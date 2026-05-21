import { useState, useCallback } from "react";
import AdminLogin from "./AdminLogin";

// ─── Types ────────────────────────────────────────────────────────────────────

type SidebarTab = "products" | "banners" | "categories" | "orders";

type ProductCategory = "rudraksh" | "bracelets" | "crystal";
type ProductSize = "6mm" | "8mm" | "10mm" | "Standard";

interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  sizes: ProductSize[];
  imageUrls: string[];
  isBestseller: boolean;
  ordersCount: number;
}

interface BannerSlot {
  id: string;
  position: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  isActive: boolean;
}

interface CategoryCircle {
  id: string;
  label: string;
  imageUrl: string;
  slug: string;
  itemCount: number;
}

interface Order {
  id: string;
  devotee: string;
  items: string[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  location: string;
}

type NewProduct = Omit<Product, "id" | "ordersCount">;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Panchmukhi Rudraksha Mala",
    description: "108 bead sacred mala handcrafted with authentic 5-faced rudraksha.",
    category: "rudraksh",
    price: 1199,
    originalPrice: 1799,
    sizes: ["8mm", "10mm"],
    imageUrls: ["https://placehold.co/80x80/8b4513/fff?text=Mala"],
    isBestseller: true,
    ordersCount: 342,
  },
  {
    id: "p2",
    name: "Sphatik Crystal Bracelet",
    description: "Pure clear quartz crystal bracelet for positive energy.",
    category: "crystal",
    price: 549,
    originalPrice: 799,
    sizes: ["Standard"],
    imageUrls: ["https://placehold.co/80x80/c8a2c8/fff?text=Crystal"],
    isBestseller: false,
    ordersCount: 218,
  },
  {
    id: "p3",
    name: "Navratna Raksha Bracelet",
    description: "Nine gemstone bracelet aligned with Navagraha energies.",
    category: "bracelets",
    price: 899,
    originalPrice: 1299,
    sizes: ["6mm", "8mm", "Standard"],
    imageUrls: ["https://placehold.co/80x80/d4af37/fff?text=Navratna"],
    isBestseller: true,
    ordersCount: 176,
  },
];

const MOCK_BANNERS: BannerSlot[] = [
  {
    id: "b1",
    position: 1,
    title: "Divya Rudraksha Collection",
    subtitle: "Handpicked from the sacred Himalayas — Awaken your spiritual journey",
    imageUrl: "https://placehold.co/600x200/2d1a0e/d4af37?text=Banner+1",
    isActive: true,
  },
  {
    id: "b2",
    position: 2,
    title: "Festival Special: Japam Malas",
    subtitle: "Blessed by Vedic scholars — Free shipping across India",
    imageUrl: "https://placehold.co/600x200/1a0a2e/c8a2c8?text=Banner+2",
    isActive: true,
  },
  {
    id: "b3",
    position: 3,
    title: "Crystal Healing Collection",
    subtitle: "Authentic Sphatik & Amethyst — Energized & Certified",
    imageUrl: "https://placehold.co/600x200/0a2015/7cbb8f?text=Banner+3",
    isActive: false,
  },
];

const MOCK_CATEGORIES: CategoryCircle[] = [
  { id: "c1", label: "Rudraksha", imageUrl: "https://placehold.co/120x120/8b4513/fff?text=रुद्राक्ष", slug: "rudraksh", itemCount: 48 },
  { id: "c2", label: "Bracelets", imageUrl: "https://placehold.co/120x120/d4af37/fff?text=ब्रेसलेट", slug: "bracelets", itemCount: 36 },
  { id: "c3", label: "Crystals", imageUrl: "https://placehold.co/120x120/c8a2c8/fff?text=क्रिस्टल", slug: "crystal", itemCount: 29 },
  { id: "c4", label: "Malas", imageUrl: "https://placehold.co/120x120/2d6a4f/fff?text=माला", slug: "malas", itemCount: 61 },
];

