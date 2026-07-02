"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import SymbolIcon from "@/components/SymbolIcon";

export default function CartDrawer() {
  const {
    cartItems,
    cartOpen,
    cartTotal,
    toggleCart,
    removeFromCart,
    updateQuantity,
  } = useCart();
  
  const drawerRef = useRef(null);

  // Close drawer on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        cartOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target)
      ) {
        toggleCart();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cartOpen, toggleCart]);

  return (
    /* Backdrop — always in the DOM, fades in/out so the panel can animate */
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-colors duration-300 ${
        cartOpen
          ? "bg-black/60 backdrop-blur-sm pointer-events-auto"
          : "bg-transparent pointer-events-none"
      }`}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        {/* Panel — slides in from the right with a luxury deceleration curve */}
        <div
          ref={drawerRef}
          className={`w-screen max-w-md bg-[#131313]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl h-full
            transition-transform duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)]
            ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Header */}
          <div className="px-6 py-6 border-b border-white/10 flex justify-between items-center bg-[#0e0e0e]/80">
            <h2 className="font-playfair text-[18px] md:text-[20px] text-white tracking-[0.1em] uppercase flex items-center gap-2">
              <SymbolIcon name="shopping_bag" className="size-5 text-gold" />
              Atelier Bag ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </h2>
            <button
              type="button"
              onClick={toggleCart}
              aria-label="Close cart"
              className="text-white/60 hover:text-gold transition-colors flex items-center justify-center"
            >
              <SymbolIcon name="close" className="size-7" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6 hide-scrollbar">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-6 animate-fade-in-up-fast">
                <SymbolIcon name="shopping_bag" className="size-16 text-white/20" />
                <div>
                  <h3 className="font-playfair text-[18px] text-white tracking-widest uppercase mb-2">
                    Your bag is empty
                  </h3>
                  <p className="font-montserrat text-[12px] text-white/50 max-w-[250px] leading-relaxed">
                    Allow us to curate your wardrobe. Begin exploring our unique designs.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={toggleCart}
                  className="btn-shimmer inline-flex items-center gap-2 px-10 py-4 bg-gold hover:bg-white text-[#131313] font-montserrat text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.98] hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                >
                  <SymbolIcon name="sparkles" className="size-3.5" />
                  EXPLORE THE ATELIER
                </Link>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={item.key}
                  className="flex gap-4 pb-6 border-b border-white/5 last:border-b-0 animate-fade-in-up-fast"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
                >
                  {/* Image */}
                  <div className="w-20 h-28 flex-shrink-0 bg-[#1F1F1F] border border-white/5 overflow-hidden relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-grow flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-playfair text-[14px] text-white tracking-wide">
                          {item.title}
                        </h4>
                        <span className="inline-block mt-1 font-montserrat text-[11px] uppercase tracking-wider text-gold font-medium">
                          Size: {item.size}
                        </span>
                        {item.colour && (
                          <span className="inline-block font-montserrat text-[11px] uppercase tracking-wider text-white/50 font-medium">
                            Colour: {item.colour}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.key)}
                        aria-label={`Remove ${item.title} from cart`}
                        className="text-white/40 hover:text-gold transition-colors"
                      >
                        <SymbolIcon name="delete" className="size-4.5" />
                      </button>
                    </div>

                    {/* Custom Tailoring Display */}
                    {item.customTailoring && (
                      <div className="mt-2 p-2 bg-white/5 border border-white/5 space-y-1">
                        <span className="block text-[10px] font-montserrat tracking-wider text-white/40 uppercase font-semibold">
                          Custom Tailoring Specs:
                        </span>

                        {item.customTailoring.sleeve && (
                          <div className="text-[10px] font-montserrat text-white/60">
                            Sleeves: <span className="text-gold font-medium">{item.customTailoring.sleeve}</span>
                          </div>
                        )}
                        {item.customTailoring.customSizeEnabled && (
                          <div className="text-[10px] font-montserrat text-white/60 mt-1 flex flex-wrap gap-x-2 border-t border-white/5 pt-1">
                            {item.customTailoring.bust && (
                              <span>Bust: {item.customTailoring.bust}&quot;</span>
                            )}
                            {item.customTailoring.waist && (
                              <span>Waist: {item.customTailoring.waist}&quot;</span>
                            )}
                            {item.customTailoring.height && (
                              <span>Height: {item.customTailoring.height}&quot;</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quantity Selector & Price */}
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <div className="flex items-center border border-white/10 bg-[#0e0e0e]/50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, -1)}
                          aria-label={`Decrease quantity of ${item.title}`}
                          className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-gold text-[16px] font-bold touch-manipulation"
                        >
                          −
                        </button>
                        <span className="px-3 font-montserrat text-[12px] text-white font-medium select-none min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, 1)}
                          aria-label={`Increase quantity of ${item.title}`}
                          className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-gold text-[16px] font-bold touch-manipulation"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-montserrat text-[13px] text-white/90 font-medium">
                        {item.price > 0 ? `₹ ${(item.price * item.quantity).toLocaleString()}` : "Price on Enquiry"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Section */}
          {cartItems.length > 0 && (
            <div className="px-6 py-6 border-t border-white/10 bg-[#0e0e0e]/80 space-y-6">
              {/* Calculations */}
              <div className="space-y-2">
                <div className="flex justify-between text-white/70">
                  <span className="font-montserrat text-[12px] tracking-wider uppercase">Subtotal</span>
                  <span className="font-montserrat text-[13px] font-medium">₹ {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span className="font-montserrat text-[11px] tracking-wider uppercase">Custom Tailoring</span>
                  <span className="font-montserrat text-[11px] uppercase text-gold font-medium">Complimentary</span>
                </div>
                <div className="h-[1px] bg-white/10 my-2"></div>
                <div className="flex justify-between items-baseline text-white">
                  <span className="font-playfair text-[15px] tracking-wider uppercase">Total Est.</span>
                  <span className="font-montserrat text-[18px] font-semibold text-gold">
                    ₹ {cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="btn-shimmer btn-pulse-glow group w-full flex items-center justify-center gap-3 py-4 bg-gold hover:bg-[#e8c840] text-[#121212] font-montserrat text-[13px] font-bold tracking-[0.2em] uppercase active:scale-[0.99] transition-all duration-300 hover:shadow-[0_6px_28px_rgba(212,175,55,0.40)]"
                >
                  <SymbolIcon name="lock" className="size-3.5" />
                  SECURE CHECKOUT
                  <SymbolIcon name="arrow_forward" className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <div className="flex items-center justify-center gap-2">
                  <SymbolIcon name="verified" className="size-3.5 text-gold/60" />
                  <p className="text-[10px] font-montserrat text-white/40 text-center">
                    Complimentary delivery · Free bespoke tailoring · Secure payment
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
