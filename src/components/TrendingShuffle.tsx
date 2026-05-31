import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { Product as ShopProduct } from "./Productcard";
import { productService } from "../utils/service";
import CartAction from "./CartAction";
import { useCart } from "../context/CartContext";

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
  variants?: any[];
}

type TrendingItem = TrendingProduct | ShopProduct;

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
  return (
    (product as ShopProduct).name !== undefined &&
    (product as ShopProduct).sizes !== undefined
  );
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
    variants: product.variants,
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

function ProductCard({
  product,
  index,
  onViewDetails,
  onAddToCart,
}: ProductCardProps) {
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

  const { cartItems } = useCart() as any;

  const productVariants = "variants" in product && Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : undefined;

  const hasMultipleSizes = productVariants && productVariants.length > 1;

  const defaultSize = hasMultipleSizes
    ? ""
    : (productVariants
        ? (productVariants.find((v: any) => v.inStock)?.size ?? productVariants[0].size)
        : "Standard");

  // Dynamic selection if a size variant of this product is already in the global cart
  const productIdStr = String("id" in product ? product.id : (product as any)._id);
  const activeInCartVariant = productVariants?.find((v: any) => {
    const sizeKey = (v.size || "Standard").toLowerCase();
    return !!cartItems?.[`${productIdStr}_${sizeKey}`];
  });

  const selectedSize = activeInCartVariant
    ? activeInCartVariant.size
    : defaultSize;

  const mockProductForCart = {
    _id: productIdStr,
    name: "title" in product ? product.title : (product as any).name,
    variants: productVariants || [{
      size: "Standard",
      price: product.price,
      inStock: true,
      stock: 99
    }]
  };

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

        {/* Synced Cart Action */}
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
                onAddToCart(toModalProduct(product));
              }
            }}
          />
        </div>

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
  products,
  onViewDetails,
  onAddToCart,
}: TrendingShuffleProps) {
  const [displayProducts, setDisplayProducts] = useState<TrendingItem[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedProducts, setFetchedProducts] = useState<TrendingItem[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  // ── Fetch live data from MongoDB via productService on mount ──
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      // If a products prop was explicitly passed, respect it and skip the fetch
      if (products && products.length > 0) {
        setFetchedProducts(products);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await productService.getAllProducts();

        if (!isMounted) return;

        // Handle both common API envelope shapes:
        // { data: { products: [...] } }  or  { data: { data: [...] } }
        const raw: unknown[] =
          response?.data?.products ??
          response?.data?.data ??
          [];

        // ── MongoDB key normalisation ──────────────────────────────────────
        //
        // MongoDB populate() can replace scalar fields with full subdocument
        // objects, e.g. category: { _id, name, image, ... } instead of "Malas".
        // Every field extraction below goes through typed helper functions that
        // safely unwrap either a plain primitive OR a populated object.

        /** Safely extract a plain string from a value that may be a string,
         *  a populated MongoDB subdocument { name, title, ... }, or undefined. */
        const extractString = (
          val: unknown,
          subKeys: string[] = ["name", "title", "label"]
        ): string | undefined => {
          if (typeof val === "string" && val.trim() !== "") return val.trim();
          if (val && typeof val === "object") {
            const obj = val as Record<string, unknown>;
            for (const key of subKeys) {
              if (typeof obj[key] === "string" && (obj[key] as string).trim() !== "") {
                return (obj[key] as string).trim();
              }
            }
          }
          return undefined;
        };

        /** Safely extract a number from a value that may be a number,
         *  a numeric string, or a populated subdocument with a numeric field. */
        const extractNumber = (
          val: unknown,
          subKeys: string[] = ["value", "amount", "price"]
        ): number | undefined => {
          if (typeof val === "number" && !isNaN(val)) return val;
          if (typeof val === "string") {
            const n = parseFloat(val);
            if (!isNaN(n)) return n;
          }
          if (val && typeof val === "object") {
            const obj = val as Record<string, unknown>;
            for (const key of subKeys) {
              if (typeof obj[key] === "number") return obj[key] as number;
            }
          }
          return undefined;
        };

        /** Safely extract an image URL string from a value that may be a plain
         *  string URL, an object with a `url`/`src`/`image` key, or undefined. */
        const extractImageUrl = (val: unknown): string | undefined => {
          if (typeof val === "string" && val.trim() !== "") return val.trim();
          if (val && typeof val === "object") {
            const obj = val as Record<string, unknown>;
            for (const key of ["url", "src", "image", "path"]) {
              if (typeof obj[key] === "string") return (obj[key] as string).trim();
            }
          }
          return undefined;
        };

        const PLACEHOLDER = "https://placehold.co/500x500/f5ede4/c8843a?text=🪬";

        const normalised: TrendingProduct[] = raw.map((item) => {
          const r = item as Record<string, unknown>;

          // ── Identity ──────────────────────────────────────────────────────
          const id =
            extractString(r._id, []) ||
            extractString(r.id, []) ||
            String(Math.random());

          // ── Title ─────────────────────────────────────────────────────────
          const displayTitle =
            extractString(r.name) ||
            extractString(r.title) ||
            "Unnamed Item";

          // ── Images ────────────────────────────────────────────────────────
          // r.images may be: string[], object[], or a single populated object
          const rawImages = Array.isArray(r.images) ? r.images : [];
          const allImages: string[] = rawImages
            .map((img) => extractImageUrl(img))
            .filter((url): url is string => !!url);

          // Single-image fallback: r.image field or placeholder
          if (allImages.length === 0) {
            const single = extractImageUrl(r.image) ?? PLACEHOLDER;
            allImages.push(single);
          }

          // ── Pricing ───────────────────────────────────────────────────────
          const variants = Array.isArray(r.variants)
            ? (r.variants as Record<string, unknown>[])
            : [];
          const v0 = variants[0] ?? {};

          const price: number =
            extractNumber(v0.price) ??
            extractNumber(r.price) ??
            0;

          const originalPrice: number =
            extractNumber(v0.mrp) ??
            extractNumber(r.originalPrice) ??
            extractNumber(r.mrp) ??
            price;

          const discountPct =
            originalPrice > price
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : 0;

          // ── Category ─────────────────────────────────────────────────────
          // Frequently a populated object: { _id, name, image, ... }
          const category =
            extractString(r.category, ["name", "title", "label"]) ??
            undefined;

          // ── Misc scalar fields ────────────────────────────────────────────
          const slug = extractString(r.slug, []) ?? undefined;
          const description = extractString(r.description, ["text", "body"]) ?? undefined;
          const isNew = typeof r.isNew === "boolean" ? r.isNew : false;
          const rating = extractNumber(r.rating, ["value", "average"]) ?? undefined;
          const ordersCount = extractNumber(r.ordersCount, ["count", "total"]) ?? undefined;

          const sizes = Array.isArray(r.sizes)
            ? (r.sizes as unknown[]).map((s) => extractString(s) ?? String(s)).filter(Boolean)
            : undefined;

          const reviews = Array.isArray(r.reviews)
            ? (r.reviews as unknown[]).map((rv) => {
                const o = (rv ?? {}) as Record<string, unknown>;
                return {
                  user: extractString(o.user, ["name", "username"]) ?? "Customer",
                  rating: extractNumber(o.rating) ?? 4,
                  comment: extractString(o.comment, ["text", "body"]) ?? "",
                };
              })
            : undefined;

          return {
            id,
            title: displayTitle,
            slug,
            images: allImages,
            price,
            originalPrice,
            discount: discountPct,
            isNew,
            category,
            rating,
            description,
            sizes,
            ordersCount,
            reviews,
            variants: Array.isArray(r.variants) && r.variants.length > 0 ? r.variants : undefined,
          };
        });

        setFetchedProducts(normalised);
      } catch (error) {
        if (!isMounted) return;
        console.error("[TrendingShuffle] Failed to fetch products:", error);
        // On error: render a clean empty state — no hardcoded fallback data
        setFetchedProducts([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-shuffle whenever fetchedProducts or shuffleKey changes ──
  useEffect(() => {
    if (fetchedProducts.length > 0) {
      setDisplayProducts(shuffleArray(fetchedProducts).slice(0, 8));
    } else {
      setDisplayProducts([]);
    }
  }, [fetchedProducts, shuffleKey]);

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

        {/* ── Loading Skeleton ── */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div
                  className="rounded-2xl animate-pulse"
                  style={{
                    aspectRatio: "1 / 1",
                    background:
                      "linear-gradient(90deg, #f5ede4 25%, #eddccc 50%, #f5ede4 75%)",
                    backgroundSize: "200% 100%",
                  }}
                />
                <div className="px-0.5 flex flex-col gap-2">
                  <div
                    className="h-2.5 w-16 rounded animate-pulse"
                    style={{ backgroundColor: "#e8d5c0" }}
                  />
                  <div
                    className="h-3.5 w-full rounded animate-pulse"
                    style={{ backgroundColor: "#e8d5c0" }}
                  />
                  <div
                    className="h-3 w-20 rounded animate-pulse"
                    style={{ backgroundColor: "#e8d5c0" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && displayProducts.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            style={{ color: "#c8843a", opacity: 0.6 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p
              className="text-sm"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              No products available at the moment.
            </p>
          </div>
        )}

        {/* ── Product Grid ── */}
        {!isLoading && displayProducts.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={shuffleKey}
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6"
            >
              {displayProducts.map((product, idx) => {
                const raw = product as Record<string, unknown>;
                const keyId = (raw._id as string) || (raw.id as string) || String(idx);
                return (
                  <ProductCard
                    key={`${keyId}-${shuffleKey}`}
                    product={product}
                    index={idx}
                    onViewDetails={onViewDetails}
                    onAddToCart={onAddToCart}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

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