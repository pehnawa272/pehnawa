import React from "react";
import Link from "next/link";
import SymbolIcon from "@/components/SymbolIcon";

export default function Footer() {
  return (
    <footer className="w-full py-20 px-6 md:px-16 border-t border-white/5 flex flex-col items-center text-center bg-[#0e0e0e]">
      {/* Brand Signature */}
      <h2 className="font-playfair text-[32px] md:text-[40px] text-gold mb-8 tracking-widest select-none leading-[1.1] flex flex-col items-center">
        <span>PEHNAWA</span>
        <span className="block font-montserrat text-[11px] md:text-[12px] tracking-[0.3em] font-light text-white/50 mt-2 uppercase">
          by Laxshmi
        </span>
      </h2>

      {/* Navigation Directory */}
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-12">
        <Link
          href="/about"
          className="font-montserrat text-[13px] text-white/50 hover:text-gold transition-colors tracking-widest uppercase"
        >
          About Us
        </Link>
        <Link
          href="/"
          className="font-montserrat text-[13px] text-white/50 hover:text-gold transition-colors tracking-widest uppercase"
        >
          Craftsmanship
        </Link>

        <Link
          href="/"
          className="font-montserrat text-[13px] text-white/50 hover:text-gold transition-colors tracking-widest uppercase"
        >
          Privacy Policy
        </Link>
        <a
          href="tel:+917309336575"
          className="font-montserrat text-[13px] text-white/50 hover:text-gold transition-colors tracking-widest uppercase"
        >
          Contact Us
        </a>
      </div>

      {/* Contact Info Details */}
      <div className="flex flex-col items-center gap-2 mb-10">
        <span className="font-montserrat text-[10px] text-white/30 tracking-[0.25em] uppercase font-semibold">Inquiries & Appointments</span>
        <a 
          href="tel:+917309336575" 
          className="font-montserrat text-[15px] text-white hover:text-gold transition-colors tracking-widest font-medium"
        >
          +91 73093 36575
        </a>
      </div>

      {/* Social Indicators */}
      <div className="flex gap-8 mb-12">
        <SymbolIcon name="public" className="size-5.5 text-white/40 hover:text-gold cursor-pointer transition-colors" />
        <SymbolIcon name="photo_camera" className="size-5.5 text-white/40 hover:text-gold cursor-pointer transition-colors" />
        <a href="tel:+917309336575" aria-label="Call Us">
          <SymbolIcon name="phone" className="size-5.5 text-white/40 hover:text-gold cursor-pointer transition-colors" />
        </a>
      </div>

      {/* Brand Copyright */}
      <p className="font-montserrat text-[12px] text-white/30 tracking-widest max-w-lg leading-relaxed">
        © 2026 PEHNAWA BY LAXSHMI HOUSE OF COUTURE. ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
}
