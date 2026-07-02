"use client";

import React, { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Link from "next/link";
import Image from "next/image";
import SymbolIcon from "@/components/SymbolIcon";

export default function BridalAtelier({ initialProducts = [] }) {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    weddingDate: "",
    message: "",
  });

  // Only use live DB products — no static fallback.
  // Products deleted from the admin will no longer reappear here.

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryProduct) return;

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: inquiryForm.name,
          clientEmail: inquiryForm.email,
          clientPhone: inquiryForm.phone,
          requestedDate: inquiryForm.weddingDate ? new Date(inquiryForm.weddingDate + "T00:00:00Z").toISOString() : undefined,
          type: "VIRTUAL",
          message: `Inquiry for Product: ${inquiryProduct.title}\n\nClient Notes: ${inquiryForm.message || "None provided"}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || "We could not save your inquiry.");
      }

      setInquirySuccess(true);
      setTimeout(() => {
        setInquiryModalOpen(false);
        setInquirySuccess(false);
        setInquiryForm({ name: "", email: "", phone: "", weddingDate: "", message: "" });
      }, 2500);
    } catch (err) {
      alert(err.message);
    }
  };



  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313] pt-20">
        {/* Luxury Bridal Hero Section */}
        <header className="relative h-[480px] sm:h-[600px] md:h-[780px] w-full flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0">
            <Image
              src="/pic5.png"
              alt="PEHNAWA Golden Era — Timeless Elegant Ethnic Wear"
              fill
              priority
              quality={85}
              className="object-cover brightness-[0.45] scale-100 hover:scale-105 transition-transform duration-[4000ms]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#131313]"></div>
          </div>

          <div className="relative z-10 text-center max-w-4xl px-6 space-y-6">
            <span className="font-montserrat text-[11px] tracking-[0.3em] text-gold uppercase block">THE GOLDEN ERA</span>
            <h2 className="font-playfair text-[28px] sm:text-[38px] md:text-[64px] font-bold text-white tracking-widest leading-none">
              Golden Era
            </h2>
            <p className="font-montserrat text-[15px] md:text-[18px] text-white/70 max-w-2xl mx-auto leading-relaxed italic font-light">
              &quot;Timeless elegance crafted for women who carry grace through every chapter of life. Each piece in the Golden Era is a testament to heritage, refined by master artisans who weave sophistication into every thread.&quot;
            </p>

          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <SymbolIcon name="expand_more" className="size-7 text-gold" />
          </div>
        </header>

        {/* Content Catalog Grid */}
        <section className="px-6 md:px-16 py-20 md:py-32 max-w-[1440px] mx-auto">
          {initialProducts.length === 0 ? (
            <div className="py-24 text-center">
              <SymbolIcon name="inventory_2" className="size-12 text-white/20 mb-4 mx-auto" />
              <p className="font-playfair text-[18px] text-white/70 tracking-widest uppercase">
                No couture items match this edit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-20">
              {initialProducts.map((product) => (
                <div key={product.id} className="asymmetric-grid-item group flex flex-col">
                  <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-[#1F1F1F] border border-white/5 group-hover:border-gold/30 transition-colors">
                    <Image
                      src={product.images?.[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuCQEdOybnVP46O-DFJtarqg5GFmzA0czzX6tV5p_SGKEfw38pMlpfNro4EnKG-HrHNr_zEKZw-THH7iMo4hBgRHNAIV8fXt7RGYSOSYNq7Ohn2iEHH-lqBTpLEaKX021NhpjpYpYFTl0EBrzyT7Drntg98T3_uSK6Npoi4EMLyh9xtv9SaoEaCh6H7yDQ-gV0MLdytw58tZpYs170gzsQxsFRE3gFGcfY-dvrd6-4S_GFwmsKG_zTOpkeINvVEIWbBWcRfq1L1xV-U"}
                      alt={product.title}
                      fill
                      quality={85}
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-500"></div>

                    {/* Overlay action */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={() => {
                          setInquiryProduct(product);
                          setInquiryModalOpen(true);
                        }}
                        className="px-8 py-3 bg-[#131313]/90 hover:bg-gold hover:text-[#131313] border border-gold text-gold font-montserrat text-[11px] font-bold tracking-[0.2em] transition-all uppercase rounded-none"
                      >
                        Enquire Now
                      </button>
                    </div>
                  </div>

                  <div className="text-center space-y-1.5">
                    <h3 className="font-playfair text-[18px] md:text-[22px] font-medium text-white">
                      {product.title}
                    </h3>
                    <p className="font-montserrat text-[12px] text-white/50 tracking-wider">
                      {product.subTitle}
                    </p>
                    <p className="font-montserrat text-[11px] text-gold tracking-[0.2em] uppercase pt-1">
                      Enquire for Price
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Artisanal Focus Counters CTA */}
        <section className="bg-[#0e0e0e] py-16 md:py-32 px-6 border-y border-white/5 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <span className="font-montserrat text-[11px] text-gold tracking-[0.2em] uppercase block">
                The PEHNAWA Legacy
              </span>
              <h2 className="font-playfair text-[28px] md:text-[40px] text-white font-medium">
                Crafting Forever
              </h2>
              <p className="font-montserrat text-[15px] md:text-[18px] text-white/70 italic leading-relaxed font-light max-w-2xl mx-auto">
                Every piece in the Golden Era demands between 600 to 2,000 man-hours of intricate handwork. We honour the imperfection of the hand-made, for that is where timeless soul resides.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
              <div className="flex flex-col items-center p-6 border border-white/5 bg-[#131313]/40">
                <span className="font-playfair text-[32px] md:text-[48px] text-gold font-semibold mb-2">12</span>
                <span className="font-montserrat text-[10px] text-white/50 uppercase tracking-widest leading-none">
                  Generations of Craft
                </span>
              </div>
              <div className="flex flex-col items-center p-6 border border-white/5 bg-[#131313]/40">
                <span className="font-playfair text-[32px] md:text-[48px] text-gold font-semibold mb-2">2k+</span>
                <span className="font-montserrat text-[10px] text-white/50 uppercase tracking-widest leading-none">
                  Hours Per Piece
                </span>
              </div>
              <div className="flex flex-col items-center p-6 border border-white/5 bg-[#131313]/40">
                <span className="font-playfair text-[32px] md:text-[48px] text-gold font-semibold mb-2">0%</span>
                <span className="font-montserrat text-[10px] text-white/50 uppercase tracking-widest leading-none">
                  Machine Finish
                </span>
              </div>
              <div className="flex flex-col items-center p-6 border border-white/5 bg-[#131313]/40">
                <span className="font-playfair text-[32px] md:text-[48px] text-gold font-semibold mb-2">100</span>
                <span className="font-montserrat text-[10px] text-white/50 uppercase tracking-widest leading-none">
                  Heirloom Quality
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Luxury Bridal Inquiry Popup Modal */}
      {inquiryModalOpen && inquiryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#1F1F1F] border border-white/10 p-8 flex flex-col shadow-2xl animate-fade-in-up">
            <button
              type="button"
              onClick={() => setInquiryModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-gold"
              aria-label="Close inquiry modal"
            >
              <SymbolIcon name="close" className="size-6" />
            </button>

            {inquirySuccess ? (
              <div className="py-12 text-center space-y-4">
                <SymbolIcon name="verified" className="size-16 text-gold animate-bounce mx-auto" />
                <h3 className="font-playfair text-[22px] text-white tracking-widest uppercase">
                  Inquiry Received
                </h3>
                <p className="font-montserrat text-[13px] text-white/60 max-w-xs mx-auto">
                  Our personal style consultant will reach out to you within 24 hours to discuss your occasion and preferences.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="font-montserrat text-[10px] text-gold tracking-widest uppercase block mb-1">
                    Couture Request
                  </span>
                  <h3 className="font-playfair text-[20px] md:text-[24px] text-white tracking-wide">
                    Enquire: {inquiryProduct.title}
                  </h3>
                  <p className="text-[12px] font-montserrat text-white/50 italic mt-1 border-b border-white/5 pb-2">
                    {inquiryProduct.subTitle}
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bridal-name" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                        Your Name *
                      </label>
                      <input
                        id="bridal-name"
                        name="clientName"
                        required
                        type="text"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        className="w-full bg-[#131313] border border-white/10 px-4 py-2.5 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="bridal-phone" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        id="bridal-phone"
                        name="clientPhone"
                        required
                        type="tel"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        className="w-full bg-[#131313] border border-white/10 px-4 py-2.5 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bridal-email" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="bridal-email"
                      name="clientEmail"
                      required
                      type="email"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      className="w-full bg-[#131313] border border-white/10 px-4 py-2.5 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="bridal-wedding-date" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                      Target Event / Occasion Date
                    </label>
                    <input
                      id="bridal-wedding-date"
                      name="weddingDate"
                      required
                      type="date"
                      value={inquiryForm.weddingDate}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, weddingDate: e.target.value })}
                      className="w-full bg-[#131313] border border-white/10 px-4 py-2.5 text-[12px] font-montserrat text-white/70 focus:border-gold outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="bridal-message" className="block text-[11px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5">
                      Custom Details or Measurements Preferences
                    </label>
                    <textarea
                      id="bridal-message"
                      name="message"
                      rows={3}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      placeholder="E.g., custom sleeves length, neckline adjustments, custom fitting inquiry..."
                      className="w-full bg-[#131313] border border-white/10 px-4 py-2.5 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none placeholder-white/20 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 bg-gold hover:bg-[#C5A028] text-[#121212] font-montserrat text-[12px] font-bold tracking-[0.2em] transition-all uppercase rounded-none"
                    >
                      SUBMIT PRIVATE INQUIRY
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
