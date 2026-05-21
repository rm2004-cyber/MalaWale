import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, useInView, type Variants, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface NavLink {
  label: string;
  href: string;
}

interface FeedbackForm {
  name: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────
const quickLinks: NavLink[] = [
  { label: "All Products", href: "#products" },
  { label: "Rudraksh Malas", href: "#rudraksh" },
  { label: "Premium Bracelets", href: "#bracelets" },
  { label: "Sphatik / Crystal", href: "#crystal" },
  { label: "Our Legacy Story", href: "#history" },
];

// ─────────────────────────────────────────────────────────────────────────────
// INLINE SVG ICONS
// ─────────────────────────────────────────────────────────────────────────────
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3.05 4.11a1 1 0 011.41-.07l2.83 2.45a1 1 0 01.11 1.37l-1.1 1.45a9.1 9.1 0 004.36 4.36l1.45-1.1a1 1 0 011.37.11l2.45 2.83a1 1 0 01-.07 1.41l-1.56 1.44A2 2 0 0112.5 18C7.25 18 2 12.75 2 7.5a2 2 0 01.6-1.44L3.05 4.1z"
      stroke="#d4a373" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="#d4a373" strokeWidth="1.4" />
    <path d="M2 7l8 5 8-5" stroke="#d4a373" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z" stroke="#d4a373" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="10" cy="8" r="2" stroke="#d4a373" strokeWidth="1.4" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#d4a373" fillOpacity="0.85" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.046 21.5l4.438-1.363A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
      stroke="#d4a373" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Decorative asterism ornament
const Asterism = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1 L7.9 5.6 L12 3 L9.4 7.1 L14 8 L9.4 8.9 L12 13 L7.9 10.4 L7 15 L6.1 10.4 L2 13 L4.6 8.9 L0 8 L4.6 7.1 L2 3 L6.1 5.6 Z"
      fill="#d4a373" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const trustBannerVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0.92 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
  },
};

