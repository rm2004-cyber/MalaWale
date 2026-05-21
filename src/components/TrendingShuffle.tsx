import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { Product as ShopProduct } from "./Productcard";

// ─── Trending item type ───────────────────────────────────────────────────────
interface TrendingProduct {
  id: string | number;
  title: string;
  slug?: string;
  images: string[];
  price: number;
  originalPrice: number;
  discount?: number;
  isNew?: boolean;
  category?: string;
  rating?: number;
  description?: string;
  sizes?: string[];
  ordersCount?: number;
  reviews?: { user: string; rating: number; comment: string }[];
}

type TrendingItem = TrendingProduct | ShopProduct;

const STATIC_PRODUCTS: TrendingProduct[] = [
  {
    id: 1,
    title: "Rudraksha Mala 108 Beads",
    images: [
      "https://picsum.photos/seed/rudraksha1/500/500",
      "https://picsum.photos/seed/rudraksha2/500/500",
    ],
    price: 799,
    originalPrice: 1299,
    discount: 38,
    isNew: true,
    category: "Malas",
  },
  {
    id: 2,
    title: "Crystal Quartz Bracelet",
    images: [
      "https://picsum.photos/seed/crystal1/500/500",
      "https://picsum.photos/seed/crystal2/500/500",
    ],
    price: 549,
    originalPrice: 899,
    discount: 39,
    isNew: false,
    category: "Bracelets",
  },
  {
    id: 3,
    title: "Sandalwood Prayer Mala",
    images: [
      "https://picsum.photos/seed/sandal1/500/500",
      "https://picsum.photos/seed/sandal2/500/500",
    ],
    price: 1099,
    originalPrice: 1799,
    discount: 39,
    isNew: true,
    category: "Malas",
  },
  {
    id: 4,
    title: "Tulsi Mala Sacred Beads",
    images: [
      "https://picsum.photos/seed/tulsi1/500/500",
      "https://picsum.photos/seed/tulsi2/500/500",
    ],
    price: 349,
    originalPrice: 599,
    discount: 42,
    isNew: false,
    category: "Malas",
  },
  {
    id: 5,
    title: "Amethyst Healing Mala",
    images: [
      "https://picsum.photos/seed/amethyst1/500/500",
      "https://picsum.photos/seed/amethyst2/500/500",
    ],
    price: 1499,
    originalPrice: 2399,
    discount: 37,
    isNew: true,
    category: "Healing",
  },
  {
    id: 6,
    title: "Sphatik Rosary Crystal",
    images: [
      "https://picsum.photos/seed/sphatik1/500/500",
      "https://picsum.photos/seed/sphatik2/500/500",
    ],
    price: 899,
    originalPrice: 1499,
    discount: 40,
    isNew: false,
    category: "Crystal",
  },
  {
    id: 7,
    title: "Panchmukhi Rudraksha",
    images: [
      "https://picsum.photos/seed/panch1/500/500",
      "https://picsum.photos/seed/panch2/500/500",
    ],
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    isNew: true,
    category: "Rudraksha",
  },
  {
    id: 8,
    title: "Lapis Lazuli Mala 108",
    images: [
      "https://picsum.photos/seed/lapis1/500/500",
      "https://picsum.photos/seed/lapis2/500/500",
    ],
    price: 1299,
    originalPrice: 2099,
    discount: 38,
    isNew: false,
    category: "Crystal",
  },
];

// ─── Shuffle Utility ──────────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const defaultReviews = [
  { user: "Customer", rating: 4, comment: "Loved this product!" },
];

function isShopProduct(product: TrendingItem): product is ShopProduct {
  return (product as ShopProduct).name !== undefined && (product as ShopProduct).sizes !== undefined;
}

function toModalProduct(product: TrendingItem): ShopProduct {
  if (isShopProduct(product)) {
    return product;
  }

  return {
    id: String(product.id),
    name: product.title,
    category: product.category ?? "Trending",
    price: product.price,
    originalPrice: product.originalPrice,
    images: product.images,
    description:
      product.description ??
      `A beautifully handpicked item from our trending spiritual collection.`,
    sizes: product.sizes ?? ["Standard"],
    ordersCount: product.ordersCount ?? 120,
    reviews: product.reviews ?? defaultReviews,
  };
}

