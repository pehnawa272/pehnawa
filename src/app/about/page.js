"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SymbolIcon from "@/components/SymbolIcon";

// =========================================================================
// PHOTO REFERENCES FOR THE EDITORIAL SECTIONS
// =========================================================================
// Replace these placeholders with your actual image paths once they are ready.
// By default, we use existing high-quality images as temporary fallbacks.
// =========================================================================
const ABOUT_ENGLISH_IMAGE = "/roomi.jpeg"; // Edit this path for the English Story image
const ABOUT_HINDI_IMAGE = "/chikankari.jpeg";   // Edit this path for the Hindi Story image
// =========================================================================

export default function AboutUsPage() {
  const [revealActive, setRevealActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealActive(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313] text-[#e5e2e1] pt-20">

        {/* Luxury Hero Section */}
        <section className="relative py-24 md:py-36 flex flex-col items-center justify-center text-center px-6 md:px-16 border-b border-white/5 bg-[#0e0e0e] overflow-hidden">
          {/* Subtle Golden Glow Accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

          <div className={`relative z-10 max-w-4xl space-y-6 transition-all duration-1000 ${revealActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="font-montserrat text-[11px] tracking-[0.4em] text-gold uppercase block">HOUSE OF COUTURE</span>
            <h1 className="font-playfair text-[36px] md:text-[54px] font-semibold text-white leading-[1.15] tracking-wide">
              About Us – Pehnawa by Laxshmi
            </h1>

            {/* Elegant Gold Divider */}
            <div className="flex justify-center py-2">
              <div className="h-[1px] w-24 bg-gold/40 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 bg-gold rotate-45"></div>
              </div>
            </div>

            <p className="font-montserrat text-[15px] md:text-[19px] text-white/80 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
              Celebrating Confidence, Comfort, and Style for Women at Every Stage of Life.
            </p>
          </div>
        </section>

        {/* Section 1 – English Story */}
        <section className="py-24 md:py-32 px-6 md:px-16 max-w-[1440px] mx-auto border-b border-white/5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Text Left (55% / 7 cols) */}
            <div className="lg:col-span-7 space-y-8 order-1">
              <div className="space-y-3">
                <span className="font-montserrat text-[11px] tracking-[0.25em] text-gold uppercase font-semibold block">
                  English
                </span>
                <h2 className="font-playfair text-[28px] md:text-[36px] font-medium text-white tracking-wide leading-tight">
                  Our Journey & Philosophy
                </h2>
                <div className="h-[1px] w-12 bg-gold/30"></div>
              </div>

              <div className="font-montserrat text-[14px] md:text-[15px] text-white/70 space-y-6 leading-relaxed font-light tracking-wide">
                <p>
                  At <strong className="text-white font-medium">Pehnawa by Laxshmi</strong>, we believe that fashion is more than just clothing—it is a reflection of a woman's journey, confidence, and individuality. Inspired by the real-life experiences of women, our brand is dedicated to creating ethnic wear that supports and empowers women through every phase of life.
                </p>
                <p>
                  From young professionals building their careers to mothers balancing family responsibilities, and from women embracing their personal style to those entering their beautiful Golden Era, we understand that every stage brings unique needs and challenges. Our mission is to design ethnic wear that not only looks elegant but also provides exceptional comfort, confidence, and ease for everyday living.
                </p>
                <p>
                  We are especially passionate about serving women in the 40+, 50+, and Plus-Size categories—women who often put everyone else first and rarely take time to prioritize themselves. Through thoughtfully designed silhouettes, premium fabrics, comfortable fits, and timeless styling, we help women rediscover the joy of dressing well and feeling confident in their own skin.
                </p>
                <p>
                  Our <strong className="text-gold font-medium">Golden Era Collection</strong> is a tribute to mature women who deserve fashion that reflects their grace, wisdom, and individuality. We create pieces that offer a perfect balance of sophistication, comfort, and luxury—without compromising on affordability. Whether for work, social gatherings, family occasions, or daily wear, our collections are designed to make women feel stylish, confident, and comfortable throughout their day.
                </p>
                <p>
                  Rooted in the cultural heritage of Lucknow, we proudly bring together the timeless beauty of traditional craftsmanship, including Chikankari, Crochet Work, and Heritage Thread Work, with contemporary designs that suit modern lifestyles. By blending tradition with innovation, we strive to create ethnic wear that honors our roots while meeting the needs of today's women.
                </p>
                <p>
                  At Pehnawa by Laxshmi, our purpose goes beyond fashion. We aim to bring a little more comfort, confidence, and elegance into the lives of women through thoughtfully crafted clothing that celebrates every body type, every age group, and every story.
                </p>
                <p className="font-medium text-white italic pt-2">
                  Because every woman deserves to look beautiful, feel confident, and embrace her style—at every age.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <p className="font-playfair text-[18px] text-gold italic font-medium">Pehnawa by Laxshmi</p>
                <p className="font-montserrat text-[11px] text-white/40 uppercase tracking-widest">
                  Crafted with Heritage. Designed for Comfort. Made for Every Woman. ✨
                </p>
              </div>
            </div>

            {/* Image Right (45% / 5 cols) */}
            <div className="lg:col-span-5 order-2">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1F1F1F] border border-white/5 gold-glow group">
                <Image
                  src={ABOUT_ENGLISH_IMAGE}
                  alt="Elegant Indian Woman in premium designer ethnic wear"
                  fill
                  priority
                  quality={95}
                  unoptimized={true}
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                {/* Thin Golden Border Overlay */}
                <div className="absolute inset-4 border border-gold/10 pointer-events-none group-hover:border-gold/30 transition-colors duration-500"></div>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2 – Hindi Story */}
        <section className="py-24 md:py-32 px-6 md:px-16 max-w-[1440px] mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Image Left (45% / 5 cols) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1F1F1F] border border-white/5 gold-glow group">
                <Image
                  src={ABOUT_HINDI_IMAGE}
                  alt="Elegant mature Indian Woman in premium ethnic attire"
                  fill
                  priority
                  quality={95}
                  unoptimized={true}
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                {/* Thin Golden Border Overlay */}
                <div className="absolute inset-4 border border-gold/10 pointer-events-none group-hover:border-gold/30 transition-colors duration-500"></div>
              </div>
            </div>

            {/* Text Right (55% / 7 cols) */}
            <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
              <div className="space-y-3">
                <span className="font-montserrat text-[11px] tracking-[0.25em] text-gold uppercase font-semibold block">
                  हिंदी
                </span>
                <h2 className="font-playfair text-[28px] md:text-[36px] font-medium text-white tracking-wide leading-tight">
                  हमारी कहानी और विरासत
                </h2>
                <div className="h-[1px] w-12 bg-gold/30"></div>
              </div>

              <div className="font-montserrat text-[15px] md:text-[16px] text-white/70 space-y-6 leading-relaxed font-light tracking-wide">
                <p>
                  <strong className="text-white font-medium">Pehnawa by Laxshmi</strong> केवल एक एथनिक वियर ब्रांड नहीं है, बल्कि महिलाओं की वास्तविक जीवन यात्रा से प्रेरित एक पहल है। हम समझते हैं कि जीवन के हर पड़ाव पर महिलाओं की ज़रूरतें बदलती हैं—चाहे वह करियर की शुरुआत हो, परिवार की जिम्मेदारियाँ हों, मातृत्व का सफर हो, या फिर जीवन का वह खूबसूरत दौर जिसे हम &quot;Golden Era&quot; कहते हैं।
                </p>
                <p>
                  हमारा उद्देश्य ऐसे एथनिक परिधानों का निर्माण करना है जो केवल सुंदर दिखें ही नहीं, बल्कि महिलाओं को हर दिन अधिक आत्मविश्वासी, आरामदायक और सशक्त महसूस कराएँ। इसलिए हमारे प्रत्येक डिज़ाइन में बेहतरीन फैब्रिक, आरामदायक फिट, प्रीमियम फिनिश और आधुनिक स्टाइलिंग का विशेष ध्यान रखा जाता है।
                </p>
                <p>
                  हम मानते हैं कि 40+, 50+ और प्लस साइज महिलाओं को भी फैशन में उतना ही महत्व मिलना चाहिए जितना किसी अन्य आयु वर्ग को। अक्सर परिवार और जिम्मेदारियों के बीच महिलाएँ स्वयं को प्राथमिकता देना भूल जाती हैं। हमारा प्रयास है कि उन्हें ऐसे परिधान मिलें जो उनकी गरिमा, व्यक्तित्व और जीवन अनुभवों का सम्मान करते हुए उन्हें एक लक्ज़री लुक, परफेक्ट फिट और सहज आराम प्रदान करें।
                </p>
                <p>
                  <strong className="text-gold font-medium">Golden Era Collection</strong> हमारी इसी सोच का विस्तार है—जहाँ परिपक्वता, आत्मविश्वास और सुंदरता को आधुनिक एथनिक फैशन के माध्यम से नए रूप में प्रस्तुत किया जाता है। चाहे आप ऑफिस जा रही हों, किसी सामाजिक कार्यक्रम में शामिल हो रही हों, या अपने दैनिक जीवन में सहज और स्टाइलिश दिखना चाहती हों, हमारे डिज़ाइन आपके लिए बनाए गए हैं।
                </p>
                <p>
                  लखनऊ की समृद्ध सांस्कृतिक विरासत से प्रेरित होकर, हम चिकनकारी, क्रोशिया वर्क और पारंपरिक हस्तकला को आधुनिक डिज़ाइनों के साथ जोड़ते हैं। हमारा उद्देश्य केवल कपड़े बेचना नहीं, बल्कि लखनऊ की विरासत को नई पीढ़ी तक पहुँचाना और हर महिला की अलमारी में एक ऐसा परिधान जोड़ना है जो उसकी पहचान को और खूबसूरत बनाए।
                </p>
                <p className="font-medium text-white italic pt-2">
                  Pehnawa by Laxshmi में हम विश्वास करते हैं कि फैशन उम्र का नहीं, आत्मविश्वास का विषय है।
                </p>
                <p className="font-medium text-white italic">
                  क्योंकि हर महिला, हर उम्र में, खूबसूरत दिखने और महसूस करने की हकदार है। ✨
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <p className="font-playfair text-[18px] text-gold italic font-medium">From Lucknow, with Heritage, Comfort & Confidence.</p>
                <p className="font-montserrat text-[11px] text-white/40 uppercase tracking-widest">
                  Pehnawa by Laxshmi – Crafted for Every Woman, Every Age, Every Story.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Editorial Footer CTA Section */}
        <section className="py-24 md:py-32 px-6 md:px-16 bg-[#0e0e0e] border-t border-white/5 relative overflow-hidden flex flex-col items-center text-center">
          {/* Subtle Golden Glow Accent */}
          <div className="absolute bottom-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

          <div className="relative z-10 max-w-3xl space-y-8">
            <span className="font-montserrat text-[11px] tracking-[0.3em] text-gold uppercase block">THE COLLECTION</span>
            <h2 className="font-playfair text-[32px] md:text-[48px] font-semibold text-white tracking-wide leading-tight">
              Every Woman Has A Story.<br />Dress Yours Beautifully.
            </h2>
            <p className="font-montserrat text-[14px] md:text-[16px] text-white/60 max-w-xl mx-auto leading-relaxed font-light">
              Discover collections designed with heritage, comfort, confidence, and timeless elegance.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link
                href="/products"
                className="w-full sm:w-auto inline-block bg-gold text-[#131313] hover:bg-white hover:scale-105 px-10 py-4 font-montserrat text-[12px] font-bold tracking-[0.25em] transition-all uppercase rounded-none border border-gold hover:border-white active:scale-95 text-center"
              >
                Explore Collections
              </Link>
              <a
                href="https://wa.me/917309336575?text=Hello%20Pehnawa%2C%20I%20would%20like%20to%20book%20a%20styling%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gold/45 hover:border-gold hover:bg-gold/5 hover:scale-105 px-10 py-4 font-montserrat text-[12px] font-bold tracking-[0.25em] text-gold transition-all uppercase rounded-none active:scale-95 text-center"
              >
                <SymbolIcon name="calendar_month" className="size-4" />
                Book Consultation
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
