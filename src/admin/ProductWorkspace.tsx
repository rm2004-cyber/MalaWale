"use client";

import { useState, useEffect, useRef } from "react";
import { productService, categoryService } from "../utils/service";
import { toast } from "react-hot-toast";

interface ProductWorkspaceProps {
  onRefreshStats: () => void;
}

interface DBProduct {
  _id: string;
  name: string;
  description: string;
  category: { _id: string; name: string } | string | null;
  price: number;
  originalPrice: number;
  sizes: string[];
  imageUrls: string[];
  isBestseller: boolean;
  stock: boolean;
}

interface DBCategory {
  _id: string;
  name: string;
}

// --- NEW: Variant interface ---
interface Variant {
  size: string;
  price: number;
  mrp: number;
  stock: number;
  inStock: boolean;
}

export default function ProductWorkspace({ onRefreshStats }: ProductWorkspaceProps) {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isBestseller, setIsBestseller] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // --- NEW: Variants state ---
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantSize, setVariantSize] = useState("");
  const [variantPrice, setVariantPrice] = useState<number | "">("");
  const [variantMrp, setVariantMrp] = useState<number | "">("");
  const [variantStock, setVariantStock] = useState<number | "">("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getCategories(),
      ]);

      if (prodRes?.data) {
        const rawProducts = prodRes.data.products || prodRes.data || [];
        const mappedProducts = rawProducts.map((p: any) => {
          const hasVariants = p.variants && p.variants.length > 0;
          const defaultVariant = hasVariants ? p.variants[0] : null;

          return {
            _id: p._id,
            name: p.name,
            description: p.description,
            category: p.category,
            price: p.price ?? defaultVariant?.price ?? 0,
            originalPrice: p.originalPrice ?? defaultVariant?.mrp ?? 0,
            sizes: p.sizes || (hasVariants ? p.variants.map((v: any) => v.size) : []),
            imageUrls: p.images || [],
            isBestseller: p.badge === "Bestseller" || !!p.isFeatured,
            stock: p.stock !== undefined ? p.stock > 0 : (defaultVariant ? defaultVariant.inStock : true),
          };
        });
        setProducts(mappedProducts);
      }
      if (catRes?.data?.categories) {
        setCategories(catRes.data.categories);
      }
    } catch (err) {
      toast.error("Failed to fetch fresh data nodes from inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetVariantInputs = () => {
    setVariantSize("");
    setVariantPrice("");
    setVariantMrp("");
    setVariantStock("");
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName(""); setDescription(""); setCategory(categories[0]?._id || "");
    setIsBestseller(false); setSelectedFiles([]);
    setVariants([]); resetVariantInputs();
    setShowModal(true);
  };

  const openEditModal = (p: DBProduct) => {
    console.log("--- Edit Modal Debug ---");
    console.log("Product Data:", p);
    console.log("Current Categories Array:", categories);
    console.log("Category Source Value:", p.category);

    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);

    let targetCategoryId = "";
    if (typeof p.category === "object" && p.category !== null) {
      targetCategoryId = p.category._id;
      console.log("Detected object category, ID:", targetCategoryId);
    } else if (p.category) {
      targetCategoryId = p.category as string;
      console.log("Detected string category, ID:", targetCategoryId);
    } else if (categories.length > 0) {
      targetCategoryId = categories[0]._id;
      console.log("Category missing, falling back to index 0:", targetCategoryId);
    } else {
      console.warn("Category is missing and no categories array found!");
    }

    setCategory(targetCategoryId);
    setIsBestseller(p.isBestseller || false);
    setSelectedFiles([]);

    // --- NEW: Rebuild variants from existing sizes/price data ---
    const rebuiltVariants: Variant[] = (p.sizes || []).map((size) => ({
      size,
      price: p.price,
      mrp: p.originalPrice,
      stock: 0,
      inStock: p.stock ?? true,
    }));
    setVariants(rebuiltVariants);
    resetVariantInputs();

    setShowModal(true);
  };

  // --- NEW: Add a variant to local list ---
  const handleAddVariant = () => {
    const trimmedSize = variantSize.trim();
    if (!trimmedSize) { toast.error("Size is required."); return; }
    if (variantPrice === "" || variantMrp === "" || variantStock === "") {
      toast.error("Please fill in Price, MRP, and Stock for the variant.");
      return;
    }
    if (variants.some((v) => v.size.toLowerCase() === trimmedSize.toLowerCase())) {
      toast.error(`Variant for size "${trimmedSize}" already added.`);
      return;
    }
    const stockNum = Number(variantStock);
    setVariants((prev) => [
      ...prev,
      {
        size: trimmedSize,
        price: Number(variantPrice),
        mrp: Number(variantMrp),
        stock: stockNum,
        inStock: stockNum > 0,
      },
    ]);
    resetVariantInputs();
  };

  // --- NEW: Remove a variant ---
  const handleRemoveVariant = (size: string) => {
    setVariants((prev) => prev.filter((v) => v.size !== size));
  };

  const handleToggleStock = async (id: string, currentStockState: boolean) => {
    try {
      await productService.toggleStock({ productId: id, stock: !currentStockState });
      toast.success("Stock status toggled live! 📿");
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, stock: !currentStockState } : p)));
    } catch (err) {
      toast.error("Failed to shift stock parameters node grid.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely erase this item?")) return;
    try {
      await productService.deleteProduct(id);
      toast.success("Sacred item wiped out cleanly.");
      setProducts((prev) => prev.filter((p) => p._id !== id));
      onRefreshStats();
    } catch (err) {
      toast.error("Failed to delete specified catalog element.");
    }
  };

  const handleSubmit = async () => {
    console.log("Validation Check -> Name:", name, "Category:", category);

    if (!name || name.trim() === "" || !category) {
      toast.error(`Missing attributes: Name is '${name}', Category is '${category}'`);
      return;
    }

    // --- UPDATED: Variants are now built from state, not from sizes/price fields ---
    if (variants.length === 0) {
      toast.error("Please add at least one size variant.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("isFeatured", String(isBestseller));
    formData.append("badge", isBestseller ? "Bestseller" : "Regular");

    // --- UPDATED: Append variants from state ---
    formData.append("variants", JSON.stringify(variants));

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => formData.append("images", file));
    }

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success("Sacred item attributes updated!");
      } else {
        await productService.createProduct(formData);
        toast.success("New product saved safely!");
      }
      setShowModal(false);
      loadData();
      onRefreshStats();
    } catch (err) {
      toast.error("Multipart payload transmission failure.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Product Catalog</h2>
          <p className="text-sm text-stone-400 mt-0.5">
            <span className="font-semibold text-[#9B1B1B]">{products.length}</span> items active.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-xl bg-[#9B1B1B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#7a3b10] shadow-md"
        >
          + Add New Sacred Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 italic text-stone-400 animate-pulse">Syncing catalog loops...</div>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b bg-stone-50/70 text-stone-400 text-xs font-semibold uppercase">
                <th className="px-5 py-3.5">Item</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Stock Trigger</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-stone-50/40 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrls?.[0] || "https://placehold.co/48x48?text=?"} className="h-11 w-11 rounded-xl object-cover border" alt="" />
                      <div>
                        <div className="font-semibold text-stone-800">
                          {p.name} {p.isBestseller && <span className="text-amber-500 text-xs">★ Bestseller</span>}
                        </div>
                        <p className="text-xs text-stone-400 max-w-xs truncate">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><p className="font-bold text-stone-800">₹{p.price}</p></td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleStock(p._id, p.stock ?? true)}
                      className={`px-3 py-1 rounded-full font-bold text-xs uppercase ${p.stock !== false ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
                    >
                      {p.stock !== false ? "● In Stock" : "○ Out of Stock"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(p)} className="px-3 py-1.5 text-xs font-semibold border rounded-lg hover:text-[#9B1B1B]">Edit</button>
                      <button onClick={() => handleDeleteProduct(p._id)} className="px-3 py-1.5 text-xs font-semibold border text-stone-400 hover:text-red-500">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-800">{editingProduct ? "Modify Devotion Item" : "Insert New Devotion Item"}</h3>
            <div className="space-y-3">

              {/* Product Title */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Product Title</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2.5 rounded-xl outline-none" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2.5 rounded-xl outline-none resize-none" rows={2} />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border p-2.5 rounded-xl bg-white outline-none">
                  {categories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                </select>
              </div>

              {/* ── NEW: Add Variant Section ── */}
              <div className="border border-dashed border-stone-300 rounded-xl p-3 space-y-3 bg-stone-50/60">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Add Variant (Size-wise Pricing)</p>

                {/* Variant Input Row */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Size</label>
                    <input
                      type="text"
                      placeholder="e.g. M"
                      value={variantSize}
                      onChange={(e) => setVariantSize(e.target.value)}
                      className="w-full border p-2 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={variantPrice}
                      onChange={(e) => setVariantPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full border p-2 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      placeholder="700"
                      value={variantMrp}
                      onChange={(e) => setVariantMrp(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full border p-2 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Stock</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={variantStock}
                      onChange={(e) => setVariantStock(e.target.value === "" ? "" : parseInt(e.target.value))}
                      className="w-full border p-2 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full py-2 text-xs font-bold text-[#9B1B1B] border border-[#9B1B1B]/40 rounded-lg hover:bg-[#9B1B1B]/5 transition"
                >
                  + Add Variant
                </button>

                {/* Added Variants List */}
                {variants.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-stone-400 font-semibold">Added Variants:</p>
                    {variants.map((v) => (
                      <div key={v.size} className="flex items-center justify-between bg-white border rounded-lg px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="inline-block bg-[#9B1B1B] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[32px] text-center">
                            {v.size}
                          </span>
                          <span className="text-xs text-stone-700 font-semibold">₹{v.price}</span>
                          <span className="text-xs text-stone-400 line-through">₹{v.mrp}</span>
                          <span className={`text-xs font-semibold ${v.inStock ? "text-emerald-600" : "text-red-500"}`}>
                            {v.inStock ? `● ${v.stock} pcs` : "○ Out"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.size)}
                          className="text-stone-300 hover:text-red-500 text-sm font-bold transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* ── END: Add Variant Section ── */}

              {/* Image Upload — untouched */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Upload Images</label>
                <input type="file" multiple accept="image/*" onChange={(e) => { if (e.target.files) setSelectedFiles(Array.from(e.target.files)); }} className="w-full border p-2 text-xs rounded-xl bg-stone-50" />
              </div>

              {/* Bestseller toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-amber-50/50 p-2.5 border border-dashed rounded-xl">
                <input type="checkbox" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} />
                <span className="text-xs font-semibold text-stone-700">Promote to Premium Bestsellers</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-stone-500">Cancel</button>
              <button type="button" onClick={handleSubmit} className="px-5 py-2 bg-[#9B1B1B] text-white font-bold rounded-xl">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}