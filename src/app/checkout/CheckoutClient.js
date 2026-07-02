"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import SymbolIcon from "@/components/SymbolIcon";


export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    giftDraping: false,
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });

  // Redirect if cart is empty and we are not in confirmation step
  useEffect(() => {
    if (cartItems.length === 0 && step < 4) {
      // Allow redirecting back or showing empty state
    }
  }, [cartItems, step]);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleConfirmMeasurements = () => {
    setStep(3);
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setPaymentError(null);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingForm: {
            name: shippingForm.name,
            email: shippingForm.email,
            phone: shippingForm.phone,
            address: shippingForm.address,
            city: shippingForm.city,
            state: shippingForm.state,
            zip: shippingForm.zip,
            giftDraping: shippingForm.giftDraping,
          },
          items: cartItems.map((item) => {
            const tailoring = item.customTailoring ? { ...item.customTailoring } : undefined;
            if (tailoring) {
              Object.keys(tailoring).forEach((key) => {
                if (tailoring[key] === null) {
                  delete tailoring[key];
                }
              });
            }
            return {
              id: item.id,
              quantity: item.quantity,
              size: item.size || undefined,
              colour: item.colour || undefined,
              customTailoring: tailoring,
            };
          }),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // API returns { success: false, error: { message } }
        const msg = errorData?.error?.message || errorData?.error || "Failed to create order on payment server.";
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      const orderData = await res.json().then((d) => d.data);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Pehnawa by Laxshmi Atelier",
        description: "Bespoke Couture Order",
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          setLoading(true);
          setPaymentError(null);
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const verifyError = await verifyRes.json().catch(() => ({}));
              const vMsg = verifyError?.error?.message || verifyError?.error || "Payment verification failed.";
              throw new Error(typeof vMsg === "string" ? vMsg : JSON.stringify(vMsg));
            }

            const verifyData = await verifyRes.json().then((d) => d.data);
            const createdOrder = verifyData.order;

            // Map order back to frontend structure for success screen
            setOrderResult({
              id: createdOrder.orderNumber || createdOrder.id,
              customer: {
                name: shippingForm.name,
                email: shippingForm.email,
                phone: shippingForm.phone,
                address: `${shippingForm.address}, ${shippingForm.city}, ${shippingForm.state} - ${shippingForm.zip}`,
              },
              items: cartItems.map((item) => ({
                id: item.id,
                title: item.title,
                price: item.price,
                size: item.size,
                colour: item.colour,
                quantity: item.quantity,
              })),
              total: cartTotal,
            });

            clearCart();
            setStep(4);
          } catch (err) {
            setPaymentError(err.message || "Something went wrong during payment verification.");
          } finally {
            setLoading(false);
          }
        },
        prefill: orderData.prefill,
        theme: {
          color: "#D4AF37",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            console.log("Razorpay checkout modal dismissed.");
          },
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  { method: "upi" },
                ],
              },
              card: {
                name: "Pay via Card",
                instruments: [
                  { method: "card" },
                ],
              },
              netbanking: {
                name: "Pay via Netbanking",
                instruments: [
                  { method: "netbanking" },
                ],
              },
            },
            sequence: ["block.upi", "block.card", "block.netbanking"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false); // Razorpay modal is now handling the flow
    } catch (error) {
      setPaymentError(error.message || "We could not process the payment request. Please try again.");
      setLoading(false);
    }
  };


  if (cartItems.length === 0 && step !== 4) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#131313] pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 flex flex-col justify-center items-center text-center space-y-6">
          <SymbolIcon name="shopping_bag" className="size-16 text-white/20" />
          <h2 className="font-playfair text-[24px] text-white tracking-widest uppercase">
            Your bag is empty
          </h2>
          <p className="font-montserrat text-[13px] text-white/50 max-w-sm leading-relaxed">
            There are no items in your bag to checkout. Begin exploring our collections.
          </p>
          <Link
            href="/everyday"
            className="px-10 py-4 bg-gold text-[#131313] font-montserrat text-[12px] font-bold tracking-[0.2em] uppercase rounded-none hover:bg-white transition-all"
          >
            DISCOVER EDITS
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-[#131313] pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 md:px-16 max-w-[1440px] mx-auto">
        {/* Checkout Header Progress Bar */}
        {step < 4 && (
          <div className="max-w-3xl mx-auto mb-10 md:mb-16 space-y-3">
            <div className="flex justify-between font-montserrat text-[10px] md:text-[11px] text-white/40 tracking-[0.1em] md:tracking-[0.15em] uppercase font-semibold">
              <span className={step >= 1 ? "text-gold" : ""}>
                <span className="hidden sm:inline">1. Shipping</span>
                <span className="sm:hidden">① Ship</span>
              </span>
              <span className={step >= 2 ? "text-gold" : ""}>
                <span className="hidden sm:inline">2. Fitting</span>
                <span className="sm:hidden">② Fit</span>
              </span>
              <span className={step >= 3 ? "text-gold" : ""}>
                <span className="hidden sm:inline">3. Payment</span>
                <span className="sm:hidden">③ Pay</span>
              </span>
            </div>
            <div className="h-[2px] bg-white/5 w-full relative">
              <div
                className="absolute top-0 left-0 h-full bg-gold transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Loading Spinner during payment processing */}
        {loading ? (
          <div className="max-w-md mx-auto py-24 text-center space-y-6 bg-[#1F1F1F] border border-white/5 p-12 shadow-2xl animate-fade-in-up">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="font-playfair text-[20px] text-white tracking-widest uppercase">
              Handshaking Secure Payment...
            </h3>
            <p className="font-montserrat text-[12px] text-white/50 max-w-xs mx-auto leading-relaxed">
              Please do not refresh or navigate away while we authorize your order against bank nodes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Steps Canvas — renders second on mobile (order-2), first on lg (default) */}
            <div className="lg:col-span-8 order-2 lg:order-1">
              
              {/* Step 1: Shipping */}
              {step === 1 && (
                <div className="bg-[#1F1F1F] border border-white/10 p-5 sm:p-8 md:p-12 space-y-8 animate-fade-in-up">
                  <h3 className="font-playfair text-[22px] md:text-[26px] text-white tracking-wide">
                    Luxury Shipping Address
                  </h3>
                  
                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="checkout-name" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                          Full Name *
                        </label>
                        <input
                          id="checkout-name"
                          name="name"
                          required
                          type="text"
                          value={shippingForm.name}
                          onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                          className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-phone" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          id="checkout-phone"
                          name="phone"
                          required
                          type="tel"
                          value={shippingForm.phone}
                          onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                          className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="checkout-email" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="checkout-email"
                        name="email"
                        required
                        type="email"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="checkout-address" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                        Shipping Address *
                      </label>
                      <input
                        id="checkout-address"
                        name="address"
                        required
                        type="text"
                        value={shippingForm.address}
                        onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                        className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="checkout-city" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                          City *
                        </label>
                        <input
                          id="checkout-city"
                          name="city"
                          required
                          type="text"
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-state" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                          State *
                        </label>
                        <input
                          id="checkout-state"
                          name="state"
                          required
                          type="text"
                          value={shippingForm.state}
                          onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                          className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-zip" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                          ZIP / PIN Code *
                        </label>
                        <input
                          id="checkout-zip"
                          name="zip"
                          required
                          type="text"
                          value={shippingForm.zip}
                          onChange={(e) => setShippingForm({ ...shippingForm, zip: e.target.value })}
                          className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={shippingForm.giftDraping}
                          onChange={(e) => setShippingForm({ ...shippingForm, giftDraping: e.target.checked })}
                          className="form-checkbox w-4 h-4 bg-transparent border-white/20 text-gold rounded-none focus:ring-0 cursor-pointer"
                        />
                        <span className="font-montserrat text-[12px] text-white/60 hover:text-white transition-colors">
                          Add complimentary Atelier Gift Draping (handcrafted tissue wrap with brand gold seal)
                        </span>
                      </label>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        className="w-full py-4.5 bg-gold hover:bg-[#C5A028] text-[#121212] font-montserrat text-[12px] font-bold tracking-[0.25em] transition-all uppercase rounded-none"
                      >
                        CONTINUE TO FITTING SUMMARY
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Custom Fitting Verification */}
              {step === 2 && (
                <div className="bg-[#1F1F1F] border border-white/10 p-5 sm:p-8 md:p-12 space-y-8 animate-fade-in-up">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="font-playfair text-[22px] md:text-[26px] text-white tracking-wide">
                      Fitting & Tailoring Dossier
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="font-montserrat text-[11px] text-gold underline tracking-wider uppercase"
                    >
                      Back
                    </button>
                  </div>

                  <p className="font-montserrat text-[13px] text-white/60 leading-relaxed font-light">
                    Every garment is verified against your chosen specifications. Review your measurements prior to executing payment. Sizing adjustments are fully complimentary.
                  </p>

                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div
                        key={item.key}
                        className="p-4 sm:p-6 bg-[#131313] border border-white/5 flex flex-col md:flex-row gap-3 md:gap-6 items-start justify-between"
                      >
                        <div className="space-y-2">
                          <h4 className="font-playfair text-[16px] text-white font-medium">
                            {item.title} x {item.quantity}
                          </h4>
                          <div className="flex flex-col gap-1 mt-1 font-montserrat text-[11px]">
                            <div className="flex gap-4">
                              <span className="text-white/40">CHOSEN FITTING:</span>
                              <span className="text-gold font-bold">{item.size} (Standard)</span>
                            </div>
                            {item.colour && (
                              <div className="flex gap-4">
                                <span className="text-white/40">CHOSEN COLOUR:</span>
                                <span className="text-gold font-bold">{item.colour}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tailoring Specs */}
                        {item.customTailoring ? (
                          <div className="space-y-1.5 md:text-right font-montserrat text-[12px] text-white/70">
                            <span className="block text-[10px] text-gold font-bold uppercase tracking-widest">
                              Bespoke Directives:
                            </span>

                            <div>Sleeves: {item.customTailoring.sleeve}</div>
                            {item.customTailoring.customSizeEnabled && (
                              <div className="text-[11px] text-gold pt-1 border-t border-white/5 mt-1 flex flex-wrap gap-3 md:justify-end">
                                {item.customTailoring.bust && <span>Bust: {item.customTailoring.bust}&quot;</span>}
                                {item.customTailoring.waist && <span>Waist: {item.customTailoring.waist}&quot;</span>}
                                {item.customTailoring.height && <span>Height: {item.customTailoring.height}&quot;</span>}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="font-montserrat text-[12px] text-white/40 italic">
                            Standard tailoring requested.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={handleConfirmMeasurements}
                      className="w-full py-4.5 bg-gold hover:bg-[#C5A028] text-[#121212] font-montserrat text-[12px] font-bold tracking-[0.25em] transition-all uppercase rounded-none"
                    >
                      CONFIRM & PROCEED TO PAYMENT
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payments */}
              {step === 3 && (
                <div className="bg-[#1F1F1F] border border-white/10 p-5 sm:p-8 md:p-12 space-y-8 animate-fade-in-up">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="font-playfair text-[22px] md:text-[26px] text-white tracking-wide">
                      Secure Atelier Payment
                    </h3>
                    <button
                      type="button"
                      onClick={() => { setStep(2); setPaymentError(null); }}
                      className="font-montserrat text-[11px] text-gold underline tracking-wider uppercase"
                    >
                      Back
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Secure Bank Notice */}
                    <div className="p-4 bg-gold/5 border border-gold/20 flex gap-3 text-gold">
                      <SymbolIcon name="lock" className="size-5 self-start mt-0.5" />
                      <p className="font-montserrat text-[11px] leading-relaxed font-light">
                        Billing is encrypted using standard 256-bit Secure Socket Layer nodes. Transaction is fully secured and processed via Razorpay.
                      </p>
                    </div>

                    {/* Made-To-Order Warning Notice */}
                    <div className="p-6 bg-white/2 border border-white/5 space-y-3">
                      <h4 className="font-playfair text-[15px] text-white tracking-wider uppercase font-semibold">
                        Made-To-Order Product
                      </h4>
                      <div className="font-montserrat text-[12px] text-white/70 space-y-2 leading-relaxed">
                        <div className="text-gold font-bold">Estimated Stitching Time:</div>
                        <div className="text-white font-medium">7–14 Business Days</div>
                        <div className="text-[11px] text-white/50 pt-2 border-t border-white/5">
                          By placing this order, you acknowledge that this garment will be specially produced after purchase.
                        </div>
                      </div>
                    </div>

                    {/* Payment Error Banner */}
                    {paymentError && (
                      <div className="p-4 bg-red-900/20 border border-red-500/30 flex gap-3">
                        <SymbolIcon name="error" className="size-5 text-red-400 self-start mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="font-montserrat text-[11px] text-red-400 font-semibold uppercase tracking-wider">Payment Error</p>
                          <p className="font-montserrat text-[12px] text-red-300 leading-relaxed">{paymentError}</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleRazorpayPayment}
                        disabled={loading}
                        className="w-full py-5 bg-gold hover:bg-[#C5A028] disabled:opacity-60 disabled:cursor-not-allowed text-[#121212] font-montserrat text-[13px] font-bold tracking-[0.2em] transition-all uppercase rounded-none"
                      >
                        PROCEED TO SECURE PAYMENT
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Invoice Success Screen */}
              {step === 4 && orderResult && (
                <div className="bg-[#1F1F1F] border border-white/10 p-5 sm:p-8 md:p-12 space-y-10 animate-fade-in-up text-center max-w-2xl mx-auto shadow-2xl">
                  <div className="space-y-4">
                    <SymbolIcon name="check_circle" className="size-20 text-gold mx-auto" />
                    <h2 className="font-playfair text-[28px] md:text-[36px] font-medium text-white tracking-wide">
                      Order Executed
                    </h2>
                    <p className="font-montserrat text-[12px] text-gold tracking-[0.25em] font-semibold uppercase">
                      INVOICE / RECEIPT: {orderResult.id}
                    </p>
                  </div>

                  <p className="font-montserrat text-[13px] text-white/60 leading-relaxed font-light max-w-md mx-auto">
                    Your bespoke couture order has been registered in the Pehnawa by Laxshmi Atelier books. A private styling consultant will reach out via <span className="text-white font-medium">{orderResult.customer.email}</span> shortly to coordinate sizing parameters.
                  </p>

                  {/* Summary Box */}
                  <div className="bg-[#131313] border border-white/5 p-6 text-left space-y-4 font-montserrat text-[13px]">
                    <h4 className="text-[11px] text-gold font-bold tracking-widest uppercase border-b border-white/5 pb-2">
                      ATELIER DISPATCH SUMMARY
                    </h4>
                    <div className="flex justify-between text-white/50">
                      <span>Dossier client:</span>
                      <span className="text-white font-medium">{orderResult.customer.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-4 text-white/50">
                      <span className="shrink-0">Recipient Address:</span>
                      <span className="text-white sm:text-right font-medium max-w-full sm:max-w-[260px] break-words">{orderResult.customer.address}</span>
                    </div>
                    
                    {/* Items loop */}
                    <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
                      {orderResult.items.map((item) => (
                        <div key={`${item.id}-${item.size}-${item.colour || "std"}`} className="flex justify-between text-[12px]">
                          <span className="text-white/60">
                            {item.title} ({item.size}{item.colour ? `, ${item.colour}` : ""}) <span className="text-[10px] text-white/40">x{item.quantity}</span>
                          </span>
                          <span className="text-white font-semibold">₹ {item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-3 flex justify-between font-bold text-[14px]">
                      <span className="text-gold tracking-wider uppercase font-playfair">Grand Total:</span>
                      <span className="text-gold font-semibold">₹ {orderResult.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Return Policy Notice */}
                  <div className="bg-gold/5 border border-gold/20 p-6 text-left space-y-3 font-montserrat text-[12px] max-w-md mx-auto">
                    <h4 className="text-[11px] text-gold font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <SymbolIcon name="info" className="size-4" />
                      Return Policy Notice
                    </h4>
                    <p className="text-white/70 leading-relaxed font-light">
                      Returns/exchanges are strictly applicable <strong className="text-white font-semibold">within 7 days of delivery</strong> and not after that. To apply for a return, please contact our support helpline at <a href="tel:+917309336575" className="text-gold hover:underline font-semibold font-montserrat">+91 73093 36575</a>.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/"
                      className="px-10 py-4 bg-gold text-[#131313] font-montserrat text-[12px] font-bold tracking-[0.2em] uppercase rounded-none hover:bg-white transition-all"
                    >
                      RETURN TO ATELIER
                    </Link>
                    <Link
                      href="/everyday"
                      className="px-10 py-4 border border-white/20 text-white font-montserrat text-[12px] font-bold tracking-[0.2em] uppercase rounded-none hover:bg-white/5 transition-all"
                    >
                      CONTINUE SHOPPING
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Summary — renders first on mobile (order-1), right col on lg */}
            {step < 4 && (
              <div className="lg:col-span-4 order-1 lg:order-2 bg-[#1F1F1F] border border-white/10 p-5 sm:p-6 md:p-8 space-y-6 h-fit lg:sticky lg:top-24">
                <h3 className="font-playfair text-[18px] text-white tracking-wider uppercase border-b border-white/10 pb-2">
                  Atelier Bag
                </h3>

                <div className="space-y-4 max-h-[300px] overflow-y-auto hide-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.key} className="flex gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="w-12 h-16 bg-[#131313] flex-shrink-0 overflow-hidden border border-white/5 relative">
                        <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <h4 className="font-playfair text-[12px] text-white/90 truncate max-w-[150px]">
                          {item.title}
                        </h4>
                        <p className="font-montserrat text-[10px] text-white/40 uppercase">
                          Size: {item.size} {item.colour ? `• Colour: ${item.colour}` : ""} • Qty: {item.quantity}
                        </p>
                        {item.customTailoring && (
                          <span className="inline-block text-[9px] font-montserrat text-gold tracking-wider uppercase font-semibold">
                            Bespoke configured
                          </span>
                        )}
                      </div>
                      <span className="font-montserrat text-[12px] text-white/80 font-medium">
                        ₹ {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2 font-montserrat text-[12px]">
                  <div className="flex justify-between text-white/60">
                    <span className="uppercase">Subtotal</span>
                    <span>₹ {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span className="uppercase">Shipping</span>
                    <span className="text-gold font-medium uppercase text-[10px]">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span className="uppercase">Custom Tailoring</span>
                    <span className="text-gold font-medium uppercase text-[10px]">Complimentary</span>
                  </div>
                  <div className="h-[1px] bg-white/5 my-2"></div>
                  <div className="flex justify-between text-white font-bold items-baseline">
                    <span className="font-playfair text-[14px] uppercase tracking-wider">Estimated Total</span>
                    <span className="text-[16px] text-gold font-semibold">
                      ₹ {cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
