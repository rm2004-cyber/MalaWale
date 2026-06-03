import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import { categoryService } from "../utils/service";

// ─── Interface ────────────────────────────────────────────────────────────────
export interface CollectionItem {
  id: string | number;
  name: string;
  image: string;
  slug?: string;
}

// ─── Fallback Mock Data ───────────────────────────────────────────────────────
const FALLBACK_COLLECTIONS: CollectionItem[] = [
  { id: 1, name: "Rudraksha Malas", image: "https://images.unsplash.com/photo-1611516491426-03025e6043c8?w=400&q=80", slug: "rudraksha-malas" },
  { id: 2, name: "Tulsi Malas", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80", slug: "tulsi-malas" },
  { id: 3, name: "Sphatik Malas", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80", slug: "sphatik-malas" },
  { id: 4, name: "Chandan Malas", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", slug: "chandan-malas" },
  { id: 5, name: "Navratna Malas", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", slug: "navratna-malas" },
  { id: 6, name: "Puja Samagri", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80", slug: "puja-samagri" },
  { id: 7, name: "Haldi Malas", image: "https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=400&q=80", slug: "haldi-malas" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {direction === "right" ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
    </svg>
  );
}

function NavButton({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: () => void; disabled: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.08 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      aria-label={direction === "right" ? "Next" : "Previous"}
      style={{
        background: disabled ? "rgba(212, 175, 55,0.15)" : "linear-gradient(135deg, #9B1B1B 0%, #E65100 100%)",
        border: `2px solid ${disabled ? "#e8d5be" : "#D4AF37"}`,
        color: disabled ? "#c9a882" : "#fff",
        boxShadow: disabled ? "none" : "0 4px 18px rgba(155, 27, 27,0.28)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
      }}
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
    >
      <ChevronIcon direction={direction} />
    </motion.button>
  );
}

// ─── Image Fallback ───────────────────────────────────────────────────────────
function ImageFallback() {
  return (
    <div style={{
      width: "100%", height: "100%", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #fdf0e0 0%, #f5ddb8 100%)",
    }}>
      <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="52%" height="52%">
        <defs>
          <radialGradient id="fbBeadGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fde8cc" />
            <stop offset="100%" stopColor="#9a5a28" />
          </radialGradient>
          <radialGradient id="fbCenterBead" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffe5b4" />
            <stop offset="100%" stopColor="#7a3810" />
          </radialGradient>
        </defs>
        <circle cx="28" cy="28" r="22" fill="none" stroke="#c4956a" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
          return <circle key={i} cx={28 + 20 * Math.cos(angle)} cy={28 + 20 * Math.sin(angle)}
            r="3.5" fill="url(#fbBeadGrad)" stroke="#9a5a28" strokeWidth="0.5" />;
        })}
        <circle cx="28" cy="28" r="8" fill="url(#fbCenterBead)" stroke="#7a3810" strokeWidth="1" />
        <text x="28" y="32" textAnchor="middle" fontSize="9" fill="#fde8cc" fontFamily="serif">ॐ</text>
      </svg>
    </div>
  );
}

// ─── Circle Item ──────────────────────────────────────────────────────────────
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

function CircleItem({
  item, index, isInView, onClick, isDragActiveRef,
}: {
  item: CollectionItem;
  index: number;
  isInView: boolean;
  onClick?: (item: CollectionItem) => void;
  isDragActiveRef: React.MutableRefObject<boolean>;
}) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    // Only fire if user was not drag-scrolling
    if (!isDragActiveRef.current) {
      onClick?.(item);
    }
  };

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer"
      onClick={handleClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ userSelect: "none", WebkitTapHighlightColor: "transparent" }}
    >
      {/* Circle frame */}
      <div className="relative">
        {/* Animated gold ring */}
        <motion.div
          animate={{ scale: hovered ? 1.06 : 1, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "absolute", inset: "-4px", borderRadius: "9999px",
            background: "linear-gradient(135deg, #D4AF37 0%, #E65100 50%, #D4AF37 100%)",
            zIndex: 0,
          }}
        />
        {/* Static subtle ring */}
        <div style={{
          position: "absolute", inset: "-2px", borderRadius: "9999px",
          background: "linear-gradient(135deg, #edd9b8 0%, #D4AF37 100%)",
          opacity: 0.6, zIndex: 0,
        }} />

        {/* Image circle — fixed square container so image never gets cut oddly */}
        <div
          className="relative z-10 overflow-hidden rounded-full w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44"
          style={{
            background: "#f5ebe0",
            boxShadow: hovered
              ? "0 12px 36px rgba(155, 27, 27,0.30), 0 4px 12px rgba(200,132,58,0.20)"
              : "0 4px 16px rgba(155, 27, 27,0.14), 0 1px 4px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          {item.image && !imgError ? (
            <motion.img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="w-full h-full"
              style={{
                objectFit: "cover",        // fills circle without distortion
                objectPosition: "center",  // always centered
                display: "block",
              }}
              animate={{ scale: hovered ? 1.1 : 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <ImageFallback />
          )}

          {/* Vignette overlay */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(61,31,10,0.22) 100%)",
          }} />

          {/* Shimmer on hover */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
            }}
          />
        </div>
      </div>

      {/* Label */}
      <motion.span
        animate={{ color: hovered ? "#9B1B1B" : "#3d1f0a", y: hovered ? -2 : 0 }}
        transition={{ duration: 0.22 }}
        style={{
          fontFamily: "'Jost', sans-serif",
          fontWeight: 600,
          fontSize: "clamp(11px, 1.5vw, 14px)",
          letterSpacing: "0.02em",
          textAlign: "center",
          maxWidth: "9rem",
          lineHeight: 1.3,
        }}
      >
        {item.name}
      </motion.span>
    </motion.div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function OmDivider() {
  return (
    <div className="flex items-center gap-3 mt-1 mb-8">
      <div className="h-px flex-1 rounded"
        style={{ background: "linear-gradient(90deg, transparent, #D4AF37 60%, transparent)", opacity: 0.5 }} />
      <span style={{ color: "#D4AF37", fontSize: "18px", lineHeight: 1 }}>ॐ</span>
      <div className="h-px flex-1 rounded"
        style={{ background: "linear-gradient(90deg, transparent, #D4AF37 60%, transparent)", opacity: 0.5 }} />
    </div>
  );
}

