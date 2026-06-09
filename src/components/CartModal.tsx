import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CheckoutModal from "./CheckoutModal";

interface CartModalProps {
  onClose: () => void;
}

type CurrentView = "cart" | "checkout";

/* ─────────────────────────── SVG ICONS ─────────────────────────── */

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
    <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="17" height="17">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const LotusIllustration = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="120" height="120" style={{ opacity: 0.85 }}>
    <defs>
      <radialGradient id="lotusGrad" cx="50%" cy="60%" r="50%">
        <stop offset="0%" stopColor="#fde8cc" />
        <stop offset="100%" stopColor="#c87941" stopOpacity="0.3" />
      </radialGradient>
      <radialGradient id="petalGrad1" cx="50%" cy="80%" r="60%">
        <stop offset="0%" stopColor="#fff5eb" />
        <stop offset="100%" stopColor="#e8956d" />
      </radialGradient>
      <radialGradient id="petalGrad2" cx="50%" cy="80%" r="60%">
        <stop offset="0%" stopColor="#fff0e6" />
        <stop offset="100%" stopColor="#d4784a" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="168" rx="70" ry="10" fill="#c87941" opacity="0.08" />
    <path d="M100 150 Q70 110 80 70 Q100 90 100 150" fill="url(#petalGrad2)" opacity="0.5" />
    <path d="M100 150 Q130 110 120 70 Q100 90 100 150" fill="url(#petalGrad2)" opacity="0.5" />
    <path d="M100 150 Q50 120 40 80 Q75 100 100 150" fill="url(#petalGrad2)" opacity="0.4" />
    <path d="M100 150 Q150 120 160 80 Q125 100 100 150" fill="url(#petalGrad2)" opacity="0.4" />
    <path d="M100 148 Q68 115 75 78 Q98 105 100 148" fill="url(#petalGrad1)" />
    <path d="M100 148 Q132 115 125 78 Q102 105 100 148" fill="url(#petalGrad1)" />
    <path d="M100 148 Q55 125 48 90 Q85 115 100 148" fill="url(#petalGrad1)" opacity="0.8" />
    <path d="M100 148 Q145 125 152 90 Q115 115 100 148" fill="url(#petalGrad1)" opacity="0.8" />
    <path d="M100 150 Q78 120 82 95 Q100 118 100 150" fill="#f5c9a0" />
    <path d="M100 150 Q122 120 118 95 Q100 118 100 150" fill="#f5c9a0" />
    <circle cx="100" cy="138" r="14" fill="url(#lotusGrad)" stroke="#e8956d" strokeWidth="1" />
    <circle cx="100" cy="138" r="8" fill="#fde8cc" />
    <path d="M100 152 Q97 162 100 172" stroke="#9a7a4a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

const MalaIcon = () => (
  <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
    <defs>
      <radialGradient id="beadGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#fde8cc" />
        <stop offset="100%" stopColor="#9a5a28" />
      </radialGradient>
      <radialGradient id="centerBead" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ffe5b4" />
        <stop offset="100%" stopColor="#7a3810" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="22" fill="none" stroke="#c4956a" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      return <circle key={i} cx={28 + 20 * Math.cos(angle)} cy={28 + 20 * Math.sin(angle)} r="3.5" fill="url(#beadGrad)" stroke="#9a5a28" strokeWidth="0.5" />;
    })}
    <circle cx="28" cy="28" r="8" fill="url(#centerBead)" stroke="#7a3810" strokeWidth="1" />
    <text x="28" y="32" textAnchor="middle" fontSize="9" fill="#fde8cc" fontFamily="serif">ॐ</text>
  </svg>
);

const MandalaBg = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
    style={{ position: "absolute", top: 0, right: 0, width: "160px", height: "160px", opacity: 0.07, pointerEvents: "none" }}>
    {[0, 30, 60, 90, 120, 150].map((a, i) => (
      <g key={i} transform={`rotate(${a} 100 100)`}>
        <ellipse cx="100" cy="55" rx="8" ry="45" fill="#9B1B1B" />
      </g>
    ))}
    {[0, 45, 90, 135].map((a, i) => (
      <g key={i} transform={`rotate(${a} 100 100)`}>
        <ellipse cx="100" cy="40" rx="5" ry="30" fill="#c87941" />
      </g>
    ))}
    <circle cx="100" cy="100" r="20" fill="none" stroke="#9B1B1B" strokeWidth="2" />
    <circle cx="100" cy="100" r="12" fill="none" stroke="#c87941" strokeWidth="1.5" />
    <circle cx="100" cy="100" r="5" fill="#9B1B1B" />
  </svg>
);

