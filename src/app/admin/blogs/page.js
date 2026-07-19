"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SymbolIcon from "@/components/SymbolIcon";
import BlogForm from "@/components/admin/BlogForm";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import Image from "next/image";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [view, setView] = useState("list"); // list, add, edit
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blogs");
      if (!res.ok) {
        throw new Error("Failed to fetch blog list");
      }
      const data = await res.json();
      setBlogs(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred fetching blogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleEditClick = (blog) => {
    setSelectedBlog(blog);
    setView("edit");
  };

  const handleDeleteClick = async (blogId, blogTitle) => {
    if (!window.confirm(`Are you sure you want to delete the blog post "${blogTitle}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Failed to delete blog post");
      }

      await fetchBlogs();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthWrapper>
      <Navbar admin />

      <main className="min-h-screen bg-[#131313] pt-20 md:pt-28 pb-16 md:pb-24 px-4 md:px-16 max-w-[1440px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-2">
            <span className="font-montserrat text-[11px] text-gold tracking-widest uppercase font-semibold">
              ADMINISTRATION DOSSIER
            </span>
            <h2 className="font-playfair text-[28px] md:text-[40px] text-white font-medium">
              Blog Editor
            </h2>
            <p className="font-montserrat text-[12px] text-white/50 font-light">
              Create, edit, publish and manage photo + text stories and behind the scenes posts.
            </p>
          </div>

          {view === "list" && (
            <button
              onClick={() => setView("add")}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gold hover:bg-[#C5A028] text-[#131313] font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer"
            >
              <SymbolIcon name="add" className="size-4" />
              Write Blog Post
            </button>
          )}

          {view !== "list" && (
            <button
              onClick={() => setView("list")}
              className="inline-flex items-center gap-1.5 font-montserrat text-[11px] text-gold uppercase tracking-widest hover:underline cursor-pointer"
            >
              <SymbolIcon name="arrow_back" className="size-4" /> Back to List
            </button>
          )}
        </div>

        {/* View content */}
        <div className="space-y-6">
          {view === "list" ? (
            <>
              {error && (
                <div className="p-4 bg-red-950/20 border border-red-500/30 flex gap-3 text-red-400 font-montserrat text-[12px]">
                  <SymbolIcon name="error" className="size-5 self-start flex-shrink-0" />
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
              )}

              {isLoading && blogs.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/10">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="font-montserrat text-[12px] text-white/40 uppercase tracking-widest">Loading blogs catalog...</p>
                </div>
              ) : blogs.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/10">
                  <SymbolIcon name="article" className="size-12 text-white/20 mb-4 mx-auto" />
                  <p className="font-playfair text-[18px] text-white/50 tracking-wider uppercase">No blog posts found.</p>
                  <p className="font-montserrat text-[12px] text-white/30 mt-2">Click &quot;Write Blog Post&quot; to publish your first story.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-white/10 bg-[#1F1F1F]/20">
                  <table className="w-full text-left border-collapse font-montserrat text-[12px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#1F1F1F]/60 text-white/40 uppercase font-bold tracking-widest text-[9px]">
                        <th className="p-4 w-20">Cover</th>
                        <th className="p-4">Title</th>
                        <th className="p-4 w-32">Status</th>
                        <th className="p-4 w-44">Publish Date</th>
                        <th className="p-4 w-32 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {blogs.map((blog) => (
                        <tr key={blog.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4">
                            <div className="relative aspect-[16/9] w-16 overflow-hidden bg-black border border-white/10">
                              {blog.coverImage ? (
                                <Image
                                  src={blog.coverImage}
                                  alt={blog.title}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white/20">NO IMG</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-white max-w-xs md:max-w-md truncate">
                            {blog.title}
                          </td>
                          <td className="p-4">
                            {blog.isPublished ? (
                              <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                Published
                              </span>
                            ) : (
                              <span className="inline-block bg-white/5 text-white/40 border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-white/50">
                            {blog.publishedAt
                              ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => handleEditClick(blog)}
                                className="text-white/60 hover:text-gold transition-colors p-1"
                                title="Edit Blog Post"
                              >
                                <SymbolIcon name="edit" className="size-4.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(blog.id, blog.title)}
                                className="text-white/60 hover:text-red-500 transition-colors p-1"
                                title="Delete Blog Post"
                              >
                                <SymbolIcon name="delete" className="size-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : view === "add" ? (
            <BlogForm
              onSave={() => {
                setView("list");
                fetchBlogs();
              }}
              onCancel={() => setView("list")}
            />
          ) : (
            <BlogForm
              blog={selectedBlog}
              onSave={() => {
                setView("list");
                fetchBlogs();
              }}
              onCancel={() => setView("list")}
            />
          )}
        </div>

      </main>

      <Footer />
    </AdminAuthWrapper>
  );
}
