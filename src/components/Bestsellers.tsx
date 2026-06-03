import { useRef, useEffect, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { productService } from "../utils/service";
import type { Product as ShopProduct } from "./Productcard";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import CartAction from "./CartAction";
// ─── Product Interface (mirrors MongoDB shape) ────────────────────────────────

export interface Product {
  _id?: string;
  id?: string | number;
  name: string;
  image?: string;
  images?: string[];
  variants?: Array<{
    price: number;
    mrp?: number;
  }>;
  price?: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  slug?: string;
  isBestseller?: boolean;
  badge?: string;
}

// ─── Normalised shape used internally ────────────────────────────────────────

interface NormalisedProduct {
  key: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  slug?: string;
  isBestseller?: boolean;
  variants?: any[];
}

// ─── Data Normaliser ──────────────────────────────────────────────────────────
// Cleanly maps the raw MongoDB document to a flat internal shape.
// Handles variant arrays, image configurations, and calculation cascades.

function normaliseProduct(raw: Product): NormalisedProduct {
  const key = raw._id ?? String(raw.id ?? raw.name);

  const image = raw.image || raw.images?.[0] || "https://placehold.co/600x400/f5ebe0/8b4513?text=🪬";

  // Nesting resolution cascade for variant layouts
  const price = raw.variants?.[0]?.price ?? raw.price ?? 0;
  const originalPrice = raw.variants?.[0]?.mrp ?? raw.originalPrice ?? price;

  // Real-time calculation of pricing cuts if fields are missing in MongoDB documents
  const discount = raw.discount ?? (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  return {
    key,
    name: raw.name ?? "Unnamed Product",
    image,
    price,
    originalPrice,
    discount,
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    slug: raw.slug,
    isBestseller: raw.isBestseller,
    variants: raw.variants,
  };
}

// ─── Safe Fetch Wrapper ───────────────────────────────────────────────────────
// Enforces dual envelope tracking and fallback catalogue filtering bypass guards.

async function safeFetchBestsellers(): Promise<NormalisedProduct[]> {
  try {
    const response: any = await productService.getBestsellers();

    if (!response || typeof response !== "object") return [];

    // Check both potential MongoDB payload envelopes securely
    const rawProductsList = Array.isArray(response.data?.products)
      ? response.data.products
      : Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];

    const validRaw = rawProductsList.filter(
      (p: any): p is Product =>
        p !== null && typeof p === "object" && typeof p.name === "string"
    );

    if (validRaw.length === 0) return [];

    // Filter to isolate catalog items with bestseller classifications
    let filteredList = validRaw.filter(
      (p) =>
        p.isBestseller === true ||
        p.badge?.toLowerCase().includes("bestseller")
    );

    // CRITICAL: Bypass flag filtering if dataset evaluates to 0 items to protect UI presentation layout
    if (filteredList.length === 0) {
      filteredList = validRaw.slice(0, 5);
    }

    return filteredList.map(normaliseProduct);
  } catch (error) {
    console.error("Defensive collection handling caught unhandled integration error flags:", error);
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col animate-pulse">
      <div
        className="rounded-2xl aspect-square"
        style={{
          background: "linear-gradient(135deg, #f0e0cc 0%, #e8d5bb 50%, #f0e0cc 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.6s ease-in-out infinite"
        }}
      />
      <div className="mt-3 px-0.5 flex flex-col gap-2">
        <div className="h-3 rounded-full" style={{ background: "#e8d5bb", width: "90%" }} />
        <div className="h-3 rounded-full" style={{ background: "#e8d5bb", width: "65%" }} />
        <div className="h-2.5 rounded-full mt-0.5" style={{ background: "#e8d5bb", width: "50%" }} />
        <div className="h-4 rounded-full mt-0.5" style={{ background: "#e8d5bb", width: "40%" }} />
      </div>
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

interface StarRatingProps {
  rating: number;
  reviewCount: number;
}

function StarRating({ rating, reviewCount }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarIcon key={`f-${i}`} type="full" />
        ))}
        {hasHalf && <StarIcon type="half" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <StarIcon key={`e-${i}`} type="empty" />
        ))}
      </div>
      <span
        style={{ fontFamily: "'Jost', sans-serif", color: "#9B1B1B" }}
        className="text-xs font-medium opacity-70"
      >
        ({reviewCount.toLocaleString("en-IN")})
      </span>
    </div>
  );
}

