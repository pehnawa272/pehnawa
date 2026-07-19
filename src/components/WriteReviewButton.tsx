"use client";

import { useState } from "react";
import ReviewSubmitModal from "@/components/ReviewSubmitModal";

/**
 * Client-side "Write a Review" button + modal for the public /reviews page.
 * No product pre-filled — the customer enters the product they're reviewing.
 */
export default function WriteReviewButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-2.5 bg-gold text-[#131313] font-montserrat text-sm font-semibold rounded hover:bg-gold/80 transition-colors"
      >
        ✍ Write a Review
      </button>

      <ReviewSubmitModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
