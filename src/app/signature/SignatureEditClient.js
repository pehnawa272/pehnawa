"use client";

import React, { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import SymbolIcon from "@/components/SymbolIcon";

export default function SignatureEdit({ initialProducts = [] }) {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Only use live DB products — no static fallback.
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (activeCategory !== "all") {
      result = result.filter((p) => p.subCategory === activeCategory);
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, initialProducts, sortBy]);

  const categories = [
    { name: "ALL DESIGNs", value: "all" },
    { name: "ANARKALIS", value: "anarkalis" },
    { name: "SAREES", value: "sarees" },
    { name: "KURTAS", value: "kurtas" },
  ];

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313] pt-20">
        {/* Editorial Hero Banner */}
        <header className="relative h-[420px] sm:h-[520px] md:h-[650px] w-full overflow-hidden flex items-center px-6 md:px-16 border-b border-white/5">
          <div className="absolute inset-0 z-0">
            <Image
              src="/pic2.jpeg"
              alt="Pehnawa Signature Collection Hero"
              fill
              priority
              quality={85}
              className="object-cover object-top opacity-90 scale-105 hover:scale-100 transition-transform duration-[3000ms]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-2xl text-white space-y-6">
            <p className="font-montserrat text-[11px] tracking-[0.3em] uppercase text-gold">
              Signature Edit
            </p>
            <h1 className="font-playfair text-[28px] sm:text-[38px] md:text-[56px] font-bold leading-tight tracking-wider">
              Bespoke <br />Masterpieces.
            </h1>
            <p className="font-montserrat text-[14px] md:text-[16px] max-w-md opacity-90 font-light leading-relaxed">
              Exquisite hand-woven couture masterpieces representing centuries of artisanal Chikankari, Zardozi, and luxury silk weaves.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("catalog-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-10 py-4 bg-gold hover:bg-white hover:text-[#121212] text-[#121212] font-montserrat text-[12px] font-bold tracking-[0.2em] transition-all duration-300 rounded-none border border-gold"
              >
                DISCOVER THE COLLECTION
              </button>
            </div>
          </div>
        </header>

        {/* Catalog Section with Sticky Filter Bar */}
        <section id="catalog-section" className="relative">
          {/* Filter Bar */}
          <div className="sticky top-16 z-40 bg-[#131313]/90 backdrop-blur-md border-b border-white/10 text-white">
            <div className="overflow-x-auto hide-scrollbar border-b border-white/5 sm:border-none">
              <div className="flex items-center gap-5 md:gap-8 px-6 md:px-16 py-3.5 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setActiveCategory(cat.value)}
                    className={`font-montserrat text-[11px] font-semibold tracking-widest pb-1 transition-all border-b-2 whitespace-nowrap ${activeCategory === cat.value
                        ? "border-gold text-gold"
                        : "border-transparent opacity-60 hover:opacity-100 hover:text-gold"
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 md:px-16 py-2.5 sm:py-3">
              <span className="font-montserrat text-[11px] opacity-60 uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-b border-white/20 text-white font-montserrat text-[11px] tracking-wider py-1 pr-6 pl-1 outline-none focus:border-gold cursor-pointer rounded-none appearance-none"
              >
                <option value="default" className="bg-[#131313] text-white">Featured</option>
                <option value="price-low" className="bg-[#131313] text-white">Price: Low–High</option>
                <option value="price-high" className="bg-[#131313] text-white">Price: High–Low</option>
              </select>
              <SymbolIcon name="tune" className="size-4 text-gold" />
            </div>
          </div>

          {/* Product Grid */}
          <div className="px-6 md:px-16 py-20 max-w-[1440px] mx-auto">
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <SymbolIcon name="inventory_2" className="size-12 text-white/20 mb-4 mx-auto" />
                <p className="font-playfair text-[18px] text-white/70 tracking-widest uppercase">
                  No pieces found in this category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12 md:gap-y-20">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group cursor-pointer flex flex-col transition-all duration-1000 opacity-100 translate-y-0"
                  >
                    {/* Hover Image Frame */}
                    <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-[#1F1F1F] border border-white/5 group-hover:border-gold/30 transition-colors">
                      <Link href={`/product/${product.id}`}>
                        <Image
                          src={product.images?.[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuCQEdOybnVP46O-DFJtarqg5GFmzA0czzX6tV5p_SGKEfw38pMlpfNro4EnKG-HrHNr_zEKZw-THH7iMo4hBgRHNAIV8fXt7RGYSOSYNq7Ohn2iEHH-lqBTpLEaKX021NhpjpYpYFTl0EBrzyT7Drntg98T3_uSK6Npoi4EMLyh9xtv9SaoEaCh6H7yDQ-gV0MLdytw58tZpYs170gzsQxsFRE3gFGcfY-dvrd6-4S_GFwmsKG_zTOpkeINvVEIWbBWcRfq1L1xV-U"}
                          alt={product.title}
                          fill
                          loading="lazy"
                          quality={85}
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors"></div>
                      </Link>

                      {/* Premium Quick Add Trigger */}
                      <div className="absolute inset-x-0 bottom-0 p-4 quick-add-panel translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-[#131313]/95 backdrop-blur-md border-t border-gold/20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product, "S", null);
                          }}
                          className="w-full py-3 border border-gold hover:bg-gold hover:text-[#131313] text-gold font-montserrat text-[11px] font-semibold tracking-[0.15em] transition-all uppercase rounded-none"
                        >
                          QUICK ADD +
                        </button>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="text-center space-y-1">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-playfair text-[16px] md:text-[18px] text-white/90 group-hover:text-gold transition-colors font-medium">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="font-montserrat text-[11px] text-white/40 tracking-wider uppercase">
                        {product.subTitle}
                      </p>
                      <p className="font-montserrat text-[13px] text-gold font-medium pt-1">
                        ₹ {product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