function StarIcon({ type }: { type: "full" | "half" | "empty" }) {
  const color = "#D4AF37";
  if (type === "full")
    return (
      <svg width="13" height="13" viewBox="0 0 20 20" fill={color}>
        <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78z" />
      </svg>
    );
  if (type === "half")
    return (
      <svg width="13" height="13" viewBox="0 0 20 20">
        <defs>
          <linearGradient id="half-star-grad">
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="#e5d5c0" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half-star-grad)"
          d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78z"
        />
      </svg>
    );
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="#e5d5c0">
      <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78z" />
    </svg>
  );
}

// ─── Discount Badge ───────────────────────────────────────────────────────────

function DiscountBadge({ discount }: { discount: number }) {
  return (
    <div
      className="absolute top-0 left-0 z-10 flex flex-col items-start"
      style={{ pointerEvents: "none" }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #D84315 0%, #E65100 100%)",
          fontFamily: "'Jost', sans-serif",
          borderRadius: "0 0 8px 0",
          boxShadow: "2px 2px 8px rgba(160,82,45,0.35)",
          letterSpacing: "0.02em",
        }}
        className="px-2.5 py-1 text-white font-bold text-[11px] leading-tight tracking-wide uppercase"
      >
        {discount}% OFF
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: NormalisedProduct;
  index: number;
  onViewDetails?: (product: ShopProduct) => void;
  onAddToCart?: (product: ShopProduct) => void;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.55,
      ease: "easeOut" as const,
    },
  }),
};

function ProductCard({
  product,
  index,
  onViewDetails,
  onAddToCart
}: ProductCardProps) {

  const handleCardClick = () => {

    if (!onViewDetails) return;

    onViewDetails({
      id: product.key,
      name: product.name,
      category: "Bestseller",
      price: product.price,
      originalPrice: product.originalPrice,
      images: [product.image],
      description: product.name,
      sizes: ["Standard"],
      ordersCount: 100,
      reviews: [],
      variants: product.variants,
    });

  };

  const { cartItems } = useCart() as any;

  const hasMultipleSizes = product.variants && product.variants.length > 1;

  const defaultSize = hasMultipleSizes
    ? ""
    : (product.variants && product.variants.length > 0
        ? (product.variants.find((v: any) => v.inStock)?.size ?? product.variants[0].size)
        : "Standard");

  // Dynamic selection if a size variant of this product is already in the global cart
  const activeInCartVariant = product.variants?.find((v: any) => {
    const sizeKey = (v.size || "Standard").toLowerCase();
    return !!cartItems?.[`${product.key}_${sizeKey}`];
  });

  const selectedSize = activeInCartVariant
    ? activeInCartVariant.size
    : defaultSize;

  const mockProductForCart = {
    _id: product.key,
    name: product.name,
    variants: product.variants && product.variants.length > 0
      ? product.variants
      : [{
          size: "Standard",
          price: product.price,
          inStock: true,
          stock: 99
        }]
  };

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={handleCardClick}
      whileHover={{
        y: -6,
        transition: { duration: 0.28, ease: "easeOut" },
      }}
      className="group flex flex-col cursor-pointer"
      style={{ willChange: "transform" }}
    >
      <div className="relative overflow-hidden rounded-2xl aspect-square bg-[#f5ebe0]">

        <motion.img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ transformOrigin: "center" }}
        />

        {product.discount > 0 && (
          <DiscountBadge discount={product.discount} />
        )}

        <div 
          className="absolute inset-x-0 bottom-3 flex justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            // Keep quantity selector always visible when item is in cart so user has visual state feedback
            // Wait, we can make it always visible if item is in cart! That is extremely good UX. Let's do that!
          }}
        >
          {/* We will render CartAction here. It handles showing compact selector beautifully! */}
        </div>

        {/* Let's render the CartAction as a floating container.
            We want it to be persistently visible if in cart, or hover-revealed if not in cart.
            Let's pass the layout="compact" which already has custom styling! */}
        <div
          className="absolute inset-x-0 bottom-3 flex justify-center z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <CartAction
            product={mockProductForCart}
            selectedSize={selectedSize}
            layout="compact"
            onAddToCartSuccess={() => {
              if (onAddToCart) {
                onAddToCart({
                  id: product.key,
                  name: product.name,
                  category: "Bestseller",
                  price: product.price,
                  originalPrice: product.originalPrice,
                  images: [product.image],
                  description: product.name,
                  sizes: ["Standard"],
                  ordersCount: 100,
                  reviews: []
                });
              }
            }}
          />
        </div>

      </div>

      <div className="mt-3 px-0.5 flex flex-col gap-0.5">

        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            color: "#3d1f0a"
          }}
          className="text-sm font-medium leading-snug line-clamp-2"
        >
          {product.name}
        </p>

        <StarRating
          rating={product.rating}
          reviewCount={product.reviewCount}
        />

        <div className="flex items-baseline gap-2 mt-1">

          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#9B1B1B"
            }}
            className="text-base font-bold leading-none"
          >
            {formatINR(product.price)}
          </span>

          {product.originalPrice > product.price && (
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#9e7a60"
              }}
              className="text-sm line-through leading-none italic"
            >
              {formatINR(product.originalPrice)}
            </span>
          )}

        </div>

      </div>

    </motion.article>
  );
}

