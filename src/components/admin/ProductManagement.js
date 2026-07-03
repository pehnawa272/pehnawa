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
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-[#1F1F1F]/30 p-4 border border-white/5">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, fabric, embroidery..."
            className="flex-1 bg-[#131313] border border-white/10 p-2.5 text-[12px] font-montserrat text-white outline-none focus:border-gold transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gold border border-gold text-[#131313] font-montserrat text-[11px] font-bold tracking-widest uppercase hover:bg-transparent hover:text-gold transition-all"
          >
            SEARCH
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Collection Filter */}
          <select
            value={collectionFilter}
            onChange={(e) => { setCollectionFilter(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
            className="bg-[#131313] border border-white/10 p-2.5 text-[11px] font-montserrat text-white outline-none hover:border-gold transition-colors"
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
            className="bg-[#131313] border border-white/10 p-2.5 text-[11px] font-montserrat text-white outline-none hover:border-gold transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>

          <button
            onClick={() => setView("add")}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gold border border-gold text-[#131313] font-montserrat text-[11px] font-bold tracking-widest uppercase hover:bg-transparent hover:text-gold transition-all"
          >
            <SymbolIcon name="add" className="size-4" /> ADD GARMENT
          </button>
        </div>
      </div>

      {/* Sub-Filters Tabs: ALL, PUBLISHED, DRAFT, ARCHIVED, DELETED */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED", "DELETED"].map((filter) => (
          <button
            key={filter}
            onClick={() => { setStatusFilter(filter); setPagination((prev) => ({ ...prev, page: 1 })); }}
            className={`px-4 py-2 font-montserrat text-[10px] tracking-widest uppercase font-semibold transition-all ${
              statusFilter === filter
                ? "text-gold border-b-2 border-gold"
                : "text-white/40 hover:text-gold"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table listing */}
      <div className="overflow-x-auto border border-white/5 bg-[#1F1F1F]/10">
        <table className="w-full text-left border-collapse text-[12px] font-montserrat">
          <thead>
            <tr className="border-b border-white/10 bg-[#131313]/60 text-white/40 text-[10px] tracking-wider uppercase font-semibold">
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Collection</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-24 text-center">
                  <div className="size-8 border-2 border-gold border-t-transparent animate-spin rounded-full mx-auto"></div>
                  <span className="block text-[11px] text-white/40 tracking-wider uppercase font-semibold mt-4">
                    Fetching Pehnawa Atelier Catalogue...
                  </span>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-24 text-center">
                  <SymbolIcon name="inventory" className="size-12 text-white/10 mb-4 mx-auto" />
                  <p className="font-playfair text-[18px] text-white/40 uppercase tracking-widest">
                    No products matching search filters.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const priceText = p.isEnquireOnly
                  ? "Enquire Only"
                  : `₹ ${(p.price / 100).toLocaleString()}`;
                
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    {/* Image */}
                    <td className="p-4">
                      {p.primaryImage ? (
                        <div className="size-14 relative overflow-hidden border border-white/5">
                          <Image src={p.primaryImage} alt="" fill className="object-cover" sizes="56px" />
                        </div>
                      ) : (
                        <div className="size-14 bg-black/40 border border-white/5 flex items-center justify-center">
                          <SymbolIcon name="image" className="size-6 text-white/10" />
                        </div>
                      )}
                    </td>

                    {/* Title */}
                    <td className="p-4 font-playfair text-[14px] text-white font-medium">
                      {p.title}
                      {p.isFeatured && (
                        <span className="ml-2 bg-gold/10 text-gold text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                          Featured
                        </span>
                      )}
                    </td>

                    {/* Collection */}
                    <td className="p-4 text-white/70">{p.category}</td>

                    {/* Category */}
                    <td className="p-4 text-white/70">{p.subCategory || "None"}</td>

                    {/* Price */}
                    <td className="p-4 text-gold font-bold">{priceText}</td>

                    {/* Status badge */}
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2.5 py-1 tracking-wider uppercase ${
                        p.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        p.status === "DRAFT" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        p.status === "ARCHIVED" ? "bg-stone-500/10 text-stone-400 border border-stone-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="View Details"
                          onClick={() => handleViewDetails(p.id)}
                          className="p-1.5 text-white/50 hover:text-gold transition-colors"
                        >
                          <SymbolIcon name="visibility" className="size-4.5" />
                        </button>
                        
                        {p.status !== "DELETED" && (
                          <>
                            <button
                              title="Edit Garment"
                              onClick={() => handleEditClick(p.id)}
                              className="p-1.5 text-white/50 hover:text-gold transition-colors"
                            >
                              <SymbolIcon name="edit" className="size-4.5" />
                            </button>
                            <button
                              title="Duplicate Garment"
                              onClick={() => handleDuplicate(p)}
                              className="p-1.5 text-white/50 hover:text-gold transition-colors"
                            >
                              <SymbolIcon name="content_copy" className="size-4.5" />
                            </button>
                          </>
                        )}

                        {p.status === "PUBLISHED" && (
                          <button
                            title="Archive Garment"
                            onClick={() => triggerConfirm("archive", p)}
                            className="p-1.5 text-white/50 hover:text-stone-400 transition-colors"
                          >
                            <SymbolIcon name="archive" className="size-4.5" />
                          </button>
                        )}

                        {(p.status === "ARCHIVED" || p.status === "DRAFT") && (
                          <button
                            title="Publish Garment"
                            onClick={() => triggerConfirm("publish", p)}
                            className="p-1.5 text-white/50 hover:text-emerald-400 transition-colors"
                          >
                            <SymbolIcon name="publish" className="size-4.5" />
                          </button>
                        )}

                        {p.status !== "DELETED" ? (
                          <button
                            title="Soft Delete"
                            onClick={() => triggerConfirm("delete", p)}
                            className="p-1.5 text-white/50 hover:text-red-400 transition-colors"
                          >
                            <SymbolIcon name="delete" className="size-4.5" />
                          </button>
                        ) : (
                          <button
                            title="Restore Garment"
                            onClick={() => triggerConfirm("restore", p)}
                            className="p-1.5 text-white/50 hover:text-emerald-400 transition-colors"
                          >
                            <SymbolIcon name="settings_backup_restore" className="size-4.5" />
                          </button>
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

      {/* Pagination Row */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center text-[11px] font-montserrat text-white/50 bg-[#1F1F1F]/20 p-4 border border-white/5">
          <span>
            Displaying Page {pagination.page} of {pagination.pages} ({pagination.total} Garments Total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1 || isLoading}
              className="px-3 py-1.5 border border-white/10 hover:border-gold hover:text-gold disabled:opacity-20 transition-all font-bold"
            >
              PREVIOUS
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages || isLoading}
              className="px-3 py-1.5 border border-white/10 hover:border-gold hover:text-gold disabled:opacity-20 transition-all font-bold"
            >
              NEXT
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
