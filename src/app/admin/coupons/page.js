"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SymbolIcon from "@/components/SymbolIcon";
import Link from "next/link";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form Fields
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) {
        throw new Error("Failed to load coupons");
      }
      const json = await res.json();
      setCoupons(json.data?.items || []);
    } catch (err) {
      setError(err.message || "An error occurred while loading coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle Form Submission
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountPercent: parseInt(discountPercent, 10),
        minOrderValue: parseFloat(minOrderValue || "0"),
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        isActive,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || "Failed to create coupon.");
      }

      setSuccess(`Coupon "${payload.code}" created successfully!`);
      // Reset Form
      setCode("");
      setDiscountPercent("");
      setMinOrderValue("");
      setMaxUses("");
      setExpiresAt("");
      setIsActive(true);
      setShowCreateForm(false);
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (id, currentStatus) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update coupon.");
      }

      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
      );
      setSuccess("Coupon status updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id, codeToDelete) => {
    if (!window.confirm(`Are you sure you want to permanently delete the coupon "${codeToDelete}"?`)) {
      return;
    }
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete coupon.");
      }

      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setSuccess(`Coupon "${codeToDelete}" deleted successfully.`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminAuthWrapper>
      <Navbar admin />

      <main className="min-h-screen bg-[#131313] pt-20 md:pt-28 pb-16 md:pb-24 px-4 md:px-16 max-w-[1440px] mx-auto space-y-8 md:space-y-12">
        {/* Breadcrumb & Header */}
        <div className="space-y-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 font-montserrat text-[11px] text-gold tracking-widest uppercase hover:underline"
          >
            <SymbolIcon name="arrow_back" className="size-3.5" />
            Back to Dashboard
          </Link>

          <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <span className="font-montserrat text-[11px] text-gold tracking-widest uppercase font-semibold">
                PROMOTIONS DOSSIER
              </span>
              <h2 className="font-playfair text-[28px] md:text-[40px] text-white font-medium">
                Coupon Code Management
              </h2>
              <p className="font-montserrat text-[12px] text-white/50 font-light">
                Configure percentage-based checkout discounts, minimum purchases, and expiry guidelines.
              </p>
            </div>

            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-gold hover:bg-[#C5A028] text-[#131313] font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all flex items-center gap-2"
            >
              <SymbolIcon name={showCreateForm ? "close" : "add"} className="size-4" />
              {showCreateForm ? "Close Form" : "Create Coupon"}
            </button>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 flex gap-3 text-red-400 font-montserrat text-[12px]">
            <SymbolIcon name="error" className="size-5 text-red-400 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-900/20 border border-green-500/30 flex gap-3 text-green-400 font-montserrat text-[12px]">
            <SymbolIcon name="check_circle" className="size-5 text-green-400 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Create Coupon Form section */}
        {showCreateForm && (
          <div className="bg-[#1F1F1F] border border-white/10 p-6 md:p-10 space-y-6 animate-fade-in-up">
            <h3 className="font-playfair text-[20px] text-white tracking-wide border-b border-white/5 pb-3">
              Design New Coupon
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div>
                  <label className="block text-[10px] font-montserrat text-white/40 tracking-widest uppercase font-semibold mb-1.5">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE15"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[13px] font-montserrat text-white placeholder:text-white/30 focus:border-gold focus:outline-none uppercase"
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-[10px] font-montserrat text-white/40 tracking-widest uppercase font-semibold mb-1.5">
                    Discount Percent (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    placeholder="e.g. 15"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[13px] font-montserrat text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Min Order Value */}
                <div>
                  <label className="block text-[10px] font-montserrat text-white/40 tracking-widest uppercase font-semibold mb-1.5">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 2999"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[13px] font-montserrat text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Max Uses */}
                <div>
                  <label className="block text-[10px] font-montserrat text-white/40 tracking-widest uppercase font-semibold mb-1.5">
                    Max Redemptions Limit (Leave blank for unlimited)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[13px] font-montserrat text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Expires At */}
                <div>
                  <label className="block text-[10px] font-montserrat text-white/40 tracking-widest uppercase font-semibold mb-1.5">
                    Expiry Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[13px] font-montserrat text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4.5 accent-gold cursor-pointer"
                  />
                  <label
                    htmlFor="isActiveCheckbox"
                    className="font-montserrat text-[12px] text-white/80 cursor-pointer select-none uppercase tracking-wider font-semibold"
                  >
                    Activate Immediately
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 bg-gold hover:bg-[#C5A028] disabled:opacity-50 text-[#131313] font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all"
                >
                  {submitting ? "Creating..." : "Save Coupon"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-8 py-4 border border-white/20 hover:bg-white/5 text-white font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons List */}
        {loading ? (
          <div className="py-24 text-center">
            <SymbolIcon name="hourglass_empty" className="size-10 text-gold animate-spin mb-4 mx-auto" />
            <p className="font-playfair text-[16px] text-white/50 tracking-wider">Retrieving Promotions Ledger...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/10 bg-[#1F1F1F]/20">
            <SymbolIcon name="confirmation_number" className="size-16 text-white/10 mb-4 mx-auto" />
            <p className="font-playfair text-[20px] text-white/40 tracking-wider uppercase">
              No promotional coupons on record.
            </p>
            <p className="font-montserrat text-[12px] text-white/30 mt-2">
              Click the "Create Coupon" button above to configure one.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-[#1F1F1F] border border-white/10 overflow-hidden">
              <table className="w-full text-left border-collapse font-montserrat text-[12px]">
                <thead>
                  <tr className="bg-[#131313] border-b border-white/10 text-white/40 text-[10px] tracking-wider uppercase font-bold">
                    <th className="px-6 py-4.5">Code</th>
                    <th className="px-6 py-4.5">Discount</th>
                    <th className="px-6 py-4.5">Min Purchase</th>
                    <th className="px-6 py-4.5">Redemptions</th>
                    <th className="px-6 py-4.5">Expires At</th>
                    <th className="px-6 py-4.5 text-center">Status</th>
                    <th className="px-6 py-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-white/2 transition-colors">
                      {/* Code */}
                      <td className="px-6 py-5 font-mono text-gold font-bold text-[14px]">
                        {c.code}
                      </td>
                      {/* Discount */}
                      <td className="px-6 py-5 font-semibold text-[13px]">
                        {c.discountPercent}% OFF
                      </td>
                      {/* Min Order */}
                      <td className="px-6 py-5">
                        ₹ {(c.minOrderValue / 100).toLocaleString("en-IN")}
                      </td>
                      {/* Redemptions */}
                      <td className="px-6 py-5">
                        <span className="font-medium text-white">{c.usedCount}</span> /{" "}
                        <span className="text-white/40">{c.maxUses !== null ? c.maxUses : "∞"}</span>
                      </td>
                      {/* Expiry */}
                      <td className="px-6 py-5 text-white/60">
                        {c.expiresAt ? (
                          <span className={new Date(c.expiresAt).getTime() <= Date.now() ? "text-red-400" : ""}>
                            {new Date(c.expiresAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : (
                          "No Expiry"
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleToggleActive(c.id, c.isActive)}
                          className={`inline-block px-3 py-1 text-[10px] tracking-widest font-bold uppercase rounded-none border transition-all ${
                            c.isActive
                              ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                          }`}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="p-2 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                          title="Delete Coupon"
                        >
                          <SymbolIcon name="delete" className="size-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="grid grid-cols-1 gap-6 md:hidden">
              {coupons.map((c) => (
                <div key={c.id} className="bg-[#1F1F1F] border border-white/10 p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="font-mono text-gold font-bold text-[16px]">{c.code}</span>
                    <button
                      onClick={() => handleToggleActive(c.id, c.isActive)}
                      className={`px-3 py-1 text-[10px] tracking-widest font-bold uppercase rounded-none border transition-all ${
                        c.isActive
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[12px] font-montserrat">
                    <div>
                      <span className="block text-[9px] text-white/40 tracking-wider uppercase font-semibold">Discount</span>
                      <span className="font-medium text-white text-[13px]">{c.discountPercent}% OFF</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-white/40 tracking-wider uppercase font-semibold">Min Purchase</span>
                      <span className="font-medium text-white">₹ {(c.minOrderValue / 100).toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-white/40 tracking-wider uppercase font-semibold">Redemptions</span>
                      <span className="font-medium text-white">
                        {c.usedCount} / <span className="text-white/40">{c.maxUses !== null ? c.maxUses : "∞"}</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-white/40 tracking-wider uppercase font-semibold">Expires At</span>
                      <span className="font-medium text-white/70">
                        {c.expiresAt ? (
                          <span className={new Date(c.expiresAt).getTime() <= Date.now() ? "text-red-400 font-semibold" : ""}>
                            {new Date(c.expiresAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          "No Expiry"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 flex justify-end">
                    <button
                      onClick={() => handleDeleteCoupon(c.id, c.code)}
                      className="px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 font-montserrat text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-1.5"
                    >
                      <SymbolIcon name="delete" className="size-4" />
                      Delete Coupon
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </AdminAuthWrapper>
  );
}