// ─── Normalise category from backend ─────────────────────────────────────────
function normalizeCategory(cat: any): CollectionItem {
  return {
    id: cat._id || cat.id,
    name: cat.name || "Sacred Collection",
    image: cat.image || cat.imageUrl || cat.thumbnail || cat.coverImage || "",
    slug: cat.slug || cat.handle || "",
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface CollectionCirclesProps {
  collections?: CollectionItem[];
  /**
   * Called with the full CollectionItem so the parent can decide how to filter.
   * Pass both id and name so App.tsx can use whichever matches its filter logic.
   */
  onItemClick?: (item: CollectionItem) => void;
  onViewAll?: () => void;
}

const SCROLL_AMOUNT = 320;

export default function CollectionCircles({ collections, onItemClick, onViewAll }: CollectionCirclesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [liveCollections, setLiveCollections] = useState<CollectionItem[]>(
    collections ?? FALLBACK_COLLECTIONS
  );

  useEffect(() => {
    if (collections && collections.length > 0) { setLiveCollections(collections); return; }
    let cancelled = false;
    const fetch_ = async () => {
      try {
        const res = await categoryService.getCategories();
        const raw: any[] = res?.data?.categories ?? [];
        if (cancelled) return;
        setLiveCollections(raw.length > 0 ? raw.map(normalizeCategory) : FALLBACK_COLLECTIONS);
      } catch {
        if (!cancelled) setLiveCollections(FALLBACK_COLLECTIONS);
      }
    };
    fetch_();
    return () => { cancelled = true; };
  }, [collections]);

  const syncScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncScroll();
    el.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", syncScroll);
    return () => { el.removeEventListener("scroll", syncScroll); window.removeEventListener("resize", syncScroll); };
  }, [syncScroll, liveCollections]);

  const scrollBy = useCallback((dir: "left" | "right") => {
    trackRef.current?.scrollBy({ left: dir === "right" ? SCROLL_AMOUNT : -SCROLL_AMOUNT, behavior: "smooth" });
  }, []);

  // Drag-to-scroll
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const isDragActive = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current; if (!el) return;
    isDragging.current = true;
    isDragActive.current = false; // always reset on fresh press
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const walk = (e.pageX - trackRef.current.offsetLeft - dragStartX.current) * 1.4;
    if (Math.abs(walk) > 4) {
      e.preventDefault(); isDragActive.current = true;
      trackRef.current.style.cursor = "grabbing";
      trackRef.current.scrollLeft = dragScrollLeft.current - walk;
    }
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
    setTimeout(() => { isDragActive.current = false; }, 150);
  };

  // ── Scroll-to-products handler (used when parent doesn't provide onItemClick) ──
  const scrollToProducts = useCallback(() => {
    const el = document.getElementById("featured-products-section");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const handleItemClick = useCallback((item: CollectionItem) => {
    // 1. Call parent handler if provided (App.tsx will navigate + filter)
    onItemClick?.(item);
    // 2. Always scroll down to the products section smoothly
    setTimeout(scrollToProducts, 80);
  }, [onItemClick, scrollToProducts]);

  return (
    <section ref={sectionRef} style={{ backgroundColor: "#fff8f0" }}
      className="w-full py-12 px-4 sm:px-6 lg:px-10 xl:px-16" aria-label="Shop Our Collections">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex items-end justify-between mb-2">
          <div className="flex flex-col">
            <span style={{ fontFamily: "'Jost', sans-serif", color: "#E65100", letterSpacing: "0.14em", fontSize: "11px", fontWeight: 600 }}
              className="uppercase mb-1">Explore by Category</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#9B1B1B" }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
              Shop Our Collections
            </h2>
          </div>
          <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }} onClick={onViewAll}
            style={{ fontFamily: "'Jost', sans-serif", color: "#9B1B1B", borderColor: "#D4AF37" }}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold border-b-2 pb-0.5 hover:opacity-75 transition-opacity">
            View all
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, scaleX: 0.6 }} animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}>
          <OmDivider />
        </motion.div>

        {/* Slider */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block flex-shrink-0">
            <NavButton direction="left" onClick={() => scrollBy("left")} disabled={!canScrollLeft} />
          </div>

          <div ref={trackRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove}
            onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            className="flex gap-5 sm:gap-7 lg:gap-9 overflow-x-auto flex-1"
            style={{
              scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
              cursor: "grab", paddingBottom: "8px", paddingTop: "4px",
              maskImage: "linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
            }}>
            {liveCollections.map((cat, i) => (
              <CircleItem
                key={cat.id ?? i}
                item={cat}
                index={i}
                isInView={isInView}
                onClick={handleItemClick}
                isDragActiveRef={isDragActive}
              />
            ))}
          </div>

          <div className="hidden sm:block flex-shrink-0">
            <NavButton direction="right" onClick={() => scrollBy("right")} disabled={!canScrollRight} />
          </div>
        </div>

        {/* Mobile nav */}
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="flex items-center justify-between mt-6 sm:hidden">
          <NavButton direction="left" onClick={() => scrollBy("left")} disabled={!canScrollLeft} />
          <button onClick={onViewAll}
            style={{ fontFamily: "'Jost', sans-serif", background: "linear-gradient(90deg, #9B1B1B 0%, #E65100 100%)", boxShadow: "0 4px 14px rgba(155, 27, 27,0.26)" }}
            className="text-white text-xs font-semibold tracking-wide px-6 py-2.5 rounded-full active:scale-95 transition-transform">
            View All Collections
          </button>
          <NavButton direction="right" onClick={() => scrollBy("right")} disabled={!canScrollRight} />
        </motion.div>

      </div>
    </section>
  );
}