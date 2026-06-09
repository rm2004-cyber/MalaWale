import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { categoryService } from "../utils/service";

// ─── Interface ────────────────────────────────────────────────────────────────
export interface CollectionItem {
  id: string | number;
  name: string;
  image: string;
  slug?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {direction === "right" ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
    </svg>
  );
}

function NavButton({ direction, onClick, disabled }: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.08 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      aria-label={direction === "right" ? "Next" : "Previous"}
      style={{
        background: disabled
          ? "rgba(212, 175, 55,0.15)"
          : "linear-gradient(135deg, #9B1B1B 0%, #E65100 100%)",
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

// ─── Image Fallback — shown when category has no image from API ───────────────
function ImageFallback({ name }: { name: string }) {
  const colors = [
    ["#fff3e0", "#e8820c"],
    ["#fce4ec", "#c2185b"],
    ["#f3e5f5", "#7b1fa2"],
    ["#e8f5e9", "#2e7d32"],
    ["#fff8e1", "#f9a825"],
    ["#fbe9e7", "#bf360c"],
    ["#e3f2fd", "#1565c0"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  const [bg, accent] = colors[hash % colors.length];

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: `radial-gradient(circle at 35% 35%, white 0%, ${bg} 100%)`,
    }}>
      <svg viewBox="0 0 80 80" width="52" height="52">
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle key={i}
              cx={40 + 30 * Math.cos(a)} cy={40 + 30 * Math.sin(a)}
              r="5" fill={accent} opacity="0.35"
              stroke={accent} strokeWidth="0.5"
            />
          );
        })}
        <circle cx="40" cy="40" r="14" fill={accent} opacity="0.12" />
        <text x="40" y="47" textAnchor="middle"
          fontSize="22" fill={accent} fontFamily="serif" opacity="0.85">
          ॐ
        </text>
      </svg>
    </div>
  );
}

// ─── Empty State — shown while loading or if API returns nothing ──────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-16 gap-3">
      <span style={{ fontSize: "32px", opacity: 0.4, fontFamily: "serif", color: "#D4AF37" }}>ॐ</span>
      <p style={{
        fontFamily: "'Jost', sans-serif", color: "#c4956a",
        fontSize: "14px", fontStyle: "italic",
      }}>
        Collections loading...
      </p>
    </div>
  );
}

// ─── Circle Item ──────────────────────────────────────────────────────────────
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: {
      delay: i * 0.07, duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as any,
    },
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

  const hasImage = !!item.image && !imgError;

  const handleClick = () => {
    if (!isDragActiveRef.current) onClick?.(item);
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
      {/*
        Ring lives OUTSIDE overflow-hidden so it never gets clipped.
        padding: 6px gives the ring room to breathe.
      */}
      <div style={{ position: "relative", padding: "6px" }}>

        {/* Animated gold ring */}
        <motion.div
          animate={{
            opacity: hovered ? 1 : 0.5,
            scale: hovered ? 1 : 0.97,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "9999px",
            background: hovered
              ? "linear-gradient(135deg, #D4AF37 0%, #E65100 50%, #D4AF37 100%)"
              : "linear-gradient(135deg, #edd9b8 0%, #D4AF37 100%)",
            zIndex: 0,
          }}
        />

        {/* Image circle — overflow-hidden only on this inner div */}
        <div
          className="relative z-10 overflow-hidden rounded-full w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44"
          style={{
            background: "#f5ebe0",
            boxShadow: hovered
              ? "0 12px 36px rgba(155,27,27,0.30), 0 4px 12px rgba(200,132,58,0.20)"
              : "0 4px 16px rgba(155,27,27,0.14), 0 1px 4px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          {hasImage ? (
            <motion.img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="w-full h-full"
              style={{ objectFit: "cover", objectPosition: "center", display: "block" }}
              animate={{ scale: hovered ? 1.1 : 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <ImageFallback name={item.name} />
          )}

          {/* Vignette */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(61,31,10,0.22) 100%)",
          }} />

          {/* Shimmer on hover */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 60%)",
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
  onItemClick?: (item: CollectionItem) => void;
  onViewAll?: () => void;
}

const SCROLL_AMOUNT = 320;

