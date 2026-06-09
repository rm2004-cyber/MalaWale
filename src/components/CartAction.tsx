import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Variant {
  _id?: string;
  size: string;
  price: number;
  mrp?: number;
  stock?: number;
  inStock?: boolean;
}

export interface CartActionProps {
  product: {
    _id?: string;
    id?: string | number;
    name?: string;
    variants?: Variant[];
    sizes?: string[];
    images?: string[];
  };
  selectedSize?: string;
  layout?: "wide" | "compact";
  onAddToCartSuccess?: () => void;
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="w-3.5 h-3.5">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="w-3.5 h-3.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── Flying Bubble — Pure DOM, Web Animations API ─────────────────────────────
// Web Animations API (element.animate) runs on compositor thread like CSS,
// but gives frame-perfect control without any React involvement.
// No <style> injection, no keyframe string, zero stutter.

const FLIGHT_DURATION = 750; // ms — change this for speed

export function triggerFlyToCart(
  startX: number,
  startY: number,
  image?: string
) {
  // 1. Get cart icon position at click time
  const cartEl = document.getElementById("header-cart-icon");
  let endX = window.innerWidth - 56;
  let endY = 36;
  if (cartEl) {
    const r = cartEl.getBoundingClientRect();
    endX = r.left + r.width / 2;
    endY = r.top + r.height / 2;
  }

  const SIZE = 48;
  const dx = endX - startX;
  const dy = endY - startY;

  // Arc control point — lift up then curve toward cart
  const arcHeight = Math.min(Math.abs(dy) * 0.5, 130);

  // 2. Create bubble div — raw DOM, completely outside React
  const bubble = document.createElement("div");
  Object.assign(bubble.style, {
    position: "fixed",
    left: `${startX - SIZE / 2}px`,
    top: `${startY - SIZE / 2}px`,
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    borderRadius: "50%",
    overflow: "hidden",
    border: "2.5px solid #D4AF37",
    boxShadow: "0 6px 28px rgba(155,27,27,0.55)",
    background: image ? "transparent" : "linear-gradient(135deg,#9B1B1B,#E65100)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: "999999",
    willChange: "transform, opacity",
  });

  // 3. Add image or cart SVG
  if (image) {
    const img = document.createElement("img");
    img.src = image;
    Object.assign(img.style, {
      width: "100%", height: "100%",
      objectFit: "cover", borderRadius: "50%",
    });
    img.onerror = () => { img.style.display = "none"; };
    bubble.appendChild(img);
  } else {
    bubble.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="22" height="22">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>`;
  }

  // 4. Mount to body
  document.body.appendChild(bubble);

  // 5. Web Animations API — compositor-thread, no JS per frame, no stutter
  // Quadratic bezier arc: P0=start, P1=control(peak), P2=end
  // We approximate with 60 intermediate keyframes sampled from the bezier curve
  const frames: Keyframe[] = [];
  const STEPS = 60;

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;

    // Quadratic bezier: B(t) = (1-t)²P0 + 2(1-t)t·P1 + t²P2
    // P0 = (0, 0), P1 = (dx*0.5, -arcHeight), P2 = (dx, dy)
    const mt = 1 - t;
    const x = mt * mt * 0 + 2 * mt * t * (dx * 0.5) + t * t * dx;
    const y = mt * mt * 0 + 2 * mt * t * (-arcHeight) + t * t * dy;

    // Scale: 1 → 0.12, ease-in on shrink (small things look faster when shrinking late)
    const scale = 1 - (1 - 0.12) * (t * t);

    // Opacity: stay full until 70%, then fade out
    const opacity = t < 0.7 ? 1 : 1 - ((t - 0.7) / 0.3);

    frames.push({
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      offset: t,
    });
  }

  bubble.animate(frames, {
    duration: FLIGHT_DURATION,
    easing: "linear", // easing is baked into the bezier curve above — linear here = no double easing
    fill: "forwards",
  });

  // 6. Cleanup + fire cart bounce event
  setTimeout(() => {
    bubble.remove();
    window.dispatchEvent(new CustomEvent("cart-fly-landed"));
  }, FLIGHT_DURATION + 60);
}

// No-op — kept so Header.tsx import doesn't break
export function FlyingBubblesLayer() {
  return null;
}

// ─── CartAction Component ──────────────────────────────────────────────────────

export const CartAction: React.FC<CartActionProps> = ({
  product,
  selectedSize = "Standard",
  layout = "wide",
  onAddToCartSuccess,
}) => {
  const { user, openLoginModal } = useAuth();
  const { cartItems, getCartItem, addToCart, updateQuantity, removeFromCart } =
    useCart() as any;
  const isAuthenticated = !!user;

  const [cartState, setCartState] = useState<"idle" | "adding" | "added">("idle");
  const [isHovered, setIsHovered] = useState(false);

  const wideButtonRef = useRef<HTMLButtonElement | null>(null);
  const compactButtonRef = useRef<HTMLButtonElement | null>(null);

  const productId = product._id || product.id;
  const normalizedSize = selectedSize.toLowerCase();

  const cartItem =
    typeof getCartItem === "function"
      ? getCartItem(productId, selectedSize)
      : (() => {
        const arr = Array.isArray(cartItems)
          ? cartItems
          : cartItems && typeof cartItems === "object"
            ? Object.values(cartItems)
            : [];
        return arr.find((i: any) => {
          const pid = i.product?._id || i.product || i.productId?._id || i.productId;
          const sz = (i.size || "Standard").toLowerCase();
          return String(pid) === String(productId) && sz === normalizedSize;
        });
      })();

  const isInCart = !!cartItem;
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const currentVariant = product.variants?.find(
    (v) => v.size.toLowerCase() === normalizedSize
  );
  const isOutOfStock = currentVariant
    ? !currentVariant.inStock || currentVariant.stock === 0
    : false;

  const fireFly = useCallback(
    (ref: React.RefObject<HTMLButtonElement | null>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      triggerFlyToCart(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        product.images?.[0]
      );
    },
    [product.images]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("You have to login first!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      openLoginModal();
      return;
    }

    if (cartState !== "idle") return;

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const requiresSize = hasVariants && product.variants!.length > 1;

    if (requiresSize && (!selectedSize || selectedSize === "")) {
      toast.error("Please select a size!");
      return;
    }

    try {
      if (!productId) throw new Error("Product ID missing.");

      setCartState("adding");
      if (layout === "wide") fireFly(wideButtonRef);
      else fireFly(compactButtonRef);

      await addToCart(productId, selectedSize, 1);
      if (onAddToCartSuccess) onAddToCartSuccess();

      setCartState("added");
      setTimeout(() => setCartState("idle"), 2200);
      toast.success("Added to cart! 🛒");
    } catch (err) {
      console.error(err);
      setCartState("idle");
      toast.error("Failed to add to cart.");
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!productId) return;
    try {
      if (quantityInCart > 1) {
        await updateQuantity(productId, selectedSize, quantityInCart - 1);
        toast.success("Quantity updated!");
      } else {
        await removeFromCart(productId, selectedSize);
        toast.success("Removed from cart! 🗑️");
      }
    } catch { toast.error("Failed to update cart."); }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!productId) return;
    try {
      if (layout === "wide") fireFly(wideButtonRef);
      else fireFly(compactButtonRef);
      await updateQuantity(productId, selectedSize, quantityInCart + 1);
      toast.success("Quantity updated!");
    } catch { toast.error("Failed to update cart."); }
  };

  // ─── Compact Layout ────────────────────────────────────────────────────────

  if (layout === "compact") {
    return (
      <div
        className="flex items-center justify-between select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isInCart ? (
          <div
            style={{
              background: "rgba(255,249,242,0.98)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(212,175,55,0.65)",
              boxShadow: "0 6px 20px rgba(155,27,27,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
            className="flex items-center justify-between w-32 h-9 rounded-full px-1"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleDecrement}
              style={{ background: "linear-gradient(135deg,#9B1B1B,#E65100)" }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white select-none cursor-pointer border-0">
              <MinusIcon />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.span key={quantityInCart}
                initial={{ opacity: 0, scale: 0.8, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 4 }}
                transition={{ duration: 0.15 }}
                style={{ fontFamily: "'Playfair Display',serif", color: "#9B1B1B" }}
                className="text-xs font-black px-2 select-none">
                {quantityInCart}
              </motion.span>
            </AnimatePresence>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleIncrement}
              style={{ background: "linear-gradient(135deg,#9B1B1B,#E65100)" }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white select-none cursor-pointer border-0">
              <PlusIcon />
            </motion.button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="flex justify-center">
            <button ref={compactButtonRef} onClick={handleAddToCart}
              style={{ background: "linear-gradient(90deg,#9B1B1B 0%,#E65100 100%)", fontFamily: "'Jost',sans-serif", boxShadow: "0 4px 18px rgba(155,27,27,0.40)" }}
              className="text-white text-xs font-semibold tracking-wide uppercase px-5 py-2 rounded-full transition-transform active:scale-95 cursor-pointer">
              Add to Cart
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  // ─── Wide Layout ───────────────────────────────────────────────────────────

  return (
    <div className="w-full select-none" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isInCart ? (
        <div
          className="flex items-center justify-between w-full h-12 rounded-xl overflow-hidden px-1.5"
          style={{
            background: "rgba(255,249,242,0.98)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(212,175,55,0.6)",
            boxShadow: "0 6px 20px rgba(155,27,27,0.12), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
            onClick={handleDecrement}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white cursor-pointer border-0"
            style={{ background: "linear-gradient(135deg,#9B1B1B,#E65100)" }}>
            <MinusIcon />
          </motion.button>

          <AnimatePresence mode="wait">
            <motion.span key={quantityInCart}
              initial={{ opacity: 0, scale: 0.8, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 5 }}
              transition={{ duration: 0.15 }}
              className="text-base font-black px-4 select-none"
              style={{ color: "#9B1B1B", fontFamily: "'Playfair Display',serif" }}>
              {quantityInCart}
            </motion.span>
          </AnimatePresence>

          <motion.button ref={wideButtonRef as any} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
            onClick={handleIncrement}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white cursor-pointer border-0"
            style={{ background: "linear-gradient(135deg,#9B1B1B,#E65100)" }}>
            <PlusIcon />
          </motion.button>
        </div>
      ) : (
        <motion.button
          ref={wideButtonRef}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="relative w-full h-11 rounded-xl overflow-hidden flex items-center justify-center gap-2 text-sm font-semibold tracking-wide select-none"
          style={{
            fontFamily: "'Jost',sans-serif",
            letterSpacing: "0.04em",
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            opacity: isOutOfStock ? 0.65 : 1,
            boxShadow: isOutOfStock ? "none" : "0 4px 16px rgba(155,27,27,0.15)",
          }}
          whileTap={isOutOfStock ? {} : { scale: 0.97 }}
        >
          <motion.div className="absolute inset-0"
            animate={{ background: isOutOfStock ? "linear-gradient(135deg,#9ca3af,#6b7280)" : cartState === "added" ? "linear-gradient(135deg,#4a7c59,#2d5a3d)" : "linear-gradient(135deg,#9B1B1B,#E65100)" }}
            transition={{ duration: 0.4 }} />

          <AnimatePresence>
            {isHovered && cartState === "idle" && !isOutOfStock && (
              <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%)", backgroundSize: "200% 100%" }}
                initial={{ backgroundPosition: "200% 0" }} animate={{ backgroundPosition: "-200% 0" }}
                transition={{ duration: 0.9, ease: "linear" }} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {cartState === "adding" && (
              <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0.7, scale: 0.85 }} animate={{ opacity: 0, scale: 1.35 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ border: "2px solid rgba(255,255,255,0.55)" }} />
            )}
          </AnimatePresence>

          <span className="relative z-10 flex items-center gap-2 text-white">
            <AnimatePresence mode="wait">
              {isOutOfStock ? (
                <motion.span key="oos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">Out of Stock</motion.span>
              ) : cartState === "adding" ? (
                <motion.span key="adding" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, ease: "linear", repeat: Infinity }} style={{ display: "inline-flex" }}><CartIcon /></motion.span>
                  Adding…
                </motion.span>
              ) : cartState === "added" ? (
                <motion.span key="added" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><CheckIcon /> Added to Cart</motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><CartIcon /> Add to Cart</motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default CartAction;