"use client";

import React, { useCallback, useEffect, useState } from "react";
import SymbolIcon from "@/components/SymbolIcon";
import ProductForm from "./ProductForm";
import ProductDetailView from "./ProductDetailView";
import Image from "next/image";

export default function ProductManagement() {
  const [view, setView] = useState("list"); // list, add, edit, detail
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Listing state
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters state
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PUBLISHED, DRAFT, ARCHIVED, DELETED
  const [collectionFilter, setCollectionFilter] = useState(""); // ALL collections (EVERYDAY, SIGNATURE, BRIDAL)
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest"); // newest, oldest, price_low, price_high

  // Dialog triggers
  const [confirmDialog, setConfirmDialog] = useState(null); // { action, productId, title }

  // Fetch products based on current filters, sorting, and pagination page
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", "10");

      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (collectionFilter) {
        params.append("category", collectionFilter);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      // Dynamic sorting params (handled in backend database query)
      if (sortOption === "newest") {
        params.append("sortBy", "createdAt");
        params.append("sortOrder", "desc");
      } else if (sortOption === "oldest") {
        params.append("sortBy", "createdAt");
        params.append("sortOrder", "asc");
      } else if (sortOption === "price_low") {
        params.append("sortBy", "price");
        params.append("sortOrder", "asc");
      } else if (sortOption === "price_high") {
        params.append("sortBy", "price");
        params.append("sortOrder", "desc");
      }

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch product catalog");
      }

      const { data } = await res.json();
      setProducts(data.items || []);
      setPagination({
        page: data.pagination.page,
        pages: data.pagination.pages,
        total: data.pagination.total,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred fetching products");
    } finally {
      setIsLoading(false);
    }
  }, [collectionFilter, pagination.page, searchQuery, sortOption, statusFilter]);

  // Re-fetch products when filters/page changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Actions
  const handleViewDetails = async (productId) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      if (!res.ok) throw new Error("Failed to fetch product details");
      const { data } = await res.json();
      setSelectedProduct(data);
      setView("detail");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = async (productId) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      if (!res.ok) throw new Error("Failed to fetch product details");
      const { data } = await res.json();
      setSelectedProduct(data);
      setView("edit");
    } catch (err) {
      alert(err.message);
    }
  };

  const triggerConfirm = (action, product) => {
    setConfirmDialog({
      action,
      productId: product.id,
      title: product.title,
    });
  };

  const executeConfirmedAction = async () => {
    if (!confirmDialog) return;
    const { action, productId } = confirmDialog;
    setConfirmDialog(null);
    setIsLoading(true);

    try {
      let url = `/api/admin/products/${productId}`;
      let method = "PATCH";

      if (action === "archive") {
        url += "?action=archive";
      } else if (action === "publish") {
        url += "?action=publish";
      } else if (action === "restore") {
        url += "?action=restore";
      } else if (action === "delete") {
        method = "DELETE"; // soft delete
      }

      const res = await fetch(url, { method });
      if (!res.ok) {
        throw new Error(`Failed to ${action} product`);
      }

      await fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (product) => {
    setIsLoading(true);
    try {
      // 1. Fetch full product details
      const detailRes = await fetch(`/api/admin/products/${product.id}`);
      if (!detailRes.ok) throw new Error("Failed to fetch product details for cloning");
      const { data: fullProduct } = await detailRes.json();

      // 2. Clone payload
      const suffix = Math.floor(100 + Math.random() * 900);
      const duplicatePayload = {
        title: `${fullProduct.title} (Copy)`,
        slug: `${fullProduct.slug}-copy-${suffix}`,
        subTitle: fullProduct.subTitle,
        description: fullProduct.description,
        fabric: fullProduct.fabric,
        embroidery: fullProduct.embroidery,
        category: fullProduct.category,
        subCategory: fullProduct.subCategory,
        price: fullProduct.price,
        isEnquireOnly: fullProduct.isEnquireOnly,
        craftingHours: fullProduct.craftingHours,
        isFeatured: false, // reset featured status
        occasionIds: fullProduct.occasions?.map((o) => o.occasionId) || [],
        details: fullProduct.details || [],
      };

      // 3. Create duplicate product (creates as DRAFT)
      const createRes = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatePayload),
      });

      if (!createRes.ok) {
        const errBody = await createRes.json();
        throw new Error(errBody.error?.message || "Cloning operation failed");
      }

      const { data: newProd } = await createRes.json();

      // 4. Duplicate images
      for (const img of fullProduct.images || []) {
        await fetch(`/api/admin/products/${newProd.id}?action=add-image`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: img.url,
            cloudinaryId: img.cloudinaryId,
            isPrimary: img.isPrimary,
            alt: img.alt,
          }),
        });
      }

      // Duplicate videos
      for (const vid of fullProduct.videos || []) {
        await fetch(`/api/admin/products/${newProd.id}?action=add-video`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: vid.url,
            cloudinaryId: vid.cloudinaryId,
          }),
        });
      }

      await fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "add") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <h3 className="font-playfair text-[20px] text-white">Create New Garment</h3>
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1.5 font-montserrat text-[11px] text-gold uppercase tracking-widest hover:underline"
          >
            <SymbolIcon name="arrow_back" className="size-4" /> Back to Catalog
          </button>
        </div>
        <ProductForm onSave={() => { setView("list"); fetchProducts(); }} onCancel={() => setView("list")} />
      </div>
    );
  }

  if (view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <h3 className="font-playfair text-[20px] text-white">Configure Garment: {selectedProduct?.title}</h3>
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1.5 font-montserrat text-[11px] text-gold uppercase tracking-widest hover:underline"
          >
            <SymbolIcon name="arrow_back" className="size-4" /> Back to Catalog
          </button>
        </div>
        <ProductForm product={selectedProduct} onSave={() => { setView("list"); fetchProducts(); }} onCancel={() => setView("list")} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Controls: Search, Filters & Add Product */}
      <div className="flex flex-col gap-3 bg-[#1F1F1F]/30 p-4 border border-white/5">
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 min-w-0 bg-[#131313] border border-white/10 p-2.5 text-[12px] font-montserrat text-white outline-none focus:border-gold transition-colors"
          />
          <button
            type="submit"
            className="shrink-0 px-4 py-2 bg-gold border border-gold text-[#131313] font-montserrat text-[11px] font-bold tracking-widest uppercase hover:bg-transparent hover:text-gold transition-all"
          >
            SEARCH
          </button>
        </form>

        {/* Filter + Add row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Collection Filter */}
          <select
            value={collectionFilter}
            onChange={(e) => { setCollectionFilter(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
            className="flex-1 min-w-[130px] bg-[#131313] border border-white/10 p-2.5 text-[11px] font-montserrat text-white outline-none hover:border-gold transition-colors"
          >
            <option value="">All Collections</option>
            <option value="EVERYDAY">Professional Ethnic</option>
            <option value="SIGNATURE">Signature Edit</option>
            <option value="BRIDAL">Golden Era</option>
            <option value="BOTTOMWEAR">Bottomwear</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortOption}
            onChange={(e) => { setSortOption(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
            className="flex-1 min-w-[130px] bg-[#131313] border border-white/10 p-2.5 text-[11px] font-montserrat text-white outline-none hover:border-gold transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price ↑</option>
            <option value="price_high">Price ↓</option>
          </select>

          <button
            onClick={() => setView("add")}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-gold border border-gold text-[#131313] font-montserrat text-[11px] font-bold tracking-widest uppercase hover:bg-transparent hover:text-gold transition-all"
          >
            <SymbolIcon name="add" className="size-4" /> ADD
          </button>
        </div>
      </div>

      {/* Sub-Filters Tabs: ALL, PUBLISHED, DRAFT, ARCHIVED, DELETED */}
      <div className="flex overflow-x-auto hide-scrollbar gap-1 border-b border-white/5 pb-0">
        {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED", "DELETED"].map((filter) => (
          <button
            key={filter}
            onClick={() => { setStatusFilter(filter); setPagination((prev) => ({ ...prev, page: 1 })); }}
            className={`shrink-0 px-3 py-2.5 font-montserrat text-[10px] tracking-widest uppercase font-semibold transition-all border-b-2 ${
              statusFilter === filter
                ? "text-gold border-gold"
                : "text-white/40 hover:text-gold border-transparent"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Product listing — card on mobile, table on desktop */}
      <div className="border border-white/5 bg-[#1F1F1F]/10">

        {/* ── Desktop Table (md+) ───────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px] font-montserrat">
            <thead>
              <tr className="border-b border-white/10 bg-[#131313]/60 text-white/40 text-[10px] tracking-wider uppercase font-semibold">
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Collection</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="size-8 border-2 border-gold border-t-transparent animate-spin rounded-full mx-auto"></div>
                    <span className="block text-[11px] text-white/40 tracking-wider uppercase font-semibold mt-4">Fetching Catalogue...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <SymbolIcon name="inventory" className="size-12 text-white/10 mb-4 mx-auto" />
                    <p className="font-playfair text-[18px] text-white/40 uppercase tracking-widest">No products found.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const priceText = p.isEnquireOnly ? "Enquire Only" : `₹ ${(p.price / 100).toLocaleString()}`;
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="p-4">
                        {p.primaryImage ? (
                          <div className="size-14 relative overflow-hidden border border-white/5">
                            <Image src={p.primaryImage} alt="" fill loading="lazy" quality={85} className="object-cover" sizes="56px" />
                          </div>
                        ) : (
                          <div className="size-14 bg-black/40 border border-white/5 flex items-center justify-center">
                            <SymbolIcon name="image" className="size-6 text-white/10" />
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-playfair text-[14px] text-white font-medium">
                        {p.title}
                        {p.isFeatured && (
                          <span className="ml-2 bg-gold/10 text-gold text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">Featured</span>
                        )}
                      </td>
                      <td className="p-4 text-white/70 text-[11px]">{p.category}</td>
                      <td className="p-4 text-gold font-bold">{priceText}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-2.5 py-1 tracking-wider uppercase ${
                          p.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          p.status === "DRAFT" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          p.status === "ARCHIVED" ? "bg-stone-500/10 text-stone-400 border border-stone-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>{p.status}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {p.status !== "DELETED" && (
                            <button onClick={() => handleEditClick(p.id)} className="px-3 py-1 text-[11px] font-semibold font-montserrat tracking-wider uppercase border border-gold/30 text-gold hover:bg-gold/10 transition-colors rounded-sm">Edit</button>
                          )}
                          {p.status === "PUBLISHED" && (
                            <button onClick={() => triggerConfirm("archive", p)} className="px-3 py-1 text-[11px] font-semibold font-montserrat tracking-wider uppercase border border-stone-500/30 text-stone-400 hover:bg-stone-500/10 transition-colors rounded-sm">Archive</button>
                          )}
                          {(p.status === "ARCHIVED" || p.status === "DRAFT") && (
                            <button onClick={() => triggerConfirm("publish", p)} className="px-3 py-1 text-[11px] font-semibold font-montserrat tracking-wider uppercase border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors rounded-sm">Publish</button>
                          )}
                          {p.status !== "DELETED" ? (
                            <button onClick={() => triggerConfirm("delete", p)} className="px-3 py-1 text-[11px] font-semibold font-montserrat tracking-wider uppercase border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors rounded-sm">Delete</button>
                          ) : (
                            <button onClick={() => triggerConfirm("restore", p)} className="px-3 py-1 text-[11px] font-semibold font-montserrat tracking-wider uppercase border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors rounded-sm">Restore</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card List (< md) ───────────────────────────── */}
        <div className="md:hidden divide-y divide-white/5">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="size-8 border-2 border-gold border-t-transparent animate-spin rounded-full mx-auto"></div>
              <span className="block text-[11px] text-white/40 tracking-wider uppercase font-semibold mt-4">Loading...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <SymbolIcon name="inventory" className="size-12 text-white/10 mb-4 mx-auto" />
              <p className="font-playfair text-[16px] text-white/40 uppercase tracking-widest">No products found.</p>
            </div>
          ) : (
            products.map((p) => {
              const priceText = p.isEnquireOnly ? "Enquire Only" : `₹ ${(p.price / 100).toLocaleString()}`;
              return (
                <div key={p.id} className="p-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="shrink-0">
                    {p.primaryImage ? (
                      <div className="size-16 relative overflow-hidden border border-white/5">
                        <Image src={p.primaryImage} alt="" fill loading="lazy" quality={85} className="object-cover" sizes="64px" />
                      </div>
                    ) : (
                      <div className="size-16 bg-black/40 border border-white/5 flex items-center justify-center">
                        <SymbolIcon name="image" className="size-6 text-white/10" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="font-playfair text-[14px] text-white font-medium leading-snug line-clamp-2">
                      {p.title}
                      {p.isFeatured && (
                        <span className="ml-2 bg-gold/10 text-gold text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase align-middle">★</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-montserrat text-[10px] text-white/40 uppercase tracking-wider">{p.category}</span>
                      <span className="text-white/20">·</span>
                      <span className="font-montserrat text-[11px] text-gold font-bold">{priceText}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase ${
                        p.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        p.status === "DRAFT" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        p.status === "ARCHIVED" ? "bg-stone-500/10 text-stone-400 border border-stone-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>{p.status}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {p.status !== "DELETED" && (
                        <button onClick={() => handleEditClick(p.id)} className="px-3 py-1 text-[10px] font-semibold font-montserrat tracking-wider uppercase border border-gold/30 text-gold hover:bg-gold/10 transition-colors rounded-sm">Edit</button>
                      )}
                      {p.status === "PUBLISHED" && (
                        <button onClick={() => triggerConfirm("archive", p)} className="px-3 py-1 text-[10px] font-semibold font-montserrat tracking-wider uppercase border border-stone-500/30 text-stone-400 hover:bg-stone-500/10 transition-colors rounded-sm">Archive</button>
                      )}
                      {(p.status === "ARCHIVED" || p.status === "DRAFT") && (
                        <button onClick={() => triggerConfirm("publish", p)} className="px-3 py-1 text-[10px] font-semibold font-montserrat tracking-wider uppercase border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors rounded-sm">Publish</button>
                      )}
                      {p.status !== "DELETED" ? (
                        <button onClick={() => triggerConfirm("delete", p)} className="px-3 py-1 text-[10px] font-semibold font-montserrat tracking-wider uppercase border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors rounded-sm">Delete</button>
                      ) : (
                        <button onClick={() => triggerConfirm("restore", p)} className="px-3 py-1 text-[10px] font-semibold font-montserrat tracking-wider uppercase border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors rounded-sm">Restore</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Row */}
      {pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] font-montserrat text-white/50 bg-[#1F1F1F]/20 p-4 border border-white/5">
          <span className="text-center sm:text-left">
            Page {pagination.page} of {pagination.pages} &nbsp;·&nbsp; {pagination.total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1 || isLoading}
              className="px-4 py-2 border border-white/10 hover:border-gold hover:text-gold disabled:opacity-20 transition-all font-bold"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages || isLoading}
              className="px-4 py-2 border border-white/10 hover:border-gold hover:text-gold disabled:opacity-20 transition-all font-bold"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {view === "detail" && selectedProduct && (
        <ProductDetailView product={selectedProduct} onClose={() => setView("list")} />
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#1F1F1F] border border-white/10 p-6 md:p-8 w-full max-w-[450px] space-y-6 text-center">
            <SymbolIcon
              name={confirmDialog.action === "delete" ? "warning" : "help_outline"}
              className={`size-12 mx-auto ${confirmDialog.action === "delete" ? "text-red-400" : "text-gold"}`}
            />
            <div className="space-y-2">
              <h3 className="font-playfair text-[18px] text-white uppercase tracking-wider font-bold">
                {confirmDialog.action} Garment Dossier?
              </h3>
              <p className="font-montserrat text-[12px] text-white/60 leading-relaxed font-light">
                Are you sure you want to <span className="text-white font-bold">{confirmDialog.action}</span> the product{" "}
                <span className="text-gold italic font-bold">"{confirmDialog.title}"</span>?
                {confirmDialog.action === "delete" && " This will perform a soft-delete, moving the product to deleted releases catalog."}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 border border-white/10 text-white/60 hover:text-white font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all"
              >
                ABORT
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className={`flex-1 py-2.5 font-montserrat text-[11px] font-bold tracking-widest uppercase transition-all ${
                  confirmDialog.action === "delete"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gold text-[#131313] hover:bg-gold/80"
                }`}
              >
                PROCEED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
