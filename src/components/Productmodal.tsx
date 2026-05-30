import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, Review, Variant } from "./Productcard";
import CartAction from "./CartAction";

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: Variant) => void;
}

// ─── Inline SVG icons ──────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#8b4513" strokeWidth={1.5}
    strokeLinecap="round" className="w-5 h-5 flex-shrink-0">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" className="w-5 h-5">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
    strokeLinecap="round" className="w-4 h-4">
    {dir === "left"
      ? <polyline points="15 18 9 12 15 6" />
      : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

// ─── Helpers ───────────────────────────────────────────────────────────────────

// const avgRating = (reviews: Review[] | undefined | null): number => {
//   if (!Array.isArray(reviews) || reviews.length === 0) return 0;
//   return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
// };

const getRandomRating = (reviews: Review[] | undefined | null): number => {
  // Agar reviews exist karte hain, toh unka average lo
  if (Array.isArray(reviews) && reviews.length > 0) {
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }
  
 
  return parseFloat((Math.random() * (5.0 - 3.6) + 3.6).toFixed(1));
};

const resolveCategory = (
  category: string | { _id?: string; name?: string } | null | undefined
): string => {
  if (!category) return "Uncategorized";
  if (typeof category === "object") return category.name ?? "Uncategorized";
  return category;
};

/**
 * Resolves price & mrp from the new variants[] API or falls back to legacy flat fields.
 * Never returns undefined — always safe numbers.
 */
const resolvePrice = (
  product: Product,
  selectedVariant?: Variant
): { price: number; mrp: number | undefined } => {
  if (selectedVariant) {
    return { price: selectedVariant.price ?? 0, mrp: selectedVariant.mrp };
  }
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length > 0) {
    const first = variants.find((v) => v.inStock) ?? variants[0];
    return { price: first.price ?? 0, mrp: first.mrp };
  }
  // Legacy flat fields
  return { price: product?.price ?? 0, mrp: product?.originalPrice };
};

/**
 * Resolves sold/order count from new soldCount field or legacy ordersCount.
 */
const resolveSoldCount = (product: Product): number => {
  if (typeof product?.soldCount === "number" && product.soldCount > 0) return product.soldCount;
  if (typeof product?.ordersCount === "number" && product.ordersCount > 0) return product.ordersCount;
  return 0;
};

const StarRow = ({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) => {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#d4a373" : "none"}
          stroke="#d4a373" strokeWidth={1.5} className={cls}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

// ─── Animate a number from 0 to target ────────────────────────────────────────

const useCountUp = (target: number, active: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) { setCount(0); return; }
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 28);
    return () => clearInterval(timer);
  }, [target, active]);
  return count;
};

// ─── useLiveViewers ────────────────────────────────────────────────────────────

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const rand = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;

const useLiveViewers = (active: boolean): number => {
  const [viewers, setViewers] = useState(() => rand(18, 42));
  useEffect(() => {
    if (!active) { setViewers(rand(18, 42)); return; }
    const go = () => {
      const id = setTimeout(() => {
        setViewers((p) => clamp(p + (Math.random() < 0.5 ? 1 : -1) * rand(1, 5), 5, 80));
        go();
      }, rand(4000, 7000));
      return id;
    };
    const id = go();
    return () => clearTimeout(id);
  }, [active]);
  return viewers;
};

// ─── useDynamicSoldCount ───────────────────────────────────────────────────────

const hashString = (str: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
};

const EPOCH_MS = new Date("2024-01-01T00:00:00Z").getTime();

const useDynamicSoldCount = (
  productId: string | undefined,
  baseSold: number,
  active: boolean
): number => {
  const compute = useCallback((): number => {
    const id = productId ?? "fallback";
    const seed = hashString(id);
    const baseline = baseSold > 15 ? baseSold : 10 + (seed % 6);
    const hoursElapsed = Math.floor((Date.now() - EPOCH_MS) / (1000 * 60 * 60));
    const hourlyRate: 1 | 2 = hashString(id + "_rate") % 3 === 0 ? 2 : 1;
    return baseline + hoursElapsed * hourlyRate;
  }, [productId, baseSold]);

  const [sold, setSold] = useState(compute);
  useEffect(() => { if (active) setSold(compute()); }, [active, compute]);
  return sold;
};

