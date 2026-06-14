"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SymbolIcon from "@/components/SymbolIcon";
import ProductManagement from "@/components/admin/ProductManagement";
import Link from "next/link";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [productsCount, setProductsCount] = useState(0);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.total || 0), 0);
  }, [orders]);

  const bookings = useMemo(() => {
    return consultations
      .filter((c) => !c.message?.startsWith("Inquiry for Product:"))
      .map((c) => ({
        id: c.id,
        type: c.type === "VIRTUAL" ? "Virtual" : "In-Person",
        timestamp: c.createdAt,
        clientName: c.clientName,
        clientEmail: c.clientEmail,
        clientPhone: c.clientPhone,
        message: c.message,
        consultationDate: c.requestedDate
          ? new Date(c.requestedDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "N/A",
        consultationTime: c.requestedTime || "N/A",
      }));
  }, [consultations]);

  const inquiries = useMemo(() => {
    return consultations
      .filter((c) => c.message?.startsWith("Inquiry for Product:"))
      .map((c) => {
        let productTitle = "Golden Era Product";
        let message = c.message || "";
        if (message.startsWith("Inquiry for Product: ")) {
          const lines = message.split("\n\n");
          productTitle = lines[0].replace("Inquiry for Product: ", "");
          message = lines[1]?.replace("Client Notes: ", "") || "";
        }
        return {
          id: c.id,
          timestamp: c.createdAt,
          clientName: c.clientName,
          clientEmail: c.clientEmail,
          clientPhone: c.clientPhone,
          message,
          productTitle,
          weddingDate: c.requestedDate
            ? new Date(c.requestedDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "N/A",
        };
      });
  }, [consultations]);

  // Fetch from database layer on mount
  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const [ordersResponse, consultationsResponse, productsResponse] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/consultations?limit=200"),
        fetch("/api/admin/products?limit=1"),
      ]);

      if (!active) {
        return;
      }

      let mappedOrders = [];
      if (ordersResponse.ok) {
        try {
          const ordersData = await ordersResponse.json();
          const ordersArray = ordersData.data?.items || [];
          mappedOrders = ordersArray.map(order => ({
            id: order.orderNumber || order.id,
            dbId: order.id,
            status: order.status,
            timestamp: order.createdAt,
            customer: {
              name: order.user?.name || "N/A",
              email: order.user?.email || "N/A",
              phone: order.user?.phone || "N/A",
              address: order.address ? [
                order.address.line1,
                order.address.line2,
                order.address.city,
                order.address.state,
                order.address.pincode,
                order.address.country
              ].filter(Boolean).join(", ") : "N/A",
              giftDraping: order.giftDraping,
            },
            total: (order.total || 0) / 100, // Convert paise to Rupees
            payment: order.payment ? {
              method: order.payment.method,
              status: order.payment.status,
              amount: (order.payment.amount || 0) / 100,
              razorpayOrderId: order.payment.razorpayOrderId || "N/A",
              razorpayPaymentId: order.payment.razorpayPaymentId || "N/A",
              createdAt: order.payment.createdAt,
            } : null,
            items: (order.items || []).map(item => ({
              id: item.id,
              title: item.productTitle,
              size: item.size || "Standard",
              colour: item.colour,
              quantity: item.quantity,
              customTailoring: item.customTailoring,
            }))
          }));
        } catch (e) {
          console.error("Error loading or mapping admin orders:", e);
        }
      }

      setOrders(mappedOrders);
      
      let fetchedConsultations = [];
      if (consultationsResponse.ok) {
        try {
          const data = await consultationsResponse.json();
          fetchedConsultations = data.data?.items || [];
        } catch (e) {
          console.error("Error loading consultations:", e);
        }
      }
      setConsultations(fetchedConsultations);
      
      if (productsResponse.ok) {
        const prodData = await productsResponse.json();
        setProductsCount(prodData.data?.pagination?.total || 0);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    let cancellationReason = undefined;
    if (newStatus === "CANCELLED") {
      const reason = prompt("Enter cancellation reason:");
      if (!reason) return;
      cancellationReason = reason;
    }
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          cancellationReason,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update order status");
      }
      setOrders((prev) =>
        prev.map((o) => (o.dbId === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const tabs = [
    { id: "orders", label: "Custom Orders", count: orders.length, icon: "receipt" },
    { id: "bookings", label: "Consultation Bookings", count: bookings.length, icon: "event" },
    { id: "inquiries", label: "Golden Era Inquiries", count: inquiries.length, icon: "mail" },
    { id: "products", label: "Product Catalog", count: productsCount, icon: "shopping_bag" },
  ];

  return (
    <AdminAuthWrapper>
      <Navbar />

      <main className="min-h-screen bg-[#131313] pt-32 pb-24 px-6 md:px-16 max-w-[1440px] mx-auto space-y-12">
        {/* Panel Header */}
        <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <span className="font-montserrat text-[11px] text-gold tracking-widest uppercase font-semibold">
              ADMINISTRATION DOSSIER
            </span>
            <h2 className="font-playfair text-[28px] md:text-[40px] text-white font-medium">
              Atelier Management
            </h2>
            <p className="font-montserrat text-[12px] text-white/50 font-light">
              Review custom measurements, bespoke direct orders, styling consultations, and manage the product catalog.
            </p>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="p-6 bg-[#1F1F1F]/40 border border-white/5 space-y-2">
            <span className="font-montserrat text-[10px] text-white/44 tracking-widest uppercase font-bold block">
              TOTAL ATELIER ORDERS
            </span>
            <span className="font-playfair text-[32px] text-gold font-bold">{orders.length}</span>
          </div>
          <div className="p-6 bg-[#1F1F1F]/40 border border-white/5 space-y-2">
            <span className="font-montserrat text-[10px] text-white/44 tracking-widest uppercase font-bold block">
              TOTAL ORDER VALUE
            </span>
            <span className="font-playfair text-[32px] text-gold font-bold">
              ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-6 bg-[#1F1F1F]/40 border border-white/5 space-y-2">
            <span className="font-montserrat text-[10px] text-white/44 tracking-widest uppercase font-bold block">
              SCHEDULED CONSULTATIONS
            </span>
            <span className="font-playfair text-[32px] text-gold font-bold">{bookings.length}</span>
          </div>
          <div className="p-6 bg-[#1F1F1F]/40 border border-white/5 space-y-2">
            <span className="font-montserrat text-[10px] text-white/44 tracking-widest uppercase font-bold block">
              GOLDEN ERA LEADS
            </span>
            <span className="font-playfair text-[32px] text-gold font-bold">{inquiries.length}</span>
          </div>
          <div className="p-6 bg-[#1F1F1F]/40 border border-white/5 space-y-2">
            <span className="font-montserrat text-[10px] text-white/44 tracking-widest uppercase font-bold block">
              TOTAL CATALOG PRODUCTS
            </span>
            <span className="font-playfair text-[32px] text-gold font-bold">{productsCount}</span>
          </div>
        </div>

        {/* Dynamic Tabs Navigation */}
        <div className="flex border-b border-white/10 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-4.5 font-montserrat text-[11px] md:text-[12px] tracking-widest uppercase font-bold transition-all border-b-2 flex-shrink-0 ${
                activeTab === tab.id
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-white/55 hover:text-gold hover:bg-white/2"
              }`}
            >
              <SymbolIcon name={tab.icon} className="size-4.5" />
              {tab.label}
              <span className="ml-1 bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Viewport */}
        <div className="space-y-6">
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-[#1F1F1F] border border-gold/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-playfair text-[18px] text-gold font-bold">Advanced Order Pipeline</h4>
                  <p className="font-montserrat text-[12px] text-white/60">
                    Access search, multi-stage status filtering, timeline visualizations, and courier tracking details.
                  </p>
                </div>
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gold hover:bg-[#C5A028] text-[#131313] font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap"
                >
                  <SymbolIcon name="launch" className="size-4" />
                  Open Pipeline Dashboard
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/10">
                  <SymbolIcon name="receipt" className="size-12 text-white/20 mb-4 mx-auto" />
                  <p className="font-playfair text-[18px] text-white/50 tracking-wider uppercase">No placed orders in database.</p>
                </div>
              ) : (
                [...orders].reverse().map((order) => (
                  <div key={order.id} className="bg-[#1F1F1F] border border-white/10 p-6 md:p-8 flex flex-col lg:flex-row justify-between gap-8">
                    {/* Info */}
                    <div className="space-y-4 max-w-xl">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="font-playfair text-[18px] font-bold text-white tracking-wide">
                          Order ID: {order.id}
                        </span>
                        <span className="text-[11px] font-montserrat text-gold bg-gold/10 px-3 py-1 font-semibold uppercase tracking-wider">
                          {order.status}
                        </span>
                        <span className="text-[11px] font-montserrat text-white/40">
                          {new Date(order.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-montserrat text-[13px] leading-relaxed">
                        <div>
                          <span className="block text-[10px] text-white/40 tracking-wider uppercase font-semibold">Customer Dossier</span>
                          <span className="text-white/80 font-medium">{order.customer.name}</span>
                          <span className="block text-white/50">{order.customer.email}</span>
                          <span className="block text-white/50">{order.customer.phone}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-white/40 tracking-wider uppercase font-semibold">Delivery Address</span>
                          <span className="text-white/80 leading-snug block">{order.customer.address}</span>
                          {order.customer.giftDraping && (
                            <span className="text-[11px] text-gold font-semibold uppercase tracking-wider block mt-1">
                              🎁 Gift Draping Requested
                            </span>
                          )}
                        </div>

                        {order.payment && (
                          <div className="col-span-1 sm:col-span-2 pt-3 border-t border-white/5 mt-3 space-y-1 font-montserrat text-[12px]">
                            <span className="block text-[10px] text-gold font-bold uppercase tracking-widest mb-1.5">
                              Payment Audit details
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-white/60">
                              <div>
                                <span className="text-white/40 font-medium">Method:</span> {order.payment.method} ({order.payment.status})
                              </div>
                              <div>
                                <span className="text-white/40 font-medium">Razorpay Order:</span> {order.payment.razorpayOrderId}
                              </div>
                              <div>
                                <span className="text-white/40 font-medium">Razorpay Payment:</span> {order.payment.razorpayPaymentId}
                              </div>
                              <div>
                                <span className="text-white/40 font-medium">Paid Date:</span> {order.payment.createdAt ? new Date(order.payment.createdAt).toLocaleString() : "N/A"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Items Ordered */}
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <span className="block text-[10px] text-white/40 tracking-wider uppercase font-semibold">Items Catalog Details</span>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={`${item.id}-${item.size}-${item.colour || "std"}`} className="p-3 bg-[#131313] border border-white/5 text-[12px] font-montserrat flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <span className="text-white font-medium">{item.title}</span>
                                <span className="mx-2 text-white/30">•</span>
                                <span className="text-white/60">Size: {item.size}</span>
                                {item.colour && (
                                  <>
                                    <span className="mx-2 text-white/30">•</span>
                                    <span className="text-white/60">Colour: {item.colour}</span>
                                  </>
                                )}
                                <span className="mx-2 text-white/30">•</span>
                                <span className="text-white/60">Qty: {item.quantity}</span>
                              </div>
                              
                              {/* Sizing Details */}
                              {item.customTailoring ? (
                                <div className="text-[11px] text-gold space-y-0.5 md:text-right border-t md:border-t-0 border-white/5 pt-2 md:pt-0 w-full md:w-auto">
                                  <span className="font-bold block text-[9px] uppercase tracking-widest mb-0.5">Bespoke Fitting:</span>

                                  <div>Sleeve: {item.customTailoring.sleeve}</div>
                                  {item.customTailoring.customSizeEnabled && (
                                    <div className="flex gap-2 justify-end text-[10px] font-bold">
                                      {item.customTailoring.bust && <span>Bust: {item.customTailoring.bust}&quot;</span>}
                                      {item.customTailoring.waist && <span>Waist: {item.customTailoring.waist}&quot;</span>}
                                      {item.customTailoring.height && <span>Height: {item.customTailoring.height}&quot;</span>}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-white/40 italic text-[11px]">Standard sizing directives</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Total billing card */}
                    <div className="flex-shrink-0 self-center bg-[#131313] border border-white/5 p-6 text-center space-y-4 w-full lg:w-48">
                      <div>
                        <span className="font-montserrat text-[10px] text-white/40 tracking-widest uppercase block">GRAND BILLING</span>
                        <span className="font-playfair text-[22px] text-gold font-bold block">₹ {order.total.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-white/5"></div>
                      
                      <div className="space-y-2 text-left">
                        <label className="block text-[9px] font-montserrat text-white/40 uppercase tracking-widest">
                          Update Status
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.dbId, e.target.value)}
                          className="w-full bg-[#131313] border border-white/10 px-2 py-1.5 text-[11px] font-montserrat text-white focus:border-gold outline-none rounded-none cursor-pointer"
                        >
                          <option value="NEW">NEW</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="IN_STITCHING">IN STITCHING</option>
                          <option value="QUALITY_CHECK">QUALITY CHECK</option>
                          <option value="READY_TO_SHIP">READY TO SHIP</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-fade-in-up">
              {bookings.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/10">
                  <SymbolIcon name="event" className="size-12 text-white/20 mb-4 mx-auto" />
                  <p className="font-playfair text-[18px] text-white/50 tracking-wider uppercase">No stylist appointments scheduled.</p>
                </div>
              ) : (
                [...bookings].reverse().map((booking) => (
                  <div key={booking.id} className="bg-[#1F1F1F] border border-white/10 p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-playfair text-[18px] font-bold text-white tracking-wide">
                          Booking ID: {booking.id}
                        </span>
                        <span className="text-[11px] font-montserrat text-gold bg-gold/10 px-3 py-1 font-semibold uppercase tracking-wider">
                          {booking.type} Consult
                        </span>
                        <span className="text-[11px] font-montserrat text-white/40">
                          Created: {new Date(booking.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-montserrat text-[13px] leading-relaxed pt-2">
                        <div>
                          <span className="block text-[10px] text-white/40 tracking-wider uppercase font-semibold">Client Profile</span>
                          <span className="text-white/80 font-medium block">{booking.clientName}</span>
                          <span className="text-white/50 block">{booking.clientEmail}</span>
                          <span className="text-white/50 block">{booking.clientPhone}</span>
                        </div>
                        {booking.message && (
                          <div>
                            <span className="block text-[10px] text-white/40 tracking-wider uppercase font-semibold">Client Directives</span>
                            <p className="text-white/60 italic leading-snug">{booking.message}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 self-center bg-[#131313] border border-white/5 p-6 text-center space-y-2 w-full md:w-56 flex flex-col justify-center">
                      <span className="font-montserrat text-[10px] text-white/40 tracking-widest uppercase block">SCHEDULE DATE / TIME</span>
                      <span className="font-playfair text-[18px] text-gold font-bold block">{booking.consultationDate}</span>
                      <span className="font-montserrat text-[13px] text-white block font-medium">{booking.consultationTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* INQUIRIES TAB */}
          {activeTab === "inquiries" && (
            <div className="space-y-6 animate-fade-in-up">
              {inquiries.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/10">
                  <SymbolIcon name="mail" className="size-12 text-white/20 mb-4 mx-auto" />
                  <p className="font-playfair text-[18px] text-white/50 tracking-wider uppercase">No Golden Era inquiries found.</p>
                </div>
              ) : (
                [...inquiries].reverse().map((inq) => (
                  <div key={inq.id} className="bg-[#1F1F1F] border border-white/10 p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-playfair text-[18px] font-bold text-white tracking-wide">
                          Inquiry ID: {inq.id}
                        </span>
                        <span className="text-[11px] font-montserrat text-gold bg-gold/10 px-3 py-1 font-semibold uppercase tracking-wider">
                          Golden Era Request
                        </span>
                        <span className="text-[11px] font-montserrat text-white/40">
                          {new Date(inq.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-montserrat text-[13px] leading-relaxed pt-2">
                        <div>
                          <span className="block text-[10px] text-white/40 tracking-wider uppercase font-semibold">Golden Era Client Dossier</span>
                          <span className="text-white/80 font-medium block">{inq.clientName}</span>
                          <span className="text-white/50 block">{inq.clientEmail}</span>
                          <span className="text-white/50 block">{inq.clientPhone}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-white/40 tracking-wider uppercase font-semibold">Inquiry Directives / Message</span>
                          <p className="text-white/60 leading-snug">{inq.message || "No specific comments."}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 self-center bg-[#131313] border border-white/5 p-6 text-center space-y-2 w-full md:w-56 flex flex-col justify-center">
                      <span className="font-montserrat text-[10px] text-white/40 tracking-widest uppercase block">COUTURE COGNIZANCE</span>
                      <span className="font-playfair text-[16px] text-white font-bold block leading-snug">{inq.productTitle}</span>
                      <div className="h-px bg-white/5 my-2"></div>
                      <span className="font-montserrat text-[11px] text-gold uppercase tracking-widest font-semibold block">
                        Date Required: {inq.weddingDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PRODUCTS CATALOG TAB */}
          {activeTab === "products" && (
            <ProductManagement />
          )}
        </div>
      </main>

      <Footer />
    </AdminAuthWrapper>
  );
}
