"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import ReviewFormModal from "@/components/admin/ReviewFormModal";
import { StarRating } from "@/components/StarRating";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | approved | pending
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      let url = "/api/admin/reviews";
      if (filter === "approved") url += "?isApproved=true";
      else if (filter === "pending") url += "?isApproved=false";

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred fetching reviews");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleApproval = async (review) => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !review.isApproved }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Failed to update review");
      }
      fetchReviews();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Failed to delete review");
      }
      fetchReviews();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-[#131313] text-white px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-playfair text-2xl md:text-3xl text-white font-medium">
                Reviews Management
              </h1>
              <p className="font-montserrat text-sm text-white/50 mt-1">
                Approve, edit, or delete customer reviews.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/reviews"
                className="px-5 py-2.5 bg-white/10 text-white font-montserrat text-sm font-semibold rounded hover:bg-white/20 transition-colors inline-block"
              >
                View Public Reviews
              </Link>
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 bg-gold text-[#131313] font-montserrat text-sm font-semibold rounded hover:bg-gold/80 transition-colors"
              >
                + Add Manual Review
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: "all", label: "All" },
              { key: "approved", label: "Approved" },
              { key: "pending", label: "Pending" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-1.5 rounded font-montserrat text-xs font-semibold tracking-wider uppercase transition-colors ${
                  filter === tab.key
                    ? "bg-gold text-[#131313]"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-500/40 text-red-300 font-montserrat text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <p className="text-white/40 font-montserrat text-sm py-8 text-center">
              Loading reviews...
            </p>
          )}

          {/* Table */}
          {!isLoading && reviews.length === 0 && (
            <p className="text-white/40 font-montserrat text-sm py-12 text-center">
              No reviews found.
            </p>
          )}

          {!isLoading && reviews.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-3 font-montserrat text-[10px] text-white/50 tracking-widest uppercase">
                      Customer
                    </th>
                    <th className="py-3 px-3 font-montserrat text-[10px] text-white/50 tracking-widest uppercase">
                      Product
                    </th>
                    <th className="py-3 px-3 font-montserrat text-[10px] text-white/50 tracking-widest uppercase">
                      Rating
                    </th>
                    <th className="py-3 px-3 font-montserrat text-[10px] text-white/50 tracking-widest uppercase">
                      Review
                    </th>
                    <th className="py-3 px-3 font-montserrat text-[10px] text-white/50 tracking-widest uppercase">
                      Verified
                    </th>
                    <th className="py-3 px-3 font-montserrat text-[10px] text-white/50 tracking-widest uppercase">
                      Status
                    </th>
                    <th className="py-3 px-3 font-montserrat text-[10px] text-white/50 tracking-widest uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-3 font-montserrat text-sm text-white">
                        {review.customerName}
                      </td>
                      <td className="py-3 px-3 font-montserrat text-xs text-white/60">
                        {review.product?.title || review.productId}
                      </td>
                      <td className="py-3 px-3">
                        <StarRating rating={review.rating} size={14} />
                      </td>
                      <td className="py-3 px-3 font-montserrat text-xs text-white/60 max-w-[200px] truncate">
                        {review.text}
                      </td>
                      <td className="py-3 px-3">
                        {review.isVerifiedPurchase ? (
                          <span className="text-emerald-400 font-montserrat text-[10px] uppercase tracking-wider font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="text-white/30 font-montserrat text-[10px] uppercase tracking-wider">
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleApproval(review)}
                          className={`px-3 py-1 rounded font-montserrat text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                            review.isApproved
                              ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60"
                              : "bg-amber-900/30 text-amber-400 border border-amber-500/30 hover:bg-amber-900/50"
                          }`}
                        >
                          {review.isApproved ? "Approved" : "Pending"}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="px-3 py-1 rounded bg-red-900/30 text-red-400 border border-red-500/30 hover:bg-red-900/50 font-montserrat text-[10px] uppercase tracking-wider font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manual review modal */}
        <ReviewFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchReviews(); // refresh list after potential creation
          }}
        />
      </div>
    </AdminAuthWrapper>
  );
}
