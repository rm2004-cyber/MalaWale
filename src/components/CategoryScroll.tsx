import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type FC,
  type PointerEvent,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { categoryService } from "../utils/service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryItem {
  id: string;
  name: string;
}

export interface CategoryScrollProps {
  selected?: string;
  onSelect?: (id: string) => void;
}

const categories: CategoryItem[] = [
  { id: 'all', name: 'All Products' },
  { id: 'rudraksh', name: 'Rudraksh Malas' },
  { id: 'bracelets', name: 'Premium Bracelets' },
  { id: 'crystal', name: 'Sphatik / Crystal' },
];

// ─── Inline SVG Motifs ────────────────────────────────────────────────────────

/** Rudraksha bead — five-faced, hand-drawn look */
const RudrakshaMotif: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Outer bead */}
    <circle cx="12" cy="12" r="9.5" fill="#d4a373" opacity="0.15" />
    <circle
      cx="12"
      cy="12"
      r="9.5"
      fill="none"
      stroke="#d4a373"
      strokeWidth="1.1"
    />
    {/* Five faces (mukhi) — lines from center to edge */}
    {[0, 72, 144, 216, 288].map((angle) => (
      <line
        key={angle}
        x1="12"
        y1="12"
        x2={12 + 9.5 * Math.cos(((angle - 90) * Math.PI) / 180)}
        y2={12 + 9.5 * Math.sin(((angle - 90) * Math.PI) / 180)}
        stroke="#d4a373"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />
    ))}
    {/* Drill hole cap */}
    <circle cx="12" cy="3" r="1.4" fill="#d4a373" opacity="0.6" />
    <circle cx="12" cy="21" r="1.4" fill="#d4a373" opacity="0.6" />
    {/* Center nub */}
    <circle cx="12" cy="12" r="2" fill="#d4a373" opacity="0.4" />
    <circle
      cx="12"
      cy="12"
      r="2"
      fill="none"
      stroke="#d4a373"
      strokeWidth="0.8"
    />
  </svg>
);

