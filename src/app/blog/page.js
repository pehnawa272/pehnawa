import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SymbolIcon from "@/components/SymbolIcon";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Revalidate every minute

export const metadata = {
  title: "Blog | Pehnawa by Laxshmi",
  description: "Explore the stories, traditional craftsmanship, behind the scenes, and style diaries of Pehnawa House of Couture.",
  openGraph: {
    title: "Blog | Pehnawa by Laxshmi",
    description: "Explore the stories, traditional craftsmanship, behind the scenes, and style diaries of Pehnawa House of Couture.",
    type: "website",
  },
};

export default async function BlogListingPage() {
  const blogs = await prisma.blog.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313] text-[#e5e2e1] pt-20">
        
        {/* Luxury Hero Header */}
        <section className="relative py-20 md:py-28 flex flex-col items-center justify-center text-center px-6 md:px-16 border-b border-white/5 bg-[#0e0e0e] overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

          <div className="relative z-10 max-w-4xl space-y-6">
            <span className="font-montserrat text-[11px] tracking-[0.3em] text-gold uppercase block">The Journal</span>
            <h1 className="font-playfair text-[36px] md:text-[54px] font-bold text-white leading-[1.15] tracking-wide">
              Pehnawa Diaries
            </h1>

            {/* Elegant Gold Divider */}
            <div className="flex justify-center py-2">
              <div className="h-[1px] w-24 bg-gold/40 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 bg-gold rotate-45"></div>
              </div>
            </div>

            <p className="font-montserrat text-[14px] md:text-[16px] text-white/60 max-w-xl mx-auto leading-relaxed font-light tracking-wide">
              Step inside our atelier. Discover the handloom heritage, behind-the-scenes shoots, style guides, and structural craftsmanship behind each ensemble.
            </p>
          </div>
        </section>

        {/* Blog Grid Section */}
        <section className="py-20 px-6 md:px-16 max-w-[1440px] mx-auto">
          {blogs.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-white/10">
              <SymbolIcon name="article" className="size-12 text-white/20 mb-4 mx-auto" />
              <p className="font-playfair text-[18px] text-white/50 tracking-wider uppercase">No stories published yet.</p>
              <p className="font-montserrat text-[12px] text-white/30 mt-2">Our latest journals are being stitched and will arrive shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group flex flex-col bg-[#1F1F1F]/20 border border-white/5 hover:border-gold/30 transition-all duration-300 relative flex-1"
                >
                  {/* Link covers card but lets text highlight */}
                  <Link href={`/blog/${blog.slug}`} className="absolute inset-0 z-10" />

                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1F1F1F]">
                    {blog.coverImage ? (
                      <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        priority
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/20">NO COVER</div>
                    )}
                    {/* Inner gold overlay border on hover */}
                    <div className="absolute inset-3 border border-gold/0 group-hover:border-gold/30 transition-all duration-300 pointer-events-none"></div>
                  </div>

                  {/* Content Container */}
                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Publish Date */}
                      <span className="font-montserrat text-[10px] text-gold tracking-widest uppercase font-semibold block">
                        {blog.publishedAt
                          ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              timeZone: "Asia/Kolkata",
                            })
                          : "Draft"}
                      </span>
                      
                      {/* Title */}
                      <h3 className="font-playfair text-[20px] md:text-[22px] font-medium text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="font-montserrat text-[13px] text-white/60 leading-relaxed font-light line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>

                    {/* Read Link */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-gold group-hover:underline">
                      <span className="font-montserrat text-[11px] tracking-widest uppercase font-bold">
                        Read Story
                      </span>
                      <SymbolIcon name="arrow_forward" className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </>
  );
}
