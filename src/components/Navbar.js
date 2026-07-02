"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import SymbolIcon from "@/components/SymbolIcon";

// ─── Collections shown inside the dropdown ───────────────────────────────────
const COLLECTIONS = [
  {
    name: "Professional Ethnic",
    description: "Kurtas & co-ords for everyday confidence",
    href: "/everyday",
  },
  {
    name: "Signature Edit",
    description: "Anarkalis, sarees & statement masterpieces",
    href: "/signature",
  },
  {
    name: "Golden Era",
    description: "Timeless ensembles for your most elegant chapters",
    href: "/bridal",
  },
  {
    name: "Others",
    description: "Artisanal accessories & unique pieces",
    href: "/others",
  },
];

export default function Navbar({ admin = false }) {
  const pathname = usePathname();
  const { cartCount, toggleCart } = useCart();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const [mounted, setMounted]         = useState(false);
  const dropdownRef = useRef(null);

  const handleAdminLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    window.location.href = "/admin";
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCollectionsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const isCollectionActive = COLLECTIONS.some((c) => pathname === c.href);

  return (
    <>
      {/* ── Desktop / Tablet Nav ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-16 transition-all duration-500 ease-in-out border-b ${
          scrolled
            ? "h-16 bg-[#131313]/90 backdrop-blur-xl border-white/10 shadow-2xl"
            : "h-20 bg-transparent border-transparent"
        }`}
      >
        {/* ── Left links ── */}
        <div className="flex-1 flex items-center justify-start gap-1 xl:gap-2">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="cursor-pointer hover:text-gold transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <SymbolIcon name="menu" className="size-6" />
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">

            {/* Shop — direct link */}
            <Link
              href="/products"
              className={`font-montserrat text-[10.5px] xl:text-[11px] font-semibold uppercase tracking-[0.12em] xl:tracking-[0.15em] transition-all duration-300 px-3 py-2 whitespace-nowrap ${
                pathname === "/products"
                  ? "text-gold border-b border-gold"
                  : "text-white/60 hover:text-gold"
              }`}
            >
              Shop
            </Link>

            {/* Collections — hover dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCollectionsOpen((v) => !v)}
                aria-expanded={collectionsOpen}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1.5 font-montserrat text-[10.5px] xl:text-[11px] font-semibold uppercase tracking-[0.12em] xl:tracking-[0.15em] transition-all duration-300 px-3 py-2 whitespace-nowrap ${
                  isCollectionActive
                    ? "text-gold border-b border-gold"
                    : "text-white/60 hover:text-gold"
                }`}
              >
                Collections
                <SymbolIcon
                  name="expand_more"
                  className={`size-3.5 transition-transform duration-300 ${collectionsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown panel */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[440px] bg-[#131313]/98 backdrop-blur-xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.6)] transition-all duration-200 origin-top ${
                  collectionsOpen
                    ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
                }`}
              >
                {/* Dropdown header */}
                <div className="px-5 pt-4 pb-3 border-b border-white/5">
                  <span className="font-montserrat text-[10px] tracking-[0.3em] text-gold uppercase">
                    The Collections
                  </span>
                </div>

                {/* Collection links — 2-column grid */}
                <div className="grid grid-cols-2 gap-px bg-white/5 p-px">
                  {COLLECTIONS.map((col) => {
                    const active = pathname === col.href;
                    return (
                      <Link
                        key={col.href}
                        href={col.href}
                        onClick={() => setCollectionsOpen(false)}
                        className={`group flex flex-col gap-1 px-5 py-4 bg-[#131313] hover:bg-[#1F1F1F] transition-colors duration-200 ${
                          active ? "border-l-2 border-gold" : "border-l-2 border-transparent"
                        }`}
                      >
                        <span className={`font-montserrat text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                          active ? "text-gold" : "text-white/80 group-hover:text-gold"
                        }`}>
                          {col.name}
                        </span>
                        <span className="font-montserrat text-[10px] text-white/40 font-light leading-snug">
                          {col.description}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* "Browse all" footer row */}
                <Link
                  href="/products"
                  onClick={() => setCollectionsOpen(false)}
                  className="group flex items-center justify-between px-5 py-3 border-t border-white/5 hover:bg-[#1F1F1F] transition-colors"
                >
                  <span className="font-montserrat text-[10px] text-white/40 uppercase tracking-widest">
                    Browse all pieces
                  </span>
                  <SymbolIcon
                    name="arrow_forward"
                    className="size-3 text-white/30 group-hover:text-gold group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              </div>
            </div>

            {/* About */}
            <Link
              href="/about"
              className={`font-montserrat text-[10.5px] xl:text-[11px] font-semibold uppercase tracking-[0.12em] xl:tracking-[0.15em] transition-all duration-300 px-3 py-2 whitespace-nowrap ${
                pathname === "/about"
                  ? "text-gold border-b border-gold"
                  : "text-white/60 hover:text-gold"
              }`}
            >
              About
            </Link>
          </div>
        </div>

        {/* ── Centered logo ── */}
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

        {/* ── Right actions ── */}
        <div className="flex-1 flex justify-end gap-4 xl:gap-6 items-center">
          {!admin && (
            <a
              href="https://wa.me/917309336575?text=Hello%20Pehnawa%2C%20I%20would%20like%20to%20book%20a%20styling%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-2 px-4 py-2 border border-gold/50 hover:border-gold hover:bg-gold hover:text-[#131313] transition-all duration-300 text-[10px] font-montserrat font-bold tracking-widest text-gold rounded-none"
            >
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

      {/* ── Mobile Full-Screen Menu ──────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 bg-[#131313]/97 backdrop-blur-md transition-all duration-500 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full px-6 py-8 sm:px-8 sm:py-12 overflow-y-auto">

          {/* Header row */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-playfair text-[24px] text-white tracking-widest leading-[1.1] flex flex-col items-start">
              <span>PEHNAWA</span>
              <span className="block font-montserrat text-[9px] tracking-[0.25em] font-light text-white/50 mt-1 uppercase">
                by Laxshmi
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-gold transition-colors"
              aria-label="Close menu"
            >
              <SymbolIcon name="close" className="size-7" />
            </button>
          </div>

          {/* Nav links */}
          <div className="flex flex-col mb-auto space-y-1">

            {/* Shop */}
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-montserrat text-[15px] font-semibold tracking-[0.2em] uppercase py-3.5 border-b border-white/5 flex items-center justify-between ${
                pathname === "/products" ? "text-gold" : "text-white/80"
              }`}
            >
              Shop All Pieces
              <SymbolIcon name="arrow_forward" className="size-4 text-white/20" />
            </Link>

            {/* Collections — accordion on mobile */}
            <div className="border-b border-white/5">
              <button
                type="button"
                onClick={() => setMobileCollectionsOpen((v) => !v)}
                aria-expanded={mobileCollectionsOpen}
                className={`w-full flex items-center justify-between py-3.5 font-montserrat text-[15px] font-semibold tracking-[0.2em] uppercase transition-colors ${
                  isCollectionActive ? "text-gold" : "text-white/80"
                }`}
              >
                Collections
                <SymbolIcon
                  name="expand_more"
                  className={`size-5 text-white/30 transition-transform duration-300 ${mobileCollectionsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Accordion body */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  mobileCollectionsOpen ? "max-h-[400px] pb-3" : "max-h-0"
                }`}
              >
                {COLLECTIONS.map((col) => {
                  const active = pathname === col.href;
                  return (
                    <Link
                      key={col.href}
                      href={col.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-start gap-3 py-3 px-3 rounded-none transition-colors ${
                        active ? "border-l-2 border-gold pl-4" : "border-l-2 border-transparent pl-4 hover:border-gold/40"
                      }`}
                    >
                      <div>
                        <p className={`font-montserrat text-[13px] font-semibold tracking-wider uppercase ${active ? "text-gold" : "text-white/70"}`}>
                          {col.name}
                        </p>
                        <p className="font-montserrat text-[11px] text-white/35 mt-0.5 font-light">
                          {col.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* About */}
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-montserrat text-[15px] font-semibold tracking-[0.2em] uppercase py-3.5 border-b border-white/5 flex items-center justify-between ${
                pathname === "/about" ? "text-gold" : "text-white/80"
              }`}
            >
              About Us
              <SymbolIcon name="arrow_forward" className="size-4 text-white/20" />
            </Link>

            {/* Craftsmanship */}
            <Link
              href="/craftsmanship"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-montserrat text-[15px] font-semibold tracking-[0.2em] uppercase py-3.5 border-b border-white/5 flex items-center justify-between ${
                pathname === "/craftsmanship" ? "text-gold" : "text-white/80"
              }`}
            >
              Our Craft
              <SymbolIcon name="arrow_forward" className="size-4 text-white/20" />
            </Link>
          </div>

          {/* Book Consultation CTA */}
          {!admin && (
            <div className="mt-8">
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
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-white/30 text-[10px] tracking-widest uppercase">
            © 2026 PEHNAWA HOUSE OF COUTURE
          </div>
        </div>
      </div>
    </>
  );
}
