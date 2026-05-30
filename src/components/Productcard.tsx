import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { cartService, favoriteService } from "../utils/service";
import CartAction from "./CartAction";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Review {
  user: string;
  rating: number; // 1–5
  comment: string;
}

export interface Category {
  _id: string;
  name: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Variant {
  _id?: string;
  size: string;
  mrp: number;
  price: number;
  stock: number;
  inStock: boolean;
}

export interface Product {
  id?: string;
  _id?: string;
  name: string;
  category: string | Category | null;
  // Legacy flat fields (kept for backward compat)
  price?: number;
  originalPrice?: number;
  sizes?: string[];
  ordersCount?: number;
  reviews?: Review[];
  // New API fields
  variants?: Variant[];
  soldCount?: number;
  badge?: string;
  details?: string[];
  description: string;
  images: string[];
  isFeatured?: boolean;
}

export interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product, selectedVariant?: Variant) => void;
  onAddToCart: (product: Product, selectedVariant?: Variant) => void;
}

// ─── Fallback Products (used by App.tsx when API fails) ───────────────────────

export const products: Product[] = [
  {
    id: '101',
    name: 'Natural 5 Mukhi Rudraksh Mala',
    category: 'rudraksh',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80',
    ],
    description: 'Directly sourced raw materials, handcrafted by Sanwariya artisans.',
    soldCount: 450,
    badge: 'Bestseller',
    details: [],
    variants: [
      { size: 'Standard', mrp: 1299, price: 1100, stock: 10, inStock: true, _id: 'v101' },
    ],
    isFeatured: true,
  },
  {
    id: '102',
    name: 'Premium Sandalwood Bracelet',
    category: 'bracelets',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=80',
    ],
    description: 'Fragrant and pure natural sandalwood beads.',
    soldCount: 0,
    badge: '',
    details: [],
    variants: [
      { size: 'Small', mrp: 599, price: 450, stock: 20, inStock: true, _id: 'v102a' },
      { size: 'Medium', mrp: 699, price: 550, stock: 15, inStock: true, _id: 'v102b' },
    ],
    isFeatured: false,
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "#8b4513" : "none"}
    stroke={filled ? "#8b4513" : "#a0522d"}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "#d4a373" : "none"}
    stroke="#d4a373"
    strokeWidth={1.5}
    className="w-3.5 h-3.5"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── Helpers ───────────────────────────────────────────────────────────────────

const averageRating = (reviews: Review[] | undefined | null): number => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
};

const discount = (price: number, mrp?: number): number | null => {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
};

/**
 * Resolves the active price and mrp from the product.
 * Prefers variants array; falls back to legacy flat fields.
 */
const resolveVariantPrice = (
  product: Product,
  selectedVariant?: Variant
): { price: number; mrp: number | undefined } => {
  // Use selected variant if provided
  if (selectedVariant) {
    return { price: selectedVariant.price, mrp: selectedVariant.mrp };
  }
  // Use first available (inStock) variant
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const firstInStock = product.variants.find((v) => v.inStock) ?? product.variants[0];
    return { price: firstInStock.price, mrp: firstInStock.mrp };
  }
  // Legacy flat fields fallback
  return {
    price: product.price ?? 0,
    mrp: product.originalPrice,
  };
};

/**
 * Resolves the display orders/sold count.
 * Prefers soldCount (new API), then ordersCount (legacy), then seeded fallback.
 */
const resolveOrdersCount = (product: Product): number => {
  if (typeof product.soldCount === "number" && product.soldCount > 0) {
    return product.soldCount;
  }
  if (typeof product.ordersCount === "number" && product.ordersCount > 0) {
    return product.ordersCount;
  }
  return getSeededOrdersCount(product._id ?? product.id);
};

/**
 * Deterministically generates a stable baseline order count based on the product ID.
 */
const getSeededOrdersCount = (productId?: string): number => {
  const safeId = productId ?? "";
  let seed = 0;
  for (let i = 0; i < safeId.length; i++) {
    seed += safeId.charCodeAt(i);
  }
  const currentGlobalHour = new Date().getHours();
  const baselineBase = 10 + (seed % 6);
  const growthFactor = (seed % 2) + 1;
  const currentDayHourImpact = (currentGlobalHour * growthFactor) % 12;
  return baselineBase + currentDayHourImpact;
};

/**
 * Resolves the category display name from either string or Category object.
 */
const resolveCategoryName = (category: Product["category"]): string => {
  if (!category) return "";
  if (typeof category === "object" && "name" in category) return category.name;
  if (typeof category === "string") return category;
  return "";
};

