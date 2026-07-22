import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SymbolIcon from "@/components/SymbolIcon";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug },
  });

  if (!blog || !blog.isPublished) {
    return {
      title: "Story Not Found | Pehnawa by Laxshmi",
    };
  }

  const title = blog.metaTitle || blog.title;
  const description = blog.metaDescription || blog.excerpt;

  return {
    title: `${title} | Pehnawa by Laxshmi`,
    description,
    openGraph: {
      title: `${title} | Pehnawa by Laxshmi`,
      description,
      type: "article",
      publishedTime: blog.publishedAt?.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      images: [
        {
          url: blog.coverImage,
          width: 1200,
          height: 675,
          alt: blog.title,
        },
      ],
    },
  };
}

function renderContent(content) {
  if (!content) return null;
  return content.split("\n\n").map((paragraph, index) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;

    // Bullet points list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items = trimmed.split("\n").map((item) => item.replace(/^[-*]\s+/, ""));
      return (
        <ul key={index} className="list-disc pl-6 mb-6 text-white/80 font-montserrat font-light text-[15px] md:text-[16px] leading-relaxed space-y-2.5">
          {items.map((item, itemIdx) => (
            <li key={itemIdx}>{item}</li>
          ))}
        </ul>
      );
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      return (
        <h4 key={index} className="font-playfair text-[18px] md:text-[20px] font-bold text-white mt-8 mb-4 tracking-wide uppercase">
          {trimmed.replace(/^###\s+/, "")}
        </h4>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={index} className="font-playfair text-[22px] md:text-[24px] font-medium text-gold mt-10 mb-4 tracking-wide">
          {trimmed.replace(/^##\s+/, "")}
        </h3>
      );
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h2 key={index} className="font-playfair text-[26px] md:text-[30px] font-bold text-white mt-12 mb-6 tracking-wide leading-tight">
          {trimmed.replace(/^#\s+/, "")}
        </h2>
      );
    }

    // Plain Paragraph
    return (
      <p
        key={index}
        className="mb-6 leading-relaxed font-light text-white/80 font-montserrat text-[15px] md:text-[16px] tracking-wide"
      >
        {trimmed}
      </p>
    );
  });
}

export default async function BlogDetailsPage({ params }) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug },
  });

  // Strict check: Only show published blogs. Drafts should 404.
  if (!blog || !blog.isPublished) {
    notFound();
  }

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt,
    "image": [blog.coverImage, ...(blog.images || [])],
    "datePublished": blog.publishedAt ? new Date(blog.publishedAt).toISOString() : undefined,
    "dateModified": new Date(blog.updatedAt).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Pehnawa by Laxshmi",
      "url": "https://pehnawabylaxshmi.com",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Pehnawa by Laxshmi",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pehnawabylaxshmi.com/favicon.ico",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://pehnawabylaxshmi.com/blog/${blog.slug}`,
    },
  };

  return (
    <>
      {/* Inject JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313] text-[#e5e2e1] pt-20 pb-24">
        
        {/* Back Link */}
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 font-montserrat text-[10px] md:text-[11px] text-gold uppercase tracking-[0.2em] hover:underline"
          >
            <SymbolIcon name="arrow_back" className="size-4" /> Back to Journal
          </Link>
        </div>

        {/* Article Container */}
        <article className="max-w-4xl mx-auto px-6 space-y-8 md:space-y-12">
          
          {/* Header Metadata */}
          <div className="space-y-4 text-center md:text-left">
            <span className="font-montserrat text-[11px] text-gold tracking-[0.25em] uppercase font-semibold">
              {blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  })
                : "Draft"}
            </span>

            <h1 className="font-playfair text-[32px] md:text-[48px] font-medium text-white leading-[1.2] tracking-wide">
              {blog.title}
            </h1>

            <p className="font-montserrat text-[14px] md:text-[16px] text-white/50 leading-relaxed font-light italic max-w-3xl">
              {blog.excerpt}
            </p>
          </div>

          {/* Cover Photo Banner */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1F1F1F] border border-white/5 gold-glow">
            {blog.coverImage ? (
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/10">No image banner</div>
            )}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Article Main Body Content */}
          <div className="prose prose-invert max-w-none pt-4 border-b border-white/5 pb-10">
            {renderContent(blog.content)}
          </div>

          {/* Additional Images Gallery */}
          {blog.images && blog.images.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="text-center md:text-left space-y-1">
                <span className="font-montserrat text-[10px] tracking-[0.2em] text-gold uppercase block">Visual Dossier</span>
                <h3 className="font-playfair text-[22px] text-white font-medium">Gallery & In-Post Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {blog.images.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-video sm:aspect-[3/4] w-full overflow-hidden bg-[#1F1F1F] border border-white/5 hover:border-gold/20 transition-all duration-300 group"
                  >
                    <Image
                      src={imgUrl}
                      alt={`Gallery view ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-102"
                      sizes="(max-width: 640px) 100vw, 450px"
                    />
                    <div className="absolute inset-4 border border-gold/0 group-hover:border-gold/10 pointer-events-none transition-colors duration-500"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Footer CTA for Blogs */}
          <div className="bg-[#1F1F1F]/30 border border-white/5 p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 text-center md:text-left">
            <div className="space-y-2">
              <span className="font-montserrat text-[10px] text-gold tracking-widest uppercase font-semibold">Couture Styling</span>
              <h4 className="font-playfair text-[20px] text-white font-medium">Inspired by this story?</h4>
              <p className="font-montserrat text-[12px] text-white/50 leading-relaxed font-light">
                Our design consultants are ready to adapt these techniques into a bespoke garment created for your body.
              </p>
            </div>
            <a
              href="https://wa.me/917309336575?text=Hello%20Pehnawa%2C%20I%20read%20your%20blog%20post%20and%20would%20like%20to%20discuss%20a%20bespoke%20design."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-[#C5A028] text-[#131313] px-8 py-3.5 font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap active:scale-98"
            >
              <SymbolIcon name="whatsapp" className="size-4" />
              Book Styling Session
            </a>
          </div>

        </article>
      </main>

      <Footer />
    </>
  );
}
