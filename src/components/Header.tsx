"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface HeaderProps {
  favCount?: number;
  cartCount?: number;
}

interface ActionButtonProps {
  children: React.ReactNode;
  label: string;
  count: number;
  countColor: string;
}

// ─── Icon Components ───────────────────────────────────────────────────────────

const HeartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
    style={{ width: 20, height: 20, flexShrink: 0 }}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    width="20"
    height="20"
    style={{ width: 20, height: 20, flexShrink: 0 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="16"
    height="16"
    style={{ width: 16, height: 16, flexShrink: 0 }}
  >
    <circle cx="11" cy="11" r="8" />
    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
  </svg>
);

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    width="20"
    height="20"
    style={{ width: 20, height: 20, flexShrink: 0 }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    width="16"
    height="16"
    style={{ width: 16, height: 16, flexShrink: 0 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const SparkleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="12"
    height="12"
    style={{ width: 12, height: 12, flexShrink: 0 }}
  >
    <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="16"
    height="16"
    style={{ width: 16, height: 16, flexShrink: 0 }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 12 12"
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    strokeLinecap="round"
    width="12"
    height="12"
    style={{ width: 12, height: 12 }}
  >
    <path d="M2 6l3 3 5-5" />
  </svg>
);

// ─── Placeholder cycling hook ──────────────────────────────────────────────────

const PLACEHOLDERS = [
  "Search Rudraksha malas…",
  "Find crystal bracelets…",
  "Explore chandan malas…",
  "Discover tulsi beads…",
  "Browse spiritual gifts…",
];

function useCyclingPlaceholder(active: boolean) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (active) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, [active]);

  return { text: PLACEHOLDERS[index], visible };
}

// ─── Reusable Action Button with Badge ────────────────────────────────────────

function ActionButton({ children, label, count, countColor }: ActionButtonProps) {
  return (
    <motion.button
      className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl group"
      whileHover={{ scale: 1.07, backgroundColor: "rgba(212,163,115,0.1)" }}
      whileTap={{ scale: 0.95 }}
      style={{ color: "#8b4513" }}
      aria-label={label}
      type="button"
    >
      <div className="relative">
        {children}
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{
                background: countColor,
                fontSize: "9px",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 700,
                minWidth: 16,
                minHeight: 16,
              }}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span
        className="text-[10px] font-medium hidden sm:block"
        style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif", letterSpacing: "0.04em" }}
      >
        {label}
      </span>
    </motion.button>
  );
}

// ─── Header Component ──────────────────────────────────────────────────────────

export default function Header({ favCount = 0, cartCount = 0 }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileEntered, setMobileEntered] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { text: placeholderText, visible: placeholderVisible } = useCyclingPlaceholder(searchFocused);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setMobileEntered(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // future: trigger search
  };

  return (
    <>
      {/* ── Google Fonts Import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap');

        .header-root {
          font-family: 'Jost', sans-serif;
        }
        .brand-title {
          font-family: 'Playfair Display', serif;
          letter-spacing: 0.08em;
        }
        .brand-subtitle {
          font-family: 'Cormorant Garamond', serif;
        }
        .divine-gradient {
          background: linear-gradient(135deg, #fdf6ec 0%, #fff8f0 50%, #fdf0e0 100%);
        }
        .header-border {
          background: linear-gradient(90deg, transparent, #d4a37366, #c8843a99, #d4a37366, transparent);
        }
        .om-divider {
          font-family: serif;
          color: #c8843a;
          font-size: 10px;
          opacity: 0.5;
        }
        .profile-shimmer {
          background: linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #8b4513 100%);
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .dropdown-glass {
          background: linear-gradient(145deg, rgba(255,252,245,0.98) 0%, rgba(253,246,236,0.98) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .phone-input-field {
          font-family: 'Jost', sans-serif;
          letter-spacing: 0.12em;
        }
        .send-otp-btn {
          background: linear-gradient(135deg, #8b4513, #a0522d);
          transition: all 0.3s ease;
        }
        .send-otp-btn:hover {
          background: linear-gradient(135deg, #a0522d, #c8843a);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(139,69,19,0.35);
        }
        .mandala-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a373' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='28'/%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .top-bar {
          background: linear-gradient(90deg, #6b2d0e, #8b4513, #6b2d0e);
        }
        /* Fix: prevent SVG overflow in search area */
        .search-icon-wrap svg,
        .action-btn svg {
          display: block;
          flex-shrink: 0;
        }
      `}</style>

      {/* ── Thin Top Announcement Bar ── */}
      <div className="top-bar py-1.5 px-4 text-center">
        <motion.p
          className="text-xs tracking-widest"
          style={{ color: "#fde8c8", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ✦ &nbsp; Free shipping on orders above ₹999 &nbsp; · &nbsp; 100% Authentic Handcrafted Malas &nbsp; ✦
        </motion.p>
      </div>

      {/* ── Main Header ── */}
      <header
        className="header-root divine-gradient relative"
        style={{ borderBottom: "1px solid rgba(212,163,115,0.25)" }}
      >
        {/* Subtle mandala texture */}
        <div className="absolute inset-0 mandala-bg opacity-60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">

            {/* ── LEFT: Branding ── */}
            <motion.div
              className="flex-shrink-0 cursor-pointer select-none"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="flex items-center gap-1.5 mb-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span style={{ color: "#c8843a", fontSize: "13px", fontFamily: "serif" }}>ॐ</span>
                <span className="om-divider">✦ ✦ ✦</span>
              </motion.div>

              <h1
                className="brand-title text-2xl sm:text-3xl font-black uppercase leading-none"
                style={{ color: "#8b4513", textShadow: "0 1px 2px rgba(139,69,19,0.15)" }}
              >
                MalaWale
              </h1>

              <motion.p
                className="brand-subtitle italic text-xs sm:text-sm font-medium leading-tight mt-0.5"
                style={{ color: "#d4a373", letterSpacing: "0.04em" }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                By Sanwariya Handicraft
              </motion.p>
            </motion.div>

            {/* ── CENTER: Search Bar ── */}
            <motion.div
              className="flex-1 max-w-lg hidden sm:block"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                {/* Outer glow ring */}
                <motion.div
                  className="absolute -inset-px rounded-full pointer-events-none"
                  animate={{
                    boxShadow: searchFocused
                      ? "0 0 0 2px rgba(212,163,115,0.55), 0 0 28px rgba(200,132,58,0.18)"
                      : "0 0 0 1px rgba(212,163,115,0.2)",
                  }}
                  transition={{ duration: 0.35 }}
                />

                {/* Search input container */}
                <div
                  className="flex items-center rounded-full overflow-hidden"
                  style={{
                    background: searchFocused ? "rgba(255,252,245,0.97)" : "rgba(255,252,245,0.8)",
                    border: "1px solid",
                    borderColor: searchFocused ? "rgba(212,163,115,0.6)" : "rgba(212,163,115,0.3)",
                    transition: "background 0.3s ease, border-color 0.3s ease",
                  }}
                >
                  {/* Search icon — fixed size wrapper */}
                  <motion.div
                    className="pl-4 pr-2 flex-shrink-0 flex items-center search-icon-wrap"
                    animate={{ color: searchFocused ? "#c8843a" : "#c8a07a" }}
                    transition={{ duration: 0.3 }}
                    style={{ lineHeight: 0 }}
                  >
                    <SearchIcon />
                  </motion.div>

                  {/* Input with animated placeholder */}
                  <div className="relative flex-1 py-2.5 pr-3 overflow-hidden">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="w-full bg-transparent outline-none text-sm relative z-10"
                      style={{
                        color: "#5c3317",
                        fontFamily: "'Jost', sans-serif",
                        fontWeight: 400,
                        letterSpacing: "0.02em",
                      }}
                      aria-label="Search products"
                    />
                    {/* Animated placeholder */}
                    <AnimatePresence mode="wait">
                      {!searchValue && !searchFocused && (
                        <motion.span
                          key={placeholderText}
                          className="absolute inset-0 flex items-center pointer-events-none text-sm"
                          style={{
                            color: "#c8a07a",
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: "italic",
                          }}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: placeholderVisible ? 1 : 0, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.35 }}
                        >
                          {placeholderText}
                        </motion.span>
                      )}
                      {!searchValue && searchFocused && (
                        <motion.span
                          key="focused-placeholder"
                          className="absolute inset-0 flex items-center pointer-events-none text-sm"
                          style={{
                            color: "#d4b896",
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: "italic",
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Type to search malas, beads, bracelets…
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Search button */}
                  <motion.button
                    type="submit"
                    className="m-1.5 px-4 py-1.5 rounded-full text-xs font-medium flex-shrink-0 flex items-center gap-1.5"
                    style={{
                      background: "linear-gradient(135deg, #8b4513, #c8843a)",
                      color: "#fde8c8",
                      fontFamily: "'Jost', sans-serif",
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                    }}
                    whileHover={{ scale: 1.04, boxShadow: "0 4px 14px rgba(139,69,19,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <SparkleIcon />
                    Search
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* ── RIGHT: Actions ── */}
            <motion.div
              className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Favorites */}
              <ActionButton label="Favourites" count={favCount} countColor="#e05c7a">
                <HeartIcon />
              </ActionButton>

              {/* Cart */}
              <ActionButton label="Cart" count={cartCount} countColor="#c8843a">
                <CartIcon />
              </ActionButton>

              {/* Divider */}
              <div
                className="w-px h-8 mx-1 hidden sm:block"
                style={{ background: "rgba(212,163,115,0.3)" }}
              />

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <motion.button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="relative flex flex-col items-center gap-0.5 group"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label="User profile"
                  type="button"
                >
                  {/* Avatar circle */}
                  <div className="relative">
                    <motion.div
                      className="w-9 h-9 rounded-full flex items-center justify-center profile-shimmer"
                      animate={profileOpen ? { scale: 1.08 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      style={{ color: "#fde8c8" }}
                    >
                      <UserIcon />
                    </motion.div>
                    {/* Online indicator dot */}
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: "#c8843a", borderColor: "#fdf6ec" }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-medium hidden sm:block"
                    style={{
                      color: "#8b4513",
                      fontFamily: "'Jost', sans-serif",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Login
                  </span>
                </motion.button>

                {/* ── Profile Dropdown ── */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-3 w-72 rounded-2xl shadow-2xl overflow-hidden dropdown-glass"
                      style={{
                        border: "1px solid rgba(212,163,115,0.3)",
                        boxShadow: "0 20px 60px rgba(139,69,19,0.15), 0 4px 16px rgba(139,69,19,0.1)",
                        zIndex: 999,
                      }}
                      initial={{ opacity: 0, y: -12, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    >
                      {/* Dropdown header */}
                      <div
                        className="px-5 py-4 relative overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg, #8b4513 0%, #a0522d 60%, #c8843a 100%)",
                        }}
                      >
                        <div
                          className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10"
                          style={{ background: "#fde8c8" }}
                        />
                        <div
                          className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
                          style={{ background: "#fde8c8" }}
                        />

                        <div className="relative flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                              background: "rgba(253,232,200,0.2)",
                              border: "2px solid rgba(253,232,200,0.4)",
                              color: "#fde8c8",
                            }}
                          >
                            <UserIcon />
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{
                                color: "#fde8c8",
                                fontFamily: "'Playfair Display', serif",
                              }}
                            >
                              Welcome, Devotee
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{
                                color: "rgba(253,232,200,0.7)",
                                fontFamily: "'Cormorant Garamond', serif",
                                fontStyle: "italic",
                              }}
                            >
                              Sign in to your sacred space
                            </p>
                          </div>
                        </div>

                        <div
                          className="absolute top-2 right-4 text-3xl font-serif opacity-10"
                          style={{ color: "#fde8c8" }}
                        >
                          ॐ
                        </div>
                      </div>

                      {/* Dropdown body */}
                      <div className="p-4">
                        <AnimatePresence mode="wait">
                          {!mobileEntered ? (
                            <motion.div
                              key="phone-entry"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.25 }}
                            >
                              <p
                                className="text-xs font-medium mb-3"
                                style={{
                                  color: "#8b4513",
                                  fontFamily: "'Jost', sans-serif",
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                }}
                              >
                                Login via Mobile Number
                              </p>

                              <div
                                className="flex items-center rounded-xl overflow-hidden mb-3"
                                style={{
                                  border: "1px solid rgba(212,163,115,0.4)",
                                  background: "#fff8f2",
                                }}
                              >
                                <div
                                  className="px-3 py-2.5 flex items-center gap-1.5 flex-shrink-0"
                                  style={{ borderRight: "1px solid rgba(212,163,115,0.3)" }}
                                >
                                  <span className="text-base">🇮🇳</span>
                                  <span
                                    className="text-sm font-medium"
                                    style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}
                                  >
                                    +91
                                  </span>
                                </div>
                                <input
                                  type="tel"
                                  maxLength={10}
                                  value={mobileNumber}
                                  onChange={(e) =>
                                    setMobileNumber(e.target.value.replace(/\D/g, ""))
                                  }
                                  placeholder="Enter mobile number"
                                  className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm phone-input-field"
                                  style={{ color: "#5c3317" }}
                                />
                                {mobileNumber.length === 10 && (
                                  <motion.div
                                    className="px-2"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                  >
                                    <div
                                      className="w-5 h-5 rounded-full flex items-center justify-center"
                                      style={{ background: "#22c55e" }}
                                    >
                                      <CheckIcon />
                                    </div>
                                  </motion.div>
                                )}
                              </div>

                              <motion.button
                                type="button"
                                className="send-otp-btn w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                                style={{
                                  color: "#fde8c8",
                                  fontFamily: "'Jost', sans-serif",
                                  letterSpacing: "0.06em",
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  mobileNumber.length === 10 && setMobileEntered(true)
                                }
                              >
                                <PhoneIcon />
                                Send OTP
                              </motion.button>

                              <div className="flex items-center gap-2 my-3">
                                <div
                                  className="flex-1 h-px"
                                  style={{ background: "rgba(212,163,115,0.25)" }}
                                />
                                <span
                                  className="text-xs"
                                  style={{
                                    color: "#c8a07a",
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontStyle: "italic",
                                  }}
                                >
                                  secure &amp; quick
                                </span>
                                <div
                                  className="flex-1 h-px"
                                  style={{ background: "rgba(212,163,115,0.25)" }}
                                />
                              </div>

                              <p
                                className="text-center text-xs"
                                style={{ color: "#c8a07a", fontFamily: "'Jost', sans-serif" }}
                              >
                                By signing in, you agree to our{" "}
                                <span
                                  className="underline cursor-pointer"
                                  style={{ color: "#8b4513" }}
                                >
                                  Terms
                                </span>{" "}
                                and{" "}
                                <span
                                  className="underline cursor-pointer"
                                  style={{ color: "#8b4513" }}
                                >
                                  Privacy Policy
                                </span>
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="otp-entry"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.25 }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <button
                                  type="button"
                                  onClick={() => setMobileEntered(false)}
                                  className="text-xs underline"
                                  style={{ color: "#c8843a" }}
                                >
                                  ← Change
                                </button>
                                <p
                                  className="text-xs"
                                  style={{
                                    color: "#8b4513",
                                    fontFamily: "'Jost', sans-serif",
                                  }}
                                >
                                  OTP sent to +91 {mobileNumber}
                                </p>
                              </div>

                              <p
                                className="text-xs font-medium mb-2"
                                style={{
                                  color: "#8b4513",
                                  fontFamily: "'Jost', sans-serif",
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                }}
                              >
                                Enter 6-digit OTP
                              </p>

                              <div className="flex gap-2 mb-3">
                                {[...Array(6)].map((_, i) => (
                                  <input
                                    key={i}
                                    type="text"
                                    maxLength={1}
                                    className="w-full aspect-square text-center text-base font-bold rounded-lg outline-none"
                                    style={{
                                      border: "1.5px solid rgba(212,163,115,0.4)",
                                      background: "#fff8f2",
                                      color: "#8b4513",
                                      fontFamily: "'Jost', sans-serif",
                                    }}
                                    onFocus={(e) =>
                                      ((e.target as HTMLInputElement).style.borderColor =
                                        "#c8843a")
                                    }
                                    onBlur={(e) =>
                                      ((e.target as HTMLInputElement).style.borderColor =
                                        "rgba(212,163,115,0.4)")
                                    }
                                    onInput={(e) => {
                                      const target = e.target as HTMLInputElement;
                                      if (
                                        target.value &&
                                        target.nextElementSibling instanceof HTMLElement
                                      ) {
                                        target.nextElementSibling.focus();
                                      }
                                    }}
                                  />
                                ))}
                              </div>

                              <motion.button
                                type="button"
                                className="send-otp-btn w-full py-2.5 rounded-xl text-sm font-medium"
                                style={{
                                  color: "#fde8c8",
                                  fontFamily: "'Jost', sans-serif",
                                  letterSpacing: "0.06em",
                                }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Verify &amp; Login ✦
                              </motion.button>

                              <p
                                className="text-center text-xs mt-2"
                                style={{ color: "#c8a07a" }}
                              >
                                Didn&apos;t receive?{" "}
                                <span
                                  className="underline cursor-pointer"
                                  style={{ color: "#8b4513" }}
                                >
                                  Resend OTP
                                </span>
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Quick links */}
                      <div className="px-4 pb-4 flex flex-col gap-1">
                        {["My Orders", "My Wishlist", "Track Parcel"].map((item) => (
                          <button
                            key={item}
                            type="button"
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                            style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLButtonElement).style.background =
                                "rgba(212,163,115,0.1)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLButtonElement).style.background =
                                "transparent")
                            }
                          >
                            <span>{item}</span>
                            <ChevronRightIcon />
                          </button>
                        ))}
                      </div>

                      {/* Bottom tag */}
                      <div className="px-4 pb-3 text-center">
                        <p
                          className="text-xs"
                          style={{
                            color: "rgba(200,132,58,0.6)",
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: "italic",
                          }}
                        >
                          ✦ &nbsp; Handcrafted with devotion &nbsp; ✦
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ── Mobile Search Bar ── */}
          <div className="pb-3 sm:hidden">
            <form onSubmit={handleSearchSubmit}>
              <div
                className="flex items-center rounded-full px-3 py-2"
                style={{
                  background: "rgba(255,252,245,0.9)",
                  border: "1px solid rgba(212,163,115,0.35)",
                }}
              >
                <div style={{ color: "#c8843a", lineHeight: 0 }}>
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search malas, bracelets…"
                  className="flex-1 mx-2 bg-transparent outline-none text-sm"
                  style={{ color: "#5c3317", fontFamily: "'Jost', sans-serif" }}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Bottom gradient border line */}
        <div className="header-border h-px w-full" />
      </header>
    </>
  );
}