// ─── Component Props ──────────────────────────────────────────────────────────
interface TrendingShuffleProps {
  products?: TrendingItem[];
  onViewDetails?: (product: ShopProduct) => void;
  onAddToCart?: (product: ShopProduct) => void;
}

// ─── Product Card ─────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: TrendingItem;
  index: number;
  onViewDetails?: (product: ShopProduct) => void;
  onAddToCart?: (product: ShopProduct) => void;
}

function ProductCard({ product, index, onViewDetails, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(product.images[0]);
  const [imgLoaded, setImgLoaded] = useState(false);

  const displayTitle = "title" in product ? product.title : product.name;
  const displayPrice = product.price;
  const displayOriginalPrice = product.originalPrice ?? product.price;
  const hasOriginalPrice = displayOriginalPrice > displayPrice;
  const discountPct =
    "discount" in product && product.discount !== undefined
      ? product.discount
      : hasOriginalPrice
      ? Math.round(
          ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100
        )
      : 0;
  const isNewFlag = "isNew" in product && product.isNew;

  const handleCardClick = () => {
    if (!onViewDetails) return;
    onViewDetails(toModalProduct(product));
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCart) return;
    onAddToCart(toModalProduct(product));
  };

  // Swap image source on hover/unhover
  useEffect(() => {
    if (isHovered && product.images.length > 1) {
      setCurrentSrc(product.images[1]);
    } else {
      setCurrentSrc(product.images[0]);
    }
  }, [isHovered, product.images]);

  const cardVariants = {
    hidden: { opacity: 0, y: 36 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        delay: index * 0.09,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="group flex flex-col gap-3 cursor-pointer"
    >
      {/* ── Image Frame ── */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-md"
        style={{ aspectRatio: "1 / 1", backgroundColor: "#f5ede4" }}
      >
        {/* Skeleton shimmer shown until image loads */}
        {!imgLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                "linear-gradient(90deg, #f5ede4 25%, #eddccc 50%, #f5ede4 75%)",
              backgroundSize: "200% 100%",
            }}
          />
        )}

        {/* Single <img> — crossfade via AnimatePresence keyed on src */}
        <AnimatePresence mode="sync">
          <motion.img
            key={currentSrc}
            src={currentSrc}
            alt={displayTitle}
            onLoad={() => setImgLoaded(true)}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: imgLoaded ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.38, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            // Prevent broken-image icon from ever appearing
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                `https://placehold.co/500x500/f5ede4/c8843a?text=${encodeURIComponent(displayTitle)}`;
            }}
          />
        </AnimatePresence>

        {/* Hover overlay tint */}
        <motion.div
          animate={{ opacity: isHovered ? 0.15 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: "#8b4513" }}
        />

        {/* ── Badge Stack top-left ── */}
        <div className="absolute top-3 left-3 flex flex-col gap-[5px] z-10">
          {discountPct > 0 && (
            <span
              className="text-white text-[10px] font-bold px-2 py-[3px] rounded-sm leading-tight tracking-wide"
              style={{
                fontFamily: "'Jost', sans-serif",
                background:
                  "linear-gradient(135deg, #c0392b 0%, #a0522d 100%)",
                boxShadow: "0 1px 4px rgba(160,82,45,0.45)",
              }}
            >
              {discountPct >= 40
                ? `Up to ${discountPct}% off`
                : `${discountPct}% off`}
            </span>
          )}

          {isNewFlag && (
            <span
              className="text-[10px] font-semibold px-2 py-[3px] rounded-sm leading-tight tracking-wide"
              style={{
                fontFamily: "'Jost', sans-serif",
                backgroundColor: "#fef08a",
                color: "#1a0a00",
                boxShadow: "0 1px 3px rgba(250,204,21,0.5)",
              }}
            >
              New arrival
            </span>
          )}
        </div>

        {/* ── Cart Icon bottom-right on hover ── */}
        <motion.button
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
            scale: isHovered ? 1 : 0.85,
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          aria-label="Add to cart"
          className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #8b4513 0%, #c8843a 100%)",
            boxShadow: "0 3px 12px rgba(139,69,19,0.55)",
          }}
          onClick={handleCartClick}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </motion.button>

        {/* Hover ring border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
          style={{
            boxShadow: isHovered
              ? "inset 0 0 0 2px rgba(200,132,58,0.45)"
              : "none",
          }}
        />
      </div>

      {/* ── Metadata ── */}
      <div className="px-0.5 flex flex-col gap-1">
        {product.category && (
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "rgba(200,132,58,0.8)",
            }}
          >
            {product.category}
          </span>
        )}

        <motion.p
          animate={{ color: isHovered ? "#8b4513" : "#3d1c08" }}
          transition={{ duration: 0.2 }}
          className="text-sm font-semibold leading-snug line-clamp-2"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {displayTitle}
        </motion.p>

        <div className="flex items-baseline gap-2 mt-0.5">
          <span
            className="text-base font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#8b4513",
            }}
          >
            ₹{product.price.toLocaleString("en-IN")}.00
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span
              className="text-xs text-gray-400 line-through"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              ₹{product.originalPrice.toLocaleString("en-IN")}.00
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main TrendingShuffle Component ──────────────────────────────────────────
export default function TrendingShuffle({
  products = STATIC_PRODUCTS,
  onViewDetails,
  onAddToCart,
}: TrendingShuffleProps) {
  const [displayProducts, setDisplayProducts] = useState<TrendingItem[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  useEffect(() => {
    setDisplayProducts(shuffleArray(products).slice(0, 8));
  }, [products, shuffleKey]);

  const handleReshuffle = () => setShuffleKey((k) => k + 1);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  return (
    <section
      ref={sectionRef}
      className="w-full py-12 px-4 md:px-8"
      style={{ backgroundColor: "#fff9f2" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Section Header ── */}
        <div
          className="flex items-end justify-between mb-8 pb-5"
          style={{ borderBottom: "1px solid #e8d5c0" }}
        >
          <div>
            <span
              className="block text-[11px] uppercase mb-1.5"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                letterSpacing: "0.2em",
                color: "#c8843a",
              }}
            >
              Handcrafted • Spiritual • Sacred
            </span>

            <h2
              className="text-3xl md:text-4xl font-bold leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#3d1c08",
              }}
            >
              Latest &amp;{" "}
              <span className="relative inline-block" style={{ color: "#8b4513" }}>
                Trending
                <svg
                  className="absolute left-0 w-full"
                  style={{ bottom: "-6px" }}
                  viewBox="0 0 120 8"
                  preserveAspectRatio="none"
                  height="8"
                >
                  <path
                    d="M2 6 Q30 2 60 5 Q90 8 118 4"
                    stroke="#c8843a"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleReshuffle}
            className="hidden sm:flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-300"
            style={{
              fontFamily: "'Jost', sans-serif",
              border: "1px solid #c8843a",
              color: "#8b4513",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#8b4513";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#8b4513";
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
            </svg>
            Explore More
          </motion.button>
        </div>

        {/* ── Product Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={shuffleKey}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6"
          >
            {displayProducts.map((product, idx) => (
              <ProductCard
                key={`${product.id}-${shuffleKey}`}
                product={product}
                index={idx}
                onViewDetails={onViewDetails}
                onAddToCart={onAddToCart}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Mobile Explore Button ── */}
        <div className="flex justify-center mt-10 sm:hidden">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleReshuffle}
            className="flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-full"
            style={{
              fontFamily: "'Jost', sans-serif",
              border: "1px solid #c8843a",
              color: "#8b4513",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
            </svg>
            Explore More
          </motion.button>
        </div>

        {/* ── Bottom ornament ── */}
        <div className="flex items-center justify-center mt-10 gap-3" style={{ opacity: 0.4 }}>
          <div
            className="h-px flex-1"
            style={{
              background: "linear-gradient(to right, transparent, #c8843a)",
            }}
          />
          <svg viewBox="0 0 24 24" fill="#c8843a" className="w-4 h-4">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          <div
            className="h-px flex-1"
            style={{
              background: "linear-gradient(to left, transparent, #c8843a)",
            }}
          />
        </div>

      </div>
    </section>
  );
}