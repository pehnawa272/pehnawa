"use client";

import React, { useState } from "react";
import SymbolIcon from "@/components/SymbolIcon";
import Image from "next/image";

export default function ProductDetailView({ product, onClose }) {
  const [activeMedia, setActiveMedia] = useState(
    product.images?.find((img) => img.isPrimary) || product.images?.[0] || null
  );

  // Parse details and stories out of description if formatted, or display default
  const parseStories = (desc) => {
    const defaultStories = {
      description: desc || "",
      craftsmanship: "",
      fabric: product.fabric || "",
      inspiration: "",
    };

    if (!desc) return defaultStories;

    // Look for storytelling markers in description
    const craftIndex = desc.indexOf("### Craftsmanship Story");
    const fabricIndex = desc.indexOf("### Fabric Story");
    const inspIndex = desc.indexOf("### Inspiration Story");

    if (craftIndex === -1 && fabricIndex === -1 && inspIndex === -1) {
      return defaultStories;
    }

    let description = desc;
    let craftsmanship = "";
    let fabric = product.fabric || "";
    let inspiration = "";

    // Simple slicing based on indexes
    const indexes = [
      { key: "desc", index: 0 },
      { key: "craft", index: craftIndex },
      { key: "fabric", index: fabricIndex },
      { key: "insp", index: inspIndex },
    ].filter((item) => item.index !== -1).sort((a, b) => a.index - b.index);

    for (let i = 0; i < indexes.length; i++) {
      const current = indexes[i];
      const next = indexes[i + 1];
      const start = current.index;
      const end = next ? next.index : desc.length;
      let text = desc.substring(start, end).trim();

      if (current.key === "desc") {
        description = text;
      } else if (current.key === "craft") {
        craftsmanship = text.replace("### Craftsmanship Story", "").trim();
      } else if (current.key === "fabric") {
        fabric = text.replace("### Fabric Story", "").trim();
      } else if (current.key === "insp") {
        inspiration = text.replace("### Inspiration Story", "").trim();
      }
    }

    return { description, craftsmanship, fabric, inspiration };
  };

  const stories = parseStories(product.description);
  const occasionsText = product.occasions?.map((o) => o.occasion.name).join(", ") || "None";
  const formattedPrice = product.isEnquireOnly
    ? "Enquire Only"
    : `₹ ${(product.price / 100).toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-center p-4 md:p-10 animate-fade-in">
      <div className="bg-[#131313] border border-white/10 w-full max-w-[1100px] h-[90vh] md:h-[80vh] flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/40 border border-white/5 text-white/70 hover:text-gold hover:border-gold/30 transition-all rounded-none"
        >
          <SymbolIcon name="close" className="size-5" />
        </button>

        {/* Media Column (Left) */}
        <div className="w-full md:w-1/2 bg-[#131313] flex flex-col justify-between p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/10 h-1/2 md:h-full overflow-y-auto">
          <div className="flex-1 flex items-center justify-center bg-black/20 p-2 relative h-[250px] md:h-[400px]">
            {activeMedia?.url ? (
              activeMedia.url.endsWith(".mp4") || activeMedia.url.endsWith(".webm") ? (
                <video
                  src={activeMedia.url}
                  controls
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Image
                  src={activeMedia.url}
                  alt={product.title}
                  fill
                  className="object-contain cinematic-zoom"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              )
            ) : (
              <div className="text-white/20 flex flex-col items-center">
                <SymbolIcon name="image" className="size-16 mb-2" />
                <span className="font-montserrat text-[10px] tracking-widest uppercase">No media attached</span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <span className="text-[10px] font-montserrat font-bold tracking-widest uppercase bg-gold text-[#131313] px-2.5 py-1">
                {product.category}
              </span>
              {product.isFeatured && (
                <span className="text-[10px] font-montserrat font-bold tracking-widest uppercase bg-white/15 text-white px-2.5 py-1">
                  ⭐ FEATURED
                </span>
              )}
            </div>
          </div>

          {/* Media Thumbnails */}
          {((product.images && product.images.length > 0) || (product.videos && product.videos.length > 0)) && (
            <div className="flex gap-2 overflow-x-auto pt-4 pb-2 hide-scrollbar">
              {product.images?.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveMedia(img)}
                  className={`flex-shrink-0 size-16 border bg-black/20 p-0.5 transition-all relative ${
                    activeMedia?.id === img.id
                      ? "border-gold"
                      : "border-white/5 hover:border-white/20"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover p-0.5" sizes="64px" />
                </button>
              ))}
              {product.videos?.map((vid) => (
                <button
                  key={vid.id}
                  onClick={() => setActiveMedia(vid)}
                  className={`flex-shrink-0 size-16 border bg-black/20 p-0.5 transition-all relative flex items-center justify-center ${
                    activeMedia?.id === vid.id
                      ? "border-gold"
                      : "border-white/5 hover:border-white/20"
                  }`}
                >
                  {vid.thumbnail ? (
                    <Image src={vid.thumbnail} alt="" fill className="object-cover p-0.5" sizes="64px" />
                  ) : (
                    <SymbolIcon name="movie" className="size-6 text-white/50" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <SymbolIcon name="play_arrow" className="size-4 text-gold" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column (Right) */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between h-1/2 md:h-full overflow-y-auto space-y-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-1 border-b border-white/5 pb-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-montserrat text-gold tracking-widest uppercase font-semibold">
                  {product.subCategory || "Atelier Catalog"}
                </span>
                <span className={`text-[10px] font-montserrat px-2 py-0.5 font-bold tracking-widest uppercase ${
                  product.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  product.status === "DRAFT" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                  "bg-white/10 text-white/60 border border-white/15"
                }`}>
                  {product.status}
                </span>
              </div>
              <h3 className="font-playfair text-[24px] md:text-[30px] text-white font-medium leading-tight">
                {product.title}
              </h3>
              {product.subTitle && (
                <p className="font-montserrat text-[12px] text-white/50 leading-relaxed italic">
                  {product.subTitle}
                </p>
              )}
            </div>

            {/* Price & Details */}
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4 text-[12px] font-montserrat">
              <div>
                <span className="block text-[9px] text-white/40 tracking-wider uppercase font-semibold">Pricing Model</span>
                <span className="text-[16px] text-gold font-bold">{formattedPrice}</span>
              </div>
              <div>
                <span className="block text-[9px] text-white/40 tracking-wider uppercase font-semibold">Estimated Stitching</span>
                <span className="text-white font-medium">
                  {product.craftingHours ? `${Math.round(product.craftingHours / 8)} Days (${product.craftingHours} Hours)` : "Made-To-Order Standard"}
                </span>
              </div>
            </div>

            {/* Details Specifications */}
            <div className="space-y-3">
              <span className="block text-[10px] text-white/40 tracking-widest uppercase font-bold">GARMENT BLUEPRINTS</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] font-montserrat">
                <div>
                  <span className="text-white/45">Fabric Composition:</span>
                  <span className="block text-white/80 font-medium">{product.fabric || "Pure Atelier Silk"}</span>
                </div>
                <div>
                  <span className="text-white/45">Embroidery & Work:</span>
                  <span className="block text-white/80 font-medium">{product.embroidery || "Artisanal Handwork"}</span>
                </div>
                <div>
                  <span className="text-white/45">Occasion Suitability:</span>
                  <span className="block text-white/80 font-medium">{occasionsText}</span>
                </div>
                <div>
                  <span className="text-white/45">Unique Identifier (Slug):</span>
                  <span className="block text-white/80 font-mono text-[10px] overflow-hidden text-ellipsis">{product.slug}</span>
                </div>
              </div>
            </div>

            {/* Bullet Points */}
            {product.details?.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="block text-[10px] text-white/40 tracking-widest uppercase font-bold">ATELIER NOTES</span>
                <ul className="list-disc pl-4 text-[12px] font-montserrat text-white/70 space-y-1">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="leading-relaxed">{detail}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Storytelling Dossier */}
            {(stories.description || stories.craftsmanship || stories.inspiration) && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <span className="block text-[10px] text-white/40 tracking-widest uppercase font-bold">HERITAGE STORYTELLING</span>
                
                {stories.description && (
                  <div className="text-[12px] font-montserrat text-white/70 leading-relaxed font-light">
                    {stories.description}
                  </div>
                )}
                {stories.craftsmanship && (
                  <div className="p-4 bg-[#1F1F1F]/20 border border-white/5">
                    <span className="block text-[9px] text-gold tracking-widest uppercase font-bold mb-1">Craftsmanship Story</span>
                    <p className="text-[12px] font-montserrat text-white/60 leading-relaxed font-light italic">
                      {stories.craftsmanship}
                    </p>
                  </div>
                )}
                {stories.inspiration && (
                  <div className="p-4 bg-[#1F1F1F]/20 border border-white/5">
                    <span className="block text-[9px] text-gold tracking-widest uppercase font-bold mb-1">Inspiration Story</span>
                    <p className="text-[12px] font-montserrat text-white/60 leading-relaxed font-light italic">
                      {stories.inspiration}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
