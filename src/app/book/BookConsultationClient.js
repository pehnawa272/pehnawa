"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SymbolIcon from "@/components/SymbolIcon";

export default function BookConsultation() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [consultationType, setConsultationType] = useState("Virtual");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const dates = [
    { day: "Tue", num: "02", full: "2026-06-02" },
    { day: "Wed", num: "03", full: "2026-06-03" },
    { day: "Thu", num: "04", full: "2026-06-04" },
    { day: "Fri", num: "05", full: "2026-06-05" },
    { day: "Sat", num: "06", full: "2026-06-06" },
    { day: "Sun", num: "07", full: "2026-06-07" },
  ];

  const timeSlots = ["10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Please select a preferred Date and Time slot.");
      return;
    }

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.name,
          clientEmail: form.email,
          clientPhone: form.phone,
          requestedDate: new Date(selectedDate + "T00:00:00Z").toISOString(),
          requestedTime: selectedTime,
          type: consultationType === "Virtual" ? "VIRTUAL" : "IN_PERSON",
          message: form.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || "We could not save your consultation.");
      }

      const resBody = await response.json();
      if (resBody.success) {
        setBookingDetails(resBody.data);
        setSuccess(true);
      } else {
        throw new Error(resBody?.error?.message || "Failed to book consultation");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313] pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 md:px-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-2xl bg-[#1F1F1F] border border-white/10 p-5 sm:p-8 md:p-12 relative z-10 space-y-8 gold-glow">
          
          {success && bookingDetails ? (
            <div className="py-12 text-center space-y-6 animate-fade-in-up">
              <SymbolIcon name="event_available" className="size-18 text-gold animate-bounce mx-auto" />
              <div className="space-y-2">
                <h3 className="font-playfair text-[24px] text-white tracking-widest uppercase">
                  Appointment Scheduled
                </h3>
                <p className="font-montserrat text-[12px] text-gold tracking-widest uppercase font-semibold">
                  BOOKING ID: {bookingDetails.id}
                </p>
              </div>
              <div className="max-w-md mx-auto p-5 sm:p-6 bg-[#131313] border border-white/5 space-y-3 text-left font-montserrat text-[13px]">
                {[
                  { label: "Client Name", value: bookingDetails.clientName },
                  { label: "Type", value: bookingDetails.type === "VIRTUAL" ? "Virtual Atelier" : "In-Person Boutique", gold: true },
                  { label: "Date", value: bookingDetails.requestedDate ? new Date(bookingDetails.requestedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A" },
                  { label: "Time", value: bookingDetails.requestedTime || "N/A" },
                ].map(({ label, value, gold }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-4 text-white/50">
                    <span className="shrink-0">{label}:</span>
                    <span className={`font-medium text-right ${gold ? "text-gold" : "text-white"}`}>{value}</span>
                  </div>
                ))}
              </div>
              <p className="font-montserrat text-[12px] text-white/50 max-w-sm mx-auto leading-relaxed">
                A calendar invitation with digital boutique credentials has been dispatched to <span className="text-white font-semibold">{bookingDetails.clientEmail}</span>.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setSelectedDate("");
                    setSelectedTime("");
                    setForm({ name: "", email: "", phone: "", message: "" });
                  }}
                  className="px-8 py-3 border border-gold text-gold font-montserrat text-[12px] font-bold tracking-widest hover:bg-gold/5 transition-all uppercase rounded-none"
                >
                  Schedule Another Visit
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <span className="font-montserrat text-[10px] text-gold tracking-widest uppercase font-semibold">
                  PEHNAWA BY LAXSHMI SERVICES
                </span>
                <h2 className="font-playfair text-[28px] md:text-[36px] font-medium text-white tracking-wide">
                  Private Styling Consult
                </h2>
                <p className="font-montserrat text-[13px] text-white/50 max-w-md mx-auto leading-relaxed font-light">
                  Reserve a personalized concierge consultation with our master fashion stylists to review silhoutes, sizes, and Lucknow embroidery craft.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Consult Type */}
                <div className="space-y-3">
                  <span className="block text-[11px] font-montserrat text-white/50 tracking-widest uppercase font-semibold text-center">
                    CONSULTATION METHOD
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setConsultationType("Virtual")}
                      className={`py-4 text-[12px] font-montserrat font-bold tracking-widest transition-all ${
                        consultationType === "Virtual"
                          ? "bg-gold text-[#131313] border border-gold"
                          : "border border-white/10 hover:border-gold/50 text-white/60"
                      }`}
                    >
                      VIRTUAL ATELIER
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType("In-Person")}
                      className={`py-4 text-[12px] font-montserrat font-bold tracking-widest transition-all ${
                        consultationType === "In-Person"
                          ? "bg-gold text-[#131313] border border-gold"
                          : "border border-white/10 hover:border-gold/50 text-white/60"
                      }`}
                    >
                      IN-PERSON BOUTIQUE
                    </button>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="block text-[11px] font-montserrat text-white/50 tracking-widest uppercase font-semibold text-center">
                    SELECT PREFERRED DATE
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {dates.map((d) => (
                      <button
                        key={d.full}
                        type="button"
                        onClick={() => setSelectedDate(d.full)}
                        className={`p-3 flex flex-col items-center justify-center border transition-all ${
                          selectedDate === d.full
                            ? "border-gold bg-gold/5 text-gold"
                            : "border-white/10 text-white/50 hover:border-white/30"
                        }`}
                      >
                        <span className="text-[10px] font-montserrat uppercase tracking-wider">{d.day}</span>
                        <span className="font-playfair text-[18px] font-bold mt-1">{d.num}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="block text-[11px] font-montserrat text-white/50 tracking-widest uppercase font-semibold text-center">
                    SELECT PREFERRED TIME SLOT
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3 text-[11px] font-montserrat tracking-wider transition-all ${
                          selectedTime === slot
                            ? "bg-gold text-[#131313] border border-gold font-bold"
                            : "border border-white/10 text-white/50 hover:border-white/30"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Client Contact Info */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="block text-[11px] font-montserrat text-white/50 tracking-widest uppercase font-semibold text-center">
                    CLIENT DOSSIER DETAILS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="book-name" className="block text-[11px] font-montserrat text-white/40 uppercase tracking-widest mb-1.5">
                        Your Name *
                      </label>
                      <input
                        id="book-name"
                        name="name"
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="book-phone" className="block text-[11px] font-montserrat text-white/40 uppercase tracking-widest mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        id="book-phone"
                        name="phone"
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="book-email" className="block text-[11px] font-montserrat text-white/40 uppercase tracking-widest mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="book-email"
                      name="email"
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="book-message" className="block text-[11px] font-montserrat text-white/40 uppercase tracking-widest mb-1.5">
                      Special Style Inquiry / Custom Requirements
                    </label>
                    <textarea
                      id="book-message"
                      name="message"
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="E.g., discussing custom sizing, exploring custom embroidery collections..."
                      className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none placeholder-white/10 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4.5 bg-gold hover:bg-[#C5A028] text-[#121212] font-montserrat text-[12px] font-bold tracking-[0.25em] transition-all uppercase rounded-none"
                  >
                    SCHEDULE CONCIERGE APPOINTMENT
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
