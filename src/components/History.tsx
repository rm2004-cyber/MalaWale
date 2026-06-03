import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// DATA LAYER  (swap `src` values with API response when backend is ready)
// ─────────────────────────────────────────────────────────────────────────────
interface FactoryImage {
  id: number;
  src: string;
  alt: string;
  /** corner style creates the asymmetric grid feel */
  cornerStyle: string;
}

const factoryImages: FactoryImage[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1599619585752-c3edb42a414c?w=600&q=80",
    alt: "Traditional wooden bead craftsmanship",
    cornerStyle: "rounded-tl-[2.5rem] rounded-tr-[0.5rem] rounded-bl-[0.5rem] rounded-br-[2.5rem]",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1599619585752-c3edb42a414c?w=600&q=80",
    alt: "Raw crystal sorting by artisan hands",
    cornerStyle: "rounded-tl-[0.5rem] rounded-tr-[2.5rem] rounded-bl-[2.5rem] rounded-br-[0.5rem]",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80",
    alt: "Hand-stringing sacred mala beads",
    cornerStyle: "rounded-tl-[2.5rem] rounded-tr-[0.5rem] rounded-bl-[0.5rem] rounded-br-[2.5rem]",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80",
    alt: "Finished malas laid out for quality inspection",
    cornerStyle: "rounded-tl-[0.5rem] rounded-tr-[2.5rem] rounded-bl-[2.5rem] rounded-br-[0.5rem]",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BENEFIT DATA
// ─────────────────────────────────────────────────────────────────────────────
interface Benefit {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PurityIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" stroke="#D4AF37" strokeWidth="1.5" />
    <path d="M14 5 L16.5 11 L23 11.5 L18 16 L19.5 23 L14 19.5 L8.5 23 L10 16 L5 11.5 L11.5 11 Z"
      fill="#D4AF37" fillOpacity="0.25" stroke="#D4AF37" strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="14" cy="14" r="2.5" fill="#D4AF37" />
  </svg>
);

const ArtisanIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" stroke="#D4AF37" strokeWidth="1.5" />
    <path d="M9 19 C9 15.5 11 13.5 14 13.5 C17 13.5 19 15.5 19 19" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="14" cy="10.5" r="3" stroke="#D4AF37" strokeWidth="1.5" />
    <path d="M11 20.5 Q14 18 17 20.5" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const MiddlemenFreeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" stroke="#D4AF37" strokeWidth="1.5" />
    {/* Forest/source dot on left */}
    <circle cx="7.5" cy="14" r="2.2" fill="#D4AF37" fillOpacity="0.3" stroke="#D4AF37" strokeWidth="1.2" />
    {/* Arrow path going direct to right */}
    <path d="M10 14 L18 14" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15.5 11.5 L18.5 14 L15.5 16.5" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Hand/you dot on right */}
    <circle cx="20.5" cy="14" r="2.2" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1.2" />
    {/* Crossed-out middleman */}
    <circle cx="14" cy="9" r="1.8" stroke="#E65100" strokeWidth="1" strokeOpacity="0.6" />
    <line x1="12.5" y1="7.5" x2="15.5" y2="10.5" stroke="#E65100" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const benefits: Benefit[] = [
  {
    id: 1,
    icon: <PurityIcon />,
    title: "100% Shuddh Purity Guaranteed",
    description:
      "Every bead, every stone, every sacred thread is inspected by our master karigars before it leaves the workshop.",
  },
  {
    id: 2,
    icon: <ArtisanIcon />,
    title: "Direct Artisan Support",
    description:
      "We employ native craftsmen from Vrindavan, Haridwar & Rajasthan, preserving centuries-old beadwork traditions.",
  },
  {
    id: 3,
    icon: <MiddlemenFreeIcon />,
    title: "Zero Middlemen — Source to Soul",
    description:
      "Raw rudraksha, crystal & sandalwood travel directly from forest & quarry to our workshop, and then to you.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const sectionVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const tagVariants: Variants = {
  hidden: { opacity: 0, letterSpacing: "0.15em" },
  visible: {
    opacity: 1,
    letterSpacing: "0.3em",
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

const dividerVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
  },
};

/** Each image pops in from a slightly different transform origin */
const imageEntryVariants = (index: number): Variants => {
  const origins: [number, number, string][] = [
    [-30, 30, "140deg"],   // top-left  → slides from bottom-left, slight rotate
    [30, 30, "-140deg"],   // top-right
    [-30, -30, "140deg"],  // bottom-left
    [30, -30, "-140deg"],  // bottom-right
  ];
  const [x, y, rotate] = origins[index % 4];
  return {
    hidden: { opacity: 0, x, y, scale: 0.82, rotate },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.85,
        delay: 0.15 + index * 0.14,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// DECORATIVE ORNAMENT
// ─────────────────────────────────────────────────────────────────────────────
const OrnamentDivider = () => (
  <div className="flex items-center gap-3 my-5">
    <motion.div
      variants={dividerVariants}
      className="h-px flex-1"
      style={{ background: "linear-gradient(90deg, transparent, #D4AF37 60%, transparent)" }}
    />
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1 L10.5 7.5 L17 9 L10.5 10.5 L9 17 L7.5 10.5 L1 9 L7.5 7.5 Z"
        fill="#D4AF37" fillOpacity="0.7" />
    </svg>
    <motion.div
      variants={dividerVariants}
      className="h-px flex-1"
      style={{ background: "linear-gradient(90deg, transparent, #D4AF37 60%, transparent)" }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE CARD
// ─────────────────────────────────────────────────────────────────────────────
interface ImageCardProps {
  image: FactoryImage;
  index: number;
  inView: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, index, inView }) => (
  <motion.div
    variants={imageEntryVariants(index)}
    initial="hidden"
    animate={inView ? "visible" : "hidden"}
    className="relative group overflow-hidden"
    style={{ borderRadius: "inherit" }}
  >
    <div className={`relative overflow-hidden ${image.cornerStyle} aspect-square`}
      style={{
        boxShadow: "0 8px 32px rgba(155, 27, 27,0.18), 0 2px 8px rgba(212, 175, 55,0.14)",
      }}
    >
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        style={{ transform: "scale(1.01)" }}
      />

      {/* Golden overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(135deg, rgba(212, 175, 55,0.22) 0%, rgba(155, 27, 27,0.18) 100%)",
        }}
      />

      {/* Subtle corner accent */}
      <div
        className="absolute top-0 left-0 w-10 h-10 opacity-40"
        style={{
          background:
            "radial-gradient(circle at top left, #D4AF37 0%, transparent 70%)",
        }}
      />

      {/* Alt text badge */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
        style={{ background: "linear-gradient(to top, rgba(155, 27, 27,0.82), transparent)" }}
      >
        <p
          className="text-xs text-center"
          style={{ color: "#FCF8F2", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
        >
          {image.alt}
        </p>
      </div>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// BENEFIT ITEM
// ─────────────────────────────────────────────────────────────────────────────
interface BenefitItemProps {
  benefit: Benefit;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ benefit }) => (
  <motion.div variants={fadeUpVariants} className="flex items-start gap-4">
    {/* Icon bubble */}
    <div
      className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl"
      style={{
        background: "linear-gradient(135deg, rgba(212, 175, 55,0.13) 0%, rgba(155, 27, 27,0.09) 100%)",
        border: "1px solid rgba(212, 175, 55,0.35)",
        boxShadow: "0 2px 12px rgba(212, 175, 55,0.12)",
      }}
    >
      {benefit.icon}
    </div>

    <div>
      <h4
        className="font-semibold mb-0.5 leading-snug"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.1rem",
          color: "#9B1B1B",
          letterSpacing: "0.01em",
        }}
      >
        {benefit.title}
      </h4>
      <p
        className="leading-relaxed"
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.875rem",
          color: "#7a5c44",
          lineHeight: 1.65,
        }}
      >
        {benefit.description}
      </p>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const History: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const leftInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      aria-label="MalaWale Brand History and Sourcing"
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: "#fff8f0" }}
    >
      {/* ── Ambient background texture ─────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 10% 20%, rgba(212, 175, 55,0.09) 0%, transparent 70%), " +
            "radial-gradient(ellipse 60% 60% at 90% 80%, rgba(155, 27, 27,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Faint Sanskrit watermark ────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
        aria-hidden="true"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(5rem, 15vw, 13rem)",
          color: "rgba(212, 175, 55,0.055)",
          whiteSpace: "nowrap",
          userSelect: "none",
          letterSpacing: "0.15em",
          fontStyle: "italic",
        }}
      >
        शुद्धता
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-14">
        {/* ── Section header centered label ─────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate={leftInView ? "visible" : "hidden"}
          variants={sectionVariants}
          className="text-center mb-14 md:mb-18"
        >
          <motion.p
            variants={tagVariants}
            className="inline-block text-xs font-semibold uppercase mb-3 tracking-widest"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#D4AF37",
              letterSpacing: "0.3em",
            }}
          >
            Sanwariya Handicraft · Since Generations
          </motion.p>
          <OrnamentDivider />
        </motion.div>

        {/* ── Two-column layout ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ════════════════════════════════════════════════════════════════
              LEFT COLUMN — The MalaWale Story
          ════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial="hidden"
            animate={leftInView ? "visible" : "hidden"}
            variants={sectionVariants}
            className="flex flex-col"
          >
            {/* Legacy tag */}
            <motion.span
              variants={tagVariants}
              className="self-start px-3 py-1 rounded-full text-xs font-medium uppercase mb-5"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#D4AF37",
                background: "rgba(212, 175, 55,0.10)",
                border: "1px solid rgba(212, 175, 55,0.3)",
                letterSpacing: "0.22em",
              }}
            >
              Direct from the Source
            </motion.span>

            {/* Main headline */}
            <motion.h2
              variants={fadeUpVariants}
              className="mb-2 leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.85rem, 4vw, 2.9rem)",
                fontWeight: 700,
                color: "#9B1B1B",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              Shuddhata Aur
              <br />
              <span style={{ color: "#E65100" }}>Parampara</span>
            </motion.h2>

            {/* Sanskrit sub-line */}
            <motion.p
              variants={fadeUpVariants}
              className="mb-5 italic"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.05rem",
                color: "#D84315",
                letterSpacing: "0.04em",
              }}
            >
              — Purity &amp; Tradition, Woven Into Every Mala
            </motion.p>

            {/* Body copy */}
            <motion.p
              variants={fadeUpVariants}
              className="mb-4 leading-relaxed"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.95rem",
                color: "#5a3e2b",
                lineHeight: 1.8,
              }}
            >
              At <strong style={{ color: "#9B1B1B" }}>MalaWale by Sanwariya Handicraft</strong>, we
              have always believed that a sacred mala must carry the full energy of its origin —
              untouched by commercial shortcuts. That is why we completely eliminate middlemen.
            </motion.p>

            <motion.p
              variants={fadeUpVariants}
              className="mb-7 leading-relaxed"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.95rem",
                color: "#5a3e2b",
                lineHeight: 1.8,
              }}
            >
              Our raw rudraksha beads are sourced directly from the forests of Nepal &amp; South
              India. Our crystals arrive straight from certified quarry clusters in Rajasthan. Our
              sandalwood is procured from native forest cooperatives in Karnataka — every single
              time, checked for grade, aura, and authenticity before our karigars even touch them.
              The result? A mala that carries the{" "}
              <em style={{ color: "#9B1B1B" }}>prana</em> of the earth, not the weight of a supply
              chain.
            </motion.p>

            {/* Ornament divider before benefits */}
            <OrnamentDivider />

            {/* Benefits */}
            <div className="flex flex-col gap-5 mt-1">
              {benefits.map((benefit) => (
                <BenefitItem key={benefit.id} benefit={benefit} />
              ))}
            </div>

            {/* Bottom CTA whisper */}
            <motion.p
              variants={fadeUpVariants}
              className="mt-8 italic text-sm"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#D84315",
                letterSpacing: "0.03em",
                borderLeft: "3px solid #D4AF37",
                paddingLeft: "1rem",
              }}
            >
              "हर माला एक संकल्प है — शुद्धता का, परंपरा का, और आपके विश्वास का।"
              <br />
              <span
                className="not-italic text-xs mt-1 block"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  color: "#7a5c44",
                  letterSpacing: "0.05em",
                }}
              >
                Every mala is a vow — of purity, tradition, and your trust.
              </span>
            </motion.p>
          </motion.div>

          {/* ════════════════════════════════════════════════════════════════
              RIGHT COLUMN — 2×2 Curved Image Grid
          ════════════════════════════════════════════════════════════════ */}
          <div ref={gridRef} className="relative">
            {/* Glow behind the grid */}
            <div
              className="pointer-events-none absolute inset-[-10%] rounded-full"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(212, 175, 55,0.13) 0%, transparent 75%)",
                filter: "blur(24px)",
              }}
            />

            {/* 2×2 grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-5 relative z-10">
              {factoryImages.map((image, index) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  inView={gridInView}
                />
              ))}
            </div>

            {/* Floating badge — "Handcrafted Since Generations" */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
              animate={
                gridInView
                  ? { opacity: 1, scale: 1, rotate: -6 }
                  : { opacity: 0, scale: 0.7, rotate: -12 }
              }
              transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-5 -left-5 z-20 px-4 py-2.5 flex flex-col items-center text-center"
              style={{
                background: "linear-gradient(135deg, #9B1B1B 0%, #D84315 100%)",
                borderRadius: "50%",
                width: "88px",
                height: "88px",
                justifyContent: "center",
                boxShadow:
                  "0 4px 20px rgba(155, 27, 27,0.35), 0 0 0 3px rgba(212, 175, 55,0.4), 0 0 0 6px rgba(212, 175, 55,0.12)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#D4AF37",
                  lineHeight: 1,
                }}
              >
                100%
              </span>
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.58rem",
                  color: "#FCF8F2",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  lineHeight: 1.3,
                  marginTop: "2px",
                }}
              >
                Pure
                <br />
                Handmade
              </span>
            </motion.div>

            {/* Floating "No Middlemen" ribbon */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -10 }}
              animate={
                gridInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 30, y: -10 }
              }
              transition={{ delay: 1.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-3 -right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,249,242,0.96)",
                border: "1.5px solid rgba(212, 175, 55,0.55)",
                boxShadow: "0 4px 16px rgba(155, 27, 27,0.12)",
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>✦</span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "0.78rem",
                  color: "#9B1B1B",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                }}
              >
                Zero Middlemen
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default History;