const MOCK_ORDERS: Order[] = [
  { id: "MW-2026-001", devotee: "Ramesh Sharma", items: ["Panchmukhi Rudraksha Mala"], total: 1199, status: "delivered", date: "2026-05-18", location: "Varanasi, UP" },
  { id: "MW-2026-002", devotee: "Priya Agarwal", items: ["Sphatik Crystal Bracelet", "Navratna Raksha Bracelet"], total: 1448, status: "shipped", date: "2026-05-20", location: "Jaipur, RJ" },
  { id: "MW-2026-003", devotee: "Suresh Gupta", items: ["Panchmukhi Rudraksha Mala"], total: 1199, status: "processing", date: "2026-05-21", location: "Mathura, UP" },
  { id: "MW-2026-004", devotee: "Anita Mishra", items: ["Navratna Raksha Bracelet"], total: 899, status: "pending", date: "2026-05-21", location: "Pune, MH" },
];

const ALL_SIZES: ProductSize[] = ["6mm", "8mm", "10mm", "Standard"];
const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "rudraksh", label: "Rudraksha" },
  { value: "bracelets", label: "Bracelets" },
  { value: "crystal", label: "Crystal" },
];

const EMPTY_PRODUCT: NewProduct = {
  name: "",
  description: "",
  category: "rudraksh",
  price: 0,
  originalPrice: 0,
  sizes: [],
  imageUrls: [""],
  isBestseller: false,
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconBanner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <rect x="2" y="4" width="20" height="14" rx="2" />
    <path d="M8 18v2M16 18v2M6 20h12" />
  </svg>
);

const IconCategory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <circle cx="12" cy="12" r="3" />
    <circle cx="5" cy="5" r="2" />
    <circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
  </svg>
);

const IconProduct = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const IconOrders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconOm = () => (
  <svg viewBox="0 0 40 40" fill="currentColor" className="w-8 h-8">
    <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fontFamily="serif">ॐ</text>
  </svg>
);

const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// ─── Shared Primitives ────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 outline-none transition focus:border-[#8b4513] focus:ring-2 focus:ring-[#8b4513]/15";

