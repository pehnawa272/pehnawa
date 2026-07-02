"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import SymbolIcon from "@/components/SymbolIcon";

export default function Navbar({ admin = false }) {
  const pathname = usePathname();
  const { cartCount, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleAdminLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    window.location.href = "/admin";
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "All Products", href: "/products" },
    { name: "Professional Ethnic", href: "/everyday" },
    { name: "Signature Edit", href: "/signature" },
    { name: "Golden Era", href: "/bridal" },
    { name: "Others", href: "/others" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-16 transition-all duration-500 ease-in-out border-b ${
          scrolled
            ? "h-16 bg-[#131313]/90 backdrop-blur-xl border-white/10 shadow-2xl"
            : "h-20 bg-transparent border-transparent"
        }`}
      >
        {/* Left Side Links */}
        <div className="flex-1 flex items-center justify-start">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="cursor-pointer hover:text-gold transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <SymbolIcon name="menu" className="size-6" />
          </button>
          <div className="hidden lg:flex gap-4 xl:gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-montserrat text-[10.5px] xl:text-[11px] font-semibold uppercase tracking-[0.12em] xl:tracking-[0.15em] transition-all duration-300 pb-1 text-center whitespace-nowrap ${
                    isActive
                      ? "text-gold border-b border-gold"
                      : "text-white/60 hover:text-gold"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Centered Luxury Logo */}
        <div className="flex-none flex justify-center">
          <Link href="/">
            <h1 className="font-playfair text-[24px] md:text-[32px] tracking-widest font-medium text-white hover:text-gold transition-colors select-none text-center leading-[1.1] flex flex-col items-center">
              <span>PEHNAWA</span>
              <span className="block font-montserrat text-[9px] md:text-[10px] tracking-[0.35em] font-light text-white/50 mt-1 uppercase">
                by Laxshmi
              </span>
            </h1>
          </Link>
        </div>

        {/* Right Action Icons */}
        <div className="flex-1 flex justify-end gap-4 xl:gap-6 items-center">
          {/* Book Consultation — only visible at xl to avoid crowding */}
          {!admin && (
            <a
              href="https://wa.me/917309336575?text=Hello%20Pehnawa%2C%20I%20would%20like%20to%20book%20a%20styling%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-2 px-4 py-2 border border-gold/50 hover:border-gold hover:bg-gold hover:text-[#131313] transition-all duration-300 text-[10px] font-montserrat font-bold tracking-widest text-gold rounded-none group"
            >
              {/* Live-availability dot */}
              <span className="relative flex size-1.5 shrink-0">
                <span className="dot-live absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-1.5 bg-emerald-400"></span>
              </span>
              <SymbolIcon name="whatsapp" className="size-3.5" />
              BOOK CONSULTATION
            </a>
          )}

          {!admin && (
            <button
              type="button"
              onClick={toggleCart}
              aria-label="Open shopping bag"
              className="relative flex items-center justify-center p-1.5 text-white hover:text-gold transition-colors"
            >
              <SymbolIcon name="shopping_bag" className="size-6" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-[#131313] text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold font-montserrat border border-[#131313]">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {admin && (
            <button
              type="button"
              onClick={handleAdminLogout}
              className="font-montserrat text-[10px] text-white/50 hover:text-gold uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SymbolIcon name="lock" className="size-4" />
              Sign out
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar Navigation Panel */}
      <div
        className={`fixed inset-0 z-50 bg-[#131313]/95 backdrop-blur-md transition-all duration-500 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full px-6 py-8 sm:px-8 sm:py-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-10 sm:mb-16">
            <h2 className="font-playfair text-[24px] text-white tracking-widest leading-[1.1] flex flex-col items-start">
              <span>PEHNAWA</span>
              <span className="block font-montserrat text-[9px] tracking-[0.25em] font-light text-white/50 mt-1 uppercase">
                by Laxshmi
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-gold cursor-pointer"
              aria-label="Close menu"
            >
              <SymbolIcon name="close" className="size-7" />
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-6 sm:gap-8 mb-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-montserrat text-[16px] font-medium tracking-[0.25em] uppercase pb-2 ${
                    isActive ? "text-gold border-b border-gold/45" : "text-white/70"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {!admin && (
              <a
                href="https://wa.me/917309336575?text=Hello%20Pehnawa%2C%20I%20would%20like%20to%20book%20a%20styling%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-shimmer w-full flex items-center gap-3 px-6 py-4 bg-gold text-[#131313] font-montserrat text-[13px] font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.98]"
              >
                <SymbolIcon name="whatsapp" className="size-5" />
                Book a Free Consultation
                <SymbolIcon name="arrow_forward" className="size-4 ml-auto" />
              </a>
            )}
          </div>

          {/* Footer inside mobile nav */}
          <div className="text-center text-white/40 text-[11px] tracking-widest uppercase">
            © 2026 PEHNAWA HOUSE OF COUTURE
          </div>
        </div>
      </div>
    </>
  );
}
