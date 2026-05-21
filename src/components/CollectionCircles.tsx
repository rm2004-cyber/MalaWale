import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";

// ─── Interface ────────────────────────────────────────────────────────────────
export interface CollectionItem {
  id: string | number;
  name: string;
  image: string;
  slug?: string;
}

// ─── Fallback Mock Data ───────────────────────────────────────────────────────
const FALLBACK_COLLECTIONS: CollectionItem[] = [
  {
    id: 1,
    name: "Rudraksha Malas",
    image: "https://images.unsplash.com/photo-1611516491426-03025e6043c8?w=400&q=80",
    slug: "rudraksha-malas",
  },
  {
    id: 2,
    name: "Tulsi Malas",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80",
    slug: "tulsi-malas",
  },
  {
    id: 3,
    name: "Sphatik Malas",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
    slug: "sphatik-malas",
  },
  {
    id: 4,
    name: "Chandan Malas",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    slug: "chandan-malas",
  },
  {
    id: 5,
    name: "Navratna Malas",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    slug: "navratna-malas",
  },
  {
    id: 6,
    name: "Puja Samagri",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    slug: "puja-samagri",
  },
  {
    id: 7,
    name: "Haldi Malas",
    image: "https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=400&q=80",
    slug: "haldi-malas",
  },
];

// ─── Chevron Icon ─────────────────────────────────────────────────────────────
function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "right" ? (
        <path d="M9 18l6-6-6-6" />
      ) : (
        <path d="M15 18l-6-6 6-6" />
      )}
    </svg>
  );
}

// ─── Nav Button ───────────────────────────────────────────────────────────────
interface NavButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}

function NavButton({ direction, onClick, disabled }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.08 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      aria-label={direction === "right" ? "Next collections" : "Previous collections"}
      style={{
        background: disabled
          ? "rgba(212,163,115,0.15)"
          : "linear-gradient(135deg, #8b4513 0%, #c8843a 100%)",
        border: `2px solid ${disabled ? "#e8d5be" : "#d4a373"}`,
        color: disabled ? "#c9a882" : "#fff",
        boxShadow: disabled ? "none" : "0 4px 18px rgba(139,69,19,0.28)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
      }}
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
    >
      <ChevronIcon direction={direction} />
    </motion.button>
  );
}

// ─── Collection Circle Item ───────────────────────────────────────────────────
interface CircleItemProps {
  item: CollectionItem;
  index: number;
  isInView: boolean;
  onClick?: (item: CollectionItem) => void;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.07,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

function CircleItem({ item, index, isInView, onClick }: CircleItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer group"
      onClick={() => onClick?.(item)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ userSelect: "none" }}
    >
      {/* ── Circle Frame ── */}
      <div className="relative">
        {/* Animated gold ring on hover */}
        <motion.div
          animate={{
            scale: hovered ? 1.06 : 1,
            opacity: hovered ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: "-4px",
            borderRadius: "9999px",
            background:
              "linear-gradient(135deg, #d4a373 0%, #c8843a 50%, #d4a373 100%)",
            zIndex: 0,
          }}
        />

        {/* Static subtle ring */}
        <div
          style={{
            position: "absolute",
            inset: "-2px",
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #edd9b8 0%, #d4a373 100%)",
            opacity: 0.6,
            zIndex: 0,
          }}
        />

        {/* Image circle */}
        <div
          className="
            relative z-10 overflow-hidden rounded-full
            w-28 h-28
            sm:w-32 sm:h-32
            md:w-36 md:h-36
            lg:w-40 lg:h-40
            xl:w-44 xl:h-44
          "
          style={{
            background: "#f5ebe0",
            boxShadow: hovered
              ? "0 12px 36px rgba(139,69,19,0.30), 0 4px 12px rgba(200,132,58,0.20)"
              : "0 4px 16px rgba(139,69,19,0.14), 0 1px 4px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <motion.img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ transformOrigin: "center" }}
          />

          {/* Inner vignette overlay */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(61,31,10,0.18) 100%)",
            }}
          />
        </div>
      </div>

