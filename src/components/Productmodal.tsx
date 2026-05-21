import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, Review } from "./Productcard";

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

// ─── Inline SVG icons ──────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const StarIcon = ({ filled, half }: { filled: boolean; half?: boolean }) => (
  <svg viewBox="0 0 24 24"
    fill={filled ? "#d4a373" : half ? "url(#half)" : "none"}
    stroke="#d4a373" strokeWidth={1.5} className="w-4 h-4">
    {half && (
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stopColor="#d4a373" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
    )}
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

const avgRating = (reviews: Review[]): number =>
  reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

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

// Animate a number from 0 to target
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

// Pulsing live viewer counter
const useLiveViewers = (base: number, active: boolean) => {
  const [viewers, setViewers] = useState(base);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setViewers(base + Math.floor(Math.random() * 7 - 3));
    }, 3000);
    return () => clearInterval(t);
  }, [base, active]);
  return viewers;
};

// ─── Modal ─────────────────────────────────────────────────────────────────────

const ProductModal: React.FC<ProductModalProps> = ({
  product, isOpen, onClose, onAddToCart,
}) => {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [cartState, setCartState] = useState<"idle" | "added">("idle");
  const [tab, setTab] = useState<"details" | "reviews">("details");
  const [noSize, setNoSize] = useState(false);

 //  NEW (Guarded against missing properties)
const rating = product?.reviews ? avgRating(product.reviews) : 0;
const orders = useCountUp(product?.ordersCount ?? 0, isOpen);
const viewers = useLiveViewers(
  product?.ordersCount ? Math.floor(product.ordersCount / 12) + 8 : 0, 
  isOpen
);

  // Reset state when product changes
  useEffect(() => {
    setActiveImg(0);
    setSelectedSize("");
    setCartState("idle");
    setTab("details");
    setNoSize(false);
  }, [product?.id]);

  // Close on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  useEffect(() => {
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
      setNoSize(true);
      setTimeout(() => setNoSize(false), 1800);
      return;
    }
    if (cartState === "added") return;
    onAddToCart(product, selectedSize);
    setCartState("added");
    setTimeout(() => setCartState("idle"), 2400);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    setActiveImg((i) => (i - 1 + product.images.length) % product.images.length);
  };
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    setActiveImg((i) => (i + 1) % product.images.length);
  };

  const disc =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  // ── Render ──────────────────────────────────────────────────────────────────

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
            {/* dark layer */}
            <div className="absolute inset-0" style={{ background: "rgba(30,12,4,0.62)" }} />
          </motion.div>

          {/* Modal panel */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            aria-modal="true"
            role="dialog"
            aria-label={product.name}
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
              {/* Gold ornamental top bar */}
              <div
                className="h-1 w-full flex-shrink-0"
                style={{
                  background: "linear-gradient(90deg, transparent, #d4a373, #c8843a, #d4a373, transparent)",
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(139,69,19,0.08)",
                  border: "1px solid rgba(212,163,115,0.4)",
                  color: "#8b4513",
                }}
              >
                <CloseIcon />
              </button>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                  {/* ═══════════ LEFT — Gallery ═══════════ */}
                  <div
                    className="p-5 lg:p-7 flex flex-col gap-4 lg:border-r"
                    style={{ borderColor: "#e8d5c0" }}
                  >
                    {/* Main image */}
                    <div
                      className="relative rounded-2xl overflow-hidden"
                      style={{
                        aspectRatio: "1/1",
                        background: "#f5ede0",
                        border: "1px solid #e0c9a8",
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeImg}
                          src={product.images[activeImg]}
                          alt={`${product.name} view ${activeImg + 1}`}
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

                      {/* Nav arrows */}
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImg}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background: "rgba(255,249,242,0.88)",
                              backdropFilter: "blur(4px)",
                              border: "1px solid rgba(212,163,115,0.5)",
                              color: "#8b4513",
                            }}
                          >
                            <ChevronIcon dir="left" />
                          </button>
                          <button
                            onClick={nextImg}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background: "rgba(255,249,242,0.88)",
                              backdropFilter: "blur(4px)",
                              border: "1px solid rgba(212,163,115,0.5)",
                              color: "#8b4513",
                            }}
                          >
                            <ChevronIcon dir="right" />
                          </button>
                        </>
                      )}

                      {/* Discount badge */}
                      {disc && (
                        <div
                          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-xs font-bold"
                          style={{
                            background: "linear-gradient(135deg, #c8843a, #8b4513)",
                            fontFamily: "'Jost', sans-serif",
                          }}
                        >
                          -{disc}% OFF
                        </div>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    {product.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {product.images.map((img, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => setActiveImg(idx)}
                            className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden"
                            style={{
                              border: `2px solid ${activeImg === idx ? "#8b4513" : "#e0c9a8"}`,
                              opacity: activeImg === idx ? 1 : 0.65,
                              transition: "all 0.2s ease",
                            }}
                            whileHover={{ opacity: 1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/64x64/f5ede0/8b4513?text=🪬";
                              }}
                            />
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Live viewers pill */}
                    <motion.div
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                      style={{
                        background: "rgba(139,69,19,0.06)",
                        border: "1px solid rgba(139,69,19,0.12)",
                      }}
                      animate={{ opacity: [1, 0.75, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                          style={{ background: "#c8843a" }}
                        />
                        <span
                          className="relative inline-flex rounded-full h-2.5 w-2.5"
                          style={{ background: "#8b4513" }}
                        />
                      </span>
                      <EyeIcon />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}
                      >
                        <strong>{viewers}</strong> people viewing this right now
                      </span>
                    </motion.div>
                  </div>

                  {/* ═══════════ RIGHT — Details ═══════════ */}
                  <div className="p-5 lg:p-7 flex flex-col gap-5">

                    {/* Category */}
                    <span
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{
                        color: "#a0522d",
                        fontFamily: "'Cormorant Garamond', serif",
                        letterSpacing: "0.14em",
                      }}
                    >
                      {product.category}
                    </span>

                    {/* Title */}
                    <h2
                      className="text-2xl sm:text-3xl font-bold leading-tight"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#3d1f0a",
                      }}
                    >
                      {product.name}
                    </h2>

                    {/* Rating + orders */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <StarRow rating={rating} />
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}
                        >
                          {rating.toFixed(1)}
                        </span>
                      </div>
                      <div
                        className="h-4 w-px"
                        style={{ background: "#d4a373" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "#a07a5a", fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem" }}
                      >
                        {product.reviews.length} verified reviews
                      </span>
                      <div
                        className="h-4 w-px"
                        style={{ background: "#d4a373" }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}
                      >
                        🔥 {orders.toLocaleString()}+ sold
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-3">
                      <span
                        className="text-3xl font-bold"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "#8b4513",
                        }}
                      >
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <>
                          <span
                            className="text-lg line-through pb-0.5"
                            style={{ color: "#b8987a", fontFamily: "'Jost', sans-serif" }}
                          >
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                            style={{
                              background: "linear-gradient(135deg, #c8843a, #a0522d)",
                              fontFamily: "'Jost', sans-serif",
                            }}
                          >
                            Save ₹{(product.originalPrice - product.price).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Size selector */}
                    {product.sizes.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#5c2e0a", fontFamily: "'Jost', sans-serif" }}
                          >
                            Choose Size
                          </span>
                          {noSize && (
                            <motion.span
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-xs font-medium"
                              style={{ color: "#c0392b", fontFamily: "'Jost', sans-serif" }}
                            >
                              ↑ Please select a size
                            </motion.span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((sz) => (
                            <motion.button
                              key={sz}
                              onClick={() => setSelectedSize(sz)}
                              whileTap={{ scale: 0.93 }}
                              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                background:
                                  selectedSize === sz
                                    ? "linear-gradient(135deg, #8b4513, #c8843a)"
                                    : "rgba(139,69,19,0.06)",
                                color: selectedSize === sz ? "#fff" : "#8b4513",
                                border: `1.5px solid ${selectedSize === sz ? "#c8843a" : "rgba(139,69,19,0.2)"}`,
                                boxShadow:
                                  selectedSize === sz
                                    ? "0 4px 14px rgba(200,132,58,0.35)"
                                    : "none",
                                outline: noSize && !selectedSize
                                  ? "2px solid #c0392b"
                                  : "none",
                              }}
                            >
                              {sz}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Trust badge ── */}
                    <div
                      className="flex gap-3 p-4 rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(212,163,115,0.10) 0%, rgba(139,69,19,0.06) 100%)",
                        border: "1px solid rgba(212,163,115,0.5)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Decorative corner accent */}
                      <div
                        className="absolute top-0 right-0 w-16 h-16 opacity-10"
                        style={{
                          background:
                            "radial-gradient(circle at top right, #d4a373, transparent 70%)",
                        }}
                      />
                      <ShieldIcon />
                      <div className="flex flex-col gap-1">
                        <span
                          className="text-sm font-bold"
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            color: "#5c2e0a",
                          }}
                        >
                          Direct Sourcing — Middlemen-Free Purity
                        </span>
                        <span
                          className="text-xs leading-relaxed"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "#8b6a4a",
                            fontSize: "0.82rem",
                            letterSpacing: "0.01em",
                          }}
                        >
                          Crafted directly from premium raw materials by{" "}
                          <strong>Sanwariya Handicraft</strong> artisans. Every bead is
                          sacred, sourced, and strung with devotion — no intermediaries,
                          no compromises.
                        </span>
                      </div>
                    </div>

                    {/* ── CTA Button ── */}
                    <motion.button
                      onClick={handleCart}
                      className="w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 text-base font-semibold overflow-hidden relative"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        letterSpacing: "0.05em",
                        background:
                          cartState === "added"
                            ? "linear-gradient(135deg, #4a7c59, #2d5a3d)"
                            : "linear-gradient(135deg, #8b4513 0%, #c8843a 100%)",
                        color: "#fff",
                        boxShadow:
                          cartState === "added"
                            ? "0 6px 20px rgba(74,124,89,0.4)"
                            : "0 6px 24px rgba(139,69,19,0.38)",
                        transition: "background 0.4s ease, box-shadow 0.4s ease",
                      }}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <AnimatePresence mode="wait">
                        {cartState === "added" ? (
                          <motion.span
                            key="done"
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth={2.5} strokeLinecap="round" className="w-5 h-5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Added to Cart!
                          </motion.span>
                        ) : (
                          <motion.span
                            key="add"
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <CartIcon /> Add to Cart
                            {selectedSize && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full ml-1"
                                style={{
                                  background: "rgba(255,255,255,0.25)",
                                  fontFamily: "'Jost', sans-serif",
                                }}
                              >
                                {selectedSize}
                              </span>
                            )}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* ── Tabs ── */}
                    <div>
                      <div
                        className="flex gap-1 p-1 rounded-xl"
                        style={{ background: "rgba(139,69,19,0.06)" }}
                      >
                        {(["details", "reviews"] as const).map((t) => (
                          <motion.button
                            key={t}
                            onClick={() => setTab(t)}
                            className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors duration-200"
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              background:
                                tab === t
                                  ? "linear-gradient(135deg, #8b4513, #c8843a)"
                                  : "transparent",
                              color: tab === t ? "#fff" : "#a07a5a",
                            }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {t === "reviews"
                              ? `Reviews (${product.reviews.length})`
                              : "Details"}
                          </motion.button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        {tab === "details" ? (
                          <motion.div
                            key="details"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="mt-4"
                          >
                            <p
                              className="leading-relaxed text-sm"
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "#6b4226",
                                fontSize: "0.95rem",
                                lineHeight: "1.7",
                              }}
                            >
                              {product.description}
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="reviews"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="mt-4 flex flex-col gap-3"
                          >
                            {product.reviews.length === 0 ? (
                              <p
                                className="text-center py-6 text-sm"
                                style={{
                                  color: "#a07a5a",
                                  fontFamily: "'Cormorant Garamond', serif",
                                }}
                              >
                                No reviews yet. Be the first to share your experience!
                              </p>
                            ) : (
                              product.reviews.map((rev, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -12 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.06 }}
                                  className="p-4 rounded-xl flex flex-col gap-1.5"
                                  style={{
                                    background: "rgba(212,163,115,0.07)",
                                    border: "1px solid rgba(212,163,115,0.25)",
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span
                                      className="text-sm font-semibold"
                                      style={{
                                        fontFamily: "'Jost', sans-serif",
                                        color: "#5c2e0a",
                                      }}
                                    >
                                      {rev.user}
                                    </span>
                                    <StarRow rating={rev.rating} size="sm" />
                                  </div>
                                  <p
                                    className="text-sm leading-relaxed"
                                    style={{
                                      fontFamily: "'Cormorant Garamond', serif",
                                      color: "#7a5238",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    {rev.comment}
                                  </p>
                                </motion.div>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                  {/* ── end RIGHT ── */}
                </div>
              </div>
              {/* End scrollable body */}

              {/* Bottom gold ornament */}
              <div
                className="h-0.5 w-full flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #d4a373, #c8843a, #d4a373, transparent)",
                  opacity: 0.5,
                }}
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;