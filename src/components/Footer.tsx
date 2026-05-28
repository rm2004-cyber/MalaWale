import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { motion, useInView, type Variants, AnimatePresence } from "framer-motion";
import { categoryService, feedbackService } from "../utils/service";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface NavLink {
  label: string;
  href: string;
  categoryId?: string; // MongoDB _id for filtering
}

interface FeedbackForm {
  name: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC FALLBACK DATA
// ─────────────────────────────────────────────────────────────────────────────
const quickLinks: NavLink[] = [
  { label: "All Products", href: "#", categoryId: "all" },
  { label: "Rudraksh Malas", href: "#", categoryId: "rudraksh" },
  { label: "Premium Bracelets", href: "#", categoryId: "bracelets" },
  { label: "Sphatik / Crystal", href: "#", categoryId: "crystal" },
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
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="#d4a373" strokeWidth="1.4" />
    <path d="M2 7l8 5 8-5" stroke="#d4a373" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z" stroke="#d4a373" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="10" cy="8" r="2" stroke="#d4a373" strokeWidth="1.4" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#d4a373" fillOpacity="0.85" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.046 21.5l4.438-1.363A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
      stroke="#d4a373" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const Asterism = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1 L7.9 5.6 L12 3 L9.4 7.1 L14 8 L9.4 8.9 L12 13 L7.9 10.4 L7 15 L6.1 10.4 L2 13 L4.6 8.9 L0 8 L4.6 7.1 L2 3 L6.1 5.6 Z" fill="#d4a373" />
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};
const trustBannerVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0.92 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 } },
};
const linkHoverVariants: Variants = {
  rest: { x: 0 },
  hover: { x: 6, transition: { duration: 0.22, ease: "easeOut" } },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const GoldDivider = () => (
  <div className="flex items-center gap-3 my-4" aria-hidden="true">
    <div className="h-px flex-1" style={{ background: "rgba(212,163,115,0.3)" }} />
    <Asterism size={10} />
    <div className="h-px flex-1" style={{ background: "rgba(212,163,115,0.3)" }} />
  </div>
);

const ColHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-5 uppercase tracking-widest" style={{
    fontFamily: "'Cormorant Garamond', serif", fontSize: "0.72rem",
    color: "#d4a373", letterSpacing: "0.26em", fontWeight: 600,
  }}>
    {children}
  </h3>
);

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN 1 — Brand
// ─────────────────────────────────────────────────────────────────────────────
const BrandColumn = () => (
  <motion.div variants={columnVariants} className="flex flex-col">
    <ColHeading>Sacred Creations</ColHeading>
    <div className="mb-3">
      <h2 className="leading-none" style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 700,
        color: "#fff9f2", letterSpacing: "0.12em",
      }}>MALA WALE</h2>
      <p className="mt-1" style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: "0.88rem",
        color: "#d4a373", letterSpacing: "0.16em", fontStyle: "italic",
      }}>By Sanwariya Handicraft</p>
    </div>
    <GoldDivider />
    <p className="leading-relaxed mb-6" style={{
      fontFamily: "'Cormorant Garamond', serif", fontSize: "1.01rem",
      color: "rgba(255,249,242,0.75)", lineHeight: 1.75, fontStyle: "italic",
    }}>
      Shuddhata Aur Parampara — Handcrafted with absolute devotion to bring divine energy into your life.
    </p>
    <div className="flex items-center gap-3 mt-auto">
      {(["FB", "IG", "YT", "WA"] as const).map((s) => (
        <motion.a key={s} href="#" aria-label={s} whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.95 }}
          className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium cursor-pointer"
          style={{ background: "rgba(212,163,115,0.12)", border: "1px solid rgba(212,163,115,0.3)", color: "#d4a373", fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "0.05em" }}>
          {s}
        </motion.a>
      ))}
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN 2 — Quick Links (live categories + scroll/filter on click)
// ─────────────────────────────────────────────────────────────────────────────

