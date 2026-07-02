import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Link from "next/link";

export const metadata = {
  title: "Craftsmanship | PEHNAWA BY LAXSHMI",
  description:
    "Discover the centuries-old artisanal traditions behind every Pehnawa by Laxshmi creation — from Lucknow Chikankari to hand-worked Zardozi.",
};

export default function CraftsmanshipPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313]">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative pt-40 pb-24 md:pt-52 md:pb-32 px-6 md:px-16 flex flex-col items-center justify-center text-center border-b border-white/5 bg-[#0e0e0e] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04] bg-[url('/mainhero.jpeg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e]/80 via-transparent to-[#0e0e0e]" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="font-montserrat text-[11px] tracking-[0.3em] text-gold uppercase block">
              The Art of Detail
            </span>
            <h1 className="font-playfair text-[36px] sm:text-[48px] md:text-[64px] font-bold text-white leading-tight tracking-wide">
              Handcrafted in Lucknow
            </h1>
            <div className="pt-2 flex justify-center">
              <div className="h-[1px] w-20 bg-gold/40" />
            </div>
          </div>
        </section>

        {/* ── Section 1: Every Stitch Is a Prayer ─────────────────────────── */}
        <section className="py-20 md:py-32 px-6 md:px-16 border-b border-white/5 bg-[#131313]">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-3">
              <span className="font-montserrat text-[10px] tracking-[0.3em] text-gold uppercase block">
                The Craft
              </span>
              <h2 className="font-playfair text-[28px] md:text-[40px] font-medium text-white leading-snug tracking-wide">
                Every Stitch Is a Prayer
              </h2>
              <div className="h-[1px] w-12 bg-gold/30 mt-4" />
            </div>

            <div className="space-y-6">
              <p className="font-montserrat text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light">
                Long before it is a garment, a Pehnawa piece is a promise — passed from a
                master artisan's hands to the fabric stretched across his frame, and from there,
                to you.
              </p>
              <p className="font-montserrat text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light">
                In the old quarters of Lucknow, where Chikankari was first embroidered for royal
                courts, our karigars still work the way their grandfathers did: by lamplight and
                patience, one needle-pull at a time. A single Chikankari dupatta can carry over
                forty different stitches —{" "}
                <em className="text-white/85">bakhiya, phanda, jaali</em> — each with its own
                name, its own rhythm, its own place in a tradition that predates the idea of
                "fast fashion" by two centuries. Nothing here is printed to look hand-done. It{" "}
                <em className="text-white/85">is</em> hand-done, thread by deliberate thread.
              </p>
              <p className="font-montserrat text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light">
                Alongside it lives Zardosi — the older, heavier art of metallic thread and
                gold-toned wire, once reserved for Mughal royalty. Where Chikankari whispers,
                Zardosi announces. Sequins are couched by hand, one at a time, so the light
                catches each differently. A single Zardosi panel can take a skilled artisan days
                to complete — time we refuse to shortcut, because a craft rushed is a craft lost.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 2: Why We Keep It Slow ──────────────────────────────── */}
        <section className="py-20 md:py-32 px-6 md:px-16 border-b border-white/5 bg-[#0e0e0e]">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-3">
              <span className="font-montserrat text-[10px] tracking-[0.3em] text-gold uppercase block">
                Our Philosophy
              </span>
              <h2 className="font-playfair text-[28px] md:text-[40px] font-medium text-white leading-snug tracking-wide">
                Why We Keep It Slow
              </h2>
              <div className="h-[1px] w-12 bg-gold/30 mt-4" />
            </div>

            <p className="font-montserrat text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light">
              In a world of same-day manufacturing, choosing hand-embroidery is a deliberate
              act of resistance. It means:
            </p>

            <ul className="space-y-6">
              {[
                {
                  bold: "No two pieces are identical.",
                  text: "The hand does not repeat itself the way a machine does — a small irregularity in a stitch is not a flaw, it's a signature.",
                },
                {
                  bold: "Every artisan is known, not anonymous.",
                  text: "The karigars who work on Pehnawa pieces are craftsmen we return to season after season, not a rotating, uncredited workforce.",
                },
                {
                  bold: "The fabric is chosen to honour the work.",
                  text: "Premium georgettes, silks, and cottons are selected specifically for how they hold embroidery — because even the finest handwork looks cheap on the wrong cloth.",
                },
                {
                  bold: "Comfort is engineered in, not sacrificed for beauty.",
                  text: "Every silhouette is tailored to move with real bodies, at every age and every size, so the craftsmanship serves the woman wearing it — not the other way around.",
                },
              ].map((item) => (
                <li key={item.bold} className="flex gap-4 items-start">
                  <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-gold/60" />
                  <p className="font-montserrat text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light">
                    <span className="text-white font-semibold">{item.bold}</span>{" "}
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Section 3: Tradition, Tailored for Today ─────────────────────── */}
        <section className="py-20 md:py-32 px-6 md:px-16 border-b border-white/5 bg-[#131313]">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-3">
              <span className="font-montserrat text-[10px] tracking-[0.3em] text-gold uppercase block">
                Heritage &amp; Modernity
              </span>
              <h2 className="font-playfair text-[28px] md:text-[40px] font-medium text-white leading-snug tracking-wide">
                Tradition, Tailored for Today
              </h2>
              <div className="h-[1px] w-12 bg-gold/30 mt-4" />
            </div>

            <div className="space-y-6">
              <p className="font-montserrat text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light">
                We don't ask Lucknow's heritage to shrink itself to fit modern life. Instead,
                we translate it — pairing centuries-old handwork with silhouettes built for
                boardrooms, family functions, and everything in between. A Chikankari kurta cut
                for a woman leading a meeting. A Zardosi ensemble made for a woman who has
                earned her Golden Era and dresses like it.
              </p>
              <p className="font-montserrat text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light">
                This is what "Desi Vibes, Modern Soul" means to us: heritage that is worn, not
                just admired. A lineage of skill, carried forward one garment at a time.
              </p>
            </div>

            {/* Closing pull quote */}
            <blockquote className="mt-10 border-l-2 border-gold/40 pl-6 py-2">
              <p className="font-playfair text-[17px] md:text-[19px] text-white/80 italic leading-relaxed">
                "Every Pehnawa piece is a small act of preservation — of a craft, a city, and
                the women who deserve to wear its history well."
              </p>
            </blockquote>
          </div>
        </section>

        {/* ── Closing CTA ──────────────────────────────────────────────────── */}
        <section className="py-20 md:py-32 px-6 md:px-16 text-center bg-[#0e0e0e]">
          <div className="max-w-xl mx-auto space-y-6">
            <span className="font-montserrat text-[11px] tracking-[0.3em] text-gold uppercase block">
              Experience It
            </span>
            <h3 className="font-playfair text-[28px] md:text-[36px] font-medium text-white tracking-wide">
              Wear the Story
            </h3>
            <p className="font-montserrat text-[14px] text-white/60 leading-relaxed font-light">
              Every piece in our atelier carries this heritage forward. Explore the collections
              or speak with a stylist.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/products"
                className="inline-block px-10 py-4 bg-gold hover:bg-white text-[#131313] font-montserrat text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.98]"
              >
                Shop the Collection
              </Link>
              <a
                href="https://wa.me/917309336575?text=Hello%20Pehnawa%2C%20I%20would%20like%20to%20book%20a%20styling%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-10 py-4 border border-white/20 hover:border-gold text-white hover:text-gold font-montserrat text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300"
              >
                Book a Consultation
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
