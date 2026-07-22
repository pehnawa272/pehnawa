"use client";

import React, { useState, useRef } from "react";
import Modal from "@/components/Modal";
import { StarRating } from "@/components/StarRating";
import Image from "next/image";

type ReviewableProduct = {
  orderId: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productImageUrl: string | null;
};

type ReviewSubmitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fill productId when opened from a product page */
  productId?: string;
  /** Human-readable name shown to the customer */
  productName?: string;
};

export default function ReviewSubmitModal({
  isOpen,
  onClose,
  productId: initialProductId = "",
  productName = "",
}: ReviewSubmitModalProps) {
  // Step 1: verification inputs
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: retrieved options
  const [products, setProducts] = useState<ReviewableProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ReviewableProduct | null>(null);

  // Step 3: review content
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // File Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI Flow & States
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isProductLocked = !!initialProductId;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() && !phone.trim()) {
      setError("Please enter your email or phone number.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reviews/lookup-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lookup failed.");
      }

      const retrievedProducts = (data.products || []) as ReviewableProduct[];

      if (retrievedProducts.length === 0) {
        setError(
          "We couldn't find any delivered orders with reviewable products for this email/phone. Please check the details or contact us if you believe this is an error."
        );
        setLoading(false);
        return;
      }

      if (isProductLocked) {
        // Find matching item for pre-filled product ID
        const match = retrievedProducts.find((p) => p.productId === initialProductId);
        if (!match) {
          setError(
            `We couldn't find a delivered order for "${productName || initialProductId}" under this email/phone, or you have already reviewed it.`
          );
          setLoading(false);
          return;
        }
        setSelectedProduct(match);
        setStep(3); // skip product select
      } else {
        setProducts(retrievedProducts);
        setStep(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retrieve orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (prod: ReviewableProduct) => {
    setSelectedProduct(prod);
    setStep(3);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError(null);

    // 1. Limit check: total images cannot exceed 5
    if (imageUrls.length + files.length > 5) {
      setError("You can upload a maximum of 5 images per review.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

      for (const file of files) {
        // 2. File size validation: max 5MB
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 5MB size limit.`);
        }

        // 3. File type validation: JPG, PNG, WebP only
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          throw new Error(
            `File "${file.name}" is not a supported format. Please upload a JPG, PNG, or WebP image.`
          );
        }

        // 4. Get signed signature parameters from our public route
        const signResponse = await fetch("/api/reviews/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!signResponse.ok) {
          const errBody = await signResponse.json().catch(() => ({}));
          throw new Error(errBody.error || "Failed to get upload signature.");
        }

        const { data: signData } = await signResponse.json();
        const { signature, timestamp, apiKey, cloudName, folder } = signData;

        // 5. Build FormData for direct browser-to-Cloudinary upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        setUploadProgress(40);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errData = await uploadResponse.json().catch(() => ({}));
          throw new Error(errData.error?.message || "Cloudinary upload failed.");
        }

        const uploadData = await uploadResponse.json();
        setImageUrls((prev) => [...prev, uploadData.secure_url]);
      }
      setUploadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEmail("");
    setPhone("");
    setProducts([]);
    setSelectedProduct(null);
    setCustomerName("");
    setRating(0);
    setText("");
    setImageUrls([]);
    setError(null);
    setSuccess(false);
    setStep(1);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProduct) {
      setError("No product selected.");
      return;
    }
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          orderId: selectedProduct.orderId,
          customerName: customerName.trim(),
          rating,
          text: text.trim(),
          images: imageUrls.length > 0 ? imageUrls : undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to submit review.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Write a Review">
      {success ? (
        <div className="py-8 text-center space-y-4">
          <div className="text-4xl">✨</div>
          <h3 className="font-playfair text-xl text-white">Thank you for your review!</h3>
          <p className="font-montserrat text-sm text-white/60">
            Your review has been submitted and will appear once approved by our team.
          </p>
          <button
            onClick={handleClose}
            className="mt-4 px-6 py-2 bg-gold text-[#131313] font-montserrat text-sm font-semibold rounded hover:bg-gold/80 transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <div>
          {/* STEP 1: Email / Phone Order Lookup */}
          {step === 1 && (
            <form onSubmit={handleLookup} className="space-y-5">
              <p className="font-montserrat text-xs text-white/60 leading-relaxed">
                Enter the email or phone number associated with your Pehnawa order to find your purchased items.
              </p>
              <div>
                <label className="block font-montserrat text-[11px] text-white/50 tracking-wider uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white font-montserrat text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none transition-colors"
                />
              </div>
              <div className="text-center font-montserrat text-[10px] text-white/30 uppercase tracking-widest">
                — OR —
              </div>
              <div>
                <label className="block font-montserrat text-[11px] text-white/50 tracking-wider uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white font-montserrat text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded bg-red-900/30 border border-red-500/40 text-red-300 font-montserrat text-sm leading-relaxed">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-white/5 text-white/60 hover:bg-white/10 font-montserrat text-sm rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gold text-[#131313] font-montserrat text-sm font-semibold rounded hover:bg-gold/80 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Searching..." : "Find My Orders"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Select Purchased Product */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-playfair text-sm text-white">Select a product to review:</h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {products.map((prod, idx) => (
                  <button
                    key={`${prod.orderId}-${prod.productId}-${idx}`}
                    onClick={() => handleSelectProduct(prod)}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded hover:border-gold/50 transition-colors text-left"
                  >
                    <div className="relative w-12 h-12 rounded overflow-hidden bg-white/5 flex-shrink-0">
                      {prod.productImageUrl ? (
                        <Image
                          src={prod.productImageUrl}
                          alt={prod.productTitle}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center text-[10px] text-white/40">
                          No Img
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-montserrat text-sm text-white font-medium line-clamp-1">
                        {prod.productTitle}
                      </h4>
                      <p className="font-montserrat text-[10px] text-white/40 mt-0.5">
                        Order #{prod.orderNumber}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-white/5 text-white/70 hover:bg-white/10 font-montserrat text-xs rounded transition-colors"
                >
                  ← Go Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Submit Review */}
          {step === 3 && selectedProduct && (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded">
                <div className="relative w-10 h-10 rounded overflow-hidden bg-white/5 flex-shrink-0">
                  {selectedProduct.productImageUrl ? (
                    <Image
                      src={selectedProduct.productImageUrl}
                      alt={selectedProduct.productTitle}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-[8px] text-white/40">
                      No Img
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-montserrat text-xs text-white font-medium line-clamp-1">
                    {selectedProduct.productTitle}
                  </h4>
                  <p className="font-montserrat text-[9px] text-white/40 mt-0.5">
                    Order #{selectedProduct.orderNumber}
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-montserrat text-[11px] text-white/50 tracking-wider uppercase mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="How you'd like to be credited"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white font-montserrat text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-montserrat text-[11px] text-white/50 tracking-wider uppercase mb-2">
                  Rating
                </label>
                <StarRating
                  rating={rating}
                  size={28}
                  onChange={(val) => setRating(val)}
                />
              </div>

              <div>
                <label className="block font-montserrat text-[11px] text-white/50 tracking-wider uppercase mb-1">
                  Your Review
                </label>
                <textarea
                  placeholder="Tell us about the fabric, the fit, the craftsmanship..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white font-montserrat text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* DIRECT CLOUDINARY FILE UPLOAD */}
              <div>
                <label className="block font-montserrat text-[11px] text-white/50 tracking-wider uppercase mb-1">
                  Upload Photos
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="review-photo-upload"
                  />
                  <label
                    htmlFor="review-photo-upload"
                    className="px-4 py-3 min-h-[44px] bg-white/10 text-white hover:bg-white/20 font-montserrat text-xs rounded transition-colors cursor-pointer inline-flex items-center justify-center gap-2 border border-white/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {isUploading ? "Uploading..." : "Choose Files"}
                  </label>
                  {isUploading && (
                    <span className="font-montserrat text-xs text-gold/80">
                      Uploading ({uploadProgress}%)
                    </span>
                  )}
                </div>

                {imageUrls.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="relative group w-12 h-12 rounded overflow-hidden border border-white/10">
                        <Image src={url} alt={`Upload ${i + 1}`} fill className="object-cover" sizes="48px" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded bg-red-900/30 border border-red-500/40 text-red-300 font-montserrat text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || isUploading}
                  className="w-full py-3 min-h-[44px] bg-gold text-[#131313] font-montserrat text-sm font-semibold rounded hover:bg-gold/80 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {loading ? "Submitting..." : "Submit Review"}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isProductLocked) {
                        setStep(1);
                        setSelectedProduct(null);
                      } else {
                        setStep(2);
                        setSelectedProduct(null);
                      }
                    }}
                    className="w-full py-3 min-h-[44px] bg-white/5 text-white/70 hover:bg-white/10 font-montserrat text-xs rounded transition-colors flex items-center justify-center"
                  >
                    ← Go Back
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-3 min-h-[44px] bg-white/5 text-white/60 hover:bg-white/10 font-montserrat text-xs rounded transition-colors flex items-center justify-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}
