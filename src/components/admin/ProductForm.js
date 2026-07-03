"use client";

import React, { useState, useEffect } from "react";
import SymbolIcon from "@/components/SymbolIcon";
import CloudinaryUpload from "./CloudinaryUpload";
import { getOccasions } from "@/app/admin/actions";
import Image from "next/image";

function parseStories(desc) {
  const stories = { description: desc, craftsmanship: "", fabric: "", inspiration: "" };
  if (!desc) return stories;

  const craftIndex = desc.indexOf("### Craftsmanship Story");
  const fabricIndex = desc.indexOf("### Fabric Story");
  const inspIndex = desc.indexOf("### Inspiration Story");

  if (craftIndex === -1 && fabricIndex === -1 && inspIndex === -1) {
    return stories;
  }

  let description = desc;
  let craftsmanship = "";
  let fabric = "";
  let inspiration = "";

  const indexes = [
    { key: "desc", index: 0 },
    { key: "craft", index: craftIndex },
    { key: "fabric", index: fabricIndex },
    { key: "insp", index: inspIndex },
  ].filter((item) => item.index !== -1).sort((a, b) => a.index - b.index);

  for (let i = 0; i < indexes.length; i++) {
    const current = indexes[i];
    const next = indexes[i + 1];
    const start = current.index;
    const end = next ? next.index : desc.length;
    let text = desc.substring(start, end).trim();

    if (current.key === "desc") {
      description = text;
    } else if (current.key === "craft") {
      craftsmanship = text.replace("### Craftsmanship Story", "").trim();
    } else if (current.key === "fabric") {
      fabric = text.replace("### Fabric Story", "").trim();
    } else if (current.key === "insp") {
      inspiration = text.replace("### Inspiration Story", "").trim();
    }
  }

  return { description, craftsmanship, fabric, inspiration };
}

