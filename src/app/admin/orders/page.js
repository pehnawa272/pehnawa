"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SymbolIcon from "@/components/SymbolIcon";
import Link from "next/link";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUSES = [
  { key: "ALL",           label: "All Orders",      icon: "receipt_long",     color: "text-white/60" },
  { key: "NEW",           label: "New",             icon: "fiber_new",        color: "text-blue-400" },
  { key: "ACCEPTED",      label: "Accepted",        icon: "check_circle",     color: "text-cyan-400" },
  { key: "IN_STITCHING",  label: "In Stitching",    icon: "content_cut",      color: "text-purple-400" },
  { key: "QUALITY_CHECK", label: "Quality Check",   icon: "verified",         color: "text-yellow-400" },
  { key: "READY_TO_SHIP", label: "Ready to Ship",   icon: "inventory_2",      color: "text-orange-400" },
  { key: "SHIPPED",       label: "Shipped",         icon: "local_shipping",   color: "text-indigo-400" },
  { key: "DELIVERED",     label: "Delivered",       icon: "task_alt",         color: "text-green-400" },
  { key: "CANCELLED",     label: "Cancelled",       icon: "cancel",           color: "text-red-400" },
];

const STATUS_ORDER = ["NEW","ACCEPTED","IN_STITCHING","QUALITY_CHECK","READY_TO_SHIP","SHIPPED","DELIVERED"];

const STATUS_BADGE = {
  NEW:           "bg-blue-500/15 text-blue-300 border-blue-500/30",
  ACCEPTED:      "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  IN_STITCHING:  "bg-purple-500/15 text-purple-300 border-purple-500/30",
  QUALITY_CHECK: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  READY_TO_SHIP: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  SHIPPED:       "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  DELIVERED:     "bg-green-500/15 text-green-300 border-green-500/30",
  CANCELLED:     "bg-red-500/15 text-red-300 border-red-500/30",
};

const TIMELINE_STEPS = [
  { status: "NEW",           label: "Order Placed",    icon: "shopping_bag" },
  { status: "ACCEPTED",      label: "Accepted",        icon: "check_circle" },
  { status: "IN_STITCHING",  label: "In Stitching",    icon: "content_cut" },
  { status: "QUALITY_CHECK", label: "Quality Check",   icon: "verified" },
  { status: "READY_TO_SHIP", label: "Ready to Ship",   icon: "inventory_2" },
  { status: "SHIPPED",       label: "Shipped",         icon: "local_shipping" },
  { status: "DELIVERED",     label: "Delivered",       icon: "task_alt" },
];

