"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AuthStep = "phone" | "register" | "otp" | "authenticated";
type ActiveModalWindow = "none" | "orders" | "wishlist";

interface UserProfile {
  name: string;
  email: string;
  dob: string;
}

interface HeaderProps {
  favCount?: number;
  cartCount?: number;
}

interface ActionButtonProps {
  children: React.ReactNode;
  label: string;
  count: number;
  countColor: string;
  onClick?: () => void;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_WISHLIST = [
  {
    id: 1,
    name: "5-Mukhi Rudraksha Mala",
    subtitle: "108 beads • Nepal Origin",
    price: 1299,
    originalPrice: 1899,
    image: "🔴",
    tag: "Bestseller",
  },
  {
    id: 2,
    name: "Rose Quartz Crystal Bracelet",
    subtitle: "Certified • 12mm beads",
    price: 849,
    originalPrice: 1200,
    image: "💗",
    tag: "Trending",
  },
  {
    id: 3,
    name: "Tulsi Mala with Silver Guru Bead",
    subtitle: "108+1 beads • Vrindavan",
    price: 599,
    originalPrice: 899,
    image: "🟢",
    tag: "Sacred",
  },
  {
    id: 4,
    name: "Black Tourmaline Bracelet",
    subtitle: "Protection stone • 10mm",
    price: 999,
    originalPrice: 1499,
    image: "⚫",
    tag: "New Arrival",
  },
];

const MOCK_ORDERS = [
  {
    id: "SH-20240512",
    name: "7-Mukhi Rudraksha Mala",
    date: "12 May 2024",
    amount: 2199,
    status: 3,
    milestones: [
      { label: "Order Placed", icon: "📋", done: true },
      { label: "Handcrafted with Devotion", icon: "🙏", done: true },
      { label: "Shipped via Sanwariya Logistics", icon: "📦", done: true },
      { label: "Out for Delivery", icon: "🚚", done: false },
      { label: "Delivered", icon: "✅", done: false },
    ],
  },
  {
    id: "SH-20240489",
    name: "Chandan Sandalwood Mala",
    date: "28 Apr 2024",
    amount: 1599,
    status: 4,
    milestones: [
      { label: "Order Placed", icon: "📋", done: true },
      { label: "Handcrafted with Devotion", icon: "🙏", done: true },
      { label: "Shipped via Sanwariya Logistics", icon: "📦", done: true },
      { label: "Out for Delivery", icon: "🚚", done: true },
      { label: "Delivered", icon: "✅", done: true },
    ],
  },
];

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

// ─── Icon Components ───────────────────────────────────────────────────────────

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style={{ width: 12, height: 12, flexShrink: 0 }}>
    <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" width="12" height="12" style={{ width: 12, height: 12 }}>
    <path d="M2 6l3 3 5-5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }}>
    <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ─── Sacred Mala Spinner (inline SVG animation) ────────────────────────────────

const SacredMalaSpinner = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(253,246,236,0.92)",
      backdropFilter: "blur(8px)",
      zIndex: 50,
      borderRadius: "inherit",
    }}
  >
    <svg
      viewBox="0 0 120 120"
      width="80"
      height="80"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="beadGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde8c8" stopOpacity="1" />
          <stop offset="100%" stopColor="#c8843a" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde8c8" />
          <stop offset="100%" stopColor="#8b4513" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rotating bead string group */}
      <g style={{ transformOrigin: "60px 60px", animation: "malaSpin 2.4s linear infinite" }}>
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * 2 * Math.PI;
          const r = 46;
          const cx = 60 + r * Math.cos(angle);
          const cy = 60 + r * Math.sin(angle);
          const isGuruBead = i === 0;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={isGuruBead ? 6 : 4}
              fill={isGuruBead ? "url(#centerGlow)" : "url(#beadGlow)"}
              filter="url(#glow)"
              opacity={isGuruBead ? 1 : 0.85}
              style={{
                animation: isGuruBead ? "guruPulse 1.2s ease-in-out infinite" : undefined,
              }}
            />
          );
        })}

        {/* String line circle */}
        <circle cx="60" cy="60" r="46" fill="none" stroke="#d4a373" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" />
      </g>

      {/* Center OM symbol */}
      <text
        x="60"
        y="67"
        textAnchor="middle"
        fontSize="22"
        fontFamily="serif"
        fill="#8b4513"
        filter="url(#glow)"
        style={{ animation: "omPulse 2.4s ease-in-out infinite" }}
      >
        ॐ
      </text>

      <style>{`
        @keyframes malaSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes guruPulse {
          0%, 100% { r: 6; opacity: 1; }
          50% { r: 8; opacity: 0.7; }
        }
        @keyframes omPulse {
          0%, 100% { opacity: 1; font-size: 22px; }
          50% { opacity: 0.6; font-size: 20px; }
        }
      `}</style>
    </svg>

    <p
      style={{
        marginTop: 12,
        fontSize: 11,
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic",
        color: "#c8843a",
        letterSpacing: "0.1em",
        animation: "omPulse 2.4s ease-in-out infinite",
      }}
    >
      Seeking divine connection…
    </p>
  </div>
);