export default function ProductForm({ product, onSave, onCancel }) {
  const isEditMode = !!product;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    subTitle: "",
    description: "",
    fabric: "",
    embroidery: "",
    category: "EVERYDAY",
    subCategory: "KURTAS",
    price: "",
    mrp: "",
    isEnquireOnly: false,
    craftingHours: 24, // 3 days default
    status: "PUBLISHED",
    isFeatured: false,
    occasionIds: [],
    details: [""],
    // Storytelling (Serialized into description)
    craftsmanshipStory: "",
    fabricStory: "",
    inspirationStory: "",
    // Customization (Serialized into details)
    allowCustomSizing: true,
    allowSleeveCustomization: false,
    allowNecklineCustomization: false,
    allowLengthCustomization: false,
    // SEO (Serialized into details or handled in state)
    metaTitle: "",
    metaDescription: "",
  });

  const [occasions, setOccasions] = useState([]);
  const [colours, setColours] = useState([]);   // ["Ivory White", "Midnight Black", ...]
  const [colourInput, setColourInput] = useState(""); // live text in colour input field
  const [images, setImages] = useState([]); // [{ url, cloudinaryId, isPrimary }]
  const [videos, setVideos] = useState([]);  // [{ url, cloudinaryId }]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load occasions and product details (if editing)
  useEffect(() => {
    async function loadData() {
      const res = await getOccasions();
      if (res.success) {
        setOccasions(res.data);
      }

      if (isEditMode && product) {
        // Parse storytelling and customization from product
        const parsedStories = parseStories(product.description || "");
        
        // Parse customization options out of details if saved there
        const customSizing = product.details?.some((d) => d.includes("Custom Sizing: Enabled")) ?? true;
        const sleeveCustom = product.details?.some((d) => d.includes("Sleeve Customization: Enabled")) ?? false;
        const necklineCustom = product.details?.some((d) => d.includes("Neckline Customization: Enabled")) ?? false;
        const lengthCustom = product.details?.some((d) => d.includes("Length Customization: Enabled")) ?? false;
        
        // Parse SEO from details
        const metaT = product.details?.find((d) => d.startsWith("Meta Title: "))?.replace("Meta Title: ", "") || "";
        const metaD = product.details?.find((d) => d.startsWith("Meta Description: "))?.replace("Meta Description: ", "") || "";

        // Filter out structural details from user-facing bullet points
        const userDetails = product.details?.filter(
          (d) =>
            !d.startsWith("Custom Sizing:") &&
            !d.startsWith("Sleeve Customization:") &&
            !d.startsWith("Neckline Customization:") &&
            !d.startsWith("Length Customization:") &&
            !d.startsWith("Meta Title:") &&
            !d.startsWith("Meta Description:")
        ) || [""];

        setFormData({
          title: product.title || "",
          slug: product.slug || "",
          subTitle: product.subTitle || "",
          description: parsedStories.description,
          fabric: product.fabric || "",
          embroidery: product.embroidery || "",
          category: product.category || "EVERYDAY",
          subCategory: product.subCategory || "KURTAS",
          price: product.price ? (product.price / 100).toString() : "",
          mrp: product.mrp ? (product.mrp / 100).toString() : "",
          isEnquireOnly: product.isEnquireOnly || false,
          craftingHours: product.craftingHours || 24,
          status: product.status || "DRAFT",
          isFeatured: product.isFeatured || false,
          occasionIds: product.occasions?.map((o) => o.occasionId) || [],
          details: userDetails.length ? userDetails : [""],
          craftsmanshipStory: parsedStories.craftsmanship,
          fabricStory: parsedStories.fabric,
          inspirationStory: parsedStories.inspiration,
          allowCustomSizing: customSizing,
          allowSleeveCustomization: sleeveCustom,
          allowNecklineCustomization: necklineCustom,
          allowLengthCustomization: lengthCustom,
          metaTitle: metaT,
          metaDescription: metaD,
        });

        if (product.images) setImages(product.images);
        if (product.videos) setVideos(product.videos);
        if (product.colours) setColours(product.colours);
      }
    }

    loadData();
  }, [isEditMode, product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      // Auto-generate slug from title if title is edited and not in edit mode
      if (name === "title" && !isEditMode) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return updated;
    });
  };

  // Details bullet point management
  const handleDetailChange = (index, value) => {
    setFormData((prev) => {
      const details = [...prev.details];
      details[index] = value;
      return { ...prev, details };
    });
  };

  const addDetailField = () => {
    setFormData((prev) => ({ ...prev, details: [...prev.details, ""] }));
  };

  const removeDetailField = (index) => {
    setFormData((prev) => {
      const details = prev.details.filter((_, i) => i !== index);
      return { ...prev, details: details.length ? details : [""] };
    });
  };

  // Colour tag management
  const handleColourInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addColour();
    }
  };

  const addColour = () => {
    const trimmed = colourInput.trim().replace(/,$/, "");
    if (trimmed && !colours.includes(trimmed)) {
      setColours((prev) => [...prev, trimmed]);
    }
    setColourInput("");
  };

  const removeColour = (colourToRemove) => {
    setColours((prev) => prev.filter((c) => c !== colourToRemove));
  };

  // Occasions checkbox toggle
  const handleOccasionToggle = (occasionId) => {
    setFormData((prev) => {
      const occasionIds = prev.occasionIds.includes(occasionId)
        ? prev.occasionIds.filter((id) => id !== occasionId)
        : [...prev.occasionIds, occasionId];
      return { ...prev, occasionIds };
    });
  };

  // Media upload handlers
  const handleImageUpload = (img) => {
    setImages((prev) => [
      ...prev,
      { url: img.url, cloudinaryId: img.cloudinaryId, isPrimary: prev.length === 0 },
    ]);
  };

  const handleVideoUpload = (vid) => {
    setVideos((prev) => [...prev, { url: vid.url, cloudinaryId: vid.cloudinaryId }]);
  };

  const removeImage = async (index, imageId) => {
    if (imageId) {
      // If it exists in the database, call remove API
      try {
        await fetch(`/api/admin/products/${product.id}?action=remove-image`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId }),
        });
      } catch (err) {
        console.error("Failed to delete image from DB", err);
      }
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = async (index, videoId) => {
    if (videoId) {
      try {
        await fetch(`/api/admin/products/${product.id}?action=remove-video`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
      } catch (err) {
        console.error("Failed to delete video from DB", err);
      }
    }
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Zod client-side validation
      if (!formData.title || formData.title.length < 2) {
        throw new Error("Product Name must be at least 2 characters long");
      }
      if (!formData.slug || !/^[a-z0-9-]+$/.test(formData.slug)) {
        throw new Error("Slug must contain lowercase letters, numbers, and hyphens only");
      }
      if (!formData.isEnquireOnly && (!formData.price || !/^\d+(\.\d+)?$/.test(String(formData.price).trim()) || Number(formData.price) <= 0)) {
        throw new Error("Active price must be a valid positive number (e.g. 3399)");
      }


      // 2. Serialize Storytelling and Customization/SEO into product payload
      let finalDescription = formData.description;
      if (formData.craftsmanshipStory) {
        finalDescription += `\n\n### Craftsmanship Story\n${formData.craftsmanshipStory}`;
      }
      if (formData.fabricStory) {
        finalDescription += `\n\n### Fabric Story\n${formData.fabricStory}`;
      }
      if (formData.inspirationStory) {
        finalDescription += `\n\n### Inspiration Story\n${formData.inspirationStory}`;
      }

      // Compile details
      const structuralDetails = [
        `Custom Sizing: ${formData.allowCustomSizing ? "Enabled" : "Disabled"}`,
        `Sleeve Customization: ${formData.allowSleeveCustomization ? "Enabled" : "Disabled"}`,
        `Neckline Customization: ${formData.allowNecklineCustomization ? "Enabled" : "Disabled"}`,
        `Length Customization: ${formData.allowLengthCustomization ? "Enabled" : "Disabled"}`,
      ];
      if (formData.metaTitle) structuralDetails.push(`Meta Title: ${formData.metaTitle}`);
      if (formData.metaDescription) structuralDetails.push(`Meta Description: ${formData.metaDescription}`);

      const finalDetails = [
        ...formData.details.filter((d) => d.trim() !== ""),
        ...structuralDetails,
      ];

      // Prepare core payload — use undefined (not null) for empty optional fields
      const payload = {
        title: formData.title,
        slug: formData.slug,
        subTitle: formData.subTitle || undefined,
        description: finalDescription,
        fabric: formData.fabric || undefined,
        embroidery: formData.embroidery || undefined,
        category: formData.category,
        subCategory: formData.subCategory || undefined,
        price: formData.isEnquireOnly ? undefined : Math.round(Number(String(formData.price).trim()) * 100),
        mrp: formData.isEnquireOnly || !formData.mrp ? undefined : Math.round(Number(String(formData.mrp).trim()) * 100),
        isEnquireOnly: formData.isEnquireOnly,
        craftingHours: formData.craftingHours ? parseInt(formData.craftingHours) : undefined,
        isFeatured: formData.isFeatured,
        occasionIds: formData.occasionIds,
        details: finalDetails,
        colours,
      };

      let savedProduct;

      if (isEditMode) {
        // Edit Mode: Update product details
        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errBody = await res.json();
          const fieldErrors = errBody.error?.fields;
          const fieldMsg = fieldErrors
            ? Object.entries(fieldErrors).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" | ")
            : "";
          throw new Error(fieldMsg || errBody.error?.message || "Failed to update product details");
        }

        const resData = await res.json();
        savedProduct = resData.data;

        // Set status if status was modified
        if (formData.status !== product.status) {
          let statusAction = "publish";
          if (formData.status === "ARCHIVED") statusAction = "archive";
          if (formData.status === "DRAFT" && product.status === "PUBLISHED") {
            // Revert to draft requires restore action in backend
            statusAction = "restore";
          }

          await fetch(`/api/admin/products/${product.id}?action=${statusAction}`, {
            method: "PATCH",
          });
        }
      } else {
        // Add Mode: Create product first (returns in DRAFT status)
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          const fieldErrors = errBody.error?.fields;
          const fieldMsg = fieldErrors
            ? Object.entries(fieldErrors).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" | ")
            : "";
          const serverMsg = fieldMsg || errBody.error?.message || errBody.message || `Server error ${res.status}`;
          console.error("[ProductForm] Create failed:", res.status, errBody);
          throw new Error(serverMsg);
        }

        const resData = await res.json();
        savedProduct = resData.data;

        // Publish if selected status is PUBLISHED or ARCHIVED
        if (formData.status !== "DRAFT") {
          let statusAction = "publish";
          if (formData.status === "ARCHIVED") statusAction = "archive";

          await fetch(`/api/admin/products/${savedProduct.id}?action=${statusAction}`, {
            method: "PATCH",
          });
        }
      }

      // 3. Sync media images and videos
      // We will loop through new uploaded images (those without an id) and call add-image action
      for (const img of images) {
        if (!img.id) {
          await fetch(`/api/admin/products/${savedProduct.id}?action=add-image`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: img.url,
              cloudinaryId: img.cloudinaryId,
              isPrimary: img.isPrimary,
              alt: `${formData.title} Image`,
            }),
          });
        } else {
          // If isPrimary was updated on an existing image, call add-image with isPrimary: true
          // to trigger backend isPrimary updates
          if (img.isPrimary && product?.images?.find((x) => x.id === img.id && !x.isPrimary)) {
            await fetch(`/api/admin/products/${savedProduct.id}?action=add-image`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: img.url,
                cloudinaryId: img.cloudinaryId,
                isPrimary: true,
                alt: img.alt,
              }),
            });
          }
        }
      }

      // Upload new videos
      for (const vid of videos) {
        if (!vid.id) {
          await fetch(`/api/admin/products/${savedProduct.id}?action=add-video`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: vid.url,
              cloudinaryId: vid.cloudinaryId,
            }),
          });
        }
      }

      setSuccess(isEditMode ? "Atelier product updated successfully!" : "Atelier product created successfully!");
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError(err.message || "An error occurred while saving the product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in-up bg-[#1F1F1F]/20 border border-white/5 p-6 md:p-10">
      
      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 font-montserrat text-[12px] flex items-center gap-2">
          <SymbolIcon name="warning" className="size-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-montserrat text-[12px] flex items-center gap-2">
          <SymbolIcon name="check_circle" className="size-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Basic Dossier Section */}
      <div className="space-y-6">
        <h4 className="font-playfair text-[18px] text-gold tracking-wider uppercase font-semibold border-b border-white/5 pb-2">
          Basic Dossier
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              Product Name *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              Slug (URL Identifier) *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-mono text-white focus:border-gold outline-none transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
            Short Description (Subtitle/Label)
          </label>
          <input
            type="text"
            name="subTitle"
            value={formData.subTitle}
            onChange={handleInputChange}
            placeholder="e.g. Midnight Black Silk Anarkali"
            className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
            Full Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors resize-none"
            required
          />
        </div>
      </div>

      {/* Taxonomy Section */}
      <div className="space-y-6">
        <h4 className="font-playfair text-[18px] text-gold tracking-wider uppercase font-semibold border-b border-white/5 pb-2">
          Taxonomy & Attributes
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              Collection (Category)
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
            >
              <option value="EVERYDAY">Professional Ethnic</option>
              <option value="SIGNATURE">Signature Edit</option>
              <option value="BRIDAL">Golden Era</option>
              <option value="OTHERS">Others</option>
              <option value="BOTTOMWEAR">Bottomwear</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              Garment Category (Subcategory)
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
            >
              <option value="SAREES">Saree</option>
              <option value="KURTAS">Kurti / Kurta</option>
              <option value="LEHENGAS">Lehenga</option>
              <option value="CO_ORDS">Co-ord Set</option>
              <option value="DUPATTAS">Dupatta</option>
              <option value="ANARKALIS">Anarkali</option>
              <option value="ACCESSORIES">Accessories</option>
              <option value="BOTTOMWEAR">Bottomwear</option>
            </select>
          </div>
        </div>

        {/* Occasions Checkboxes */}
        <div className="space-y-2">
          <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
            Occasion Tags
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#131313] border border-white/5">
            {occasions.map((o) => (
              <label key={o.id} className="flex items-center gap-2 cursor-pointer text-[12px] font-montserrat text-white/70 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={formData.occasionIds.includes(o.id)}
                  onChange={() => handleOccasionToggle(o.id)}
                  className="accent-gold border-white/20"
                />
                <span>{o.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Colour Variants */}
      <div className="space-y-4">
        <h4 className="font-playfair text-[18px] text-gold tracking-wider uppercase font-semibold border-b border-white/5 pb-2">
          Colour Variants
        </h4>
        <p className="font-montserrat text-[11px] text-white/40 leading-relaxed">
          Add available colour options for this design. Customers will be able to select a colour on the product page before checkout.
        </p>

        {/* Colour chips */}
        {colours.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {colours.map((colour) => (
              <span
                key={colour}
                className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/30 text-gold font-montserrat text-[11px] font-semibold px-3 py-1.5 tracking-wider"
              >
                {colour}
                <button
                  type="button"
                  onClick={() => removeColour(colour)}
                  className="text-gold/60 hover:text-gold transition-colors ml-1 font-bold leading-none"
                  aria-label={`Remove ${colour}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Colour input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={colourInput}
            onChange={(e) => setColourInput(e.target.value)}
            onKeyDown={handleColourInputKeyDown}
            onBlur={addColour}
            placeholder="e.g. Ivory White — press Enter or comma to add"
            className="flex-1 bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
          />
          <button
            type="button"
            onClick={addColour}
            className="px-4 py-3 bg-gold/10 border border-gold/30 text-gold font-montserrat text-[11px] font-bold tracking-wider uppercase hover:bg-gold/20 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
            Fabric Composition
          </label>
          <input
            type="text"
            name="fabric"
            value={formData.fabric}
            onChange={handleInputChange}
            placeholder="e.g. Mulberry Silk"
            className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
            Embroidery Work
          </label>
          <input
            type="text"
            name="embroidery"
            value={formData.embroidery}
            onChange={handleInputChange}
            placeholder="e.g. Zardosi Handwork"
            className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
          />
        </div>
      </div>

      {/* Pricing & Stitching Section */}
      <div className="space-y-6">
        <h4 className="font-playfair text-[18px] text-gold tracking-wider uppercase font-semibold border-b border-white/5 pb-2">
          Pricing & Production
        </h4>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="isEnquireOnly"
            name="isEnquireOnly"
            checked={formData.isEnquireOnly}
            onChange={handleInputChange}
            className="accent-gold"
          />
          <label htmlFor="isEnquireOnly" className="font-montserrat text-[12px] text-white/80 font-bold select-none cursor-pointer">
            Golden Era "Enquire Only" (Hides prices on website)
          </label>
        </div>

        {!formData.isEnquireOnly && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
                Sale Price (₹) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. 3399"
                className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
                required={!formData.isEnquireOnly}
              />
            </div>

            <div className="space-y-2">
              <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
                MRP (Original Retail Price ₹)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="mrp"
                value={formData.mrp}
                onChange={handleInputChange}
                placeholder="e.g. 4999"
                className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              Estimated Stitching Duration (Days)
            </label>
            <input
              type="number"
              name="craftingHours"
              value={formData.craftingHours}
              onChange={handleInputChange}
              className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Bullet Specifications Section */}
      <div className="space-y-6">
        <h4 className="font-playfair text-[18px] text-gold tracking-wider uppercase font-semibold border-b border-white/5 pb-2">
          Garment Specifications (Bullet Points)
        </h4>
        
        <div className="space-y-3">
          {formData.details.map((detail, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                value={detail}
                onChange={(e) => handleDetailChange(index, e.target.value)}
                placeholder="e.g. Dry Clean Only"
                className="flex-1 bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => removeDetailField(index)}
                className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
              >
                <SymbolIcon name="delete" className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDetailField}
            className="flex items-center gap-1 text-[11px] font-montserrat text-gold font-bold uppercase tracking-widest pt-2 hover:underline"
          >
            <SymbolIcon name="add" className="size-4" /> Add Specification
          </button>
        </div>
      </div>

      {/* Storytelling & Customization/SEO Toggles */}
      <div className="space-y-8">
        <h4 className="font-playfair text-[18px] text-gold tracking-wider uppercase font-semibold border-b border-white/5 pb-2">
          Heritage Storytelling & Customization
        </h4>

        {/* Stories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              Craftsmanship Story
            </label>
            <textarea
              name="craftsmanshipStory"
              value={formData.craftsmanshipStory}
              onChange={handleInputChange}
              rows={3}
              placeholder="Detail the hours and artisans involved..."
              className="w-full bg-[#131313] border border-white/10 p-3 text-[12px] font-montserrat text-white focus:border-gold outline-none transition-colors resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              Fabric Story
            </label>
            <textarea
              name="fabricStory"
              value={formData.fabricStory}
              onChange={handleInputChange}
              rows={3}
              placeholder="Origins, weave, dyes..."
              className="w-full bg-[#131313] border border-white/10 p-3 text-[12px] font-montserrat text-white focus:border-gold outline-none transition-colors resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              Inspiration Story
            </label>
            <textarea
              name="inspirationStory"
              value={formData.inspirationStory}
              onChange={handleInputChange}
              rows={3}
              placeholder="The artistic vision..."
              className="w-full bg-[#131313] border border-white/10 p-3 text-[12px] font-montserrat text-white focus:border-gold outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Customization checkboxes */}
        <div className="space-y-3">
          <span className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
            Bespoke Customization Directives
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#131313] border border-white/5 font-montserrat text-[12px] text-white/70">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="allowCustomSizing"
                checked={formData.allowCustomSizing}
                onChange={handleInputChange}
                className="accent-gold"
              />
              <span>Allow Custom Sizing</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="allowSleeveCustomization"
                checked={formData.allowSleeveCustomization}
                onChange={handleInputChange}
                className="accent-gold"
              />
              <span>Sleeve Customization</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="allowLengthCustomization"
                checked={formData.allowLengthCustomization}
                onChange={handleInputChange}
                className="accent-gold"
              />
              <span>Length Customization</span>
            </label>
          </div>
        </div>

        {/* SEO Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              SEO Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleInputChange}
              className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              SEO Meta Description
            </label>
            <input
              type="text"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Media Upload Section */}
      <div className="space-y-6">
        <h4 className="font-playfair text-[18px] text-gold tracking-wider uppercase font-semibold border-b border-white/5 pb-2">
          Media Assets
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cloudinary Uploader Widgets */}
          <div className="space-y-6">
            <CloudinaryUpload
              label="Add Product Image Asset"
              accept="image/*"
              multiple={true}
              onUploadComplete={handleImageUpload}
            />
            <CloudinaryUpload
              label="Add Product Video Asset"
              accept="video/*"
              multiple={false}
              onUploadComplete={handleVideoUpload}
            />
          </div>

          {/* Media Previews */}
          <div className="space-y-4">
            <span className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
              Asset Queue Previews
            </span>

            {/* Images list */}
            {images.length > 0 && (
              <div className="space-y-2">
                <span className="block font-montserrat text-[9px] text-white/30 uppercase tracking-widest">Images</span>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className={`relative border p-1 group bg-black/40 ${img.isPrimary ? 'border-gold' : 'border-white/5'}`}>
                      <div className="w-full h-16 relative overflow-hidden">
                        <Image src={img.url} alt="" fill className="object-cover" sizes="150px" />
                      </div>
                      
                      {/* Delete icon */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx, img.id)}
                        className="absolute top-1 right-1 bg-red-600/80 p-1 text-white hover:bg-red-600 transition-colors"
                      >
                        <SymbolIcon name="close" className="size-3.5" />
                      </button>

                      {/* Primary selector */}
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className={`absolute bottom-1 left-1 px-1 py-0.5 text-[8px] font-bold font-montserrat uppercase ${
                          img.isPrimary ? 'bg-gold text-[#131313]' : 'bg-black/80 text-white/50 hover:text-white'
                        }`}
                      >
                        {img.isPrimary ? "PRIMARY" : "SET COVER"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos list */}
            {videos.length > 0 && (
              <div className="space-y-2">
                <span className="block font-montserrat text-[9px] text-white/30 uppercase tracking-widest">Videos</span>
                <div className="space-y-2">
                  {videos.map((vid, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#131313] border border-white/5 p-3 text-[12px] font-montserrat">
                      <div className="flex items-center gap-2 text-white/80">
                        <SymbolIcon name="movie" className="size-4.5 text-gold" />
                        <span className="truncate max-w-[200px]">{vid.name || `Video ${idx + 1}`}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(idx, vid.id)}
                        className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && videos.length === 0 && (
              <div className="py-8 text-center border border-dashed border-white/5 bg-[#131313]/10">
                <SymbolIcon name="image" className="size-8 text-white/10 mb-2 mx-auto" />
                <span className="block font-montserrat text-[10px] text-white/30 uppercase tracking-widest">Media queue empty</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Catalog Status & Action Row */}
      <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2 w-full sm:w-56">
          <label className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
            Catalog Release Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full bg-[#131313] border border-white/10 p-3 text-[13px] font-montserrat text-white focus:border-gold outline-none transition-colors"
          >
            <option value="DRAFT">Draft Mode</option>
            <option value="PUBLISHED">Published (Active)</option>
            <option value="ARCHIVED">Archived (Legacy)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleInputChange}
            className="accent-gold"
          />
          <label htmlFor="isFeatured" className="font-montserrat text-[12px] text-white/80 font-bold select-none cursor-pointer">
            Feature on Homepage Highlights
          </label>
        </div>

        <div className="flex gap-4 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-white/10 text-white/60 hover:text-white hover:bg-white/2 font-montserrat text-[11px] font-bold tracking-wider uppercase transition-all rounded-none w-full sm:w-auto text-center"
            disabled={isLoading}
          >
            CANCEL
          </button>
          
          <button
            type="submit"
            className="px-8 py-3 bg-gold border border-gold hover:bg-[#131313] hover:text-gold text-[#131313] font-montserrat text-[11px] font-bold tracking-wider uppercase transition-all rounded-none w-full sm:w-auto text-center flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="size-3.5 border-2 border-[#131313] border-t-transparent animate-spin rounded-full"></div>
                SAVING...
              </>
            ) : (
              "COMMIT CHANGE"
            )}
          </button>
        </div>
      </div>

    </form>
  );
}