const linkHoverVariants: Variants = {
  rest: { x: 0, color: "rgba(255,249,242,0.72)" },
  hover: { x: 6, color: "#d4a373", transition: { duration: 0.22, ease: "easeOut" } },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Thin gold section divider with central ornament */
const GoldDivider = () => (
  <div className="flex items-center gap-3 my-4" aria-hidden="true">
    <div className="h-px flex-1" style={{ background: "rgba(212,163,115,0.3)" }} />
    <Asterism size={10} />
    <div className="h-px flex-1" style={{ background: "rgba(212,163,115,0.3)" }} />
  </div>
);

/** Column heading */
const ColHeading = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="mb-5 uppercase tracking-widest"
    style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "0.72rem",
      color: "#d4a373",
      letterSpacing: "0.26em",
      fontWeight: 600,
    }}
  >
    {children}
  </h3>
);

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN 1 — Brand Identity
// ─────────────────────────────────────────────────────────────────────────────
const BrandColumn = () => (
  <motion.div variants={columnVariants} className="flex flex-col">
    <ColHeading>Sacred Creations</ColHeading>

    {/* Logo wordmark */}
    <div className="mb-3">
      <h2
        className="leading-none"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)",
          fontWeight: 700,
          color: "#fff9f2",
          letterSpacing: "0.12em",
        }}
      >
        MALA WALE
      </h2>
      <p
        className="mt-1"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "0.88rem",
          color: "#d4a373",
          letterSpacing: "0.16em",
          fontStyle: "italic",
        }}
      >
        By Sanwariya Handicraft
      </p>
    </div>

    <GoldDivider />

    {/* Tagline */}
    <p
      className="leading-relaxed mb-6"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.01rem",
        color: "rgba(255,249,242,0.75)",
        lineHeight: 1.75,
        fontStyle: "italic",
      }}
    >
      Shuddhata Aur Parampara — Handcrafted with absolute devotion to bring divine energy into your life.
    </p>

    {/* Social row */}
    <div className="flex items-center gap-3 mt-auto">
      {(["FB", "IG", "YT", "WA"] as const).map((s) => (
        <motion.a
          key={s}
          href="#"
          aria-label={s}
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium cursor-pointer"
          style={{
            background: "rgba(212,163,115,0.12)",
            border: "1px solid rgba(212,163,115,0.3)",
            color: "#d4a373",
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.62rem",
            letterSpacing: "0.05em",
          }}
        >
          {s}
        </motion.a>
      ))}
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN 2 — Quick Links
// ─────────────────────────────────────────────────────────────────────────────
const QuickLinksColumn = () => (
  <motion.div variants={columnVariants} className="flex flex-col">
    <ColHeading>Navigate</ColHeading>
    <nav aria-label="Footer navigation">
      <ul className="flex flex-col gap-1.5">
        {quickLinks.map((link) => (
          <li key={link.label}>
            <motion.a
              href={link.href}
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={linkHoverVariants}
              className="flex items-center gap-2.5 py-1.5 group"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.9rem",
                color: "rgba(255,249,242,0.72)",
                textDecoration: "none",
                letterSpacing: "0.03em",
              }}
            >
              {/* Animated indicator */}
              <motion.span
                variants={{
                  rest: { opacity: 0, width: 0 },
                  hover: { opacity: 1, width: 14, transition: { duration: 0.2 } },
                }}
                className="inline-block h-px rounded-full flex-shrink-0"
                style={{ background: "#d4a373" }}
              />
              <motion.span
                variants={{
                  rest: { color: "rgba(255,249,242,0.72)" },
                  hover: { color: "#d4a373" },
                }}
              >
                {link.label}
              </motion.span>
            </motion.a>
          </li>
        ))}
      </ul>
    </nav>

    <GoldDivider />

    {/* Policies */}
    <ColHeading>Policies</ColHeading>
    <ul className="flex flex-col gap-1.5">
      {["Privacy Policy", "Return & Refund", "Shipping Policy", "Terms of Use"].map((p) => (
        <li key={p}>
          <motion.a
            href="#"
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={linkHoverVariants}
            className="flex items-center gap-2.5 py-1"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.82rem",
              color: "rgba(255,249,242,0.52)",
              textDecoration: "none",
            }}
          >
            <motion.span
              variants={{
                rest: { opacity: 0, width: 0 },
                hover: { opacity: 1, width: 10, transition: { duration: 0.18 } },
              }}
              className="inline-block h-px rounded-full flex-shrink-0"
              style={{ background: "#d4a373" }}
            />
            {p}
          </motion.a>
        </li>
      ))}
    </ul>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN 3 — Contact & Location