// ─── Reusable Action Button with Badge ────────────────────────────────────────

function ActionButton({ children, label, count, countColor, onClick }: ActionButtonProps) {
  return (
    <motion.button
      className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl group"
      whileHover={{ scale: 1.07, backgroundColor: "rgba(212,163,115,0.1)" }}
      whileTap={{ scale: 0.95 }}
      style={{ color: "#8b4513" }}
      aria-label={label}
      type="button"
      onClick={onClick}
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

// ─── Wishlist Modal ────────────────────────────────────────────────────────────

function WishlistModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(44,17,6,0.55)", backdropFilter: "blur(6px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl flex flex-col"
        style={{
          background: "linear-gradient(145deg, #fffdf9 0%, #fdf6ec 100%)",
          border: "1px solid rgba(212,163,115,0.35)",
          boxShadow: "0 32px 80px rgba(139,69,19,0.2), 0 8px 24px rgba(139,69,19,0.12)",
        }}
        initial={{ y: "100%", scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: "100%", scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #8b4513, #a0522d, #c8843a)",
            borderBottom: "1px solid rgba(212,163,115,0.3)",
          }}
        >
          <div>
            <h2
              className="text-xl font-black"
              style={{ color: "#fde8c8", fontFamily: "'Playfair Display', serif", letterSpacing: "0.05em" }}
            >
              My Wishlist
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(253,232,200,0.65)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              {MOCK_WISHLIST.length} sacred items saved
            </p>
          </div>
          <motion.button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(253,232,200,0.18)", color: "#fde8c8" }}
            whileHover={{ scale: 1.1, background: "rgba(253,232,200,0.28)" }}
            whileTap={{ scale: 0.95 }}
          >
            <CloseIcon />
          </motion.button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {MOCK_WISHLIST.map((item, i) => (
            <motion.div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: "rgba(255,252,245,0.9)", border: "1px solid rgba(212,163,115,0.2)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 26 }}
              whileHover={{ scale: 1.01, boxShadow: "0 4px 20px rgba(139,69,19,0.08)" }}
            >
              {/* Image token */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl"
                style={{ background: "linear-gradient(135deg, #fdf0e0, #fde8c8)", border: "1px solid rgba(212,163,115,0.25)" }}
              >
                {item.image}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{ color: "#5c3317", fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#c8a07a", fontFamily: "'Jost', sans-serif" }}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: "rgba(200,132,58,0.12)",
                      color: "#a0522d",
                      fontFamily: "'Jost', sans-serif",
                      border: "1px solid rgba(200,132,58,0.2)",
                      fontWeight: 600,
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-base font-bold"
                      style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}
                    >
                      ₹{item.price.toLocaleString()}
                    </span>
                    <span
                      className="text-xs line-through"
                      style={{ color: "#c8a07a" }}
                    >
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  </div>

                  <motion.button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #8b4513, #a0522d)",
                      color: "#fde8c8",
                      fontFamily: "'Jost', sans-serif",
                      letterSpacing: "0.04em",
                    }}
                    whileHover={{ scale: 1.05, boxShadow: "0 4px 14px rgba(139,69,19,0.3)" }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <CartIcon />
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 flex-shrink-0 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(212,163,115,0.2)", background: "rgba(253,246,236,0.9)" }}
        >
          <p
            className="text-xs italic"
            style={{ color: "rgba(200,132,58,0.6)", fontFamily: "'Cormorant Garamond', serif" }}
          >
            ✦ &nbsp; Handcrafted with devotion &nbsp; ✦
          </p>
          <motion.button
            className="px-5 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #8b4513, #c8843a)",
              color: "#fde8c8",
              fontFamily: "'Jost', sans-serif",
              letterSpacing: "0.05em",
            }}
            whileHover={{ scale: 1.04, boxShadow: "0 6px 20px rgba(139,69,19,0.3)" }}
            whileTap={{ scale: 0.97 }}
          >
            Add All to Cart
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Orders Modal ──────────────────────────────────────────────────────────────

function OrdersModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(44,17,6,0.55)", backdropFilter: "blur(6px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl flex flex-col"
        style={{
          background: "linear-gradient(145deg, #fffdf9 0%, #fdf6ec 100%)",
          border: "1px solid rgba(212,163,115,0.35)",
          boxShadow: "0 32px 80px rgba(139,69,19,0.2), 0 8px 24px rgba(139,69,19,0.12)",
        }}
        initial={{ y: "100%", scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: "100%", scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #5c3317, #8b4513, #a0522d)",
            borderBottom: "1px solid rgba(212,163,115,0.3)",
          }}
        >
          <div>
            <h2
              className="text-xl font-black"
              style={{ color: "#fde8c8", fontFamily: "'Playfair Display', serif", letterSpacing: "0.05em" }}
            >
              My Orders
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(253,232,200,0.65)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              {MOCK_ORDERS.length} sacred parcels tracked
            </p>
          </div>
          <motion.button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(253,232,200,0.18)", color: "#fde8c8" }}
            whileHover={{ scale: 1.1, background: "rgba(253,232,200,0.28)" }}
            whileTap={{ scale: 0.95 }}
          >
            <CloseIcon />
          </motion.button>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {MOCK_ORDERS.map((order, oi) => (
            <motion.div
              key={order.id}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(212,163,115,0.25)", background: "#fffdf9" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: oi * 0.1, type: "spring", stiffness: 280, damping: 26 }}
            >
              {/* Order header row */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ background: "rgba(212,163,115,0.1)", borderBottom: "1px solid rgba(212,163,115,0.15)" }}
              >
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "#5c3317", fontFamily: "'Playfair Display', serif" }}
                  >
                    {order.name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#c8a07a", fontFamily: "'Jost', sans-serif" }}
                  >
                    #{order.id} &nbsp;·&nbsp; {order.date}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-bold"
                    style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}
                  >
                    ₹{order.amount.toLocaleString()}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{
                      color: order.status === 4 ? "#22c55e" : "#c8843a",
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {order.status === 4 ? "✓ Delivered" : "In Transit"}
                  </p>
                </div>
              </div>

              {/* Milestone track */}
              <div className="px-4 py-4">
                {order.milestones.map((ms, mi) => (
                  <div key={mi} className="flex items-start gap-3">
                    {/* Icon + line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{
                          background: ms.done
                            ? "linear-gradient(135deg, #8b4513, #c8843a)"
                            : "rgba(212,163,115,0.15)",
                          border: ms.done ? "none" : "1.5px dashed rgba(212,163,115,0.4)",
                          opacity: ms.done ? 1 : 0.5,
                        }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: ms.done ? 1 : 0.5 }}
                        transition={{ delay: oi * 0.1 + mi * 0.06 }}
                      >
                        {ms.icon}
                      </motion.div>
                      {mi < order.milestones.length - 1 && (
                        <div
                          className="w-0.5 flex-1 my-0.5"
                          style={{
                            minHeight: 18,
                            background: ms.done
                              ? "linear-gradient(to bottom, #c8843a, rgba(200,132,58,0.3))"
                              : "rgba(212,163,115,0.2)",
                          }}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className={`pb-${mi < order.milestones.length - 1 ? "1" : "0"} pt-1.5`}>
                      <p
                        className="text-sm leading-tight"
                        style={{
                          color: ms.done ? "#5c3317" : "#c8a07a",
                          fontFamily: "'Jost', sans-serif",
                          fontWeight: ms.done ? 500 : 400,
                        }}
                      >
                        {ms.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div
          className="px-5 py-3 flex-shrink-0 text-center"
          style={{ borderTop: "1px solid rgba(212,163,115,0.2)", background: "rgba(253,246,236,0.9)" }}
        >
          <p
            className="text-xs italic"
            style={{ color: "rgba(200,132,58,0.55)", fontFamily: "'Cormorant Garamond', serif" }}
          >
            ✦ &nbsp; Every parcel shipped with devotion from Sanwariya Handicraft &nbsp; ✦
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Profile Dropdown ──────────────────────────────────────────────────────────

interface ProfileDropdownProps {
  authStep: AuthStep;
  setAuthStep: (s: AuthStep) => void;
  userProfile: UserProfile;
  setUserProfile: (p: UserProfile) => void;
  mobileNumber: string;
  setMobileNumber: (n: string) => void;
  onOpenOrders: () => void;
  onOpenWishlist: () => void;
  onClose: () => void;
}

function ProfileDropdown({
  authStep,
  setAuthStep,
  userProfile,
  setUserProfile,
  mobileNumber,
  setMobileNumber,
  onOpenOrders,
  onOpenWishlist,
  onClose,
}: ProfileDropdownProps) {
  const [loading, setLoading] = useState(false);

  const mockDbCheck = useCallback(
    async (number: string) => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1800));
      setLoading(false);
      if (number === "9999999999") {
        setAuthStep("otp");
      } else {
        setAuthStep("register");
      }
    },
    [setAuthStep]
  );

  const handleSendOtp = () => {
    if (mobileNumber.length === 10) mockDbCheck(mobileNumber);
  };

  const handleRegistrationContinue = async () => {
    if (!userProfile.name || !userProfile.email || !userProfile.dob) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setAuthStep("otp");
  };

  const handleVerify = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setAuthStep("authenticated");
  };

  return (
    <motion.div
      className="absolute right-0 top-full mt-3 w-80 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(255,252,245,0.98) 0%, rgba(253,246,236,0.98) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
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
        style={{ background: "linear-gradient(135deg, #8b4513 0%, #a0522d 60%, #c8843a 100%)" }}
      >
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10" style={{ background: "#fde8c8" }} />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10" style={{ background: "#fde8c8" }} />

        <div className="relative flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(253,232,200,0.2)", border: "2px solid rgba(253,232,200,0.4)", color: "#fde8c8" }}
          >
            <UserIcon />
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "#fde8c8", fontFamily: "'Playfair Display', serif" }}
            >
              {authStep === "authenticated" ? `Namaste, ${userProfile.name || "Devotee"}` : "Welcome, Devotee"}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(253,232,200,0.7)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              {authStep === "authenticated" ? mobileNumber : "Sign in to your sacred space"}
            </p>
          </div>
        </div>

        <div className="absolute top-2 right-4 text-3xl font-serif opacity-10" style={{ color: "#fde8c8" }}>ॐ</div>
      </div>

      {/* Dropdown body */}
      <div className="p-4 relative" style={{ minHeight: 180 }}>
        {/* Spinner overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "0 0 16px 16px",
                zIndex: 20,
                overflow: "hidden",
              }}
            >
              <SacredMalaSpinner />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ── PHONE STEP ── */}
          {authStep === "phone" && (
            <motion.div
              key="phone-entry"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p
                className="text-xs font-medium mb-3"
                style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                Login via Mobile Number
              </p>

              <div
                className="flex items-center rounded-xl overflow-hidden mb-3"
                style={{ border: "1px solid rgba(212,163,115,0.4)", background: "#fff8f2" }}
              >
                <div
                  className="px-3 py-2.5 flex items-center gap-1.5 flex-shrink-0"
                  style={{ borderRight: "1px solid rgba(212,163,115,0.3)" }}
                >
                  <span className="text-base">🇮🇳</span>
                  <span className="text-sm font-medium" style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter mobile number"
                  className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm"
                  style={{ color: "#5c3317", fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em" }}
                />
                {mobileNumber.length === 10 && (
                  <motion.div className="px-2" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
                      <CheckIcon />
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.button
                type="button"
                className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #8b4513, #a0522d)",
                  color: "#fde8c8",
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.06em",
                  transition: "all 0.3s ease",
                  opacity: mobileNumber.length === 10 ? 1 : 0.5,
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendOtp}
              >
                <PhoneIcon />
                Send OTP
              </motion.button>

              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px" style={{ background: "rgba(212,163,115,0.25)" }} />
                <span className="text-xs italic" style={{ color: "#c8a07a", fontFamily: "'Cormorant Garamond', serif" }}>
                  secure &amp; quick
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(212,163,115,0.25)" }} />
              </div>

              <p className="text-center text-xs" style={{ color: "#c8a07a", fontFamily: "'Jost', sans-serif" }}>
                By signing in, you agree to our{" "}
                <span className="underline cursor-pointer" style={{ color: "#8b4513" }}>Terms</span>{" "}
                and{" "}
                <span className="underline cursor-pointer" style={{ color: "#8b4513" }}>Privacy Policy</span>
              </p>
            </motion.div>
          )}

          {/* ── REGISTER STEP ── */}
          {authStep === "register" && (
            <motion.div
              key="register-entry"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => { setAuthStep("phone"); }}
                  className="text-xs underline"
                  style={{ color: "#c8843a" }}
                >
                  ← Back
                </button>
                <p className="text-xs" style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}>
                  New devotee — let's get you set up
                </p>
              </div>

              <p
                className="text-xs font-medium mb-2"
                style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                Complete Your Profile
              </p>

              {(
                [
                  { key: "name", placeholder: "Full Name", type: "text" },
                  { key: "email", placeholder: "Gmail Address", type: "email" },
                  { key: "dob", placeholder: "Date of Birth", type: "date" },
                ] as { key: keyof UserProfile; placeholder: string; type: string }[]
              ).map((field, fi) => (
                <motion.input
                  key={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={userProfile[field.key]}
                  onChange={(e) => setUserProfile({ ...userProfile, [field.key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm mb-2"
                  style={{
                    border: "1px solid rgba(212,163,115,0.4)",
                    background: "#fff8f2",
                    color: "#5c3317",
                    fontFamily: "'Jost', sans-serif",
                  }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: fi * 0.06 }}
                  onFocus={(e) => (e.target.style.borderColor = "#c8843a")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(212,163,115,0.4)")}
                />
              ))}

              <motion.button
                type="button"
                className="w-full py-2.5 rounded-xl text-sm font-medium mt-1 flex items-center justify-center gap-1.5"
                style={{
                  background: "linear-gradient(135deg, #8b4513, #a0522d)",
                  color: "#fde8c8",
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.06em",
                  opacity: userProfile.name && userProfile.email && userProfile.dob ? 1 : 0.5,
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegistrationContinue}
              >
                <SparkleIcon />
                Continue Registration
              </motion.button>
            </motion.div>
          )}

          {/* ── OTP STEP ── */}
          {authStep === "otp" && (
            <motion.div
              key="otp-entry"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => setAuthStep("phone")} className="text-xs underline" style={{ color: "#c8843a" }}>
                  ← Change
                </button>
                <p className="text-xs" style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif" }}>
                  OTP sent to +91 {mobileNumber}
                </p>
              </div>

              <p
                className="text-xs font-medium mb-2"
                style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
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
                    onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#c8843a")}
                    onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(212,163,115,0.4)")}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.value && target.nextElementSibling instanceof HTMLElement) {
                        target.nextElementSibling.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <motion.button
                type="button"
                className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5"
                style={{
                  background: "linear-gradient(135deg, #8b4513, #a0522d)",
                  color: "#fde8c8",
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.06em",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerify}
              >
                <SparkleIcon />
                Verify &amp; {authStep === "otp" ? "Login" : "Signup"} ✦
              </motion.button>

              <p className="text-center text-xs mt-2" style={{ color: "#c8a07a" }}>
                Didn&apos;t receive?{" "}
                <span className="underline cursor-pointer" style={{ color: "#8b4513" }}>Resend OTP</span>
              </p>
            </motion.div>
          )}

          {/* ── AUTHENTICATED STEP ── */}
          {authStep === "authenticated" && (
            <motion.div
              key="authenticated"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className="flex items-center gap-3 p-3 rounded-xl mb-3"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#22c55e" }}
                >
                  <CheckIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#14532d", fontFamily: "'Playfair Display', serif" }}>
                    Jai Shri Ram 🙏
                  </p>
                  <p className="text-xs" style={{ color: "#16a34a", fontFamily: "'Jost', sans-serif" }}>
                    You are now connected
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                className="w-full py-2 rounded-xl text-xs font-medium"
                style={{
                  background: "rgba(212,163,115,0.15)",
                  color: "#8b4513",
                  fontFamily: "'Jost', sans-serif",
                  border: "1px solid rgba(212,163,115,0.3)",
                }}
                whileHover={{ background: "rgba(212,163,115,0.25)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setAuthStep("phone"); setMobileNumber(""); setUserProfile({ name: "", email: "", dob: "" }); }}
              >
                Sign Out
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick links */}
      {authStep === "authenticated" && (
        <div className="px-4 pb-4 flex flex-col gap-1">
          {[
            { label: "My Orders", action: onOpenOrders },
            { label: "My Wishlist", action: onOpenWishlist },
            { label: "Track Parcel", action: onOpenOrders },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(212,163,115,0.1)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
              onClick={() => { item.action(); onClose(); }}
            >
              <span>{item.label}</span>
              <ChevronRightIcon />
            </button>
          ))}
        </div>
      )}

      {/* Bottom tag */}
      <div className="px-4 pb-3 text-center">
        <p
          className="text-xs"
          style={{ color: "rgba(200,132,58,0.6)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
        >
          ✦ &nbsp; Handcrafted with devotion &nbsp; ✦
        </p>
      </div>
    </motion.div>
  );
}

// ─── Header Component ──────────────────────────────────────────────────────────

export default function Header({ favCount = 0, cartCount = 0 }: HeaderProps) {
  // ── Auth State Machine ──
  const [authStep, setAuthStep] = useState<AuthStep>("phone");
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: "", email: "", dob: "" });
  const [mobileNumber, setMobileNumber] = useState("");

  // ── UI State ──
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeModalWindow, setActiveModalWindow] = useState<ActiveModalWindow>("none");

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { text: placeholderText, visible: placeholderVisible } = useCyclingPlaceholder(searchFocused);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <>
      {/* ── Google Fonts Import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap');

        .header-root { font-family: 'Jost', sans-serif; }
        .brand-title { font-family: 'Playfair Display', serif; letter-spacing: 0.08em; }
        .brand-subtitle { font-family: 'Cormorant Garamond', serif; }
        .divine-gradient { background: linear-gradient(135deg, #fdf6ec 0%, #fff8f0 50%, #fdf0e0 100%); }
        .header-border { background: linear-gradient(90deg, transparent, #d4a37366, #c8843a99, #d4a37366, transparent); }
        .om-divider { font-family: serif; color: #c8843a; font-size: 10px; opacity: 0.5; }
        .profile-shimmer {
          background: linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #8b4513 100%);
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .mandala-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a373' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='28'/%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .top-bar { background: linear-gradient(90deg, #6b2d0e, #8b4513, #6b2d0e); }
        .search-icon-wrap svg, .action-btn svg { display: block; flex-shrink: 0; }
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
      <header className="header-root divine-gradient relative" style={{ borderBottom: "1px solid rgba(212,163,115,0.25)" }}>
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
                <motion.div
                  className="absolute -inset-px rounded-full pointer-events-none"
                  animate={{
                    boxShadow: searchFocused
                      ? "0 0 0 2px rgba(212,163,115,0.55), 0 0 28px rgba(200,132,58,0.18)"
                      : "0 0 0 1px rgba(212,163,115,0.2)",
                  }}
                  transition={{ duration: 0.35 }}
                />

                <div
                  className="flex items-center rounded-full overflow-hidden"
                  style={{
                    background: searchFocused ? "rgba(255,252,245,0.97)" : "rgba(255,252,245,0.8)",
                    border: "1px solid",
                    borderColor: searchFocused ? "rgba(212,163,115,0.6)" : "rgba(212,163,115,0.3)",
                    transition: "background 0.3s ease, border-color 0.3s ease",
                  }}
                >
                  <motion.div
                    className="pl-4 pr-2 flex-shrink-0 flex items-center search-icon-wrap"
                    animate={{ color: searchFocused ? "#c8843a" : "#c8a07a" }}
                    transition={{ duration: 0.3 }}
                    style={{ lineHeight: 0 }}
                  >
                    <SearchIcon />
                  </motion.div>

                  <div className="relative flex-1 py-2.5 pr-3 overflow-hidden">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="w-full bg-transparent outline-none text-sm relative z-10"
                      style={{ color: "#5c3317", fontFamily: "'Jost', sans-serif", fontWeight: 400, letterSpacing: "0.02em" }}
                      aria-label="Search products"
                    />
                    <AnimatePresence mode="wait">
                      {!searchValue && !searchFocused && (
                        <motion.span
                          key={placeholderText}
                          className="absolute inset-0 flex items-center pointer-events-none text-sm"
                          style={{ color: "#c8a07a", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
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
                          style={{ color: "#d4b896", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Type to search malas, beads, bracelets…
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

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
              <ActionButton
                label="Favourites"
                count={favCount}
                countColor="#e05c7a"
                onClick={() => setActiveModalWindow("wishlist")}
              >
                <HeartIcon />
              </ActionButton>

              {/* Cart */}
              <ActionButton label="Cart" count={cartCount} countColor="#c8843a">
                <CartIcon />
              </ActionButton>

              {/* Divider */}
              <div className="w-px h-8 mx-1 hidden sm:block" style={{ background: "rgba(212,163,115,0.3)" }} />

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
                  <div className="relative">
                    <motion.div
                      className="w-9 h-9 rounded-full flex items-center justify-center profile-shimmer"
                      animate={profileOpen ? { scale: 1.08 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      style={{ color: "#fde8c8" }}
                    >
                      <UserIcon />
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{
                        background: authStep === "authenticated" ? "#22c55e" : "#c8843a",
                        borderColor: "#fdf6ec",
                      }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-medium hidden sm:block"
                    style={{ color: "#8b4513", fontFamily: "'Jost', sans-serif", letterSpacing: "0.04em" }}
                  >
                    {authStep === "authenticated" ? "Account" : "Login"}
                  </span>
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <ProfileDropdown
                      authStep={authStep}
                      setAuthStep={setAuthStep}
                      userProfile={userProfile}
                      setUserProfile={setUserProfile}
                      mobileNumber={mobileNumber}
                      setMobileNumber={setMobileNumber}
                      onOpenOrders={() => setActiveModalWindow("orders")}
                      onOpenWishlist={() => setActiveModalWindow("wishlist")}
                      onClose={() => setProfileOpen(false)}
                    />
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
                style={{ background: "rgba(255,252,245,0.9)", border: "1px solid rgba(212,163,115,0.35)" }}
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

      {/* ── Full-Screen Workspace Modals ── */}
      <AnimatePresence>
        {activeModalWindow === "wishlist" && (
          <WishlistModal onClose={() => setActiveModalWindow("none")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModalWindow === "orders" && (
          <OrdersModal onClose={() => setActiveModalWindow("none")} />
        )}
      </AnimatePresence>
    </>
  );
}