      {/* ── Label ── */}
      <motion.span
        animate={{
          color: hovered ? "#8b4513" : "#3d1f0a",
          y: hovered ? -2 : 0,
        }}
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

// ─── Decorative Om Divider ────────────────────────────────────────────────────
function OmDivider() {
  return (
    <div className="flex items-center gap-3 mt-1 mb-8">
      <div
        className="h-px flex-1 rounded"
        style={{
          background:
            "linear-gradient(90deg, transparent, #d4a373 60%, transparent)",
          opacity: 0.5,
        }}
      />
      <span style={{ color: "#d4a373", fontSize: "18px", lineHeight: 1 }}>ॐ</span>
      <div
        className="h-px flex-1 rounded"
        style={{
          background:
            "linear-gradient(90deg, transparent, #d4a373 60%, transparent)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface CollectionCirclesProps {
  collections?: CollectionItem[];
  onItemClick?: (item: CollectionItem) => void;
  onViewAll?: () => void;
}

const SCROLL_AMOUNT = 320; // px per nav click

export default function CollectionCircles({
  collections = FALLBACK_COLLECTIONS,
  onItemClick,
  onViewAll,
}: CollectionCirclesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayItems = collections.length ? collections : FALLBACK_COLLECTIONS;

  // ── Scroll state sync ──
  const syncScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncScrollState();
    el.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);
    return () => {
      el.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
    };
  }, [syncScrollState]);

  const scrollBy = useCallback((direction: "left" | "right") => {
    trackRef.current?.scrollBy({
      left: direction === "right" ? SCROLL_AMOUNT : -SCROLL_AMOUNT,
      behavior: "smooth",
    });
  }, []);

  // ── Drag-to-scroll on desktop ──
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = true;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.4;
    trackRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  };

  return (
    <section
      ref={sectionRef}
      style={{ backgroundColor: "#fff8f0" }}
      className="w-full py-12 px-4 sm:px-6 lg:px-10 xl:px-16"
      aria-label="Shop Our Collections"
    >
      <div className="max-w-screen-xl mx-auto">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex items-end justify-between mb-2"
        >
          {/* Title block */}
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                color: "#c8843a",
                letterSpacing: "0.14em",
                fontSize: "11px",
                fontWeight: 600,
              }}
              className="uppercase mb-1"
            >
              Explore by Category
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#8b4513",
              }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight"
            >
              Shop Our Collections
            </h2>
          </div>

          {/* View All — desktop */}
          <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.96 }}
            onClick={onViewAll}
            style={{
              fontFamily: "'Jost', sans-serif",
              color: "#8b4513",
              borderColor: "#d4a373",
            }}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold border-b-2 pb-0.5 hover:opacity-75 transition-opacity"
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

        {/* Om Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <OmDivider />
        </motion.div>

        {/* ── Slider Row: Track + Nav Controls ── */}
        <div className="flex items-center gap-3">

          {/* Left Nav — desktop only */}
          <div className="hidden sm:block flex-shrink-0">
            <AnimatePresence>
              <NavButton
                direction="left"
                onClick={() => scrollBy("left")}
                disabled={!canScrollLeft}
              />
            </AnimatePresence>
          </div>

          {/* ── Scrollable Track ── */}
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
              paddingBottom: "8px",
              paddingTop: "4px",
              // Edge fade masks
              maskImage:
                "linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
            }}
          >
            {displayItems.map((item, index) => (
              <CircleItem
                key={item.id}
                item={item}
                index={index}
                isInView={isInView}
                onClick={onItemClick}
              />
            ))}
          </div>

          {/* Right Nav — desktop only */}
          <div className="hidden sm:block flex-shrink-0">
            <NavButton
              direction="right"
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
            />
          </div>
        </div>

        {/* ── Mobile Nav Row ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="flex items-center justify-between mt-6 sm:hidden"
        >
          <NavButton
            direction="left"
            onClick={() => scrollBy("left")}
            disabled={!canScrollLeft}
          />

          <button
            onClick={onViewAll}
            style={{
              fontFamily: "'Jost', sans-serif",
              background: "linear-gradient(90deg, #8b4513 0%, #c8843a 100%)",
              boxShadow: "0 4px 14px rgba(139,69,19,0.26)",
            }}
            className="text-white text-xs font-semibold tracking-wide px-6 py-2.5 rounded-full active:scale-95 transition-transform"
          >
            View All Collections
          </button>

          <NavButton
            direction="right"
            onClick={() => scrollBy("right")}
            disabled={!canScrollRight}
          />
        </motion.div>
      </div>
    </section>
  );
}