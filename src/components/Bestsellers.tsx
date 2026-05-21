import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── Product Interface (mirrors src/utils/service.ts) ────────────────────────
export interface Product {
  id: string | number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;          // percentage integer, e.g. 40
  rating: number;            // 0–5 (supports decimals)
  reviewCount: number;
  slug?: string;
  isBestseller?: boolean;
}

// ─── Fallback / Demo Data ─────────────────────────────────────────────────────
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Rudraksha Mala 108 Beads – 5 Mukhi Certified",
    image:
      "https://images.unsplash.com/photo-1611516491426-03025e6043c8?w=600&q=80",
    price: 599,
    originalPrice: 999,
    discount: 40,
    rating: 4.8,
    reviewCount: 2424,
    isBestseller: true,
  },
  {
    id: 2,
    name: "Tulsi Mala 108 Beads – Pure Vrindavan Tulsi",
    image:
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80",
    price: 349,
    originalPrice: 649,
    discount: 46,
    rating: 4.7,
    reviewCount: 1863,
    isBestseller: true,
  },
  {
    id: 3,
    name: "Sphatik (Crystal Quartz) Mala – Energised",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    price: 799,
    originalPrice: 1499,
    discount: 47,
    rating: 4.9,
    reviewCount: 987,
    isBestseller: true,
  },
  {
    id: 4,
    name: "Chandan (Sandalwood) Mala 108 – Fragrant & Sacred",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    price: 449,
    originalPrice: 799,
    discount: 44,
    rating: 4.6,
    reviewCount: 1231,
    isBestseller: true,
  },
  {
    id: 5,
    name: "Haldi Mala – Auspicious Turmeric Beads for Puja",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    price: 279,
    originalPrice: 499,
    discount: 44,
    rating: 4.5,
    reviewCount: 754,
    isBestseller: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
interface StarRatingProps {
  rating: number;
  reviewCount: number;
}

function StarRating({ rating, reviewCount }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

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
        style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
        className="text-xs font-medium opacity-70"
      >
        ({reviewCount.toLocaleString("en-IN")})
      </span>
    </div>
  );
}

function StarIcon({ type }: { type: "full" | "half" | "empty" }) {
  const color = "#d4a373";
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
          <linearGradient id="half">
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="#e5d5c0" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half)"
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
      {/* Ribbon body */}
      <div
        style={{
          background: "linear-gradient(135deg, #a0522d 0%, #c8843a 100%)",
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
  product: Product;
  index: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.55,
      ease: "easeOut",
    },
  }),
};

function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -6,
        transition: { duration: 0.28, ease: "easeOut" },
      }}
      className="group flex flex-col cursor-pointer"
      style={{ willChange: "transform" }}
    >
      {/* ── Image Block ── */}
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

        {/* Discount badge */}
        {product.discount > 0 && <DiscountBadge discount={product.discount} />}

        {/* Hover overlay – "Add to Cart" pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 group-hover:opacity-100"
        >
          <button
            style={{
              background: "linear-gradient(90deg, #8b4513 0%, #c8843a 100%)",
              fontFamily: "'Jost', sans-serif",
              boxShadow: "0 4px 18px rgba(139,69,19,0.40)",
            }}
            className="text-white text-xs font-semibold tracking-wide uppercase px-5 py-2 rounded-full transition-transform active:scale-95"
          >
            Add to Cart
          </button>
        </motion.div>
      </div>

      {/* ── Metadata ── */}
      <div className="mt-3 px-0.5 flex flex-col gap-0.5">
        {/* Name */}
        <p
          style={{ fontFamily: "'Jost', sans-serif", color: "#3d1f0a" }}
          className="text-sm font-medium leading-snug line-clamp-2"
        >
          {product.name}
        </p>

        {/* Stars */}
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-1">
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#8b4513",
            }}
            className="text-base font-bold leading-none"
          >
            {formatINR(product.price)}
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#9e7a60",
            }}
            className="text-sm line-through leading-none italic"
          >
            {formatINR(product.originalPrice)}
          </span>
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
          background:
            "linear-gradient(90deg, transparent, #d4a373 60%, transparent)",
          opacity: 0.55,
        }}
      />
      <span style={{ color: "#d4a373", fontSize: "18px", lineHeight: 1 }}>
        ॐ
      </span>
      <div
        className="h-px flex-1 rounded"
        style={{
          background:
            "linear-gradient(90deg, transparent, #d4a373 60%, transparent)",
          opacity: 0.55,
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface BestsellersProps {
  products?: Product[];
  onViewAll?: () => void;
}

export default function Bestsellers({
  products = FALLBACK_PRODUCTS,
  onViewAll,
}: BestsellersProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const displayProducts = products.length ? products : FALLBACK_PRODUCTS;

  return (
    <section
      ref={sectionRef}
      style={{ backgroundColor: "#fff9f2" }}
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
          {/* Left: title block */}
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#c8843a",
                letterSpacing: "0.12em",
              }}
              className="text-xs uppercase italic tracking-widest mb-1 font-semibold"
            >
              Handpicked & Blessed
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#8b4513",
              }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight"
            >
              MalaWale Bestsellers
            </h2>
          </div>

          {/* Right: view all */}
          <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.96 }}
            onClick={onViewAll}
            style={{
              fontFamily: "'Jost', sans-serif",
              color: "#8b4513",
              borderColor: "#d4a373",
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

        {/* ── Products Grid ── */}
        {/*
          Layout strategy:
          - Mobile  (<640px): horizontal scroll (snap) showing ~2 cards
          - sm      (≥640px): 3 col grid
          - lg      (≥1024px): 4 col grid
          - xl      (≥1280px): 5 col grid
        */}
        <div
          className="
            flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3
            sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none
            lg:grid-cols-4
            xl:grid-cols-5
          "
          style={{ scrollbarWidth: "none" }}
        >
          {displayProducts.map((product, index) => (
            <div
              key={product.id}
              className="min-w-[calc(50%-8px)] snap-start sm:min-w-0"
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {/* ── Mobile "View All" ── */}
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
              background: "linear-gradient(90deg, #8b4513 0%, #c8843a 100%)",
              boxShadow: "0 4px 16px rgba(139,69,19,0.28)",
            }}
            className="text-white text-sm font-semibold tracking-wide px-8 py-2.5 rounded-full active:scale-95 transition-transform"
          >
            View All Bestsellers
          </button>
        </motion.div>
      </div>
    </section>
  );
}