/** Scrolls to the products section smoothly */
function scrollToProducts() {
  const el = document.getElementById("featured-products-section");
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

interface QuickLinksColumnProps {
  onCategorySelect?: (categoryId: string) => void;
}

const QuickLinksColumn = ({ onCategorySelect }: QuickLinksColumnProps) => {
  const [categories, setCategories] = useState<NavLink[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetch_ = async () => {
      try {
        const response = await categoryService.getCategories();
        const raw: unknown[] =
          response?.data?.categories ??
          response?.data?.data ??
          (Array.isArray(response?.data) ? response.data : []);

        if (!isMounted) return;

        if (Array.isArray(raw) && raw.length > 0) {
          const normalised: NavLink[] = raw.map((item) => {
            const r = item as Record<string, unknown>;
            const id = (r._id as string) || (r.id as string) || "";
            const label = (r.name as string) || (r.title as string) || "Category";
            return { label, href: "#", categoryId: id };
          });
          setCategories(normalised);
        } else {
          setCategories(quickLinks);
        }
      } catch {
        if (!isMounted) return;
        setCategories(quickLinks);
      }
    };
    fetch_();
    return () => { isMounted = false; };
  }, []);

  const displayLinks = categories.length > 0 ? categories : quickLinks;

  const handleLinkClick = (e: React.MouseEvent, link: NavLink) => {
    e.preventDefault();
    if (link.categoryId) {
      // Tell App.tsx to filter by this category
      onCategorySelect?.(link.categoryId);
      // Scroll to products grid
      setTimeout(scrollToProducts, 80);
    } else if (link.href && link.href !== "#") {
      // Normal anchor (e.g. #history)
      const target = document.querySelector(link.href);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div variants={columnVariants} className="flex flex-col">
      <ColHeading>Navigate</ColHeading>
      <nav aria-label="Footer navigation">
        <ul className="flex flex-col gap-1.5">
          {displayLinks.map((link) => (
            <li key={link.label}>
              <motion.a
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                initial="rest"
                whileHover="hover"
                animate="rest"
                variants={linkHoverVariants}
                className="flex items-center gap-2.5 py-1.5 cursor-pointer"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", color: "rgba(255,249,242,0.72)", textDecoration: "none", letterSpacing: "0.03em" }}
              >
                <motion.span
                  variants={{ rest: { opacity: 0, width: 0 }, hover: { opacity: 1, width: 14, transition: { duration: 0.2 } } }}
                  className="inline-block h-px rounded-full flex-shrink-0"
                  style={{ background: "#d4a373" }}
                />
                <motion.span variants={{ rest: { color: "rgba(255,249,242,0.72)" }, hover: { color: "#d4a373" } }}>
                  {link.label}
                </motion.span>
              </motion.a>
            </li>
          ))}
        </ul>
      </nav>

      <GoldDivider />

      <ColHeading>Policies</ColHeading>
      <ul className="flex flex-col gap-1.5">
        {["Privacy Policy", "Return & Refund", "Shipping Policy", "Terms of Use"].map((p) => (
          <li key={p}>
            <motion.a href="#" initial="rest" whileHover="hover" animate="rest" variants={linkHoverVariants}
              className="flex items-center gap-2.5 py-1"
              style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "rgba(255,249,242,0.85)", textDecoration: "none" }}>
              <motion.span
                variants={{ rest: { opacity: 0, width: 0 }, hover: { opacity: 1, width: 10, transition: { duration: 0.18 } } }}
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
};

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN 3 — Contact
// ─────────────────────────────────────────────────────────────────────────────
const ContactColumn = () => {
  const contactItems = [
    { icon: <PhoneIcon />, label: "Call / WhatsApp", value: "+91 98765 43210", href: "tel:+919876543210" },
    { icon: <WhatsAppIcon />, label: "WhatsApp Orders", value: "+91 98765 43210", href: "https://wa.me/919876543210" },
    { icon: <EmailIcon />, label: "Email Us", value: "hello@malawale.in", href: "mailto:hello@malawale.in" },
    { icon: <LocationIcon />, label: "Workshop & Unit", value: "Sanwariya Handicraft, Sector 22-C, Chandigarh, Punjab — 160022, India", href: "#" },
  ];
  return (
    <motion.div variants={columnVariants} className="flex flex-col">
      <ColHeading>Connect With Us</ColHeading>
      <ul className="flex flex-col gap-4">
        {contactItems.map((item) => (
          <li key={item.label}>
            <motion.a href={item.href} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}
              className="flex items-start gap-3 group" style={{ textDecoration: "none" }} aria-label={item.label}>
              <span className="flex-shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ background: "rgba(212,163,115,0.10)", border: "1px solid rgba(212,163,115,0.22)" }}>
                {item.icon}
              </span>
              <div>
                <p className="leading-none mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.7rem", color: "#d4a373", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.87rem", color: "rgba(255,249,242,0.8)", lineHeight: 1.55 }}>
                  {item.value}
                </p>
              </div>
            </motion.a>
          </li>
        ))}
      </ul>
      <GoldDivider />
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-1"
        style={{ background: "rgba(212,163,115,0.08)", border: "1px solid rgba(212,163,115,0.2)" }}>
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
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await feedbackService.submitFeedback({ name: form.name.trim(), message: form.message.trim() });
      setSubmitted(true);
      setForm({ name: "", message: "" });
      setTimeout(() => setSubmitted(false), 3500);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: "#fff9f2",
    background: "rgba(255,249,242,0.05)",
    border: `1px solid ${focused === field ? "rgba(212,163,115,0.7)" : "rgba(212,163,115,0.2)"}`,
    borderRadius: "10px", padding: "10px 14px", width: "100%", outline: "none",
    transition: "border-color 0.25s ease, box-shadow 0.25s ease",
    boxShadow: focused === field ? "0 0 0 3px rgba(212,163,115,0.08)" : "none",
    resize: "none" as const, letterSpacing: "0.02em",
  });

  return (
    <motion.div variants={columnVariants} className="flex flex-col">
      <ColHeading>Sacred Feedback</ColHeading>
      <p className="mb-4 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "rgba(255,249,242,0.65)", fontStyle: "italic", lineHeight: 1.65 }}>
        Share your blessings, experience, or suggestions with our artisan family.
      </p>
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.88, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl text-center"
            style={{ background: "rgba(212,163,115,0.09)", border: "1px solid rgba(212,163,115,0.28)" }}>
            <div className="text-3xl mb-3" style={{ filter: "drop-shadow(0 0 8px rgba(212,163,115,0.5))" }}>🙏</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", color: "#d4a373" }}>Dhanyavaad!</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.88rem", color: "rgba(255,249,242,0.6)", fontStyle: "italic", marginTop: "4px" }}>
              Your blessings have been received.
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-3">
            <input type="text" name="name" value={form.name} onChange={handleChange}
              onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
              placeholder="Your name (e.g. Ramesh Ji)" autoComplete="name"
              disabled={isSubmitting} style={inputStyle("name")} />
            <textarea name="message" value={form.message} onChange={handleChange}
              onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
              placeholder="Your blessing, review, or suggestion..." rows={4}
              disabled={isSubmitting} style={inputStyle("message")} />
            <AnimatePresence>
              {submitError && (
                <motion.p key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}
                  style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "#f08080", letterSpacing: "0.02em", marginTop: "-4px" }}>
                  {submitError}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button type="button" onClick={() => handleSubmit()}
              whileHover={isSubmitting ? {} : { scale: 1.025, y: -1 }}
              whileTap={isSubmitting ? {} : { scale: 0.97 }}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium"
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", letterSpacing: "0.07em", textTransform: "uppercase",
                background: isSubmitting ? "rgba(200,132,58,0.45)" : "linear-gradient(135deg, #c8843a 0%, #a0522d 100%)",
                color: "#fff9f2", border: "1px solid rgba(212,163,115,0.35)",
                boxShadow: isSubmitting ? "none" : "0 4px 18px rgba(200,132,58,0.28), 0 1px 0 rgba(255,249,242,0.08) inset",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}>
              {isSubmitting ? (
                <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                  style={{ display: "inline-block", fontSize: "0.8rem" }}>✦</motion.span><span>Sending…</span></>
              ) : (
                <><span>Submit Feedback</span><span style={{ color: "#d4a373", fontSize: "0.8rem" }}>✦</span></>
              )}
            </motion.button>
            <p className="text-center" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.72rem", color: "rgba(255,249,242,0.35)", fontStyle: "italic", letterSpacing: "0.06em" }}>
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
  <motion.div variants={trustBannerVariants} initial="hidden" animate={inView ? "visible" : "hidden"}
    className="w-full rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
    style={{ background: "linear-gradient(135deg, rgba(212,163,115,0.10) 0%, rgba(139,69,19,0.25) 100%)", border: "1px solid rgba(212,163,115,0.28)", boxShadow: "0 2px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(212,163,115,0.12)" }}>
    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
      style={{ background: "rgba(212,163,115,0.12)", border: "1px solid rgba(212,163,115,0.3)", fontSize: "1.5rem" }}>🏭</div>
    <div className="flex-1">
      <p className="mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.7rem", color: "#d4a373", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600 }}>
        Factory Direct · Raw Material Source
      </p>
      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: "rgba(255,249,242,0.8)", lineHeight: 1.6, letterSpacing: "0.01em" }}>
        <strong style={{ color: "#d4a373" }}>100% genuine products</strong> constructed directly from raw woods and pure stones. Crafted carefully inside{" "}
        <em style={{ color: "#fff9f2" }}>Sanwariya Handicraft</em> units — without a single third-party distributor, ever.
      </p>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FOOTER
