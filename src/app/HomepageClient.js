"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SymbolIcon from "@/components/SymbolIcon";

export default function Homepage() {
  const [revealActive, setRevealActive] = useState(false);

  useEffect(() => {
    // Add small delay to trigger entrance animations
    const timer = setTimeout(() => setRevealActive(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313]">
        {/* Cinematic Hero Section */}
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/mainhero.jpeg"
              alt="PEHNAWA BY LAXSHMI Luxury Indian Couture"
              fill
              priority
              quality={85}
              className="object-cover object-top scale-[1.03] hover:scale-100 transition-transform duration-[4000ms] brightness-[0.75]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#131313]"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-end items-center pb-16 sm:pb-24 md:pb-32 text-center px-6 md:px-16 max-w-5xl">
            <p className={`font-montserrat text-[11px] md:text-[13px] tracking-[0.4em] text-gold uppercase mb-6 transition-all duration-1000 ${revealActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
              AUTUMN / WINTER 2026
            </p>
            <h2 className={`font-playfair text-[32px] sm:text-[44px] md:text-[64px] font-bold text-white leading-tight tracking-wider mb-8 max-w-4xl transition-all duration-1000 delay-300 ${revealActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}>
              The Heritage of Modernity
            </h2>
            <div className={`flex flex-col items-center gap-4 transition-all duration-1000 delay-500 ${revealActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}>
              <Link
                href="/products"
                className="btn-shimmer btn-pulse-glow group inline-flex items-center gap-3 bg-gold text-[#131313] hover:bg-white hover:text-[#131313] px-8 sm:px-14 py-4 sm:py-5 font-montserrat text-[12px] font-bold tracking-[0.25em] sm:tracking-[0.3em] transition-all duration-300 uppercase rounded-none border border-gold hover:border-white active:scale-95 text-center hover:shadow-[0_8px_32px_rgba(212,175,55,0.35)]"
              >
                SHOP THE COLLECTION
                <SymbolIcon name="arrow_forward" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <p className="font-montserrat text-[10px] tracking-[0.2em] text-white/40 uppercase">
                Free global delivery · Bespoke tailoring on every order
              </p>
            </div>
          </div>
        </section>

        {/* Brand Philosophy Section */}
        <section className="py-16 md:py-32 px-6 md:px-16 text-center bg-[#0e0e0e] border-y border-white/5 relative">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
            <span className="font-montserrat text-[11px] tracking-[0.2em] text-gold uppercase block">THE PHILOSOPHY</span>
            <h3 className="font-playfair text-[28px] md:text-[40px] font-medium text-white tracking-wide">
              Desi Vibes, Modern Soul
            </h3>
            <p className="font-montserrat text-[15px] md:text-[18px] text-white/70 leading-relaxed font-light">
              At Pehnawa by Laxshmi, we bridge the gap between ancestral craftsmanship and the contemporary global spirit. Each piece is a meticulously curated narrative, celebrating the intricate soul of Indian textiles through a lens of minimalist luxury. We do not just dress bodies; we drape stories.
            </p>
            <div className="pt-4 flex justify-center">
              <div className="h-[1px] w-24 bg-gold/30"></div>
            </div>
          </div>
        </section>

        {/* Featured Collections Grid */}
        <section className="py-16 md:py-32 bg-[#131313]">
          <div className="px-6 md:px-16 mb-10 md:mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <span className="font-montserrat text-[11px] tracking-[0.2em] text-gold uppercase block mb-2">CURATED SELECTIONS</span>
              <h2 className="font-playfair text-[28px] md:text-[40px] font-medium text-white tracking-wide">
                The Collections
              </h2>
              <p className="font-montserrat text-[14px] text-white/50 mt-2 italic font-light">
                Curated edits for every silhouette
              </p>
            </div>
            <Link
              href="/everyday"
              className="group inline-flex items-center gap-2 font-montserrat text-[12px] font-semibold text-gold hover:text-white transition-colors duration-300 tracking-widest uppercase border-b border-gold/40 hover:border-white/60 pb-1"
            >
              VIEW ALL EDITS
              <SymbolIcon name="arrow_forward" className="size-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 px-6 md:px-16 max-w-[1440px] mx-auto">
            {/* Everyday Edit */}
            <Link href="/everyday" className="group cursor-pointer flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#1F1F1F] mb-6 border border-white/5 cinematic-zoom">
                <Image
                  src="/pic6.jpeg"
                  alt="Professional Ethnic Collection"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1000ms]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div className="text-center group-hover:transform group-hover:translate-y-[-4px] transition-transform duration-300">
                <h4 className="font-playfair text-[20px] md:text-[24px] font-medium text-white mb-2">Professional Ethnic</h4>
                <p className="font-montserrat text-[11px] text-white/50 tracking-[0.2em] uppercase">Casual Elegance</p>
              </div>
            </Link>

            {/* Signature Edit — offset vertically for editorial stagger */}
            <Link href="/signature" className="group cursor-pointer flex flex-col md:translate-y-12">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#1F1F1F] mb-6 border border-white/5 cinematic-zoom">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoL47DJkjHGr61NjYkTOcfLko3oZNy2gs8Z7jxqcNsQiNy8zB9JdCeONutnlgwnhSm98xeAzDm945RtVORC_kIl-GPUbGDRL6Z-zeoIbaZ47WT-usrwEozEVag4vVcrpfbnbYNQ2cn5-5j41apwopsuDIy2O_B-T9CKFbCKF2pTQcbTcgVO-EEDiGPLL8JAapv2oTPXyCNOgex-w37mOreodCRkYW4cu1tu9U0Tnn8XdzthIcjGHeTnjPZDK1kbfVkODDFmGSIsAU"
                  alt="Signature Edit"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1000ms]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div className="text-center group-hover:transform group-hover:translate-y-[-4px] transition-transform duration-300">
                <h4 className="font-playfair text-[20px] md:text-[24px] font-medium text-white mb-2">Signature Edit</h4>
                <p className="font-montserrat text-[11px] text-white/50 tracking-[0.2em] uppercase">The Statement</p>
              </div>
            </Link>

            {/* Golden Era */}
            <Link href="/bridal" className="group cursor-pointer flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#1F1F1F] mb-6 border border-white/5 cinematic-zoom">
                <Image
                  src="/pic4.jpeg"
                  alt="Golden Era"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1000ms]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div className="text-center group-hover:transform group-hover:translate-y-[-4px] transition-transform duration-300">
                <h4 className="font-playfair text-[20px] md:text-[24px] font-medium text-white mb-2">Golden Era</h4>
                <p className="font-montserrat text-[11px] text-white/50 tracking-[0.2em] uppercase">Timeless Elegance</p>
              </div>
            </Link>

            {/* Others */}
            <Link href="/others" className="group cursor-pointer flex flex-col md:translate-y-12">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#1F1F1F] mb-6 border border-white/5 cinematic-zoom">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDFrcCQuwbZm63vHnuYuhNCOnADWPeqa_zmtLEjtr407ZjQa50TAvYThgFiJW7_tTxGWDTMnfg8O0J8kwnoiT5Y9hmGx81xGLhME1MKPqj5B-anBTziMXzs-SsuSq5OfSBrYIltXgB5rWp8FxygJOWoz14gGNKfIZxBf1zd2Y4AgmmthhXvqm4rqKvjjdmmMa9Ru0FLWfvgoe0JWhK0HnJ38nwjXS9guqeNJZvyzqfNlrlLBgkC2Q9bn1-UexOeoUmzHxzQcjdEi0"
                  alt="Others Collection"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1000ms]"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div className="text-center group-hover:transform group-hover:translate-y-[-4px] transition-transform duration-300">
                <h4 className="font-playfair text-[20px] md:text-[24px] font-medium text-white mb-2">Others</h4>
                <p className="font-montserrat text-[11px] text-white/50 tracking-[0.2em] uppercase">Beyond Categories</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Craftsmanship Storytelling */}
        <section className="py-16 md:py-32 px-6 md:px-16 bg-[#0e0e0e] border-y border-white/5 relative">
          <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 space-y-8 text-left">
              <span className="font-montserrat text-[11px] tracking-[0.3em] text-gold uppercase block">THE ART OF DETAIL</span>
              <h2 className="font-playfair text-[28px] md:text-[40px] font-medium text-white leading-tight">
                Handcrafted in Lucknow
              </h2>
              <p className="font-montserrat text-[16px] text-white/70 leading-relaxed font-light">
                Centuries of Chikankari and Zardosi traditions are kept alive by our master artisans. Every stitch is a prayer, every bead a testament to a lineage of skill. We preserve the purity of handwork while tailoring it for the discerning global wardrobe.
              </p>
              <div className="pt-4">
                <Link
                  href="/product/noorani-anarkali"
                  className="group inline-flex items-center gap-3 px-10 py-4 border border-white/25 hover:border-gold hover:bg-gold hover:text-[#121212] text-white font-montserrat text-[12px] tracking-[0.2em] font-medium transition-all duration-300 uppercase rounded-none"
                >
                  EXPLORE THE CRAFT
                  <SymbolIcon name="arrow_forward" className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-gold/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative z-10 w-full aspect-square bg-[#1F1F1F] border border-white/10 overflow-hidden gold-glow">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDFrcCQuwbZm63vHnuYuhNCOnADWPeqa_zmtLEjtr407ZjQa50TAvYThgFiJW7_tTxGWDTMnfg8O0J8kwnoiT5Y9hmGx81xGLhME1MKPqj5B-anBTziMXzs-SsuSq5OfSBrYIltXgB5rWp8FxygJOWoz14gGNKfIZxBf1zd2Y4AgmmthhXvqm4rqKvjjdmmMa9Ru0FLWfvgoe0JWhK0HnJ38nwjXS9guqeNJZvyzqfNlrlLBgkC2Q9bn1-UexOeoUmzHxzQcjdEi0"
                  alt="Lucknow Zardosi Handwork Detail"
                  fill
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Styling Consultation CTA */}
        <section className="relative py-20 md:py-44 bg-black overflow-hidden flex items-center justify-center border-b border-white/5">
          <div className="absolute inset-0 opacity-35 z-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDEBCQQiGuiBPxLuOygSEZYGXr1--hffmlMcjJWuUDRNsFZIm6JAMQUmooB-mz4T_B8gNx9cDgSadE14AFILUcz9wpLzN0RrIaB4lJC15cJneT7i5c4bdbwqsuHY6P9Jvfv9IR8ldLyQJWB3iNoascu9PI9gXw2mScQ0WRY4YVzWu-UvEOaT8zLay0DhhwtjP1kNLW4FNhu0jXKZ9PWlBt4uJhBmLS2RZEAjSrRNPZ8rlGSrimY_TTtBB5AEurDPvF9OEy0IkWpxA"
              alt="Pehnawa by Laxshmi Luxury Boutique Consultations"
              fill
              className="object-cover grayscale transition-transform duration-[5000ms] hover:scale-105"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          </div>

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8">
            <span className="font-montserrat text-[11px] tracking-[0.3em] text-gold uppercase block">BESPOKE SERVICES</span>
            <h2 className="font-playfair text-[28px] md:text-[40px] font-medium text-white tracking-wide">
              Your Personal Style Concierge
            </h2>
            <p className="font-montserrat text-[15px] md:text-[17px] text-white/80 max-w-2xl mx-auto leading-relaxed font-light">
              Allow our expert stylists to curate a collection that speaks to your unique aesthetic. Experience the Pehnawa by Laxshmi House of Couture service — virtually or in-person, completely complimentary.
            </p>

            {/* Trust proof row */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-6 gap-y-1.5 font-montserrat text-[10px] tracking-[0.12em] text-white/50 uppercase">
              <span>✦ Complimentary</span>
              <span>✦ Virtual &amp; In-Person</span>
              <span>✦ Response within 2 hours</span>
            </div>

            <div className="pt-2 flex flex-col items-center gap-4">
              <a
                href="https://wa.me/917309336575?text=Hello%20Pehnawa%2C%20I%20would%20like%20to%20book%20a%20styling%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer btn-pulse-glow group inline-flex items-center gap-3 bg-gold text-[#121212] hover:bg-white hover:text-[#121212] px-8 sm:px-14 py-4 sm:py-5 font-montserrat text-[12px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase transition-all duration-300 rounded-none border border-gold hover:border-white active:scale-95 hover:shadow-[0_8px_40px_rgba(212,175,55,0.40)]"
              >
                <SymbolIcon name="whatsapp" className="size-4.5" />
                BOOK YOUR FREE CONSULTATION
                <SymbolIcon name="arrow_forward" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <p className="font-montserrat text-[10px] text-white/35 tracking-widest uppercase">
                No commitment · Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
