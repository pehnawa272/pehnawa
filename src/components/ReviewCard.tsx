import React from "react";
import Image from "next/image";
import { StarRating } from "@/components/StarRating";

type ReviewCardProps = {
  customerName: string;
  rating: number;
  text: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  productName?: string;
};

export default function ReviewCard({
  customerName,
  rating,
  text,
  images,
  isVerifiedPurchase,
  createdAt,
  productName,
}: ReviewCardProps) {
  const dateStr = new Date(createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-5 flex flex-col gap-4 transition-all hover:border-gold/30">
      {/* Header: name + rating */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-montserrat text-sm font-semibold text-white">
            {customerName}
          </p>
          {productName && (
            <p className="font-montserrat text-[11px] text-white/40 mt-0.5">
              {productName}
            </p>
          )}
        </div>
        <StarRating rating={rating} size={16} />
      </div>

      {/* Review text */}
      <p className="font-montserrat text-[13px] text-white/70 leading-relaxed">
        {text}
      </p>

      {/* Images */}
      {images && images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative w-16 h-16 rounded overflow-hidden border border-white/10"
            >
              <Image
                src={url}
                alt={`Review image ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer: badge + date */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <div>
          {isVerifiedPurchase && (
            <span className="inline-flex items-center gap-1 font-montserrat text-[10px] text-emerald-400 tracking-wider uppercase font-semibold">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Verified Purchase
            </span>
          )}
        </div>
        <span className="font-montserrat text-[10px] text-white/30">
          {dateStr}
        </span>
      </div>
    </div>
  );
}