const TS_FIELDS = {
  ACCEPTED:      "acceptedAt",
  IN_STITCHING:  "stitchingAt",
  QUALITY_CHECK: "qualityCheckAt",
  READY_TO_SHIP: "readyAt",
  SHIPPED:       "shippedAt",
  DELIVERED:     "deliveredAt",
  CANCELLED:     "cancelledAt",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(paise) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getStatusIndex(status) {
  return STATUS_ORDER.indexOf(status);
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, color = "text-gold" }) {
  return (
    <div className="bg-[#1A1A1A] border border-white/8 p-5 space-y-3 hover:border-white/15 transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <SymbolIcon name={icon} className={`size-4.5 ${color}`} />
        <span className="font-montserrat text-[10px] text-white/40 tracking-[0.18em] uppercase font-semibold">
          {label}
        </span>
      </div>
      <span className={`font-playfair text-[30px] font-bold ${color} block leading-none`}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUSES.find((x) => x.key === status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-montserrat font-bold tracking-[0.12em] uppercase border rounded-none ${STATUS_BADGE[status] || "bg-white/5 text-white/50 border-white/10"}`}>
      <SymbolIcon name={s?.icon || "circle"} className="size-3" />
      {s?.label || status}
    </span>
  );
}

function OrderTimeline({ order }) {
  const currentIdx = getStatusIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="space-y-1">
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone    = !isCancelled && currentIdx >= idx;
        const isCurrent = !isCancelled && currentIdx === idx;
        const tsKey     = TS_FIELDS[step.status];
        const ts        = tsKey ? order[tsKey] : (step.status === "NEW" ? order.createdAt : null);

        return (
          <div key={step.status} className="flex items-start gap-3">
            {/* Icon + connector */}
            <div className="flex flex-col items-center flex-shrink-0 w-7">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                isDone
                  ? "bg-gold/20 border-gold text-gold"
                  : "bg-white/3 border-white/10 text-white/20"
              } ${isCurrent ? "ring-2 ring-gold/30 ring-offset-2 ring-offset-[#131313]" : ""}`}>
                <SymbolIcon name={step.icon} className="size-3.5" />
              </div>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={`w-px flex-1 min-h-[16px] my-0.5 ${isDone && currentIdx > idx ? "bg-gold/40" : "bg-white/8"}`} />
              )}
            </div>

            {/* Label + timestamp */}
            <div className="pb-3 pt-0.5 min-w-0">
              <p className={`font-montserrat text-[11px] font-semibold tracking-wider ${isDone ? "text-white" : "text-white/25"}`}>
                {step.label}
              </p>
              {ts && isDone && (
                <p className="font-montserrat text-[10px] text-gold/70 mt-0.5">{formatDate(ts)}</p>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex items-start gap-3 mt-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center border bg-red-500/15 border-red-500/40 text-red-400 flex-shrink-0">
            <SymbolIcon name="cancel" className="size-3.5" />
          </div>
          <div className="pt-0.5">
            <p className="font-montserrat text-[11px] font-semibold tracking-wider text-red-400">Cancelled</p>
            {order.cancelledAt && (
              <p className="font-montserrat text-[10px] text-red-400/60 mt-0.5">{formatDate(order.cancelledAt)}</p>
            )}
            {order.cancellationReason && (
              <p className="font-montserrat text-[10px] text-white/40 mt-1 italic">
                Reason: {order.cancellationReason}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ShippingForm({ order, onSave }) {
  const [form, setForm] = useState({
    shippingCarrier: order.shippingCarrier || "",
    trackingCode:    order.trackingCode    || "",
    trackingUrl:     order.trackingUrl     || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingCarrier: form.shippingCarrier || undefined,
          trackingCode:    form.trackingCode    || undefined,
          trackingUrl:     form.trackingUrl     || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error?.message || "Failed to save shipping info");
      }
      const updated = await res.json().then((d) => d.data);
      setSaved(true);
      onSave(updated);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-montserrat text-white/40 uppercase tracking-widest mb-1.5">
            Courier / Carrier
          </label>
          <input
            type="text"
            value={form.shippingCarrier}
            onChange={(e) => setForm({ ...form, shippingCarrier: e.target.value })}
            placeholder="e.g. Delhivery, FedEx, DTDC"
            className="w-full bg-[#131313] border border-white/10 px-3 py-2.5 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none placeholder:text-white/20"
          />
        </div>
        <div>
          <label className="block text-[10px] font-montserrat text-white/40 uppercase tracking-widest mb-1.5">
            Tracking Number
          </label>
          <input
            type="text"
            value={form.trackingCode}
            onChange={(e) => setForm({ ...form, trackingCode: e.target.value })}
            placeholder="e.g. 123456789012"
            className="w-full bg-[#131313] border border-white/10 px-3 py-2.5 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none placeholder:text-white/20"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-montserrat text-white/40 uppercase tracking-widest mb-1.5">
          Tracking URL (optional)
        </label>
        <input
          type="url"
          value={form.trackingUrl}
          onChange={(e) => setForm({ ...form, trackingUrl: e.target.value })}
          placeholder="https://www.courier.com/track/..."
          className="w-full bg-[#131313] border border-white/10 px-3 py-2.5 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none placeholder:text-white/20"
        />
      </div>

      {error && (
        <p className="font-montserrat text-[11px] text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={`flex items-center gap-2 px-5 py-2.5 font-montserrat text-[11px] font-bold tracking-[0.15em] uppercase transition-all ${
          saved
            ? "bg-green-600/20 border border-green-500/40 text-green-400"
            : "bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-[#131313]"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <SymbolIcon name={saved ? "check" : "save"} className="size-3.5" />
        {saving ? "Saving…" : saved ? "Saved" : "Save Shipping Info"}
      </button>
    </div>
  );
}

function StatusSelector({ order, onUpdate }) {
  const [selected,    setSelected]    = useState(order.status);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);
  const [showCancel,  setShowCancel]  = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleChange = (newStatus) => {
    setSelected(newStatus);
    setError(null);
    if (newStatus === "CANCELLED") {
      setShowCancel(true);
    } else {
      setShowCancel(false);
    }
  };

  const handleSave = async () => {
    if (selected === order.status) return;
    if (selected === "CANCELLED" && !cancelReason.trim()) {
      setError("Please enter a cancellation reason.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = { status: selected };
      if (selected === "CANCELLED") body.cancellationReason = cancelReason.trim();

      const res = await fetch(`/api/admin/orders/${order.dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error?.message || "Failed to update status");
      }
      const updated = await res.json().then((d) => d.data);
      onUpdate(updated);
      setShowCancel(false);
    } catch (e) {
      setError(e.message);
      setSelected(order.status);
    } finally {
      setSaving(false);
    }
  };

  const options = STATUSES.filter((s) => s.key !== "ALL");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving || order.status === "DELIVERED" || order.status === "CANCELLED"}
          className="flex-1 bg-[#131313] border border-white/10 px-3 py-2.5 text-[11px] font-montserrat text-white focus:border-gold outline-none rounded-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {options.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || selected === order.status || order.status === "DELIVERED" || order.status === "CANCELLED"}
          className="px-4 py-2.5 bg-gold hover:bg-[#C5A028] disabled:opacity-40 disabled:cursor-not-allowed text-[#131313] font-montserrat text-[11px] font-bold tracking-wider uppercase transition-all"
        >
          {saving ? "…" : "Update"}
        </button>
      </div>

      {showCancel && (
        <textarea
          rows={2}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Enter cancellation reason (required)…"
          className="w-full bg-[#131313] border border-red-500/30 px-3 py-2.5 text-[12px] font-montserrat text-white focus:border-red-400 outline-none rounded-none placeholder:text-white/20 resize-none"
        />
      )}

      {error && (
        <p className="font-montserrat text-[11px] text-red-400">{error}</p>
      )}

      {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
        <p className="font-montserrat text-[10px] text-white/25 italic">
          Status is final and cannot be changed.
        </p>
      )}
    </div>
  );
}

function OrderDetailPanel({ order, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-[#131313] border-l border-white/10 overflow-y-auto flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-[#131313] border-b border-white/8 px-6 py-4 flex items-center justify-between z-10">
          <div className="space-y-0.5">
            <span className="font-montserrat text-[10px] text-gold tracking-widest uppercase">
              Order Details
            </span>
            <h2 className="font-playfair text-[20px] text-white">{order.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
          >
            <SymbolIcon name="close" className="size-4" />
          </button>
        </div>

        {/* Status badge + created */}
        <div className="px-6 py-3 flex items-center gap-3 border-b border-white/5">
          <StatusBadge status={order.status} />
          <span className="font-montserrat text-[11px] text-white/30">
            {formatDate(order.timestamp)}
          </span>
          {order.payment && (
            <span className="font-montserrat text-[11px] font-semibold text-gold ml-auto">
              {formatINR(order.payment.amount * 100)}
            </span>
          )}
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-white/8 px-6 overflow-x-auto hide-scrollbar">
          {[
            { id: "timeline", label: "Timeline",  icon: "timeline" },
            { id: "customer", label: "Customer",  icon: "person" },
            { id: "items",    label: "Items",     icon: "shopping_bag" },
            { id: "shipping", label: "Shipping",  icon: "local_shipping" },
            { id: "status",   label: "Status",    icon: "edit" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 font-montserrat text-[10px] tracking-wider uppercase font-semibold border-b-2 flex-shrink-0 transition-all ${
                activeTab === t.id
                  ? "border-gold text-gold"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <SymbolIcon name={t.icon} className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 px-6 py-6">
          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-2">
              <h3 className="font-montserrat text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-4">
                Production Timeline
              </h3>
              <OrderTimeline order={order} />
            </div>
          )}

          {/* CUSTOMER */}
          {activeTab === "customer" && (
            <div className="space-y-5">
              <Section title="Customer Information">
                <InfoRow label="Name"  value={order.customer.name} />
                <InfoRow label="Email" value={order.customer.email} />
                <InfoRow label="Phone" value={order.customer.phone} />
              </Section>

              <Section title="Delivery Address">
                <InfoRow label="Address" value={order.customer.address} />
                {order.customer.giftDraping && (
                  <div className="flex items-center gap-2 mt-2">
                    <SymbolIcon name="card_giftcard" className="size-4 text-gold" />
                    <span className="font-montserrat text-[11px] text-gold font-semibold">
                      Gift Draping Requested
                    </span>
                  </div>
                )}
              </Section>

              {order.payment && (
                <Section title="Payment Audit">
                  <InfoRow label="Method"    value={order.payment.method} />
                  <InfoRow label="Status"    value={order.payment.status} />
                  <InfoRow label="Amount"    value={formatINR(order.payment.amount * 100)} />
                  <InfoRow label="Rzp Order"   value={order.payment.razorpayOrderId}   mono />
                  <InfoRow label="Rzp Payment" value={order.payment.razorpayPaymentId} mono />
                  <InfoRow label="Paid At"   value={formatDate(order.payment.createdAt)} />
                </Section>
              )}
            </div>
          )}

          {/* ITEMS */}
          {activeTab === "items" && (
            <div className="space-y-4">
              <h3 className="font-montserrat text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                {order.items.length} Item{order.items.length !== 1 ? "s" : ""}
              </h3>
              {order.items.map((item, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-white/8 p-5 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="font-playfair text-[15px] text-white">{item.title}</h4>
                      <div className="flex gap-3 mt-1 font-montserrat text-[11px] text-white/50">
                        <span>Size: <span className="text-gold font-semibold">{item.size || "Standard"}</span></span>
                        {item.colour && (
                          <span>Colour: <span className="text-gold font-semibold">{item.colour}</span></span>
                        )}
                        <span>Qty: <span className="text-white font-semibold">{item.quantity}</span></span>
                      </div>
                    </div>
                  </div>

                  {item.customTailoring && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <span className="font-montserrat text-[9px] text-gold font-bold uppercase tracking-[0.2em]">
                        Bespoke Directives
                      </span>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-montserrat text-[11px]">

                        {item.customTailoring.sleeve && (
                          <InfoRow label="Sleeves" value={item.customTailoring.sleeve} compact />
                        )}
                        {item.customTailoring.customSizeEnabled && (
                          <>
                            {item.customTailoring.bust   && <InfoRow label="Bust"   value={`${item.customTailoring.bust}"`}   compact />}
                            {item.customTailoring.waist  && <InfoRow label="Waist"  value={`${item.customTailoring.waist}"`}  compact />}
                            {item.customTailoring.height && <InfoRow label="Height" value={`${item.customTailoring.height}"`} compact />}
                          </>
                        )}
                        {item.customTailoring.notes && (
                          <div className="col-span-2">
                            <InfoRow label="Notes" value={item.customTailoring.notes} compact />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SHIPPING */}
          {activeTab === "shipping" && (
            <div className="space-y-5">
              {/* Current tracking info */}
              {(order.shippingCarrier || order.trackingCode) && (
                <Section title="Current Shipping Info">
                  {order.shippingCarrier && <InfoRow label="Carrier" value={order.shippingCarrier} />}
                  {order.trackingCode    && <InfoRow label="Tracking Number" value={order.trackingCode} mono />}
                  {order.trackingUrl     && (
                    <div className="flex justify-between items-center py-1.5">
                      <span className="font-montserrat text-[10px] text-white/40 uppercase tracking-wider">Tracking URL</span>
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-montserrat text-[11px] text-gold hover:underline flex items-center gap-1"
                      >
                        Open Link <SymbolIcon name="open_in_new" className="size-3" />
                      </a>
                    </div>
                  )}
                </Section>
              )}

              <Section title="Update Shipping Details">
                <ShippingForm order={order} onSave={onUpdate} />
              </Section>
            </div>
          )}

          {/* STATUS UPDATE */}
          {activeTab === "status" && (
            <div className="space-y-5">
              <Section title="Update Order Status">
                <p className="font-montserrat text-[11px] text-white/40 leading-relaxed mb-4">
                  Move this order through the production pipeline. Each transition is time-stamped automatically.
                </p>
                <StatusSelector order={order} onUpdate={onUpdate} />
              </Section>

              {/* Quick pipeline reference */}
              <Section title="Production Pipeline">
                <div className="space-y-1 font-montserrat text-[11px]">
                  {STATUS_ORDER.map((s, i) => (
                    <div key={s} className={`flex items-center gap-2 py-1 ${order.status === s ? "text-gold font-semibold" : "text-white/30"}`}>
                      <span className="w-4 text-center text-[10px]">{i + 1}</span>
                      <span>{STATUSES.find((x) => x.key === s)?.label}</span>
                      {order.status === s && <SymbolIcon name="arrow_left" className="size-3 ml-auto" />}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="font-montserrat text-[10px] text-white/40 uppercase tracking-[0.18em] font-semibold border-b border-white/5 pb-2">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false, compact = false }) {
  if (!value) return null;
  return (
    <div className={`flex justify-between items-start gap-4 ${compact ? "py-0.5" : "py-1.5"}`}>
      <span className="font-montserrat text-[10px] text-white/35 uppercase tracking-wider flex-shrink-0">{label}</span>
      <span className={`font-montserrat text-[11px] text-white/80 text-right break-all ${mono ? "font-mono text-[10px] text-white/50" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function OrderRow({ order, onClick }) {
  const statusMeta = STATUSES.find((s) => s.key === order.status);
  return (
    <div
      onClick={() => onClick(order)}
      className="bg-[#1A1A1A] border border-white/8 p-5 hover:border-white/20 hover:bg-[#1F1F1F] transition-all duration-200 cursor-pointer group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-playfair text-[14px] text-white font-medium group-hover:text-gold transition-colors">
              {order.id}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-montserrat text-[11px] text-white/40">
            <span>{order.customer.name}</span>
            <span>{order.customer.email}</span>
            <span className="text-white/25">·</span>
            <span>{formatDate(order.timestamp)}</span>
          </div>
          <div className="font-montserrat text-[11px] text-white/30">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            {order.items.map((i) => i.title).join(", ").length > 0 && (
              <span className="text-white/20"> — {order.items.map((i) => i.title).join(", ")}</span>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 flex-shrink-0">
          <span className="font-playfair text-[18px] text-gold font-bold">
            {order.payment ? formatINR(order.payment.amount * 100) : "—"}
          </span>
          <SymbolIcon name="chevron_right" className="size-4 text-white/20 group-hover:text-gold transition-colors" />
        </div>
      </div>

      {/* Mini-pipeline progress bar */}
      {order.status !== "CANCELLED" && (
        <div className="mt-4 flex gap-1">
          {STATUS_ORDER.map((s, i) => (
            <div
              key={s}
              className={`h-0.5 flex-1 rounded-full transition-all ${
                getStatusIndex(order.status) >= i ? "bg-gold" : "bg-white/8"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search,       setSearch]       = useState("");
  const [searchInput,  setSearchInput]  = useState("");
  const [selected,     setSelected]     = useState(null);
  const [fetchError,   setFetchError]   = useState(null);

  // Load orders
  const fetchOrders = useCallback(async (statusFilter, searchQuery) => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      const raw  = data?.data?.items || [];

      const mapped = raw.map((o) => ({
        id:        o.orderNumber || o.id,
        dbId:      o.id,
        status:    o.status,
        timestamp: o.createdAt,
        createdAt: o.createdAt,
        // Timeline timestamps
        acceptedAt:      o.acceptedAt,
        stitchingAt:     o.stitchingAt,
        qualityCheckAt:  o.qualityCheckAt,
        readyAt:         o.readyAt,
        shippedAt:       o.shippedAt,
        deliveredAt:     o.deliveredAt,
        cancelledAt:     o.cancelledAt,
        cancellationReason: o.cancellationReason,
        // Shipping
        shippingCarrier: o.shippingCarrier,
        trackingCode:    o.trackingCode,
        trackingUrl:     o.trackingUrl,
        // Customer
        customer: {
          name:        o.user?.name  || "N/A",
          email:       o.user?.email || "N/A",
          phone:       o.user?.phone || "N/A",
          address:     o.address
            ? [o.address.line1, o.address.line2, o.address.city, o.address.state, o.address.pincode, o.address.country]
                .filter(Boolean).join(", ")
            : "N/A",
          giftDraping: o.giftDraping,
        },
        payment: o.payment
          ? {
              method:            o.payment.method,
              status:            o.payment.status,
              amount:            (o.payment.amount || 0) / 100,
              razorpayOrderId:   o.payment.razorpayOrderId   || "—",
              razorpayPaymentId: o.payment.razorpayPaymentId || "—",
              createdAt:         o.payment.createdAt,
            }
          : null,
        items: (o.items || []).map((item) => ({
          id:             item.id,
          title:          item.productTitle,
          size:           item.size || "Standard",
          colour:         item.colour,
          quantity:       item.quantity,
          customTailoring: item.customTailoring,
        })),
      }));

      setOrders(mapped);
    } catch (e) {
      setFetchError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(filterStatus, search);
  }, [filterStatus, search, fetchOrders]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // When an order is updated via the detail panel, update local state
  const handleOrderUpdate = useCallback((updatedRaw) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.dbId !== updatedRaw.id) return o;
        return {
          ...o,
          status:            updatedRaw.status,
          acceptedAt:        updatedRaw.acceptedAt,
          stitchingAt:       updatedRaw.stitchingAt,
          qualityCheckAt:    updatedRaw.qualityCheckAt,
          readyAt:           updatedRaw.readyAt,
          shippedAt:         updatedRaw.shippedAt,
          deliveredAt:       updatedRaw.deliveredAt,
          cancelledAt:       updatedRaw.cancelledAt,
          cancellationReason: updatedRaw.cancellationReason,
          shippingCarrier:   updatedRaw.shippingCarrier,
          trackingCode:      updatedRaw.trackingCode,
          trackingUrl:       updatedRaw.trackingUrl,
        };
      })
    );
    // Also update selected if it's the same order
    setSelected((prev) => {
      if (!prev || prev.dbId !== updatedRaw.id) return prev;
      return {
        ...prev,
        status:            updatedRaw.status,
        acceptedAt:        updatedRaw.acceptedAt,
        stitchingAt:       updatedRaw.stitchingAt,
        qualityCheckAt:    updatedRaw.qualityCheckAt,
        readyAt:           updatedRaw.readyAt,
        shippedAt:         updatedRaw.shippedAt,
        deliveredAt:       updatedRaw.deliveredAt,
        cancelledAt:       updatedRaw.cancelledAt,
        cancellationReason: updatedRaw.cancellationReason,
        shippingCarrier:   updatedRaw.shippingCarrier,
        trackingCode:      updatedRaw.trackingCode,
        trackingUrl:       updatedRaw.trackingUrl,
      };
    });
  }, []);

  // Metrics (computed from ALL loaded orders)
  const [allOrders, setAllOrders] = useState([]);
  useEffect(() => {
    // Fetch all orders once for metrics (no filter)
    fetch("/api/admin/orders?limit=500")
      .then((r) => r.json())
      .then((d) => setAllOrders(d?.data?.items || []))
      .catch(() => {});
  }, []);

  const metrics = useMemo(() => {
    const count = (s) => allOrders.filter((o) => o.status === s).length;
    const totalVal = allOrders.reduce((sum, o) => sum + (o.total || 0), 0) / 100;
    return {
      total:        allOrders.length,
      totalVal,
      inStitching:  count("IN_STITCHING"),
      readyToShip:  count("READY_TO_SHIP"),
      shipped:      count("SHIPPED"),
      delivered:    count("DELIVERED"),
    };
  }, [allOrders]);

  return (
    <AdminAuthWrapper>
      <Navbar />

      <main className="min-h-screen bg-[#131313] pt-28 pb-24 px-4 md:px-10 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-8">
          <div className="space-y-1.5">
            <Link href="/admin" className="inline-flex items-center gap-1.5 font-montserrat text-[10px] text-white/30 hover:text-gold transition-colors tracking-wider uppercase mb-2">
              <SymbolIcon name="arrow_back" className="size-3" />
              Admin Dashboard
            </Link>
            <span className="block font-montserrat text-[10px] text-gold tracking-widest uppercase font-semibold">
              Order Management
            </span>
            <h1 className="font-playfair text-[32px] md:text-[42px] text-white font-medium leading-tight">
              Production Orders
            </h1>
            <p className="font-montserrat text-[12px] text-white/40 font-light">
              Manage every bespoke order from payment through delivery.
            </p>
          </div>
          <button
            onClick={() => fetchOrders(filterStatus, search)}
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/60 hover:border-gold/40 hover:text-gold font-montserrat text-[11px] uppercase tracking-wider transition-all self-start md:self-auto"
          >
            <SymbolIcon name="refresh" className="size-3.5" />
            Refresh
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <MetricCard icon="receipt_long"    label="Total Orders"      value={metrics.total}       color="text-white" />
          <MetricCard icon="diamond"         label="Total Value"       value={`₹${metrics.totalVal.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} color="text-gold" />
          <MetricCard icon="content_cut"     label="In Stitching"     value={metrics.inStitching} color="text-purple-400" />
          <MetricCard icon="inventory_2"     label="Ready to Ship"    value={metrics.readyToShip} color="text-orange-400" />
          <MetricCard icon="local_shipping"  label="Shipped"          value={metrics.shipped}     color="text-indigo-400" />
          <MetricCard icon="task_alt"        label="Delivered"        value={metrics.delivered}   color="text-green-400" />
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <SymbolIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order number, name, email, phone…"
              className="w-full bg-[#1A1A1A] border border-white/8 pl-10 pr-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none placeholder:text-white/20"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#1A1A1A] border border-white/8 px-4 py-3 pr-10 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none cursor-pointer appearance-none min-w-[180px]"
            >
              {STATUSES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <SymbolIcon name="keyboard_arrow_down" className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
          {STATUSES.map((s) => {
            const cnt = s.key === "ALL"
              ? allOrders.length
              : allOrders.filter((o) => o.status === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setFilterStatus(s.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 font-montserrat text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 border transition-all ${
                  filterStatus === s.key
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-white/8 bg-transparent text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
              >
                <SymbolIcon name={s.icon} className="size-3" />
                {s.label}
                <span className="ml-0.5 text-[9px] opacity-60">({cnt})</span>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="font-montserrat text-[12px] text-white/30 tracking-wider uppercase">Loading orders…</p>
          </div>
        ) : fetchError ? (
          <div className="py-24 text-center space-y-3 border border-dashed border-red-500/20">
            <SymbolIcon name="error_outline" className="size-12 text-red-400/40 mx-auto" />
            <p className="font-montserrat text-[12px] text-red-400/70">{fetchError}</p>
            <button
              onClick={() => fetchOrders(filterStatus, search)}
              className="font-montserrat text-[11px] text-gold underline uppercase tracking-wider"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/8 space-y-3">
            <SymbolIcon name="receipt_long" className="size-14 text-white/10 mx-auto" />
            <p className="font-playfair text-[18px] text-white/30">No orders found</p>
            <p className="font-montserrat text-[11px] text-white/20">
              {search ? `No results for "${search}"` : "No orders match this filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-montserrat text-[10px] text-white/25 tracking-wider uppercase mb-3">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
              {filterStatus !== "ALL" ? ` · ${STATUSES.find((s) => s.key === filterStatus)?.label}` : ""}
            </p>
            {orders.map((order) => (
              <OrderRow
                key={order.dbId}
                order={order}
                onClick={setSelected}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Detail Panel */}
      {selected && (
        <OrderDetailPanel
          order={selected}
          onUpdate={handleOrderUpdate}
          onClose={() => setSelected(null)}
        />
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </AdminAuthWrapper>
  );
}