const DivineDivider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0 8px" }}>
    <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, #d4a87a)" }} />
    <span style={{ fontSize: "12px", color: "#c87941", fontFamily: "serif" }}>ॐ</span>
    <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, #d4a87a)" }} />
  </div>
);

const CartLoader = () => {
  const dots = Array.from({ length: 24 });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "32px 0" }}>
      <div style={{ position: "relative", width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 100 100" width="72" height="72" style={{ position: "absolute", animation: "cartSpin 2.5s linear infinite" }}>
          {dots.map((_, i) => {
            const angle = (i / dots.length) * 2 * Math.PI;
            const r = 44;
            return <circle key={i} cx={50 + r * Math.cos(angle)} cy={50 + r * Math.sin(angle)} r={i % 3 === 0 ? 3 : 1.8} fill="#c87941" opacity={0.2 + 0.8 * (i / dots.length)} />;
          })}
        </svg>
        <span style={{ fontSize: "22px", fontFamily: "serif", color: "#9a5220", zIndex: 1 }}>ॐ</span>
      </div>
      <p style={{ fontSize: "12px", color: "#a0622a", fontStyle: "italic", fontFamily: "serif", letterSpacing: "0.03em" }}>
        Updating your cart...
      </p>
      <style>{`@keyframes cartSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

/* ─────────────────── DIVINE BURST ANIMATION ─────────────────────
   Pure DOM — completely outside React so it never stutters.
   Fires on "Proceed to Checkout" click.
   Particles: lotus petals + Om symbols + gold sparks burst outward
   from the button center, then fade. After 680ms → switch view.
──────────────────────────────────────────────────────────────────*/

function fireDivineBurst(
  buttonEl: HTMLButtonElement,
  onComplete: () => void
) {
  const rect = buttonEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const DURATION = 750; // ms total
  const PARTICLE_COUNT = 28;

  // Particle types for spiritual feel
  const types = ["spark", "petal", "om", "dot"];
  const colors = ["#D4AF37", "#E65100", "#c87941", "#f5a623", "#9B1B1B", "#fde8cc"];

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes divineParticle {
      0%   { transform: translate(0,0) scale(1) rotate(0deg);   opacity: 1; }
      70%  { opacity: 0.8; }
      100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(var(--rot)); opacity: 0; }
    }
    @keyframes divineRing {
      0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.9; }
      100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
    }
    @keyframes divineRing2 {
      0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.7; }
      100% { transform: translate(-50%,-50%) scale(2.0); opacity: 0; }
    }
  `;
  document.head.appendChild(styleEl);

  // Container
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "999999",
    overflow: "hidden",
  });
  document.body.appendChild(container);

  // ── Expanding sacred rings ──
  [
    { delay: "0ms", dur: "600ms", anim: "divineRing", size: "120px", color: "rgba(212,175,55,0.5)" },
    { delay: "80ms", dur: "580ms", anim: "divineRing2", size: "80px", color: "rgba(230,81,0,0.45)" },
    { delay: "160ms", dur: "560ms", anim: "divineRing", size: "60px", color: "rgba(212,175,55,0.35)" },
  ].forEach(({ delay, dur, anim, size, color }) => {
    const ring = document.createElement("div");
    Object.assign(ring.style, {
      position: "fixed",
      left: `${originX}px`,
      top: `${originY}px`,
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2px solid ${color}`,
      animation: `${anim} ${dur} cubic-bezier(0.2,0,0.8,1) ${delay} forwards`,
      willChange: "transform, opacity",
    });
    container.appendChild(ring);
  });

  // ── Particles burst ──
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const type = types[i % types.length];
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const dist = 80 + Math.random() * 140;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const rot = (Math.random() - 0.5) * 720;
    const color = colors[i % colors.length];
    const delay = Math.random() * 80;
    const size = type === "om" ? 14 : type === "petal" ? 10 : 5 + Math.random() * 6;

    const p = document.createElement("div");
    Object.assign(p.style, {
      position: "fixed",
      left: `${originX}px`,
      top: `${originY}px`,
      width: `${size}px`,
      height: type === "petal" ? `${size * 1.8}px` : `${size}px`,
      marginLeft: `-${size / 2}px`,
      marginTop: `-${size / 2}px`,
      borderRadius: type === "petal" ? "50% 50% 50% 0" : type === "spark" ? "2px" : "50%",
      background: type === "om" ? "transparent" : color,
      color: color,
      fontSize: type === "om" ? "14px" : "0",
      fontFamily: "serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "--tx": `${tx}px`,
      "--ty": `${ty}px`,
      "--rot": `${rot}deg`,
      willChange: "transform, opacity",
      animation: `divineParticle ${DURATION - 50}ms cubic-bezier(0.2,0.8,0.4,1) ${delay}ms forwards`,
    } as any);

    if (type === "om") p.textContent = "ॐ";
    container.appendChild(p);
  }

  // ── Button flash ──
  const flash = document.createElement("div");
  Object.assign(flash.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    borderRadius: "14px",
    background: "rgba(255,255,255,0.45)",
    pointerEvents: "none",
    animation: `divineRing2 300ms ease-out forwards`,
  });
  container.appendChild(flash);

  // Cleanup + fire callback
  setTimeout(() => {
    container.remove();
    styleEl.remove();
    onComplete();
  }, DURATION + 60);
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────── */

export default function CartModal({ onClose }: CartModalProps) {
  const [currentView, setCurrentView] = useState<CurrentView>("cart");
  const [isBursting, setIsBursting] = useState(false);
  const checkoutBtnRef = useRef<HTMLButtonElement>(null);

  const { user, loading: authLoading } = useAuth();
  const { cart, cartLoading, updateQuantity, removeFromCart, cartTotal, fetchCart } = useCart();

  useEffect(() => {
    if (authLoading) return;
    if (user && typeof fetchCart === "function") fetchCart();
  }, [fetchCart, user, authLoading]);

  const handleQuantityChange = (productId: string, size: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) removeFromCart(productId, size);
    else updateQuantity(productId, size, newQty);
  };

  const hasItems = cart?.items?.length > 0;

  // ── Divine burst → then switch to checkout ──
  const handleCheckout = useCallback(() => {
    if (isBursting) return;
    const btn = checkoutBtnRef.current;
    if (!btn) { setCurrentView("checkout"); return; }

    setIsBursting(true);
    fireDivineBurst(btn, () => {
      setIsBursting(false);
      setCurrentView("checkout");
    });
  }, [isBursting]);

  return (
    <motion.div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "flex-end" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        style={{ position: "absolute", inset: 0, background: "rgba(30,15,5,0.55)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Drawer Panel */}
      <motion.div
        style={{
          position: "relative", width: "100%", maxWidth: "420px",
          height: "100%", display: "flex", flexDirection: "column",
          overflow: "hidden", background: "#fdf7f0",
          borderLeft: "1px solid rgba(200,150,80,0.25)",
          boxShadow: "-8px 0 48px rgba(80,30,5,0.25)",
        }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <AnimatePresence mode="wait" initial={false}>

          {/* ══════════════ CART VIEW ══════════════ */}
          {currentView === "cart" && (
            <motion.div
              key="cart"
              style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {/* HEADER */}
              <div style={{
                position: "relative", padding: "18px 20px 16px",
                background: "linear-gradient(135deg, #6e2e08 0%, #9a4a1a 50%, #b5621e 100%)",
                flexShrink: 0, overflow: "hidden",
              }}>
                <MandalaBg />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
                      <svg viewBox="0 0 28 28" fill="none" width="24" height="24">
                        <path d="M9 8.5C9 6 11.2 4 14 4s5 2 5 4.5" stroke="rgba(255,235,200,0.9)" strokeWidth="1.8" strokeLinecap="round" />
                        <rect x="4" y="9" width="20" height="15" rx="3" fill="rgba(255,255,255,0.12)" stroke="rgba(255,235,200,0.7)" strokeWidth="1.5" />
                        <path d="M10 13h8M10 17h5" stroke="rgba(255,235,200,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff8ee", fontFamily: "'Georgia','Times New Roman',serif", letterSpacing: "0.02em", margin: 0 }}>
                        Sacred Cart
                      </h2>
                    </div>
                    <p style={{ fontSize: "11.5px", color: "rgba(255,210,150,0.85)", margin: 0, letterSpacing: "0.02em" }}>
                      Your selected spiritual treasures
                    </p>
                  </div>
                  <button onClick={onClose}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff8ee", flexShrink: 0, transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                  >
                    <CloseIcon />
                  </button>
                </div>
                {hasItems && (
                  <div style={{ marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,220,150,0.3)", borderRadius: "20px", padding: "3px 10px", position: "relative", zIndex: 1 }}>
                    <span style={{ fontSize: "11px", color: "rgba(255,220,160,0.95)", letterSpacing: "0.04em" }}>
                      {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in your basket
                    </span>
                  </div>
                )}
              </div>

              {/* BODY */}
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>
                <AnimatePresence>
                  {cartLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ position: "absolute", inset: 0, background: "rgba(253,247,240,0.88)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
                      <CartLoader />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {!hasItems && !cartLoading && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px", gap: "14px" }}>
                    <LotusIllustration />
                    <div>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "#7a3810", fontFamily: "'Georgia',serif", marginBottom: "6px" }}>
                        Your cart is empty
                      </p>
                      <p style={{ fontSize: "13px", color: "#b08060", fontStyle: "italic", fontFamily: "'Georgia',serif", lineHeight: 1.6, maxWidth: "240px", margin: "0 auto" }}>
                        Begin your divine journey by adding sacred malas &amp; offerings
                      </p>
                    </div>
                    <DivineDivider />
                  </motion.div>
                )}

                {/* Cart items */}
                <AnimatePresence initial={false}>
                  {hasItems && cart.items.map((item: any, index: number) => {
                    const product = item.product || item;
                    const productId = product?._id || product?.id || "";
                    const itemSize = item.size ?? "";
                    const matchedVariant = product?.variants?.find(
                      (v: any) => v.size?.toLowerCase() === itemSize.toLowerCase()
                    ) || product?.variants?.[0];
                    const itemName = product?.name || "Sacred Item";
                    const itemPrice = matchedVariant?.price ?? matchedVariant?.mrp ?? 0;
                    const itemImage = product?.images?.[0] || product?.image || null;

                    return (
                      <motion.div
                        key={`${productId}-${itemSize}`}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.22, delay: index * 0.05 }}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#fff", border: "1px solid #eedcbe", borderRadius: "14px", boxShadow: "0 2px 12px rgba(155,27,27,0.07)", position: "relative", overflow: "hidden" }}
                      >
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: "linear-gradient(to bottom, #c87941, #9B1B1B)", borderRadius: "14px 0 0 14px" }} />
                        <div style={{ width: "56px", height: "56px", borderRadius: "10px", background: "linear-gradient(135deg, #fdf0e0 0%, #f5ddb8 100%)", border: "1px solid #e8d0a8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                          {itemImage ? <img src={itemImage} alt={itemName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <MalaIcon />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#3d1f08", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Georgia',serif" }}>
                            {itemName}
                          </p>
                          {itemSize && (
                            <p style={{ fontSize: "11px", color: "#a07a5a", margin: "0 0 2px", fontFamily: "sans-serif" }}>
                              Size: {itemSize}
                            </p>
                          )}
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "#9a4a1a", margin: "0 0 8px", fontFamily: "serif" }}>
                            ₹{itemPrice.toLocaleString("en-IN")}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button onClick={() => handleQuantityChange(productId, itemSize, item.quantity, -1)}
                              style={{ width: "26px", height: "26px", borderRadius: "7px", background: "#fdf0e0", border: "1px solid #e0c090", color: "#9B1B1B", fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", lineHeight: 1, transition: "background 0.15s" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f5ddb8")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#fdf0e0")}
                            >−</button>
                            <span style={{ fontSize: "13px", fontWeight: 700, minWidth: "22px", textAlign: "center", color: "#3d1f08" }}>{item.quantity}</span>
                            <button onClick={() => handleQuantityChange(productId, itemSize, item.quantity, 1)}
                              style={{ width: "26px", height: "26px", borderRadius: "7px", background: "#fdf0e0", border: "1px solid #e0c090", color: "#9B1B1B", fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", lineHeight: 1, transition: "background 0.15s" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f5ddb8")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#fdf0e0")}
                            >+</button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(productId, itemSize)}
                          style={{ padding: "6px", background: "transparent", border: "none", cursor: "pointer", color: "#c0806a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "color 0.15s, background 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#c0392b"; e.currentTarget.style.background = "#fef2f2"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#c0806a"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <TrashIcon />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* FOOTER */}
              <AnimatePresence>
                {hasItems && (
                  <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 60, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    style={{ padding: "16px", borderTop: "1px solid #e8d4b0", background: "linear-gradient(to bottom, #fdf7f0, #faf0e4)", flexShrink: 0 }}
                  >
                    {/* Totals */}
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12.5px", color: "#9a7860" }}>Subtotal</span>
                        <span style={{ fontSize: "12.5px", color: "#5a3820" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12.5px", color: "#9a7860" }}>Shipping</span>
                        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 500 }}>Free</span>
                      </div>
                      <div style={{ height: "1px", background: "linear-gradient(to right, transparent, #d4a87a, transparent)", margin: "8px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#5a2a08", fontFamily: "serif" }}>Total</span>
                        <span style={{ fontSize: "20px", fontWeight: 700, color: "#7a3810", fontFamily: "serif" }}>
                          ₹{cartTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* ── PROCEED TO CHECKOUT BUTTON ── */}
                    <button
                      ref={checkoutBtnRef}
                      onClick={handleCheckout}
                      disabled={isBursting}
                      style={{
                        width: "100%", padding: "14px", borderRadius: "14px", border: "none",
                        background: isBursting
                          ? "linear-gradient(135deg, #f5a623 0%, #E65100 50%, #D4AF37 100%)"
                          : "linear-gradient(135deg, #6e2e08 0%, #9a4a1a 45%, #c8643a 100%)",
                        color: "#fff8ee", fontSize: "14.5px", fontWeight: 700,
                        cursor: isBursting ? "default" : "pointer",
                        letterSpacing: "0.04em", fontFamily: "'Georgia',serif",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        boxShadow: isBursting
                          ? "0 0 0 3px rgba(212,175,55,0.5), 0 6px 24px rgba(110,46,8,0.5)"
                          : "0 6px 24px rgba(110,46,8,0.4), 0 2px 6px rgba(110,46,8,0.2)",
                        transition: "background 0.3s, box-shadow 0.3s, transform 0.15s",
                        position: "relative", overflow: "hidden",
                        transform: isBursting ? "scale(0.97)" : "scale(1)",
                      }}
                    >
                      {/* Shimmer sweep */}
                      {!isBursting && (
                        <span style={{
                          position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
                          animation: "shimmer 2.5s infinite",
                          pointerEvents: "none",
                        }} />
                      )}

                      {/* Gold ring pulse when bursting */}
                      {isBursting && (
                        <span style={{
                          position: "absolute", inset: 0, borderRadius: "14px",
                          animation: "btnPulse 0.4s ease-out",
                          pointerEvents: "none",
                          border: "2px solid rgba(212,175,55,0.8)",
                        }} />
                      )}

                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>

                      {isBursting ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontFamily: "serif", fontSize: "16px" }}>ॐ</span>
                          Blessing your order...
                        </span>
                      ) : (
                        "Proceed to Checkout ✦"
                      )}
                    </button>

                    <p style={{ textAlign: "center", marginTop: "10px", fontSize: "11px", color: "#b09070", fontStyle: "italic", letterSpacing: "0.04em" }}>
                      ✦ &nbsp;Handcrafted with devotion&nbsp; ✦
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══════════════ CHECKOUT VIEW ══════════════ */}
          {currentView === "checkout" && (
            <motion.div
              key="checkout"
              style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <div style={{
                position: "relative", padding: "18px 20px 16px",
                background: "linear-gradient(135deg, #6e2e08 0%, #9a4a1a 50%, #b5621e 100%)",
                flexShrink: 0, overflow: "hidden",
              }}>
                <MandalaBg />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                  <button onClick={() => setCurrentView("cart")}
                    style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px", padding: "6px 12px 6px 8px", color: "#fff8ee", cursor: "pointer", fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.01em", transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                  >
                    <BackArrowIcon />
                    Back to Cart
                  </button>
                  <button onClick={onClose}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff8ee", flexShrink: 0, transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div style={{ marginTop: "10px", position: "relative", zIndex: 1 }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff8ee", fontFamily: "'Georgia','Times New Roman',serif", letterSpacing: "0.02em", margin: "0 0 2px" }}>
                    Checkout
                  </h2>
                  <p style={{ fontSize: "11.5px", color: "rgba(255,210,150,0.85)", margin: 0 }}>
                    Complete your sacred order
                  </p>
                </div>
              </div>

              <CheckoutModal onBack={() => setCurrentView("cart")} onClose={onClose} />
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes shimmer   { 0%{left:-100%} 100%{left:150%} }
        @keyframes btnPulse  { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.06)} }
        @keyframes cartSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4a87a; border-radius: 4px; }
      `}</style>
    </motion.div>
  );
}