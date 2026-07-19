"use client";

import React, { useState, useEffect } from "react";
import SymbolIcon from "@/components/SymbolIcon";
import CloudinaryUpload from "./CloudinaryUpload";
import Image from "next/image";

export default function BlogForm({ blog, onSave, onCancel }) {
  const isEditMode = !!blog;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    images: [],
    metaTitle: "",
    metaDescription: "",
    isPublished: false,
  });

  const [autoSlug, setAutoSlug] = useState(!isEditMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEditMode && blog) {
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        excerpt: blog.excerpt || "",
        content: blog.content || "",
        coverImage: blog.coverImage || "",
        images: blog.images || [],
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        isPublished: blog.isPublished || false,
      });
      setAutoSlug(false);
    }
  }, [isEditMode, blog]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      if (name === "title" && autoSlug) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return updated;
    });
  };

  const handleSlugBlur = () => {
    // Sanitize slug on blur
    setFormData((prev) => ({
      ...prev,
      slug: prev.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  };

  const handleCoverUpload = (uploadData) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: uploadData.url,
    }));
  };

  const handleAdditionalImageUpload = (uploadData) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, uploadData.url],
    }));
  };

  const removeCoverImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: "",
    }));
  };

  const removeAdditionalImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.title || formData.title.length < 2) {
        throw new Error("Title must be at least 2 characters long");
      }
      if (!formData.slug || !/^[a-z0-9-]+$/.test(formData.slug)) {
        throw new Error("Slug must contain lowercase letters, numbers, and hyphens only");
      }
      if (!formData.excerpt || formData.excerpt.length < 5) {
        throw new Error("Excerpt must be at least 5 characters long");
      }
      if (!formData.content || formData.content.length < 10) {
        throw new Error("Content must be at least 10 characters long");
      }
      if (!formData.coverImage) {
        throw new Error("Cover image is required");
      }

      const method = isEditMode ? "PATCH" : "POST";
      const url = isEditMode ? `/api/admin/blogs/${blog.id}` : "/api/admin/blogs";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error?.message || resData.error || `Failed to save blog post`);
      }

      setSuccess(isEditMode ? "Blog post updated successfully!" : "Blog post created successfully!");
      
      setTimeout(() => {
        onSave();
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred saving the blog post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl bg-[#1F1F1F]/40 border border-white/5 p-6 md:p-10">
      
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 flex gap-3 text-red-400 font-montserrat text-[12px]">
          <SymbolIcon name="error" className="size-5 self-start flex-shrink-0" />
          <p className="leading-relaxed font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 flex gap-3 text-emerald-400 font-montserrat text-[12px]">
          <SymbolIcon name="check_circle" className="size-5 self-start flex-shrink-0" />
          <p className="leading-relaxed font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Title */}
        <div className="col-span-2">
          <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5 font-bold">
            Blog Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none transition-colors"
            placeholder="e.g. Behind the Scenes of our Diwali Couture Shoot"
          />
        </div>

        {/* Slug */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest font-bold">
              URL Slug
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(e) => {
                  setAutoSlug(e.target.checked);
                  if (e.target.checked) {
                    setFormData((prev) => ({
                      ...prev,
                      slug: prev.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, ""),
                    }));
                  }
                }}
                className="accent-gold size-3 rounded-none bg-[#131313] border-white/10"
              />
              <span className="font-montserrat text-[9px] text-white/40 uppercase tracking-wider">Auto-generate</span>
            </label>
          </div>
          <input
            type="text"
            name="slug"
            required
            value={formData.slug}
            onChange={handleInputChange}
            onBlur={handleSlugBlur}
            disabled={autoSlug}
            className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g. behind-the-scenes-diwali-shoot"
          />
        </div>

        {/* Publish Toggle */}
        <div>
          <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5 font-bold">
            Publish Status
          </label>
          <div className="relative">
            <select
              name="isPublished"
              value={formData.isPublished ? "true" : "false"}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.value === "true" }))}
              className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none transition-colors cursor-pointer"
            >
              <option value="false">Draft (Hidden from public)</option>
              <option value="true">Published (Live to public)</option>
            </select>
          </div>
        </div>

        {/* Excerpt */}
        <div className="col-span-2">
          <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5 font-bold">
            Excerpt / Summary
          </label>
          <textarea
            name="excerpt"
            required
            rows={3}
            value={formData.excerpt}
            onChange={handleInputChange}
            className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none transition-colors resize-y"
            placeholder="A short, elegant hook shown on the blog list page..."
          />
        </div>

        {/* Content */}
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest font-bold">
              Main Body Content
            </label>
            <span className="font-montserrat text-[9px] text-white/30 uppercase tracking-widest">
              Supports basic rich text (separate paragraphs with blank lines)
            </span>
          </div>
          <textarea
            name="content"
            required
            rows={15}
            value={formData.content}
            onChange={handleInputChange}
            className="w-full bg-[#131313] border border-white/10 px-4 py-4 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none transition-colors resize-y leading-relaxed"
            placeholder="Enter the main body of the blog post. Start writing here..."
          />
        </div>

        {/* Cover Image Upload */}
        <div className="col-span-2 border-t border-white/5 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <CloudinaryUpload
                label="Cover Image (Listing Card & Header Photo)"
                accept="image/*"
                multiple={false}
                onUploadComplete={handleCoverUpload}
                folder="pehnawa/blogs"
              />
            </div>
            <div>
              {formData.coverImage ? (
                <div className="relative border border-white/10 p-2 bg-[#131313]/50 flex flex-col items-center">
                  <div className="relative aspect-[16/9] w-full max-h-[160px] overflow-hidden bg-black">
                    <Image
                      src={formData.coverImage}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="mt-2 flex items-center gap-1 font-montserrat text-[10px] text-red-500 uppercase tracking-wider font-semibold hover:underline"
                  >
                    <SymbolIcon name="delete" className="size-4" /> Remove Cover Image
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-white/5 aspect-[16/9] flex items-center justify-center bg-[#131313]/20">
                  <span className="font-montserrat text-[10px] text-white/30 uppercase tracking-widest">No Cover Image Selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Images Upload */}
        <div className="col-span-2 border-t border-white/5 pt-6">
          <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest mb-3 font-bold">
            Additional Blog Post Gallery Images
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <CloudinaryUpload
                label="Select Additional Photos"
                accept="image/*"
                multiple={true}
                onUploadComplete={handleAdditionalImageUpload}
                folder="pehnawa/blogs"
              />
            </div>
            
            <div className="space-y-4">
              <span className="block font-montserrat text-[9px] text-white/40 uppercase tracking-wider font-bold">
                Uploaded Gallery ({formData.images.length})
              </span>
              {formData.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square border border-white/10 overflow-hidden bg-black">
                      <Image
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
                      >
                        <SymbolIcon name="delete" className="size-5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-white/5 p-8 flex items-center justify-center bg-[#131313]/20">
                  <span className="font-montserrat text-[10px] text-white/30 uppercase tracking-widest">No gallery images uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO SECTION */}
        <div className="col-span-2 border-t border-white/5 pt-6 space-y-4">
          <div>
            <h4 className="font-playfair text-[16px] text-gold font-bold">SEO Optimization Dossier</h4>
            <p className="font-montserrat text-[11px] text-white/40 font-light mt-0.5">
              Optionally set distinct meta values for search engine indexers. Falls back to Title and Excerpt if left blank.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5 font-bold">
                SEO Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none transition-colors"
                placeholder="Recommended: 50-60 characters"
              />
            </div>

            <div>
              <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5 font-bold">
                SEO Meta Description
              </label>
              <textarea
                name="metaDescription"
                rows={3}
                value={formData.metaDescription}
                onChange={handleInputChange}
                className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none transition-colors resize-y"
                placeholder="Recommended: 150-160 characters"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 border-t border-white/5 pt-6 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-3.5 border border-white/10 hover:border-white/20 text-white font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3.5 bg-gold hover:bg-[#C5A028] text-[#131313] font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "Saving post..." : isEditMode ? "Update Blog Post" : "Publish Blog Post"}
        </button>
      </div>

    </form>
  );
}
