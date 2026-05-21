import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Review {
  user: string;
  rating: number; // 1–5
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  sizes: string[];
  ordersCount: number;
  reviews: Review[];
}

export interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const products: Product[] = [
  {
    id: '101',
    name: 'Natural 5 Mukhi Rudraksh Mala',
    category: 'rudraksh',
    price: 1100,
    originalPrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80',
    ],
    description: 'Directly sourced raw materials, handcrafted by Sanwariya artisans.',
    sizes: ['Standard'],
    ordersCount: 450,
    reviews: [{ user: 'Anu', rating: 5, comment: 'Beautiful craftsmanship.' }],
  },
  {
    id: '102',
    name: 'Premium Sandalwood Bracelet',
    category: 'bracelets',
    price: 450,
    originalPrice: 599,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=80',
    ],
    description: 'Fragrant and pure natural sandalwood beads.',
    sizes: ['Small', 'Medium'],
    ordersCount: 180,
    reviews: [{ user: 'Ravi', rating: 4, comment: 'Excellent quality.' }],
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

const averageRating = (reviews: Review[]): number => {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
};

const discount = (price: number, original?: number): number | null => {
  if (!original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
};

// ─── ProductCard ───────────────────────────────────────────────────────────────

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
}) => {
  const [isFav, setIsFav] = useState(false);
  const [cartState, setCartState] = useState<"idle" | "added">("idle");
  const [isHovered, setIsHovered] = useState(false);

  const avg = averageRating(product.reviews);
  const disc = discount(product.price, product.originalPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartState === "added") return;
    onAddToCart(product);
    setCartState("added");
    setTimeout(() => setCartState("idle"), 2200);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFav((v) => !v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onViewDetails(product)}
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
            src={product.images[0]}
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
          {product.ordersCount > 0 && (
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
              {product.ordersCount.toLocaleString()}+ bought recently
            </div>
          )}
        </div>

        {/* ── Content Zone ── */}
        <div className="flex flex-col gap-1.5 p-4 pb-3">
          {/* Category pill */}
          <span
            className="text-xs font-medium tracking-widest uppercase"
            style={{
              color: "#a0522d",
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: "0.12em",
            }}
          >
            {product.category}
          </span>

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

          {/* Stars */}
          {product.reviews.length > 0 && (
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

          {/* Price row */}
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#8b4513",
              }}
            >
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span
                className="text-sm line-through"
                style={{ color: "#b8987a", fontFamily: "'Jost', sans-serif" }}
              >
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* ── Add to Cart CTA ── */}
        <div className="px-4 pb-4">
          <motion.button
            onClick={handleAddToCart}
            className="relative w-full h-11 rounded-xl overflow-hidden flex items-center justify-center gap-2 text-sm font-semibold tracking-wide select-none"
            style={{
              fontFamily: "'Jost', sans-serif",
              letterSpacing: "0.04em",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background:
                  cartState === "added"
                    ? "linear-gradient(135deg, #4a7c59, #2d5a3d)"
                    : "linear-gradient(135deg, #8b4513, #c8843a)",
              }}
              transition={{ duration: 0.4 }}
            />
            {/* Shimmer overlay */}
            <AnimatePresence>
              {isHovered && cartState === "idle" && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                  }}
                  initial={{ backgroundPosition: "200% 0" }}
                  animate={{ backgroundPosition: "-200% 0" }}
                  transition={{ duration: 0.9, ease: "linear" }}
                />
              )}
            </AnimatePresence>

            <motion.span
              className="relative z-10 flex items-center gap-2 text-white"
              key={cartState}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <AnimatePresence mode="wait">
                {cartState === "added" ? (
                  <motion.span
                    key="check"
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CheckIcon /> Added to Cart
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CartIcon /> Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          </motion.button>
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