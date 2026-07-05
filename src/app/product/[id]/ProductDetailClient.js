"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";
import { DB } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SymbolIcon from "@/components/SymbolIcon";


export default function ProductDetail({ initialProduct }) {
  const { addToCart } = useCart();
  const product = initialProduct;

  const mediaItems = [
    ...(product?.images || []).map((url) => ({ type: "image", url })),
    ...(product?.videos || []).map((vid) => ({ type: "video", url: vid.url, thumbnail: vid.thumbnail })),
  ];

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const activeMedia = mediaItems[activeMediaIndex] || mediaItems[0] || { type: "image", url: "" };

  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedColour, setSelectedColour] = useState(() => {
    // Pre-select first colour if available
    return product?.colours?.[0] || null;
  });
  
  // Custom Tailoring State
  const [customTailoringEnabled, setCustomTailoringEnabled] = useState(false);

  const [sleeve, setSleeve] = useState('Full Sleeves (22")');
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [height, setHeight] = useState("");
  
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) {
    return notFound();
  }

  const handleAddToBag = () => {
    let customTailoringSpecs = null;
    
    if (customTailoringEnabled) {
      customTailoringSpecs = {
        sleeve,
        customSizeEnabled: true,
        bust: bust ? parseFloat(bust) : null,
        waist: waist ? parseFloat(waist) : null,
        height: height ? parseFloat(height) : null,
      };
    } else {
      customTailoringSpecs = {
        sleeve: 'Full Sleeves (22")',
        customSizeEnabled: false
      };
    }

    addToCart(product, selectedSize, customTailoringSpecs, selectedColour);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

  // Default accessories if product doesn't specify custom ones
  const defaultAccessories = DB.getProductById("noorani-anarkali")?.accessories || [];
  const accessories = product.accessories || defaultAccessories;

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313] pt-20">
        {/* Editorial Product Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 max-w-[1440px] mx-auto border-b border-white/5">
          {/* Gallery Canvas (Left - 7 columns) */}
          <div className="lg:col-span-7 h-full border-r border-white/5">
            <div className="grid grid-cols-1 gap-1">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a1a]">
                {activeMedia.type === "video" ? (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={activeMedia.url}
                    alt={`${product.title} detailed portrait`}
                    fill
                    priority
                    className="object-cover transition-all duration-[2000ms]"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                )}
                
                {/* Small indicator dots */}
                {mediaItems.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {mediaItems.map((item, idx) => (
                       <button
                         key={item.url}
                         type="button"
                         onClick={() => setActiveMediaIndex(idx)}
                         aria-label={`View Product Media ${idx + 1}`}
                         className={`w-2 h-2 rounded-full transition-all ${
                           idx === activeMediaIndex ? "bg-gold w-6" : "bg-white/40 hover:bg-white"
                         }`}
                       />
                     ))}
                  </div>
                )}
              </div>

              {/* Side thumbnail row if multiple photos/videos are present */}
              {mediaItems.length > 1 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
                  {mediaItems.map((item, idx) => (
                     <button
                       key={item.url}
                       type="button"
                       onClick={() => setActiveMediaIndex(idx)}
                       className={`relative aspect-[3/4] overflow-hidden bg-[#1F1F1F] transition-all border ${
                         idx === activeMediaIndex ? "border-gold" : "border-transparent"
                       }`}
                     >
                       {item.type === "video" ? (
                         <div className="w-full h-full relative">
                           {item.thumbnail ? (
                             <Image src={item.thumbnail} alt={`Video thumbnail ${idx + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 33vw, 19vw" />
                           ) : (
                             <div className="w-full h-full bg-black/80 flex items-center justify-center">
                               <SymbolIcon name="photo_camera" className="size-6 text-white/50" />
                             </div>
                           )}
                           {/* Play button overlay */}
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                               <path d="M8 5v14l11-7z"/>
                             </svg>
                           </div>
                         </div>
                       ) : (
                         <Image src={item.url} alt={`${product.title} view ${idx + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 33vw, 19vw" />
                       )}
                     </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Details Canvas (Right - 5 columns) */}
          <div className="lg:col-span-5 px-4 sm:px-6 md:px-12 py-8 sm:py-12 lg:py-24 bg-[#131313] self-start lg:sticky lg:top-20">
            <div className="max-w-md mx-auto space-y-8">
              {/* Category Breadcrumbs */}
              <div className="flex items-center gap-4">
                <span className="font-montserrat text-[10px] text-gold uppercase tracking-widest italic font-semibold">
                  {product.category === "signature"
                    ? "Signature Edit"
                    : product.category === "bridal"
                    ? "Golden Era"
                    : "Professional Ethnic"}
                </span>
                <div className="h-[1px] flex-grow bg-white/10"></div>
              </div>

              {/* Title & Info */}
              <div className="space-y-3">
                <h2 className="font-playfair text-[28px] md:text-[36px] font-medium text-white leading-tight">
                  {product.title}
                </h2>
                <p className="font-montserrat text-[12px] text-white/50 tracking-wider">
                  {product.subTitle}
                </p>
                <p className="font-montserrat text-[14px] md:text-[16px] text-white/70 font-light leading-relaxed">
                  {product.description}
                </p>

                {/* Per-category emotional identity line */}
                {product.category === "bridal" && (
                  <p className="font-playfair text-[13px] text-gold/70 italic leading-relaxed pt-1">
                    For the woman who has arrived — and knows it.
                  </p>
                )}
                {product.category === "signature" && (
                  <p className="font-playfair text-[13px] text-gold/70 italic leading-relaxed pt-1">
                    A piece that announces you before you speak.
                  </p>
                )}
                {product.category === "everyday" && (
                  <p className="font-playfair text-[13px] text-gold/70 italic leading-relaxed pt-1">
                    Crafted for the days that ask everything of you.
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div>
                <div className="block">
                  <span className="font-montserrat text-[22px] md:text-[26px] text-gold font-medium">
                    {product.price ? `₹ ${product.price.toLocaleString()}` : "Enquire for Couture Price"}
                  </span>
                </div>
                {product.price && product.mrp && product.mrp > product.price && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-montserrat text-[14px] text-white/40 line-through">
                      MRP: ₹{product.mrp.toLocaleString()}
                    </span>
                    <span className="font-montserrat text-[11px] text-emerald-500 font-semibold tracking-wider">
                      ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF)
                    </span>
                  </div>
                )}
                <p className="font-montserrat text-[10px] text-white/40 mt-1.5">
                  Inclusive of all taxes & global luxury logistics.
                </p>
              </div>

              {/* Fit Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[12px] font-montserrat tracking-widest font-semibold text-white">
                  <span>SELECT FIT SIZE</span>
                  <button type="button" className="text-gold underline hover:text-white transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-3 min-h-[44px] text-[11px] font-montserrat font-bold tracking-widest transition-all ${
                        selectedSize === sz
                          ? "bg-gold text-[#131313] border border-gold"
                          : "border border-white/20 hover:border-gold text-white"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colour Selection — shown only if product has colour variants */}
              {product.colours && product.colours.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[12px] font-montserrat tracking-widest font-semibold text-white">
                    <span>SELECT COLOUR</span>
                    {selectedColour && (
                      <span className="text-gold text-[11px] font-normal italic">{selectedColour}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colours.map((colour) => (
                      <button
                        key={colour}
                        type="button"
                        onClick={() => setSelectedColour(colour)}
                        title={colour}
                        className={`px-4 py-2.5 min-h-[44px] text-[11px] font-montserrat font-semibold tracking-wider transition-all border ${
                          selectedColour === colour
                            ? "bg-gold text-[#131313] border-gold"
                            : "border-white/20 hover:border-gold text-white"
                        }`}
                      >
                        {colour}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bespoke Tailoring Module */}
              <div className="border border-white/5 bg-[#1F1F1F]/40 p-6 space-y-6">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={customTailoringEnabled}
                    onChange={(e) => setCustomTailoringEnabled(e.target.checked)}
                    className="form-checkbox w-4 h-4 bg-transparent border-white/20 text-gold rounded-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <h4 className="font-montserrat text-[12px] font-bold text-white tracking-widest uppercase flex items-center gap-2">
                    <SymbolIcon name="straighten" className="size-4 text-gold" />
                    ENABLE BESPOKE TAILORING
                  </h4>
                </label>
                
                <p className="font-montserrat text-[11px] text-white/50 leading-relaxed font-light">
                  Experience a private tailored fit. Enter your specifications below. Sizing consultation is complimentary.
                </p>

                {customTailoringEnabled && (
                  <div className="space-y-6 pt-4 border-t border-white/5 animate-fade-in-up">


                    {/* Sleeve Length Selection */}
                    <div className="space-y-2">
                      <label htmlFor="product-sleeve" className="block text-[11px] font-montserrat text-white/50 tracking-wider uppercase font-semibold">
                        Sleeve Length
                      </label>
                      <select
                        id="product-sleeve"
                        name="sleeve"
                        value={sleeve}
                        onChange={(e) => setSleeve(e.target.value)}
                        className="w-full bg-[#131313] border border-white/10 text-white font-montserrat text-[12px] tracking-wider py-2.5 px-4 outline-none focus:border-gold cursor-pointer rounded-none appearance-none"
                      >
                        <option>Full Sleeves (22&quot;)</option>
                        <option>Three-Quarter Sleeves (17&quot;)</option>
                        <option>Cap Sleeves (4&quot;)</option>
                      </select>
                    </div>

                    {/* Personal Body Measurements */}
                    <div className="space-y-4">
                      <span className="block text-[11px] font-montserrat text-white/50 tracking-wider uppercase font-semibold">
                        Body Measurements (Optional - Inches)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label htmlFor="product-bust" className="block text-[11px] font-montserrat text-white/40 uppercase mb-1">
                            Bust
                          </label>
                          <input
                            id="product-bust"
                            name="bust"
                            type="number"
                            value={bust}
                            onChange={(e) => setBust(e.target.value)}
                            placeholder='34"'
                            className="w-full bg-[#131313] border border-white/10 px-3 py-3 min-h-[44px] text-[11px] font-montserrat text-white focus:border-gold outline-none rounded-none text-center"
                          />
                        </div>
                        <div>
                          <label htmlFor="product-waist" className="block text-[11px] font-montserrat text-white/40 uppercase mb-1">
                            Waist
                          </label>
                          <input
                            id="product-waist"
                            name="waist"
                            type="number"
                            value={waist}
                            onChange={(e) => setWaist(e.target.value)}
                            placeholder='28"'
                            className="w-full bg-[#131313] border border-white/10 px-3 py-3 min-h-[44px] text-[11px] font-montserrat text-white focus:border-gold outline-none rounded-none text-center"
                          />
                        </div>
                        <div>
                          <label htmlFor="product-height" className="block text-[11px] font-montserrat text-white/40 uppercase mb-1">
                            Height
                          </label>
                          <input
                            id="product-height"
                            name="height"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder='65"'
                            className="w-full bg-[#131313] border border-white/10 px-3 py-3 min-h-[44px] text-[11px] font-montserrat text-white focus:border-gold outline-none rounded-none text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className={`btn-shimmer w-full py-5 font-montserrat text-[13px] font-bold tracking-[0.2em] transition-all duration-300 uppercase rounded-none flex items-center justify-center gap-3 active:scale-[0.98] ${
                    addedNotice
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-600"
                      : "bg-gold hover:bg-[#e8c840] text-[#121212] hover:shadow-[0_8px_32px_rgba(212,175,55,0.40)]"
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <SymbolIcon name="check" className="size-4" />
                      ADDED TO YOUR BAG
                    </>
                  ) : (
                    <>
                      <SymbolIcon name="shopping_bag" className="size-4" />
                      ADD TO ATELIER BAG
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => alert("Added to your atelier wishlist.")}
                  className="group w-full py-5 border border-white/20 hover:border-gold/60 hover:bg-gold/5 text-white/80 hover:text-gold font-montserrat text-[13px] font-bold tracking-[0.2em] transition-all duration-300 uppercase rounded-none flex items-center justify-center gap-3"
                >
                  <SymbolIcon name="heart" className="size-4 transition-transform duration-300 group-hover:scale-110" />
                  SAVE TO WISHLIST
                </button>
              </div>

              {/* Metadata Badges */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-white/70">
                  <SymbolIcon name="local_shipping" className="size-5 text-gold" />
                  <span className="font-montserrat text-[11px] tracking-wider uppercase font-semibold">
                    {product.craftingHours 
                      ? `Delivery in ${product.craftingHours}-${Number(product.craftingHours) + 2} days` 
                      : "Delivery in 12-14 days"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gold/10 px-4 py-1.5 border border-gold/20">
                  <SymbolIcon name="verified" className="size-4 text-gold" />
                  <span className="font-montserrat text-[11px] text-gold tracking-widest uppercase font-semibold">
                    Lucknow Heritage
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Storytelling Section */}
        <section className="py-16 md:py-32 px-6 md:px-16 bg-[#0e0e0e] border-b border-white/5 relative">
          <div className="max-w-4xl mx-auto space-y-16">
            <h3 className="font-playfair text-[26px] md:text-[36px] font-medium text-white tracking-wide text-center">
              The Soul of the Craft
            </h3>
            
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="w-full md:w-1/2 space-y-6 text-left">
                <p className="font-playfair text-[18px] text-white/80 leading-relaxed italic font-light">
                  &quot;Every stitch in this {product.title} tells a story of patience. In the narrow lanes of old Lucknow, our artisans breathe life into silk using techniques passed down through seven generations.&quot;
                </p>
                <div className="space-y-6 pt-4">
                  <div className="flex items-start gap-4">
                    <SymbolIcon name="diamond" className="size-5 text-gold mt-0.5" />
                    <div>
                      <h5 className="font-montserrat text-[13px] font-bold text-white tracking-wider uppercase">
                        Zari Embroidery
                      </h5>
                      <p className="font-montserrat text-[11px] text-white/50 leading-relaxed font-light">
                        Real gold-dipped silver threads woven with absolute handcrafting precision.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <SymbolIcon name="eco" className="size-5 text-gold mt-0.5" />
                    <div>
                      <h5 className="font-montserrat text-[13px] font-bold text-white tracking-wider uppercase">
                        Organic Materials
                      </h5>
                      <p className="font-montserrat text-[11px] text-white/50 leading-relaxed font-light">
                        Ethically sourced high-grade {product.fabric || "fabrics"} matching quiet luxury.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 relative group">
                <div className="absolute -inset-4 border border-gold/20 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                <div className="relative aspect-square overflow-hidden bg-[#1F1F1F]">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4Xs7Qeevl3_gVYlH7sN3YFzyffp402r51OA2jQHkmSUbq5pad0ksWq4LRQHzCcM5a2o6PzLHEO854INHkvWVALY78ikl11IVJcTdZYSHvKXV0FxVnOl8kjJ_iApHKejcdZh21TDHy1B9jPzqPIhsW-3UkwMZ2IWFUm0f6JLn0brZlHjtbTEf8eJpIUsNlC3zuXbnQNckrp57CkU0YQwM_qPG6piF_0FtoRqSpQ5_qeADiFxI5jtvasaAw-Yy5EwJ7aJnofajAvVw"
                    alt="Artisan working on an embroidery frame"
                    fill
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