// ─────────────────────────────────────────────────────────────────────────────
const ContactColumn = () => {
  const contactItems = [
    {
      icon: <PhoneIcon />,
      label: "Call / WhatsApp",
      value: "+91 98765 43210",
      href: "tel:+919876543210",
    },
    {
      icon: <WhatsAppIcon />,
      label: "WhatsApp Orders",
      value: "+91 98765 43210",
      href: "https://wa.me/919876543210",
    },
    {
      icon: <EmailIcon />,
      label: "Email Us",
      value: "hello@malawale.in",
      href: "mailto:hello@malawale.in",
    },
    {
      icon: <LocationIcon />,
      label: "Workshop & Unit",
      value: "Sanwariya Handicraft, Sector 22-C, Chandigarh, Punjab — 160022, India",
      href: "#",
    },
  ];

  return (
    <motion.div variants={columnVariants} className="flex flex-col">
      <ColHeading>Connect With Us</ColHeading>
      <ul className="flex flex-col gap-4">
        {contactItems.map((item) => (
          <li key={item.label}>
            <motion.a
              href={item.href}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 group"
              style={{ textDecoration: "none" }}
              aria-label={item.label}
            >
              <span
                className="flex-shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg"
                style={{
                  background: "rgba(212,163,115,0.10)",
                  border: "1px solid rgba(212,163,115,0.22)",
                }}
              >
                {item.icon}
              </span>
              <div>
                <p
                  className="leading-none mb-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "0.7rem",
                    color: "#d4a373",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.87rem",
                    color: "rgba(255,249,242,0.8)",
                    lineHeight: 1.55,
                  }}
                >
                  {item.value}
                </p>
              </div>
            </motion.a>
          </li>
        ))}
      </ul>

      <GoldDivider />

      {/* Hours badge */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-1"
        style={{
          background: "rgba(212,163,115,0.08)",
          border: "1px solid rgba(212,163,115,0.2)",
        }}
      >
        <span style={{ color: "#d4a373", fontSize: "1rem" }}>◷</span>
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.7rem", color: "#d4a373", letterSpacing: "0.12em", textTransform: "uppercase" }}>Workshop Hours</p>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "rgba(255,249,242,0.7)" }}>Mon – Sat · 9:00 AM to 6:30 PM IST</p>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN 4 — Feedback Form
// ─────────────────────────────────────────────────────────────────────────────
const FeedbackColumn = () => {
  const [form, setForm] = useState<FeedbackForm>({ name: "", message: "" });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", message: "" });
    }, 3500);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.875rem",
    color: "#fff9f2",
    background: "rgba(255,249,242,0.05)",
    border: `1px solid ${focused === field ? "rgba(212,163,115,0.7)" : "rgba(212,163,115,0.2)"}`,
    borderRadius: "10px",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.25s ease, box-shadow 0.25s ease",
    boxShadow: focused === field ? "0 0 0 3px rgba(212,163,115,0.08)" : "none",
    resize: "none" as const,
    letterSpacing: "0.02em",
  });

  return (
    <motion.div variants={columnVariants} className="flex flex-col">
      <ColHeading>Sacred Feedback</ColHeading>

      <p
        className="mb-4 leading-relaxed"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "0.95rem",
          color: "rgba(255,249,242,0.65)",
          fontStyle: "italic",
          lineHeight: 1.65,
        }}
      >
        Share your blessings, experience, or suggestions with our artisan family.
      </p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl text-center"
            style={{
              background: "rgba(212,163,115,0.09)",
              border: "1px solid rgba(212,163,115,0.28)",
            }}
          >
            <div
              className="text-3xl mb-3"
              style={{ filter: "drop-shadow(0 0 8px rgba(212,163,115,0.5))" }}
            >
              🙏
            </div>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.05rem",
                color: "#d4a373",
                letterSpacing: "0.02em",
              }}
            >
              Dhanyavaad!
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "0.88rem",
                color: "rgba(255,249,242,0.6)",
                fontStyle: "italic",
                marginTop: "4px",
              }}
            >
              Your blessings have been received.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="form"
            aria-label="Feedback form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              placeholder="Your name (e.g. Ramesh Ji)"
              autoComplete="name"
              style={inputStyle("name")}
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
              placeholder="Your blessing, review, or suggestion..."
              rows={4}
              style={inputStyle("message")}
            />

            <motion.button
              type="button"
              onClick={(e) => {
                // Trigger the form's onSubmit via the div
                const syntheticEvent = Object.create(e);
                syntheticEvent.preventDefault = e.preventDefault.bind(e);
                handleSubmit(syntheticEvent as unknown as FormEvent<HTMLDivElement>);
              }}
              whileHover={{ scale: 1.025, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium cursor-pointer"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.875rem",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #c8843a 0%, #a0522d 100%)",
                color: "#fff9f2",
                border: "1px solid rgba(212,163,115,0.35)",
                boxShadow: "0 4px 18px rgba(200,132,58,0.28), 0 1px 0 rgba(255,249,242,0.08) inset",
                transition: "box-shadow 0.25s ease",
              }}
            >
              <span>Submit Feedback</span>
              <span style={{ color: "#d4a373", fontSize: "0.8rem" }}>✦</span>
            </motion.button>

            <p
              className="text-center"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "0.72rem",
                color: "rgba(255,249,242,0.35)",
                fontStyle: "italic",
                letterSpacing: "0.06em",
              }}
            >
              We read every message with gratitude 🙏
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TRUST BANNER
// ─────────────────────────────────────────────────────────────────────────────
const TrustBanner = ({ inView }: { inView: boolean }) => (
  <motion.div
    variants={trustBannerVariants}
    initial="hidden"
    animate={inView ? "visible" : "hidden"}
    className="w-full rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
    style={{
      background: "linear-gradient(135deg, rgba(212,163,115,0.10) 0%, rgba(139,69,19,0.25) 100%)",
      border: "1px solid rgba(212,163,115,0.28)",
      boxShadow: "0 2px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(212,163,115,0.12)",
    }}
  >
    {/* Factory badge */}
    <div
      className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
      style={{
        background: "rgba(212,163,115,0.12)",
        border: "1px solid rgba(212,163,115,0.3)",
        fontSize: "1.5rem",
      }}
      aria-hidden="true"
    >
      🏭
    </div>

    <div className="flex-1">
      <p
        className="mb-1"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "0.7rem",
          color: "#d4a373",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        Factory Direct · Raw Material Source
      </p>
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.875rem",
          color: "rgba(255,249,242,0.8)",
          lineHeight: 1.6,
          letterSpacing: "0.01em",
        }}
      >
        <strong style={{ color: "#d4a373" }}>100% genuine products</strong> constructed directly
        from raw woods and pure stones. Crafted carefully inside{" "}
        <em style={{ color: "#fff9f2" }}>Sanwariya Handicraft</em> units — without a single
        third-party distributor, ever.
      </p>
    </div>

    {/* Verified mark */}
    <div
      className="flex-shrink-0 flex flex-col items-center justify-center px-4 py-3 rounded-xl"
      style={{
        background: "rgba(212,163,115,0.10)",
        border: "1px solid rgba(212,163,115,0.22)",
      }}
    >
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#d4a373",
          lineHeight: 1,
        }}
      >
        ✓
      </span>
      <span
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.58rem",
          color: "rgba(255,249,242,0.5)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: "3px",
        }}
      >
        Verified
      </span>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FOOTER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);
  const inView = useInView(footerRef, { once: true, margin: "-60px" });
  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      aria-label="MalaWale site footer"
      className="relative w-full overflow-hidden"
      style={{ background: "#8b4513" }}
    >
      {/* ── Top decorative gold border ─────────────────────────────────── */}
      <div
        className="w-full"
        style={{
          height: "5px",
          background: "linear-gradient(90deg, transparent 0%, #d4a373 20%, #f0c880 50%, #d4a373 80%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Thin secondary line beneath ───────────────────────────────── */}
      <div
        className="w-full"
        style={{
          height: "1px",
          background: "rgba(212,163,115,0.18)",
        }}
        aria-hidden="true"
      />

      {/* ── Ambient background glows ──────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 15% 30%, rgba(212,163,115,0.07) 0%, transparent 65%), " +
            "radial-gradient(ellipse 50% 60% at 85% 70%, rgba(160,82,45,0.18) 0%, transparent 65%)",
        }}
      />

      {/* ── OM watermark ──────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(14rem, 30vw, 28rem)",
            color: "rgba(212,163,115,0.045)",
            lineHeight: 1,
            userSelect: "none",
            transform: "translateY(8%)",
          }}
        >
          ॐ
        </span>
      </div>

      {/* ── Dot grid texture overlay ───────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, #d4a373 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-14 pt-14 pb-8">

        {/* 4-Column Grid */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 xl:gap-12"
        >
          <BrandColumn />
          <QuickLinksColumn />
          <ContactColumn />
          <FeedbackColumn />
        </motion.div>

        {/* ── Top divider before trust banner ───────────────────────── */}
        <div
          className="w-full my-10"
          style={{ height: "1px", background: "rgba(212,163,115,0.18)" }}
          aria-hidden="true"
        />

        {/* Trust Banner */}
        <TrustBanner inView={inView} />

        {/* ── Bottom divider ─────────────────────────────────────────── */}
        <div
          className="w-full mt-8 mb-6"
          style={{ height: "1px", background: "rgba(212,163,115,0.14)" }}
          aria-hidden="true"
        />

        {/* ── Copyright bar ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.78rem",
              color: "rgba(255,249,242,0.42)",
              letterSpacing: "0.04em",
            }}
          >
            © {currentYear} MalaWale — Sanwariya Handicraft. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <Asterism size={10} />
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "0.82rem",
                color: "rgba(212,163,115,0.55)",
                fontStyle: "italic",
                letterSpacing: "0.05em",
              }}
            >
              Crafted with Devotion · Delivered with Blessings
            </p>
            <Asterism size={10} />
          </div>

          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.72rem",
              color: "rgba(255,249,242,0.28)",
              letterSpacing: "0.04em",
            }}
          >
            Made in Bharat 🇮🇳
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;