const StatusBadge = ({ status }: { status: Order["status"] }) => {
  const map: Record<Order["status"], { bg: string; text: string; label: string }> = {
    pending:    { bg: "bg-amber-50",   text: "text-amber-700",  label: "Pending" },
    processing: { bg: "bg-blue-50",    text: "text-blue-700",   label: "Processing" },
    shipped:    { bg: "bg-violet-50",  text: "text-violet-700", label: "Shipped" },
    delivered:  { bg: "bg-emerald-50", text: "text-emerald-700",label: "Delivered" },
    cancelled:  { bg: "bg-red-50",     text: "text-red-600",    label: "Cancelled" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
};

const CategoryPill = ({ cat }: { cat: ProductCategory }) => {
  const map: Record<ProductCategory, { bg: string; text: string }> = {
    rudraksh: { bg: "bg-[#8b4513]/10", text: "text-[#8b4513]" },
    bracelets: { bg: "bg-amber-50",    text: "text-amber-700" },
    crystal:   { bg: "bg-violet-50",   text: "text-violet-700" },
  };
  const labels: Record<ProductCategory, string> = { rudraksh: "Rudraksha", bracelets: "Bracelet", crystal: "Crystal" };
  const s = map[cat];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${s.bg} ${s.text}`}>
      {labels[cat]}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}

const StatCard = ({ label, value, sub, icon, accent }: StatCardProps) => (
  <div className="relative flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-stone-100 overflow-hidden">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent} shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-stone-800 leading-tight">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{sub}</p>
    </div>
    <div className={`absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-5 ${accent}`} />
  </div>
);

// ─── Add Product Modal ────────────────────────────────────────────────────────

interface AddProductModalProps {
  onClose: () => void;
  onSave: (p: NewProduct) => void;
}

const AddProductModal = ({ onClose, onSave }: AddProductModalProps) => {
  const [form, setForm] = useState<NewProduct>({ ...EMPTY_PRODUCT });
  const [imgInput, setImgInput] = useState<string>("");

  const set = <K extends keyof NewProduct>(key: K, val: NewProduct[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleSize = (s: ProductSize) =>
    set("sizes", form.sizes.includes(s) ? form.sizes.filter((x) => x !== s) : [...form.sizes, s]);

  const addImageUrl = () => {
    if (imgInput.trim()) {
      set("imageUrls", [...form.imageUrls.filter(Boolean), imgInput.trim()]);
      setImgInput("");
    }
  };

  const removeImageUrl = (idx: number) =>
    set("imageUrls", form.imageUrls.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!form.name.trim() || !form.price) return;
    onSave(form);
  };

  const discount = form.originalPrice > 0 && form.price > 0
    ? Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-stone-800">Add New Sacred Item</h2>
            <p className="text-xs text-stone-400 mt-0.5">Fill in the details below to list a new product</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition">
            <IconClose />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Product Name *</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Panchmukhi Rudraksha Mala" className={inputBase} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the sacred significance and material details…" className={`${inputBase} resize-none`} />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Category *</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value as ProductCategory)} className={inputBase}>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Selling Price (₹) *</label>
              <input type="number" min={0} value={form.price || ""} onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                placeholder="1199" className={inputBase} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Original Price (₹)</label>
              <input type="number" min={0} value={form.originalPrice || ""} onChange={(e) => set("originalPrice", parseFloat(e.target.value) || 0)}
                placeholder="1799" className={inputBase} />
            </div>
          </div>
          {discount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium border border-emerald-100">
              <IconTrendUp />
              Auto-calculated discount: <span className="font-bold">{discount}% OFF</span>
            </div>
          )}

          {/* Sizes */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wide">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((s) => {
                const active = form.sizes.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleSize(s)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                      active
                        ? "bg-[#8b4513] border-[#8b4513] text-white shadow-sm"
                        : "border-stone-200 text-stone-500 hover:border-[#8b4513]/50 hover:text-[#8b4513]"
                    }`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image URLs */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Image URLs</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={imgInput} onChange={(e) => setImgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
                placeholder="https://example.com/image.jpg" className={`${inputBase} flex-1`} />
              <button type="button" onClick={addImageUrl}
                className="flex items-center gap-1.5 rounded-lg bg-[#8b4513] px-3 py-2 text-sm font-semibold text-white hover:bg-[#7a3b10] transition">
                <IconPlus /> Add
              </button>
            </div>
            {form.imageUrls.filter(Boolean).length > 0 && (
              <div className="space-y-1.5">
                {form.imageUrls.filter(Boolean).map((url, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2">
                    <img src={url} alt="" className="h-8 w-8 rounded object-cover border border-stone-200" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/32x32/f5f5f4/999?text=?"; }} />
                    <span className="flex-1 min-w-0 truncate text-xs text-stone-500 font-mono">{url}</span>
                    <button type="button" onClick={() => removeImageUrl(i)}
                      className="text-stone-400 hover:text-red-500 transition">
                      <IconClose />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bestseller */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 hover:bg-amber-50 transition">
            <div className={`relative flex h-5 w-5 items-center justify-center rounded border-2 transition ${
              form.isBestseller ? "bg-amber-500 border-amber-500" : "border-stone-300 bg-white"
            }`}>
              {form.isBestseller && (
                <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" className="w-3 h-3">
                  <polyline points="1 6 4.5 9.5 11 2.5" />
                </svg>
              )}
              <input type="checkbox" className="sr-only" checked={form.isBestseller}
                onChange={(e) => set("isBestseller", e.target.checked)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                <span className="text-amber-500"><IconStar /></span> Mark as Bestseller
              </p>
              <p className="text-xs text-stone-500 mt-0.5">Featured prominently in the Japam-style bestseller layout section</p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-stone-100 bg-white px-6 py-4">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#8b4513] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#7a3b10] transition shadow-sm">
            <IconPlus /> Save Sacred Item
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Workspace: Products ──────────────────────────────────────────────────────

const ProductWorkspace = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [showModal, setShowModal] = useState(false);

  const handleSave = useCallback((p: NewProduct) => {
    const newProd: Product = { ...p, id: `p${Date.now()}`, ordersCount: 0 };
    setProducts((prev) => [newProd, ...prev]);
    setShowModal(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleEdit = useCallback((_id: string) => {
    // TODO: wire to edit modal/API
    alert("Edit handler ready — wire to API.");
  }, []);

  return (
    <>
      <div className="space-y-5">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-800">Product Catalog</h2>
            <p className="text-sm text-stone-400 mt-0.5">
              <span className="font-semibold text-[#8b4513]">{products.length}</span> sacred items in inventory
            </p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#8b4513] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#7a3b10] transition shadow-md shadow-[#8b4513]/20">
            <IconPlus /> Add New Sacred Item
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/70">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">Item</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">Category</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">Price</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">Sizes</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">Orders</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-stone-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {products.map((p) => (
                  <tr key={p.id} className="group hover:bg-stone-50/60 transition">
                    {/* Item cell */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden border border-stone-100 shrink-0">
                          <img
                            src={p.imageUrls[0] || "https://placehold.co/48x48/f5f5f4/999?text=?"}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-stone-800 leading-tight">{p.name}</p>
                            {p.isBestseller && (
                              <span className="text-amber-500"><IconStar /></span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5 max-w-[200px] truncate">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-4"><CategoryPill cat={p.category} /></td>
                    {/* Price */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-stone-800">₹{p.price.toLocaleString("en-IN")}</p>
                      {p.originalPrice > p.price && (
                        <p className="text-xs text-stone-400 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</p>
                      )}
                    </td>
                    {/* Sizes */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {p.sizes.map((s) => (
                          <span key={s} className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500 font-medium">{s}</span>
                        ))}
                      </div>
                    </td>
                    {/* Orders */}
                    <td className="px-4 py-4">
                      <span className="font-semibold text-stone-700">{p.ordersCount.toLocaleString("en-IN")}</span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(p.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-[#8b4513]/40 hover:text-[#8b4513] transition">
                          <IconEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-red-300 hover:text-red-500 transition">
                          <IconTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                <div className="text-4xl mb-3 opacity-30"><IconOm /></div>
                <p className="font-medium">No items in catalog</p>
                <p className="text-sm mt-1">Click "Add New Sacred Item" to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && <AddProductModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </>
  );
};

// ─── Workspace: Banners ───────────────────────────────────────────────────────

const BannerWorkspace = () => {
  const [banners, setBanners] = useState<BannerSlot[]>(MOCK_BANNERS);

  const update = (id: string, field: keyof BannerSlot, value: string | boolean) =>
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));

  const handleSave = (id: string) => {
    // TODO: axios.put(`/api/banners/${id}`, ...)
    alert(`Banner ${id} saved! Ready for API integration.`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-800">Banner Management</h2>
        <p className="text-sm text-stone-400 mt-0.5">Manage live hero carousel content across all positions</p>
      </div>
      <div className="grid gap-5">
        {banners.map((b) => (
          <div key={b.id}
            className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition ${b.isActive ? "border-[#8b4513]/20" : "border-stone-100 opacity-75"}`}>
            {/* Preview strip */}
            <div className="relative h-28 overflow-hidden">
              <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 to-transparent flex flex-col justify-center px-6">
                <p className="text-white font-bold text-lg leading-tight drop-shadow">{b.title || "—"}</p>
                <p className="text-white/75 text-sm mt-0.5">{b.subtitle || "—"}</p>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${b.isActive ? "bg-emerald-500 text-white" : "bg-stone-400 text-white"}`}>
                  {b.isActive ? "LIVE" : "HIDDEN"}
                </span>
                <span className="rounded-full bg-white/20 backdrop-blur px-2.5 py-0.5 text-xs font-semibold text-white">
                  Position {b.position}
                </span>
              </div>
            </div>

            {/* Edit controls */}
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Title Text</label>
                  <input type="text" value={b.title} onChange={(e) => update(b.id, "title", e.target.value)} className={inputBase} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Background Image URL</label>
                  <input type="text" value={b.imageUrl} onChange={(e) => update(b.id, "imageUrl", e.target.value)} className={inputBase} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Subtitle Description</label>
                <input type="text" value={b.subtitle} onChange={(e) => update(b.id, "subtitle", e.target.value)} className={inputBase} />
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => update(b.id, "isActive", !b.isActive)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${b.isActive ? "bg-[#8b4513]" : "bg-stone-300"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${b.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm text-stone-600 font-medium">
                    {b.isActive ? "Visible on site" : "Hidden from carousel"}
                  </span>
                </label>
                <button onClick={() => handleSave(b.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#8b4513] px-4 py-2 text-xs font-bold text-white hover:bg-[#7a3b10] transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Workspace: Categories ────────────────────────────────────────────────────

const CategoryWorkspace = () => {
  const [cats, setCats] = useState<CategoryCircle[]>(MOCK_CATEGORIES);
  const [newLabel, setNewLabel] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newImage, setNewImage] = useState("");

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const item: CategoryCircle = {
      id: `c${Date.now()}`,
      label: newLabel.trim(),
      imageUrl: newImage.trim() || `https://placehold.co/120x120/8b4513/fff?text=${encodeURIComponent(newLabel.trim())}`,
      slug: newSlug.trim() || newLabel.toLowerCase().replace(/\s+/g, "-"),
      itemCount: 0,
    };
    setCats((prev) => [...prev, item]);
    setNewLabel(""); setNewSlug(""); setNewImage("");
  };

  const handleDelete = (id: string) => setCats((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-800">Category / Collection Circles</h2>
        <p className="text-sm text-stone-400 mt-0.5">Manage the homepage category navigation circles</p>
      </div>

      {/* Add form */}
      <div className="rounded-2xl border border-dashed border-[#8b4513]/30 bg-[#8b4513]/3 p-5">
        <p className="text-sm font-bold text-[#8b4513] mb-3">+ Add New Category</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Label *</label>
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Malas" className={inputBase} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Slug</label>
            <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="e.g. malas" className={inputBase} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Circle Image URL</label>
            <input value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="https://…" className={inputBase} />
          </div>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-[#8b4513] px-4 py-2 text-sm font-bold text-white hover:bg-[#7a3b10] transition">
          <IconPlus /> Add Category
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cats.map((c) => (
          <div key={c.id} className="group relative flex flex-col items-center rounded-2xl border border-stone-100 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#8b4513]/20 mb-3">
              <img src={c.imageUrl} alt={c.label} className="h-full w-full object-cover" />
            </div>
            <p className="font-bold text-stone-800 text-sm text-center">{c.label}</p>
            <p className="text-xs text-stone-400 mt-0.5">/{c.slug}</p>
            <div className="mt-2 rounded-full bg-stone-50 border border-stone-100 px-2.5 py-0.5 text-xs text-stone-500 font-semibold">
              {c.itemCount} items
            </div>
            <button onClick={() => handleDelete(c.id)}
              className="absolute top-2 right-2 rounded-lg p-1.5 text-stone-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition">
              <IconClose />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Workspace: Orders ────────────────────────────────────────────────────────

const OrdersWorkspace = () => {
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const STATUS_FILTERS: Array<Order["status"] | "all"> = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

  const total = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Devotee Orders Tracking</h2>
          <p className="text-sm text-stone-400 mt-0.5">
            <span className="font-semibold text-[#8b4513]">{orders.length}</span> total orders · ₹{total.toLocaleString("en-IN")} revenue
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition border ${
              filter === s
                ? "bg-[#8b4513] border-[#8b4513] text-white shadow-sm"
                : "border-stone-200 text-stone-500 bg-white hover:border-[#8b4513]/40 hover:text-[#8b4513]"
            }`}>
            {s === "all" ? `All (${orders.length})` : s}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.map((o) => (
          <div key={o.id}
            className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm hover:shadow-md transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b4513]/8 shrink-0">
              <span className="text-[#8b4513]"><IconBox /></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-stone-800 text-sm">{o.devotee}</p>
                <span className="font-mono text-xs text-stone-400">#{o.id}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{o.items.join(", ")}</p>
              <p className="text-xs text-stone-400 mt-0.5">{o.location} · {o.date}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-stone-800">₹{o.total.toLocaleString("en-IN")}</p>
              <button className="mt-1 text-xs text-[#8b4513] font-semibold hover:underline">View Details</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 py-12 text-stone-400">
            <p className="font-medium">No orders match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sidebar Tab Config ───────────────────────────────────────────────────────

interface TabConfig {
  id: SidebarTab;
  label: string;
  emoji: string;
  icon: React.ReactNode;
  desc: string;
}

const TABS: TabConfig[] = [
  { id: "products",   label: "Product Catalog",   emoji: "📿", icon: <IconProduct />,  desc: "Sacred Items Manager" },
  { id: "orders",     label: "Devotee Orders",     emoji: "📦", icon: <IconOrders />,   desc: "Order Tracking Hub" },
  { id: "banners",    label: "Banner Manager",     emoji: "🌄", icon: <IconBanner />,   desc: "Carousel & Hero Slots" },
  { id: "categories", label: "Category Circles",   emoji: "🏷️", icon: <IconCategory />, desc: "Collection Navigation" },
];

// ─── Root AdminDashboard ──────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("products");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Live mock counters
  const stats = {
    totalProducts: MOCK_PRODUCTS.length,
    liveViewers: 42,
    todaySales: "₹14,230",
    pendingOrders: MOCK_ORDERS.filter((o) => o.status === "pending").length,
  };

  const renderWorkspace = () => {
    switch (activeTab) {
      case "products":   return <ProductWorkspace />;
      case "banners":    return <BannerWorkspace />;
      case "categories": return <CategoryWorkspace />;
      case "orders":     return <OrdersWorkspace />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans antialiased">

      {/* ── Sidebar ── */}
      <aside
        className={`flex flex-col border-r border-stone-800/20 bg-[#1c1410] transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-[68px]" : "w-[240px]"
        } shrink-0`}>

        {/* Logo */}
        <div className={`flex items-center gap-3 border-b border-white/8 px-4 py-5 ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8b4513] text-amber-100 shadow-lg shadow-[#8b4513]/30">
            <IconOm />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-amber-100 leading-tight truncate">MalaWale</p>
              <p className="text-[10px] text-stone-500 leading-tight truncate">Sanwariya Handicraft</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4">
          {!sidebarCollapsed && (
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-stone-600">Admin Modules</p>
          )}
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                title={sidebarCollapsed ? t.label : undefined}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition group ${
                  active
                    ? "bg-[#8b4513] text-white shadow-lg shadow-[#8b4513]/20"
                    : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
                } ${sidebarCollapsed ? "justify-center" : ""}`}>
                <span className={`shrink-0 ${active ? "text-white" : "text-stone-500 group-hover:text-stone-300"}`}>
                  {t.icon}
                </span>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="leading-tight truncate">{t.label}</p>
                    <p className={`text-[10px] leading-tight mt-0.5 truncate ${active ? "text-white/60" : "text-stone-600"}`}>
                      {t.desc}
                    </p>
                  </div>
                )}
                {!sidebarCollapsed && active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-white/8 p-3">
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-stone-500 hover:bg-white/5 hover:text-stone-300 transition text-xs font-medium ${
              sidebarCollapsed ? "justify-center" : ""
            }`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {!sidebarCollapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* ── Main Stage ── */}
      <main className="flex flex-1 flex-col overflow-hidden">

        {/* Top Header Bar */}
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-3.5 shrink-0">
          <div>
            <h1 className="text-base font-bold text-stone-800">
              {TABS.find((t) => t.id === activeTab)?.emoji}{" "}
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-stone-400">{TABS.find((t) => t.id === activeTab)?.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Admin Live
            </div>
            <div className="h-8 w-8 rounded-full bg-[#8b4513] flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Stat Cards Strip */}
        <div className="grid grid-cols-2 gap-4 px-6 py-4 lg:grid-cols-4 border-b border-stone-100 bg-stone-50/50 shrink-0">
          <StatCard
            label="Total Products"
            value={String(stats.totalProducts)}
            sub="sacred items listed"
            icon={<span className="text-[#8b4513]"><IconProduct /></span>}
            accent="bg-[#8b4513]/10"
          />
          <StatCard
            label="Live Viewers"
            value={String(stats.liveViewers)}
            sub="devotees browsing now"
            icon={<span className="text-emerald-600"><IconEye /></span>}
            accent="bg-emerald-50"
          />
          <StatCard
            label="Today's Sales"
            value={stats.todaySales}
            sub="across all products"
            icon={<span className="text-amber-600"><IconTrendUp /></span>}
            accent="bg-amber-50"
          />
          <StatCard
            label="Pending Orders"
            value={String(stats.pendingOrders)}
            sub="awaiting fulfillment"
            icon={<span className="text-violet-600"><IconOrders /></span>}
            accent="bg-violet-50"
          />
        </div>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderWorkspace()}
          <div className="h-8" />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;