// ─── Decorative Divider ───────────────────────────────────────────────────────

function OmDivider() {
  return (
    <div className="flex items-center gap-3 mt-1 mb-6">
      <div
        className="h-px flex-1 rounded"
        style={{
          background: "linear-gradient(90deg, transparent, #D4AF37 60%, transparent)",
          opacity: 0.55,
        }}
      />
      <span style={{ color: "#D4AF37", fontSize: "18px", lineHeight: 1 }}>ॐ</span>
      <div
        className="h-px flex-1 rounded"
        style={{
          background: "linear-gradient(90deg, transparent, #D4AF37 60%, transparent)",
          opacity: 0.55,
        }}
      />
    </div>
  );
}

// ─── Grid Wrapper (shared by skeleton + live) ─────────────────────────────────

function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3
        sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none
        lg:grid-cols-4
        xl:grid-cols-5
      "
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface BestsellersProps {
  onViewAll?: () => void;
  onViewDetails?: (product: ShopProduct) => void;
  onAddToCart?: (product: ShopProduct) => void;
}

export default function Bestsellers({
  onViewAll,
  onViewDetails,
  onAddToCart
}: BestsellersProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const [bestsellers, setBestsellers] = useState<NormalisedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const results = await safeFetchBestsellers();
      if (cancelled) return;
      setBestsellers(results);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <section
        ref={sectionRef}
        style={{ backgroundColor: "#FCF8F2" }}
        className="w-full py-12 px-4 sm:px-6 lg:px-10 xl:px-16"
        aria-label="MalaWale Bestsellers"
      >
        <div className="max-w-screen-xl mx-auto">

          {/* ── Section Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex items-end justify-between mb-2"
          >
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#E65100",
                  letterSpacing: "0.12em",
                }}
                className="text-xs uppercase italic tracking-widest mb-1 font-semibold"
              >
                Handpicked & Blessed
              </span>
              <h2
                style={{ fontFamily: "'Playfair Display', serif", color: "#9B1B1B" }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight"
              >
                MalaWale Bestsellers
              </h2>
            </div>

            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.96 }}
              onClick={onViewAll}
              style={{
                fontFamily: "'Jost', sans-serif",
                color: "#9B1B1B",
                borderColor: "#D4AF37",
              }}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold border-b-2 pb-0.5 hover:opacity-80 transition-opacity"
            >
              View all
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Decorative Om divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <OmDivider />
          </motion.div>

          {/* ── Products Grid — skeleton while loading, live/empty state after ── */}
          {loading ? (
            <ProductGrid>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="min-w-[calc(50%-8px)] snap-start sm:min-w-0">
                  <SkeletonCard />
                </div>
              ))}
            </ProductGrid>
          ) : bestsellers.length > 0 ? (
            <ProductGrid>
              {bestsellers.map((product, index) => (
                <div
                  key={product.key}
                  className="min-w-[calc(50%-8px)] snap-start sm:min-w-0"
                >
<ProductCard
  product={product}
  index={index}
  onViewDetails={onViewDetails}
  onAddToCart={onAddToCart}
/>                </div>
              ))}
            </ProductGrid>
          ) : (
            <div className="w-full text-center py-12">
              <p
                style={{ fontFamily: "'Jost', sans-serif", color: "#9B1B1B" }}
                className="text-sm font-medium opacity-60 italic"
              >
                No sacred products available in this selection at the moment.
              </p>
            </div>
          )}

          {/* ── Mobile "View All" ── */}
          {bestsellers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex justify-center mt-7 sm:hidden"
            >
              <button
                onClick={onViewAll}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background: "linear-gradient(90deg, #9B1B1B 0%, #E65100 100%)",
                  boxShadow: "0 4px 16px rgba(155, 27, 27,0.28)",
                }}
                className="text-white text-sm font-semibold tracking-wide px-8 py-2.5 rounded-full active:scale-95 transition-transform"
              >
                View All Bestsellers
              </button>
            </motion.div>
          )}

        </div>
      </section>
    </>
  );
}