/** Tiny sparkle / diya flame */
const SparkleMotif: FC<{ color?: string; size?: number }> = ({
  color = "#d4a373",
  size = 12,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z"
      fill={color}
      opacity="0.9"
    />
    <path
      d="M5 5 L5.8 8 L9 9 L5.8 10 L5 13 L4.2 10 L1 9 L4.2 8 Z"
      fill={color}
      opacity="0.5"
    />
    <path
      d="M19 17 L19.5 19 L21 19.5 L19.5 20 L19 22 L18.5 20 L17 19.5 L18.5 19 Z"
      fill={color}
      opacity="0.5"
    />
  </svg>
);

// ─── Framer Motion Variants ───────────────────────────────────────────────────

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -18, scale: 0.94 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

const sparkleVariants: Variants = {
  initial: { opacity: 0, scale: 0.4, rotate: -20 },
  animate: {
    opacity: [0, 1, 0.85, 0],
    scale: [0.4, 1.15, 1, 0.6],
    rotate: [-20, 8, -4, 12],
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

const rudrakshaVariants: Variants = {
  initial: { opacity: 0, scale: 0, rotate: -45 },
  animate: {
    opacity: [0, 1, 1, 0],
    scale: [0, 1.2, 1, 0.8],
    rotate: [-45, 0, 5, -10],
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Category Pill ────────────────────────────────────────────────────────────

interface PillProps {
  item: CategoryItem;
  isActive: boolean;
  onClick: (id: string) => void;
  index: number;
}

const CategoryPill: FC<PillProps> = ({ item, isActive, onClick, index }) => {
  const [showSparkle, setShowSparkle] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const shouldReduce = useReducedMotion();

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(item.id);
    if (!shouldReduce) {
      setSparkleKey((k) => k + 1);
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 850);
    }
  };

  return (
    <motion.li
      variants={itemVariants}
      className="flex-shrink-0"
      style={{ listStyle: "none" }}
    >
      <motion.button
        onClick={handleClick}
        onTouchEnd={handleClick}
        aria-pressed={isActive}
        aria-label={`Filter by ${item.name}`}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer outline-none focus-visible:ring-2"
        style={{
          padding: "8px 18px",
          borderRadius: 100,
          fontFamily: "'Jost', sans-serif",
          fontWeight: isActive ? 600 : 400,
          fontSize: "clamp(0.72rem, 1.1vw, 0.88rem)",
          letterSpacing: isActive ? "0.06em" : "0.03em",
          whiteSpace: "nowrap",
          border: "none",
          color: isActive ? "#fff9f2" : "#6b3e1e",
          background: "transparent",
          transition: "color 0.25s",
          display: "flex",
          alignItems: "center",
          gap: 6,
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          zIndex: 10,
        }}
      >
        {/* ── Shared-layout background pill ─────────────────────────── */}
        {isActive && (
          <motion.span
            layoutId="active-pill"
            className="absolute inset-0"
            style={{
              borderRadius: 100,
              background:
                "linear-gradient(135deg, #8b4513 0%, #a0522d 55%, #c8843a 100%)",
              boxShadow:
                "0 4px 18px rgba(139,69,19,0.38), 0 1px 0 rgba(255,255,255,0.08) inset",
              zIndex: 0,
            }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        )}

        {/* ── Inactive pill border ── */}
        {!isActive && (
          <motion.span
            className="absolute inset-0"
            style={{
              borderRadius: 100,
              background: "rgba(255,249,242,0.82)",
              border: "1px solid rgba(212,163,115,0.38)",
              boxShadow: "0 1px 6px rgba(139,69,19,0.07)",
              zIndex: 0,
            }}
            whileHover={{
              background: "rgba(255,244,235,0.97)",
              borderColor: "rgba(200,132,58,0.65)",
              boxShadow:
                "0 3px 12px rgba(139,69,19,0.12), 0 0 0 2px rgba(212,163,115,0.15)",
            }}
            transition={{ duration: 0.22 }}
          />
        )}

        {/* ── Rudraksha icon ─────── */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              key={`bead-${index}`}
              variants={shouldReduce ? {} : rudrakshaVariants}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              style={{ position: "relative", zIndex: 1, lineHeight: 0 }}
            >
              <RudrakshaMotif size={13} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* ── Label ─────────────────────────────────────────────────── */}
        <span style={{ position: "relative", zIndex: 1 }}>{item.name}</span>

        {/* ── Sparkle burst on click ─────────────────────────────────── */}
        <AnimatePresence>
          {showSparkle && (
            <motion.span
              key={`sparkle-${sparkleKey}`}
              variants={sparkleVariants}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                right: -6,
                top: -7,
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <SparkleMotif
                size={14}
                color={isActive ? "#ffd9a0" : "#d4a373"}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.li>
  );
};

// ─── CategoryScroll (Main) ────────────────────────────────────────────────────

const CategoryScroll: FC<CategoryScrollProps> = ({
  selected: selectedProp,
  onSelect,
}) => {
  const [selected, setSelected] = useState('all');
  const currentSelected = selectedProp ?? selected;

  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([
    { id: 'all', name: 'All Products' }
  ]);

  const handleSelect = useCallback(
    (id: string) => {
      if (selectedProp === undefined) {
        setSelected(id);
      }
      onSelect?.(id);
    },
    [onSelect, selectedProp]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragThresholdMet = useRef(false);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // ── Data Fetching Lifecycle ─────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        
        if (response?.data?.categories && Array.isArray(response.data.categories) && response.data.categories.length > 0) {
          const mappedCategories: CategoryItem[] = response.data.categories.map((cat: any) => ({
            id: cat.id || cat._id,
            name: cat.name,
          }));

          if (isMounted) {
            setCategoriesList([
              { id: 'all', name: 'All Products' },
              ...mappedCategories
            ]);
          }
        } else {
          if (isMounted) {
            setCategoriesList(categories);
          }
        }
      } catch (error) {
        console.error("Failed to dynamically resolve CategoryScroll items from DB context:", error);
        if (isMounted) {
          setCategoriesList(categories);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Mouse drag-scroll fixes (prevents mouse capture from blocking clicks) ──
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    dragThresholdMet.current = false;
    startX.current = e.clientX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = e.clientX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    
    if (Math.abs(walk) > 5) {
      dragThresholdMet.current = true;
      if (scrollRef.current.pointerId === undefined) {
        scrollRef.current.setPointerCapture(e.pointerId);
      }
      scrollRef.current.style.cursor = "grabbing";
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    if (scrollRef.current) {
      try {
        scrollRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {}
      scrollRef.current.style.cursor = "grab";
    }
  };

  // ── Fade sentinels ──────────────────────────────────────────────────────
  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 8);
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateFades();
    el.addEventListener("scroll", updateFades, { passive: true });
    return () => el.removeEventListener("scroll", updateFades);
  }, [updateFades, categoriesList]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!activeBtn) return;
    const { offsetLeft, offsetWidth } = activeBtn;
    const targetScroll = offsetLeft - el.offsetWidth / 2 + offsetWidth / 2;
    el.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, [currentSelected]);

  return (
    <section
      aria-label="Product Categories"
      style={{
        background: "linear-gradient(180deg, #fff9f2 0%, #fff3e8 100%)",
        borderBottom: "1px solid rgba(212,163,115,0.22)",
        borderTop: "1px solid rgba(212,163,115,0.12)",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "40%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #d4a373, #c8843a, #d4a373, transparent)",
          opacity: 0.55,
          borderRadius: 2,
        }}
      />

      <AnimatePresence>
        {showLeftFade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 56,
              background: "linear-gradient(to right, #fff9f2 30%, transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRightFade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 56,
              background: "linear-gradient(to left, #fff9f2 30%, transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          cursor: "grab",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          padding: "12px 24px",
          position: "relative",
          zIndex: 1,
          justifyContent: categoriesList.length <= 5 ? "center" : "flex-start",
        }}
        className="[&::-webkit-scrollbar]:hidden"
      >
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="show"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "0 auto",
            padding: 0,
            width: "max-content",
          }}
          role="list"
        >
          {categoriesList.map((cat, i) => (
            <CategoryPill
              key={cat.id}
              item={cat}
              isActive={cat.id === currentSelected}
              onClick={handleSelect}
              index={i}
            />
          ))}
        </motion.ul>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "25%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(212,163,115,0.45), transparent)",
          borderRadius: 2,
        }}
      />
    </section>
  );
};

export default CategoryScroll;