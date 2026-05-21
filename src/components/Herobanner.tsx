import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Type Definitions ────────────────────────────────────────────────────────

interface BannerItem {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
  ctaText: string;
  ctaLink: string;
  accentColor: string;
}

interface DotProps {
  index: number;
  isActive: boolean;
  onClick: (index: number) => void;
}

interface ChevronButtonProps {
  direction: "left" | "right";
  onClick: () => void;
}

// ─── Banner Data (Replace with API response from admin panel) ─────────────────

const bannerData: BannerItem[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1545483656-1a34b51b8f69?w=1600&auto=format&fit=crop&q=80",
    title: "Sacred Rudraksha Malas",
    subtitle:
      "Handcrafted with devotion — each bead carries centuries of spiritual heritage from the Himalayan foothills",
    tag: "✦ Divine Collection",
    ctaText: "Explore Collection",
    ctaLink: "/collections/rudraksha",
    accentColor: "#d4a373",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1600431521340-491eca880813?w=1600&auto=format&fit=crop&q=80",
    title: "Sandalwood & Tulsi Treasures",
    subtitle:
      "Pure aromatic sandalwood beads and sacred Tulsi — worn by sages, blessed by tradition",
    tag: "✦ Purity Essence",
    ctaText: "Discover Now",
    ctaLink: "/collections/sandalwood",
    accentColor: "#c8843a",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop&q=80",
    title: "Heirloom Spiritual Gifts",
    subtitle:
      "Curated ritual adornments for puja, japa & gifting — wrapped in the warmth of Sanwariya's blessing",
    tag: "✦ Premium Gifting",
    ctaText: "Shop Gifts",
    ctaLink: "/collections/gifts",
    accentColor: "#8b4513",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const PaginationDot: React.FC<DotProps> = ({ index, isActive, onClick }) => (
  <button
    aria-label={`Go to slide ${index + 1}`}
    onClick={() => onClick(index)}
    className="relative flex items-center justify-center group cursor-pointer"
    style={{ width: 32, height: 32 }}
  >
    {/* Glow ring on active */}
    {isActive && (
      <motion.span
        layoutId="dot-ring"
        className="absolute inset-0 rounded-full"
        style={{
          border: "1.5px solid #d4a373",
          boxShadow: "0 0 8px 2px rgba(212,163,115,0.45)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    )}
    <span
      className="rounded-full transition-all duration-300"
      style={{
        width: isActive ? 10 : 6,
        height: isActive ? 10 : 6,
        background: isActive
          ? "linear-gradient(135deg,#d4a373,#c8843a)"
          : "rgba(212,163,115,0.4)",
        boxShadow: isActive ? "0 0 6px rgba(212,163,115,0.7)" : "none",
      }}
    />
  </button>
);

const ChevronButton: React.FC<ChevronButtonProps> = ({
  direction,
  onClick,
}) => (
  <motion.button
    onClick={onClick}
    aria-label={direction === "left" ? "Previous slide" : "Next slide"}
    whileHover={{ scale: 1.12 }}
    whileTap={{ scale: 0.95 }}
    className="relative flex items-center justify-center cursor-pointer"
    style={{
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: "rgba(255,249,242,0.10)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(212,163,115,0.35)",
      boxShadow:
        "0 4px 20px rgba(139,69,19,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
      color: "#d4a373",
      outline: "none",
      transition: "border-color 0.25s,box-shadow 0.25s",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.borderColor =
        "rgba(212,163,115,0.8)";
      (e.currentTarget as HTMLButtonElement).style.boxShadow =
        "0 4px 24px rgba(212,163,115,0.30), inset 0 1px 0 rgba(255,255,255,0.18)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.borderColor =
        "rgba(212,163,115,0.35)";
      (e.currentTarget as HTMLButtonElement).style.boxShadow =
        "0 4px 20px rgba(139,69,19,0.18), inset 0 1px 0 rgba(255,255,255,0.12)";
    }}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  </motion.button>
);

// ─── Decorative SVG Mandala Corner ────────────────────────────────────────────

const MandalaSvg: React.FC<{ opacity?: number }> = ({ opacity = 0.18 }) => (
  <svg
    viewBox="0 0 120 120"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    className="w-full h-full"
  >
    <circle cx="60" cy="60" r="55" fill="none" stroke="#d4a373" strokeWidth="0.8" />
    <circle cx="60" cy="60" r="44" fill="none" stroke="#d4a373" strokeWidth="0.5" />
    <circle cx="60" cy="60" r="30" fill="none" stroke="#d4a373" strokeWidth="0.6" />
    <circle cx="60" cy="60" r="16" fill="none" stroke="#d4a373" strokeWidth="0.8" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <line
        key={angle}
        x1="60"
        y1="5"
        x2="60"
        y2="115"
        stroke="#d4a373"
        strokeWidth="0.4"
        transform={`rotate(${angle} 60 60)`}
      />
    ))}
    {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((angle) => (
      <ellipse
        key={angle}
        cx="60"
        cy="32"
        rx="5"
        ry="12"
        fill="none"
        stroke="#d4a373"
        strokeWidth="0.5"
        transform={`rotate(${angle} 60 60)`}
      />
    ))}
  </svg>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const INTERVAL = 5000;

interface ProgressBarProps {
  duration: number;
  isPlaying: boolean;
  slideKey: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  duration,
  isPlaying,
  slideKey,
}) => (
  <div
    className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden"
    style={{ background: "rgba(212,163,115,0.15)" }}
  >
    <motion.div
      key={slideKey}
      initial={{ scaleX: 0 }}
      animate={isPlaying ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: duration / 1000, ease: "linear" }}
      style={{
        originX: 0,
        height: "100%",
        background:
          "linear-gradient(90deg, #d4a373 0%, #c8843a 60%, #8b4513 100%)",
        boxShadow: "0 0 8px rgba(212,163,115,0.6)",
      }}
    />
  </div>
);

// ─── Slide Text Animations ────────────────────────────────────────────────────

const textContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
  exit: {
    transition: { staggerChildren: 0.06 },
  },
};