// ─────────────────────────────────────────────────────────────────────────────
interface FooterProps {
  /** Called when user clicks a category link — pass category _id or "all" */
  onCategorySelect?: (categoryId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onCategorySelect }) => {
  const footerRef = useRef<HTMLElement>(null);
  const inView = useInView(footerRef, { once: true, margin: "-60px" });
  const currentYear = new Date().getFullYear();

  return (
    <footer ref={footerRef} aria-label="MalaWale site footer" className="relative w-full overflow-hidden" style={{ background: "#8b4513" }}>
      <div className="w-full" style={{ height: "5px", background: "linear-gradient(90deg, transparent 0%, #d4a373 20%, #f0c880 50%, #d4a373 80%, transparent 100%)" }} />
      <div className="w-full" style={{ height: "1px", background: "rgba(212,163,115,0.18)" }} />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 15% 30%, rgba(212,163,115,0.07) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 85% 70%, rgba(160,82,45,0.18) 0%, transparent 65%)" }} />
      {/* OM watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(14rem, 30vw, 28rem)", color: "rgba(212,163,115,0.045)", lineHeight: 1, userSelect: "none", transform: "translateY(8%)" }}>ॐ</span>
      </div>
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, #d4a373 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-14 pt-14 pb-8">
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 xl:gap-12">
          <BrandColumn />
          {/* Pass onCategorySelect so links can trigger filter */}
          <QuickLinksColumn onCategorySelect={onCategorySelect} />
          <ContactColumn />
          <FeedbackColumn />
        </motion.div>

        <div className="w-full my-10" style={{ height: "1px", background: "rgba(212,163,115,0.18)" }} />
        <TrustBanner inView={inView} />
        <div className="w-full mt-8 mb-6" style={{ height: "1px", background: "rgba(212,163,115,0.14)" }} />

        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "rgba(255,249,242,0.85)", letterSpacing: "0.04em" }}>
            © {currentYear} MalaWale — Sanwariya Handicraft. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <Asterism size={10} />
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.82rem", color: "rgba(212,163,115,0.85)", fontStyle: "italic", letterSpacing: "0.05em" }}>
              Crafted with Devotion · Delivered with Blessings
            </p>
            <Asterism size={10} />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(212,163,115,0.10)", border: "1px solid rgba(212,163,115,0.22)" }}>
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-label="Indian flag" role="img" style={{ borderRadius: "2px", flexShrink: 0 }}>
              <rect width="22" height="5.33" fill="#FF9933" />
              <rect y="5.33" width="22" height="5.34" fill="#FFFFFF" />
              <rect y="10.67" width="22" height="5.33" fill="#138808" />
              <circle cx="11" cy="8" r="2.4" stroke="#000080" strokeWidth="0.55" fill="none" />
              <circle cx="11" cy="8" r="0.4" fill="#000080" />
              {Array.from({ length: 24 }).map((_, i) => {
                const rad = (i * 360 / 24 * Math.PI) / 180;
                return <line key={i} x1={11 + 0.4 * Math.cos(rad)} y1={8 + 0.4 * Math.sin(rad)} x2={11 + 2.4 * Math.cos(rad)} y2={8 + 2.4 * Math.sin(rad)} stroke="#000080" strokeWidth="0.3" />;
              })}
            </svg>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "#fdf7f0", letterSpacing: "0.06em", fontWeight: 500 }}>Made in Bharat</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;