export default function CollectionCircles({
  collections,
  onItemClick,
  onViewAll,
}: CollectionCirclesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [loading, setLoading] = useState(true);
  const [liveCollections, setLiveCollections] = useState<CollectionItem[]>([]);

  // Fetch from API — no fallback data at all
  useEffect(() => {
    if (collections && collections.length > 0) {
      setLiveCollections(collections);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetch_ = async () => {
      try {
        const res = await categoryService.getCategories();
        const raw: any[] = res?.data?.categories ?? [];
        if (cancelled) return;
        setLiveCollections(raw.map(normalizeCategory));
      } catch {
        if (!cancelled) setLiveCollections([]);
      } finally {
        if (!cancelled) setLoading(false);
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
    return () => {
      el.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", syncScroll);
    };
  }, [syncScroll, liveCollections]);

  const scrollBy = useCallback((dir: "left" | "right") => {
    trackRef.current?.scrollBy({
      left: dir === "right" ? SCROLL_AMOUNT : -SCROLL_AMOUNT,
      behavior: "smooth",
    });
  }, []);

  // Drag-to-scroll
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const isDragActive = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current; if (!el) return;
    isDragging.current = true;
    isDragActive.current = false;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const walk = (e.pageX - trackRef.current.offsetLeft - dragStartX.current) * 1.4;
    if (Math.abs(walk) > 4) {
      e.preventDefault();
      isDragActive.current = true;
      trackRef.current.style.cursor = "grabbing";
      trackRef.current.scrollLeft = dragScrollLeft.current - walk;
    }
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
    setTimeout(() => { isDragActive.current = false; }, 150);
  };

  const scrollToProducts = useCallback(() => {
    const el = document.getElementById("featured-products-section");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const handleItemClick = useCallback((item: CollectionItem) => {
    onItemClick?.(item);
    setTimeout(scrollToProducts, 80);
  }, [onItemClick, scrollToProducts]);

  // Hide entire section if no data and not loading
  if (!loading && liveCollections.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      style={{ backgroundColor: "#fff8f0" }}
      className="w-full py-12 px-4 sm:px-6 lg:px-10 xl:px-16"
      aria-label="Shop Our Collections"
    >
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex items-end justify-between mb-2"
        >
          <div className="flex flex-col">
            <span style={{
              fontFamily: "'Jost', sans-serif", color: "#E65100",
              letterSpacing: "0.14em", fontSize: "11px", fontWeight: 600,
            }} className="uppercase mb-1">
              Explore by Category
            </span>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", color: "#9B1B1B" }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight"
            >
              Shop Our Collections
            </h2>
          </div>
          <motion.button
            whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }}
            onClick={onViewAll}
            style={{ fontFamily: "'Jost', sans-serif", color: "#9B1B1B", borderColor: "#D4AF37" }}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold border-b-2 pb-0.5 hover:opacity-75 transition-opacity"
          >
            View all
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <OmDivider />
        </motion.div>

        {/* Loading state */}
        {loading && <EmptyState />}

        {/* Slider — only when data is ready */}
        {!loading && liveCollections.length > 0 && (
          <>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block flex-shrink-0">
                <NavButton direction="left" onClick={() => scrollBy("left")} disabled={!canScrollLeft} />
              </div>

              <div
                ref={trackRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                className="flex gap-5 sm:gap-7 lg:gap-9 overflow-x-auto flex-1"
                style={{
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                  cursor: "grab",
                  paddingBottom: "12px",
                  paddingTop: "10px",
                  paddingLeft: "6px",
                  paddingRight: "6px",
                  maskImage: "linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
                }}
              >
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="flex items-center justify-between mt-6 sm:hidden"
            >
              <NavButton direction="left" onClick={() => scrollBy("left")} disabled={!canScrollLeft} />
              <button
                onClick={onViewAll}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background: "linear-gradient(90deg, #9B1B1B 0%, #E65100 100%)",
                  boxShadow: "0 4px 14px rgba(155,27,27,0.26)",
                }}
                className="text-white text-xs font-semibold tracking-wide px-6 py-2.5 rounded-full active:scale-95 transition-transform"
              >
                View All Collections
              </button>
              <NavButton direction="right" onClick={() => scrollBy("right")} disabled={!canScrollRight} />
            </motion.div>
          </>
        )}

      </div>
    </section>
  );
}