const tagVariant = {
  hidden: { opacity: 0, y: -16, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const titleVariant = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const subtitleVariant = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const ctaVariant = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const imageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "8%" : "-8%",
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-6%" : "6%",
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.55, ease: [0.36, 0, 0.66, 0] },
  }),
};

// ─── Main HeroBanner Component ────────────────────────────────────────────────

const HeroBanner: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const total = bannerData.length;

  const goTo = useCallback(
    (index: number, dir?: number) => {
      const resolvedDir =
        dir ?? (index > current ? 1 : index < current ? -1 : 1);
      setDirection(resolvedDir);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    goTo((current + 1) % total, 1);
  }, [current, total, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + total) % total, -1);
  }, [current, total, goTo]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || isHovered) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(next, INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, isHovered, next]);

  const slide = bannerData[current];

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      style={{
        height: "clamp(220px, 52vw, 520px)",
        background: "#1a0a00",
        fontFamily: "'Jost', sans-serif",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
      aria-label="MalaWale Featured Banners"
    >
      {/* ── Background Image ───────────────────────────────────────────── */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={shouldReduceMotion ? undefined : imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover object-center"
            draggable={false}
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Multi-layer Gradient Overlay ──────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(100deg, rgba(20,6,0,0.82) 0%, rgba(20,6,0,0.55) 40%, rgba(20,6,0,0.18) 75%, rgba(20,6,0,0.08) 100%)",
        }}
      />
      {/* golden shimmer at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "38%",
          background:
            "linear-gradient(to top, rgba(139,69,19,0.30) 0%, transparent 100%)",
        }}
      />
      {/* top vignette */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "22%",
          background:
            "linear-gradient(to bottom, rgba(20,6,0,0.28) 0%, transparent 100%)",
        }}
      />

      {/* ── Decorative Mandala corners ─────────────────────────────────── */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: "clamp(80px, 14vw, 160px)", aspectRatio: "1" }}
        aria-hidden="true"
      >
        <MandalaSvg opacity={0.22} />
      </div>
      <div
        className="absolute bottom-6 right-2 pointer-events-none"
        style={{
          width: "clamp(50px, 8vw, 90px)",
          aspectRatio: "1",
          transform: "rotate(45deg)",
        }}
        aria-hidden="true"
      >
        <MandalaSvg opacity={0.14} />
      </div>

      {/* ── Thin golden border frame ───────────────────────────────────── */}
      <div
        className="absolute inset-3 pointer-events-none hidden sm:block"
        style={{
          border: "1px solid rgba(212,163,115,0.20)",
          borderRadius: 2,
        }}
        aria-hidden="true"
      />

      {/* ── Slide Content ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-20">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`text-${slide.id}`}
            variants={textContainer}
            initial="hidden"
            animate="show"
            exit="exit"
            className="max-w-xl lg:max-w-2xl"
          >
            {/* Tag / Label */}
            <motion.span
              variants={tagVariant}
              className="inline-block mb-3 px-3 py-1 text-xs tracking-[0.18em] uppercase"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                color: slide.accentColor,
                background: "rgba(212,163,115,0.10)",
                border: `1px solid ${slide.accentColor}44`,
                borderRadius: 2,
                letterSpacing: "0.18em",
                textShadow: "0 1px 8px rgba(212,163,115,0.4)",
              }}
            >
              {slide.tag}
            </motion.span>

            {/* Title */}
            <motion.h1
              variants={titleVariant}
              className="mb-3 leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "clamp(1.45rem, 4.2vw, 3.1rem)",
                color: "#fff9f2",
                textShadow:
                  "0 2px 24px rgba(20,6,0,0.6), 0 1px 0 rgba(0,0,0,0.3)",
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
              }}
            >
              {slide.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={subtitleVariant}
              className="mb-6 leading-relaxed hidden sm:block"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)",
                color: "rgba(255,249,242,0.78)",
                textShadow: "0 1px 10px rgba(20,6,0,0.5)",
                maxWidth: "42ch",
                lineHeight: 1.65,
              }}
            >
              {slide.subtitle}
            </motion.p>

            {/* CTA Button */}
            <motion.a
              variants={ctaVariant}
              href={slide.ctaLink}
              whileHover={{
                scale: 1.04,
                boxShadow:
                  "0 8px 32px rgba(212,163,115,0.45), 0 0 0 1px rgba(212,163,115,0.55)",
              }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 cursor-pointer"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(0.75rem, 1.1vw, 0.95rem)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#fff9f2",
                background:
                  "linear-gradient(135deg, #8b4513 0%, #c8843a 55%, #d4a373 100%)",
                padding: "clamp(9px,1.2vw,13px) clamp(18px,2.5vw,30px)",
                borderRadius: 2,
                border: "1px solid rgba(212,163,115,0.5)",
                boxShadow: "0 4px 18px rgba(139,69,19,0.35)",
                textDecoration: "none",
                transition: "all 0.25s ease",
              }}
            >
              {slide.ctaText}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </motion.a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation Arrows (hidden on small mobile) ─────────────────── */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 items-center gap-2 hidden sm:flex flex-col"
      >
        <ChevronButton direction="left" onClick={prev} />
        <ChevronButton direction="right" onClick={next} />
      </div>

      {/* ── Pagination Dots ────────────────────────────────────────────── */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1"
        role="tablist"
        aria-label="Slide indicators"
      >
        {bannerData.map((item, i) => (
          <PaginationDot
            key={item.id}
            index={i}
            isActive={i === current}
            onClick={(idx) => goTo(idx)}
          />
        ))}
      </div>

      {/* ── Play / Pause toggle ─────────────────────────────────────────── */}
      <button
        onClick={() => setIsPlaying((p) => !p)}
        aria-label={isPlaying ? "Pause auto-play" : "Resume auto-play"}
        className="absolute bottom-4 right-4 cursor-pointer"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(20,6,0,0.35)",
          border: "1px solid rgba(212,163,115,0.25)",
          color: "rgba(212,163,115,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          outline: "none",
          transition: "all 0.2s",
        }}
      >
        {isPlaying ? (
          // Pause icon
          <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
            <rect x="0" y="0" width="3.5" height="11" rx="1" />
            <rect x="6.5" y="0" width="3.5" height="11" rx="1" />
          </svg>
        ) : (
          // Play icon
          <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
            <polygon points="0,0 10,5.5 0,11" />
          </svg>
        )}
      </button>

      {/* ── Slide counter (decorative) ──────────────────────────────────── */}
      <div
        className="absolute top-4 left-4 hidden md:flex items-baseline gap-1"
        aria-hidden="true"
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "rgba(212,163,115,0.85)",
            lineHeight: 1,
          }}
        >
          {String(current + 1).padStart(2, "0")}
        </span>
        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.7rem",
            color: "rgba(212,163,115,0.40)",
            letterSpacing: "0.06em",
          }}
        >
          / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* ── Brand watermark ─────────────────────────────────────────────── */}
      <div
        className="absolute top-4 right-4 hidden md:block"
        aria-hidden="true"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "0.7rem",
          letterSpacing: "0.22em",
          color: "rgba(212,163,115,0.35)",
          textTransform: "uppercase",
        }}
      >
        Sanwariya Handicraft
      </div>

      {/* ── Progress Bar ───────────────────────────────────────────────── */}
      <ProgressBar
        duration={INTERVAL}
        isPlaying={isPlaying && !isHovered}
        slideKey={current}
      />
    </section>
  );
};

export default HeroBanner;