// ─── Modal ─────────────────────────────────────────────────────────────────────

const ProductModal: React.FC<ProductModalProps> = ({
  product, isOpen, onClose, onAddToCart,
}) => {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(undefined);
  const [cartState, setCartState] = useState<"idle" | "added">("idle");
  const [tab, setTab] = useState<"details" | "reviews">("details");
  const [noVariant, setNoVariant] = useState(false);

  // ── Safe normalised values ─────────────────────────────────────────────────

  const safeReviews: Review[] = Array.isArray(product?.reviews) ? product!.reviews : [];

  const safeImages: string[] =
    Array.isArray(product?.images) && product!.images.length > 0
      ? product!.images
      : ["https://placehold.co/600x600/f5ede0/8b4513?text=🪬"];

  // New API: variants[] with size/price/mrp/stock/inStock
  const safeVariants: Variant[] = Array.isArray(product?.variants) ? product!.variants : [];

  // Legacy sizes fallback (for products with flat sizes[] but no variants)
  const legacySizes: string[] = Array.isArray(product?.sizes) ? product!.sizes : [];

  const hasVariants = safeVariants.length > 0;
  const hasLegacySizes = !hasVariants && legacySizes.length > 0;

  const safeCategory = resolveCategory((product as any)?.category);
  const safeDescription = product?.description ?? "";

  // Price resolution — uses selectedVariant if set, otherwise first inStock variant
  const { price, mrp } = resolvePrice(product ?? {} as Product, selectedVariant);
  const disc = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  // Sold count — new soldCount field OR legacy ordersCount
  const baseSold = product ? resolveSoldCount(product) : 0;
  const rawSold = useDynamicSoldCount(
    (product as any)?._id?.toString() ?? product?.id,
    baseSold,
    isOpen
  );
  const orders = useCountUp(rawSold, isOpen);

  const rating = React.useMemo(() => getRandomRating(safeReviews), [product?._id, safeReviews.length]);
  const viewers = useLiveViewers(isOpen);

  // ── Reset when product changes ─────────────────────────────────────────────

  useEffect(() => {
    setActiveImg(0);
    setCartState("idle");
    setTab("details");
    setNoVariant(false);

    // A product requires explicit size selection if it has multiple variants
    const requiresSizeSelection = safeVariants.length > 1;

    // Auto-select first inStock variant ONLY if no explicit selection is required
    if (requiresSizeSelection) {
      setSelectedVariant(undefined);
    } else if (safeVariants.length > 0) {
      setSelectedVariant(safeVariants.find((v) => v.inStock) ?? safeVariants[0]);
    } else {
      setSelectedVariant(undefined);
    }
  }, [product?._id, product?.id, safeVariants.length]);

  // Keyboard + scroll lock
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  useEffect(() => {
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Cart handler removed (moved to shared CartAction component) ──

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImg((i) => (i - 1 + safeImages.length) % safeImages.length);
  };
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImg((i) => (i + 1) % safeImages.length);
  };

  const isOutOfStock = selectedVariant
    ? !selectedVariant.inStock || selectedVariant.stock === 0
    : false;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          >
            <div className="absolute inset-0" style={{ background: "rgba(30,12,4,0.62)" }} />
          </motion.div>

          {/* Modal panel */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            aria-modal="true" role="dialog" aria-label={product.name}
          >
            <motion.div
              className="relative w-full max-w-5xl max-h-[94vh] overflow-hidden rounded-3xl pointer-events-auto flex flex-col"
              style={{
                background: "linear-gradient(160deg, #fff9f2 0%, #fff4e8 100%)",
                border: "1.5px solid #e0c9a8",
                boxShadow: "0 40px 100px rgba(139,69,19,0.28), 0 8px 32px rgba(139,69,19,0.14)",
              }}
              initial={{ opacity: 0, scale: 0.88, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold top bar */}
              <div className="h-1 w-full flex-shrink-0" style={{
                background: "linear-gradient(90deg, transparent, #d4a373, #c8843a, #d4a373, transparent)",
              }} />

              {/* Close */}
              <button onClick={onClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(139,69,19,0.08)", border: "1px solid rgba(212,163,115,0.4)", color: "#8b4513" }}>
                <CloseIcon />
              </button>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                  {/* ═══ LEFT — Gallery ═══ */}
                  <div className="p-5 lg:p-7 flex flex-col gap-4 lg:border-r" style={{ borderColor: "#e8d5c0" }}>

                    {/* Main image */}
                    <div className="relative rounded-2xl overflow-hidden"
                      style={{ aspectRatio: "1/1", background: "#f5ede0", border: "1px solid #e0c9a8" }}>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeImg}
                          src={safeImages[activeImg]}
                          alt={`${product.name ?? "Product"} view ${activeImg + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          initial={{ opacity: 0, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.32, ease: "easeInOut" }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/600x600/f5ede0/8b4513?text=🪬";
                          }}
                        />
                      </AnimatePresence>

                      {safeImages.length > 1 && (
                        <>
                          <button onClick={prevImg}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(255,249,242,0.88)", backdropFilter: "blur(4px)", border: "1px solid rgba(212,163,115,0.5)", color: "#8b4513" }}>
                            <ChevronIcon dir="left" />
                          </button>
                          <button onClick={nextImg}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(255,249,242,0.88)", backdropFilter: "blur(4px)", border: "1px solid rgba(212,163,115,0.5)", color: "#8b4513" }}>
                            <ChevronIcon dir="right" />
                          </button>
                        </>
                      )}

                      {disc && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-xs font-bold"
                          style={{ background: "linear-gradient(135deg, #c8843a, #8b4513)", fontFamily: "'Jost', sans-serif" }}>
                          -{disc}% OFF
                        </div>
                      )}

                      {/* Badge */}
                      {product.badge && product.badge.trim() !== "" && !disc && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-xs font-bold"
                          style={{
                            background: product.badge === "Bestseller"
                              ? "linear-gradient(135deg, #c8843a, #8b4513)"
                              : "linear-gradient(135deg, #6b7280, #374151)",
                            fontFamily: "'Jost', sans-serif",
                          }}>
                          {product.badge}
                        </div>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {safeImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {safeImages.map((img, idx) => (
                          <motion.button key={idx} onClick={() => setActiveImg(idx)}
                            className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden"
                            style={{ border: `2px solid ${activeImg === idx ? "#8b4513" : "#e0c9a8"}`, opacity: activeImg === idx ? 1 : 0.65, transition: "all 0.2s ease" }}
                            whileHover={{ opacity: 1 }} whileTap={{ scale: 0.95 }}>
                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/64x64/f5ede0/8b4513?text=🪬"; }} />
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Live viewers */}
                    <motion.div
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                      style={{ background: "rgba(139,69,19,0.06)", border: "1px solid rgba(139,69,19,0.12)" }}
                      animate={{ opacity: [1, 0.75, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#c8843a" }} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#8b4513" }} />
                      </span>
                      <EyeIcon />
                      <span className="text-sm font-medium" style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}>
                        <strong>{viewers}</strong> people viewing this right now
                      </span>
                    </motion.div>
                  </div>

                  {/* ═══ RIGHT — Details ═══ */}
                  <div className="p-5 lg:p-7 flex flex-col gap-5">

                    {/* Category */}
                    {safeCategory && safeCategory !== "Uncategorized" && (
                      <span className="text-xs font-semibold tracking-widest uppercase"
                        style={{ color: "#a0522d", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.14em" }}>
                        {safeCategory}
                      </span>
                    )}

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl font-bold leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif", color: "#3d1f0a" }}>
                      {product.name ?? ""}
                    </h2>

                    {/* Rating + orders */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <StarRow rating={rating} />
                        <span className="text-sm font-medium" style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}>
                          {rating.toFixed(1)}
                        </span>
                      </div>
                      {safeReviews.length > 0 && (
                        <>
                          <div className="h-4 w-px" style={{ background: "#d4a373" }} />
                          <span className="text-sm" style={{ color: "#a07a5a", fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem" }}>
                            {safeReviews.length} verified reviews
                          </span>
                        </>
                      )}
                      {orders > 0 && (
                        <>
                          <div className="h-4 w-px" style={{ background: "#d4a373" }} />
                          <span className="text-sm font-semibold" style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}>
                            🔥 {orders.toLocaleString()}+ sold
                          </span>
                        </>
                      )}
                    </div>

                    {/* Price — from selected variant or first variant */}
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-bold"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#8b4513" }}>
                        ₹{price.toLocaleString()}
                      </span>
                      {mrp && mrp > price && (
                        <>
                          <span className="text-lg line-through pb-0.5"
                            style={{ color: "#b8987a", fontFamily: "'Jost', sans-serif" }}>
                            ₹{mrp.toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #c8843a, #a0522d)", fontFamily: "'Jost', sans-serif" }}>
                            Save ₹{(mrp - price).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* ── Variant selector (new API) ── */}
                    {hasVariants && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold"
                            style={{ color: "#5c2e0a", fontFamily: "'Jost', sans-serif" }}>
                            Choose Size
                          </span>
                          {noVariant && (
                            <motion.span
                              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                              className="text-xs font-medium" style={{ color: "#c0392b", fontFamily: "'Jost', sans-serif" }}>
                              ↑ Please select a size
                            </motion.span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {safeVariants.map((variant) => {
                            const isSelected = selectedVariant?._id === variant._id;
                            const isUnavailable = !variant.inStock || variant.stock === 0;
                            return (
                              <motion.button
                                key={variant._id ?? variant.size}
                                onClick={() => !isUnavailable && setSelectedVariant(variant)}
                                whileTap={isUnavailable ? {} : { scale: 0.93 }}
                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={{
                                  fontFamily: "'Jost', sans-serif",
                                  background: isSelected
                                    ? "linear-gradient(135deg, #8b4513, #c8843a)"
                                    : isUnavailable ? "rgba(0,0,0,0.04)" : "rgba(139,69,19,0.06)",
                                  color: isSelected ? "#fff" : isUnavailable ? "#c4a882" : "#8b4513",
                                  border: `1.5px solid ${isSelected ? "#c8843a" : isUnavailable ? "#e8d5c0" : "rgba(139,69,19,0.2)"}`,
                                  boxShadow: isSelected ? "0 4px 14px rgba(200,132,58,0.35)" : "none",
                                  cursor: isUnavailable ? "not-allowed" : "pointer",
                                  textDecoration: isUnavailable ? "line-through" : "none",
                                  opacity: isUnavailable ? 0.6 : 1,
                                  outline: noVariant && !selectedVariant ? "2px solid #c0392b" : "none",
                                }}>
                                {variant.size}
                                {variant.price !== price && !isSelected && (
                                  <span className="ml-1 text-[10px]" style={{ color: "#a0522d" }}>
                                    ₹{variant.price}
                                  </span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── Legacy sizes fallback ── */}
                    {hasLegacySizes && (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold" style={{ color: "#5c2e0a", fontFamily: "'Jost', sans-serif" }}>
                          Choose Size
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {legacySizes.map((sz) => (
                            <motion.button key={sz}
                              onClick={() => setSelectedVariant({ size: sz, price, mrp: mrp ?? price, stock: 99, inStock: true })}
                              whileTap={{ scale: 0.93 }}
                              className="px-4 py-2 rounded-xl text-sm font-semibold"
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                background: selectedVariant?.size === sz ? "linear-gradient(135deg, #8b4513, #c8843a)" : "rgba(139,69,19,0.06)",
                                color: selectedVariant?.size === sz ? "#fff" : "#8b4513",
                                border: `1.5px solid ${selectedVariant?.size === sz ? "#c8843a" : "rgba(139,69,19,0.2)"}`,
                              }}>
                              {sz}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details bullet points (new API field) */}
                    {Array.isArray(product.details) && product.details.length > 0 && (
                      <ul className="flex flex-col gap-1.5">
                        {product.details.map((d, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#6b4226", fontSize: "0.92rem" }}>
                            <span style={{ color: "#c8843a", fontSize: "1rem" }}>•</span> {d}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Trust badge */}
                    <div className="flex gap-3 p-4 rounded-2xl relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, rgba(212,163,115,0.10) 0%, rgba(139,69,19,0.06) 100%)", border: "1px solid rgba(212,163,115,0.5)" }}>
                      <div className="absolute top-0 right-0 w-16 h-16 opacity-10"
                        style={{ background: "radial-gradient(circle at top right, #d4a373, transparent 70%)" }} />
                      <ShieldIcon />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#5c2e0a" }}>
                          Direct Sourcing — Middlemen-Free Purity
                        </span>
                        <span className="text-xs leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#8b6a4a", fontSize: "0.82rem" }}>
                          Crafted directly from premium raw materials by{" "}
                          <strong>Sanwariya Handicraft</strong> artisans. Every bead is
                          sacred, sourced, and strung with devotion — no intermediaries, no compromises.
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="w-full">
                      <CartAction
                        product={product}
                        selectedSize={selectedVariant?.size || ""}
                        layout="wide"
                        onAddToCartSuccess={() => onAddToCart && onAddToCart(product, selectedVariant)}
                      />
                    </div>

                    {/* Tabs */}
                    <div>
                      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(139,69,19,0.06)" }}>
                        {(["details", "reviews"] as const).map((t) => (
                          <motion.button key={t} onClick={() => setTab(t)}
                            className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors duration-200"
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              background: tab === t ? "linear-gradient(135deg, #8b4513, #c8843a)" : "transparent",
                              color: tab === t ? "#fff" : "#a07a5a",
                            }}
                            whileTap={{ scale: 0.97 }}>
                            {t === "reviews" ? `Reviews (${safeReviews.length})` : "Details"}
                          </motion.button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        {tab === "details" ? (
                          <motion.div key="details"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }} className="mt-4">
                            <p className="leading-relaxed text-sm"
                              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#6b4226", fontSize: "0.95rem", lineHeight: "1.7" }}>
                              {safeDescription}
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div key="reviews"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }} className="mt-4 flex flex-col gap-3">
                            {safeReviews.length === 0 ? (
                              <p className="text-center py-6 text-sm"
                                style={{ color: "#a07a5a", fontFamily: "'Cormorant Garamond', serif" }}>
                                No reviews yet. Be the first to share your experience!
                              </p>
                            ) : (
                              safeReviews.map((rev, idx) => (
                                <motion.div key={idx}
                                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.06 }}
                                  className="p-4 rounded-xl flex flex-col gap-1.5"
                                  style={{ background: "rgba(212,163,115,0.07)", border: "1px solid rgba(212,163,115,0.25)" }}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold"
                                      style={{ fontFamily: "'Jost', sans-serif", color: "#5c2e0a" }}>
                                      {rev.user ?? "Anonymous"}
                                    </span>
                                    <StarRow rating={rev.rating ?? 0} size="sm" />
                                  </div>
                                  <p className="text-sm leading-relaxed"
                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: "#7a5238", fontSize: "0.9rem" }}>
                                    {rev.comment ?? ""}
                                  </p>
                                </motion.div>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                  {/* end RIGHT */}
                </div>
              </div>

              {/* Bottom gold ornament */}
              <div className="h-0.5 w-full flex-shrink-0"
                style={{ background: "linear-gradient(90deg, transparent, #d4a373, #c8843a, #d4a373, transparent)", opacity: 0.5 }} />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;