// ─── ProductCard ───────────────────────────────────────────────────────────────

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
}) => {
  const { user, openLoginModal } = useAuth();
  const { cartItems, addToCart: contextAddToCart, updateQuantity, removeFromCart } = useCart() as any;
  const isAuthenticated = !!user;

  // Guard: if product is somehow undefined/null, render nothing
  if (!product) return null;

  const hasVariants =
    Array.isArray(product?.variants) && (product.variants?.length ?? 0) > 0;

  // A product requires explicit size selection if it has multiple variants
  const requiresSizeSelection = hasVariants && product.variants!.length > 1;

  // Default to first inStock variant only if no explicit selection is required
  const defaultVariant = requiresSizeSelection
    ? undefined
    : (hasVariants ? (product.variants!.find((v) => v.inStock) ?? product.variants![0]) : undefined);

  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    defaultVariant
  );
  const [isFav, setIsFav] = useState(false);
  const [cartState, setCartState] = useState<"idle" | "added">("idle");
  const [isHovered, setIsHovered] = useState(false);

  // Sync selectedVariant when product changes (list re-renders with different product)
  useEffect(() => {
    const variants = product?.variants;
    const hasVar = Array.isArray(variants) && variants.length > 0;
    const reqSize = hasVar && variants.length > 1;
    
    if (reqSize) {
      setSelectedVariant(undefined);
    } else if (hasVar) {
      setSelectedVariant(variants.find((v) => v.inStock) ?? variants[0]);
    } else {
      setSelectedVariant(undefined);
    }
  }, [product?._id, product?.id]);

  // Live viewers local engine bounded securely between 5 and 80
  const [viewersCount, setViewersCount] = useState<number>(() => {
    const safeId = product?._id ?? product?.id ?? "";
    let seed = 0;
    for (let i = 0; i < safeId.length; i++) {
      seed += safeId.charCodeAt(i);
    }
    return 12 + (seed % 23);
  });

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    const scheduleUpdate = () => {
      const nextInterval = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000;
      timerId = setTimeout(() => {
        setViewersCount((current) => {
          const changeDirection = Math.random() > 0.45 ? 1 : -1;
          const varianceAmount = Math.floor(Math.random() * 5) + 1;
          const rawTarget = current + changeDirection * varianceAmount;
          return Math.max(5, Math.min(80, rawTarget));
        });
        scheduleUpdate();
      }, nextInterval);
    };
    scheduleUpdate();
    return () => clearTimeout(timerId);
  }, [product.id, product._id]);

  // ── Derived display values ──
  const { price, mrp } = resolveVariantPrice(product, selectedVariant);
  const disc = discount(price, mrp);
  const avg = averageRating(product?.reviews ?? []);
  const displayOrdersCount = resolveOrdersCount(product);
  const categoryName = resolveCategoryName(product.category);

  // ── Derived cart mapping variables ──
  const currentVariantSize = selectedVariant?.size || "";

  // ── Handlers ──
  const handleVariantSelect = (e: React.MouseEvent, variant: Variant) => {
    e.stopPropagation();
    setSelectedVariant(variant);
    // Reset cart state when variant changes
    setCartState("idle");
  };

  const handleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login first! 🛒");
      window.scrollTo({ top: 0, behavior: "smooth" });
      openLoginModal();
      return;
    }

    try {
      const productId = product._id || product.id;
      if (!productId) throw new Error("Product ID context missing parsing fields.");

      await favoriteService.toggleFavorite({ productId });
      setIsFav((v) => !v);
    } catch (error) {
      console.error("Wishlist toggle mutation pipeline encountered a network error:", error);
    }
  };

  // Is the selected variant out of stock?
  const isOutOfStock = selectedVariant
    ? !selectedVariant.inStock || selectedVariant.stock === 0
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onViewDetails(product, selectedVariant)}
      className="relative cursor-pointer group"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {/* Card Shell */}
      <div
        className="relative rounded-2xl overflow-hidden bg-[#fff9f2] flex flex-col"
        style={{
          boxShadow: isHovered
            ? "0 20px 60px rgba(139,69,19,0.18), 0 4px 16px rgba(139,69,19,0.10)"
            : "0 4px 24px rgba(139,69,19,0.09), 0 1px 4px rgba(139,69,19,0.06)",
          border: "1.5px solid",
          borderColor: isHovered ? "#d4a373" : "#e8d5c0",
          transition: "box-shadow 0.35s ease, border-color 0.35s ease",
        }}
      >
        {/* ── Image Zone ── */}
        <div className="relative overflow-hidden bg-[#f5ede0]" style={{ aspectRatio: "1 / 1" }}>
          <motion.img
            src={product.images && product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.07 : 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/400x400/f5ede0/8b4513?text=🪬";
            }}
          />

          {/* Gradient veil at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(245,237,224,0.85) 0%, transparent 100%)",
            }}
          />

          {/* Discount badge */}
          {disc && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-white text-xs font-bold tracking-wide"
              style={{
                background: "linear-gradient(135deg, #c8843a, #8b4513)",
                fontFamily: "'Jost', sans-serif",
                boxShadow: "0 2px 8px rgba(200,132,58,0.45)",
              }}
            >
              -{disc}% OFF
            </motion.div>
          )}

          {/* Badge (Bestseller / Regular etc.) */}
          {product.badge && product.badge.trim() !== "" && !disc && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-white text-xs font-bold tracking-wide"
              style={{
                background:
                  product.badge === "Bestseller"
                    ? "linear-gradient(135deg, #c8843a, #8b4513)"
                    : "linear-gradient(135deg, #6b7280, #374151)",
                fontFamily: "'Jost', sans-serif",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {product.badge}
            </motion.div>
          )}

          {/* Live Viewers Floating Badge */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-14 left-3 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
            style={{
              background: "rgba(255, 249, 242, 0.88)",
              backdropFilter: "blur(6px)",
              color: "#8b4513",
              border: "1px solid rgba(212, 163, 115, 0.45)",
              boxShadow: "0 2px 6px rgba(139, 69, 19, 0.08)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={viewersCount}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.25 }}
              >
                {viewersCount} active views
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Favourite button */}
          <motion.button
            onClick={handleFav}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,249,242,0.92)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(212,163,115,0.4)",
              boxShadow: "0 2px 10px rgba(139,69,19,0.12)",
            }}
            whileTap={{ scale: 0.82 }}
            animate={isFav ? { scale: [1, 1.32, 1] } : {}}
            transition={{ duration: 0.35 }}
          >
            <HeartIcon filled={isFav} />
          </motion.button>

          {/* Live order counter */}
          <div
            className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(139,69,19,0.88)",
              backdropFilter: "blur(4px)",
              color: "#fde8c8",
              fontFamily: "'Jost', sans-serif",
              letterSpacing: "0.01em",
            }}
          >
            <span style={{ fontSize: "0.8rem" }}>🔥</span>
            {displayOrdersCount.toLocaleString()}+ bought recently
          </div>
        </div>

        {/* ── Content Zone ── */}
        <div className="flex flex-col gap-1.5 p-4 pb-2">
          {/* Category pill */}
          {categoryName && (
            <span
              className="text-xs font-medium tracking-widest uppercase"
              style={{
                color: "#a0522d",
                fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: "0.12em",
              }}
            >
              {categoryName}
            </span>
          )}

          {/* Product name */}
          <h3
            className="text-base font-semibold leading-snug line-clamp-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#3d1f0a",
            }}
          >
            {product.name}
          </h3>

          {/* Stars — only if reviews exist */}
          {Array.isArray(product?.reviews) && product.reviews.length > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarIcon key={s} filled={s <= Math.round(avg)} />
                ))}
              </div>
              <span
                className="text-xs"
                style={{ color: "#a07a5a", fontFamily: "'Jost', sans-serif" }}
              >
                ({product.reviews.length})
              </span>
            </div>
          )}

          {/* Price row — derived from selected variant or first variant */}
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#8b4513",
              }}
            >
              ₹{price.toLocaleString()}
            </span>
            {mrp && mrp > price && (
              <span
                className="text-sm line-through"
                style={{ color: "#b8987a", fontFamily: "'Jost', sans-serif" }}
              >
                ₹{mrp.toLocaleString()}
              </span>
            )}
            {disc && (
              <span
                className="text-xs font-semibold"
                style={{ color: "#4a7c59" }}
              >
                {disc}% off
              </span>
            )}
          </div>
        </div>

        {/* ── Variant / Size Selector ── */}
        {hasVariants && product.variants!.length > 0 && (
          <div className="px-4 pb-2" onClick={(e) => e.stopPropagation()}>
            <p
              className="text-[10px] uppercase tracking-widest mb-1.5"
              style={{ color: "#a0522d", fontFamily: "'Jost', sans-serif" }}
            >
              Size
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.variants!.map((variant) => {
                const isSelected = selectedVariant?._id === variant._id;
                const isUnavailable = !variant.inStock || variant.stock === 0;

                return (
                  <motion.button
                    key={variant._id ?? variant.size}
                    onClick={(e) => !isUnavailable && handleVariantSelect(e, variant)}
                    whileTap={isUnavailable ? {} : { scale: 0.92 }}
                    className="relative px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      background: isSelected
                        ? "linear-gradient(135deg, #8b4513, #c8843a)"
                        : isUnavailable
                        ? "rgba(0,0,0,0.04)"
                        : "rgba(212,163,115,0.15)",
                      color: isSelected
                        ? "#fff"
                        : isUnavailable
                        ? "#c4a882"
                        : "#8b4513",
                      border: isSelected
                        ? "1.5px solid transparent"
                        : `1.5px solid ${isUnavailable ? "#e8d5c0" : "#d4a373"}`,
                      cursor: isUnavailable ? "not-allowed" : "pointer",
                      textDecoration: isUnavailable ? "line-through" : "none",
                      opacity: isUnavailable ? 0.6 : 1,
                      boxShadow: isSelected
                        ? "0 2px 8px rgba(139,69,19,0.3)"
                        : "none",
                    }}
                  >
                    {variant.size}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Add to Cart CTA / Quantity Selector ── */}
        <div className="px-4 pb-4 pt-2">
          <CartAction
            product={product}
            selectedSize={currentVariantSize}
            layout="wide"
            onAddToCartSuccess={() => onAddToCart && onAddToCart(product, selectedVariant)}
          />
        </div>

        {/* Premium gold border accent on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: "1.5px solid #d4a373" }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default ProductCard;