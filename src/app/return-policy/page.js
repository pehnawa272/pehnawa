import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SymbolIcon from "@/components/SymbolIcon";

export const metadata = {
  title: "Return Policy | Pehnawa by Laxshmi",
  description: "Read the return and exchange policy for Pehnawa by Laxshmi House of Couture.",
};

export default function ReturnPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#131313] text-[#e5e2e1] pt-20">
        {/* Hero Banner */}
        <section className="relative py-24 md:py-32 flex flex-col items-center justify-center text-center px-6 md:px-16 border-b border-white/5 bg-[#0e0e0e] overflow-hidden">
          {/* Golden Glow Accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

          <div className="relative z-10 max-w-4xl space-y-6">
            <span className="font-montserrat text-[11px] tracking-[0.4em] text-gold uppercase block">HOUSE OF COUTURE</span>
            <h1 className="font-playfair text-[36px] md:text-[54px] font-semibold text-white leading-[1.15] tracking-wide">
              Return & Exchange Policy
            </h1>

            {/* Elegant Divider */}
            <div className="flex justify-center py-2">
              <div className="h-[1px] w-24 bg-gold/40 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 bg-gold rotate-45"></div>
              </div>
            </div>

            <p className="font-montserrat text-[14px] md:text-[16px] text-white/60 max-w-xl mx-auto leading-relaxed font-light tracking-wide">
              At Pehnawa by Laxshmi, we strive to deliver the highest standards of luxury craftsmanship and bespoke elegance. Here is our policy regarding returns and exchanges.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 px-6 md:px-16 max-w-3xl mx-auto space-y-12">
          {/* Main policy callout */}
          <div className="p-8 bg-[#1f1f1f] border border-gold/20 relative rounded-none space-y-4">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <SymbolIcon name="info" className="size-16 text-gold" />
            </div>
            <h2 className="font-playfair text-[20px] md:text-[24px] text-gold font-medium tracking-wide">
              Key Policy Information
            </h2>
            <p className="font-montserrat text-[14px] md:text-[15px] text-white/80 leading-relaxed font-light tracking-wide">
              Our return policy is strictly applicable <strong className="text-white font-medium">up to 7 days from the date of delivery</strong>. Any requests initiated after this 7-day window will not be eligible for returns or exchanges.
            </p>
          </div>

          <div className="space-y-6 font-montserrat text-[14px] md:text-[15px] text-white/70 leading-relaxed font-light tracking-wide">
            <h3 className="font-playfair text-[20px] text-white font-medium border-b border-white/5 pb-2">
              How to Apply for a Return
            </h3>
            <p>
              To initiate a return or exchange, please contact our support team. We will guide you through the process, including sending pictures of the delivered garment if needed.
            </p>

            <div className="p-6 bg-[#181818] border border-white/5 flex flex-col sm:flex-row items-center gap-6 justify-between mt-4">
              <div>
                <h4 className="font-playfair text-[16px] text-white font-medium">Contact Atelier Support</h4>
                <p className="text-[12px] text-white/50">Call or message on WhatsApp to apply for your return:</p>
              </div>
              <a
                href="tel:+917309336575"
                className="px-6 py-3 bg-gold text-[#131313] font-montserrat text-[12px] font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all flex items-center gap-2"
              >
                <SymbolIcon name="phone" className="size-4" />
                +91 73093 36575
              </a>
            </div>
          </div>

          <div className="space-y-4 font-montserrat text-[14px] md:text-[15px] text-white/70 leading-relaxed font-light tracking-wide pt-6 border-t border-white/5">
            <h3 className="font-playfair text-[20px] text-white font-medium">
              Conditions for Return
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-white/60">
              <li>Garments must be unworn, unwashed, and in their original packaging with all luxury tags intact.</li>
              <li>Bespoke customized items made to client measurements are eligible for alterations, but cannot be returned for a refund unless they arrive damaged.</li>
              <li>Please keep the invoice or proof of purchase handy when contacting support.</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
