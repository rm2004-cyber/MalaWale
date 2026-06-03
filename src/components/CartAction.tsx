import React, { useState } from "react";
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
  };
  selectedSize?: string;
  layout?: "wide" | "compact";
  onAddToCartSuccess?: () => void;
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const CartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    className="w-4 h-4"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    className="w-4.5 h-4.5"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const MinusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    className="w-3.5 h-3.5"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    className="w-3.5 h-3.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── Component ─────────────────────────────────────────────────────────────────

export const CartAction: React.FC<CartActionProps> = ({
  product,
  selectedSize = "Standard",
  layout = "wide",
  onAddToCartSuccess,
}) => {
  const { user, openLoginModal } = useAuth();
  const { cartItems, getCartItem, addToCart, updateQuantity, removeFromCart } = useCart() as any;
  const isAuthenticated = !!user;

  const [cartState, setCartState] = useState<"idle" | "added">("idle");
  const [isHovered, setIsHovered] = useState(false);

  const productId = product._id || product.id;
  const normalizedSize = selectedSize.toLowerCase();

  // Robust on-mount/on-render lookup using context map helper or standard fallback scanning
  const cartItem = typeof getCartItem === "function"
    ? getCartItem(productId, selectedSize)
    : (() => {
      const cartItemsArray = Array.isArray(cartItems)
        ? cartItems
        : cartItems && typeof cartItems === "object"
          ? Object.values(cartItems)
          : [];
      return cartItemsArray.find((i: any) => {
        const itemProductId = i.product?._id || i.product || i.productId?._id || i.productId;
        const itemSize = (i.size || "Standard").toLowerCase();
        return String(itemProductId) === String(productId) && itemSize === normalizedSize;
      });
    })();

  const isInCart = !!cartItem;
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // 3. Resolve out of stock based on the currently selected size variant
  const currentVariant = product.variants?.find(
    (v) => v.size.toLowerCase() === normalizedSize
  );
  const isOutOfStock = currentVariant
    ? !currentVariant.inStock || currentVariant.stock === 0
    : false;

  // 4. Handlers
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("You have to login first!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      openLoginModal();
      return;
    }

    if (cartState === "added") return;

    // Validate size selection: if the product has multiple size variants, a size must be explicitly selected.
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const requiresSize = hasVariants && product.variants!.length > 1;

    if (requiresSize && (!selectedSize || selectedSize === "")) {
      toast.error("Please select a size!");
      return;
    }

    try {
      if (!productId) throw new Error("Product context ID missing.");

      await addToCart(productId, selectedSize, 1);

      if (onAddToCartSuccess) {
        onAddToCartSuccess();
      }

      setCartState("added");
      setTimeout(() => setCartState("idle"), 2000);
      toast.success("Added to cart! 🛒");
    } catch (error) {
      console.error("Cart action addition failed:", error);
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
        toast.success("Item removed from cart! 🗑️");
      }
    } catch (err) {
      console.error("Decrement operation failed:", err);
      toast.error("Failed to update cart.");
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!productId) return;
    try {
      await updateQuantity(productId, selectedSize, quantityInCart + 1);
      toast.success("Quantity updated!");
    } catch (err) {
      console.error("Increment operation failed:", err);
      toast.error("Failed to update cart.");
    }
  };

  // ─── Render Modes ────────────────────────────────────────────────────────────

  if (layout === "compact") {
    // Elegant floating gold-and-creamy pill (standardized from the Bestsellers section)
    return (
      <div
        className="flex items-center justify-between select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isInCart ? (
          <div
            style={{
              background: "rgba(255, 249, 242, 0.98)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(212, 175, 55, 0.65)",
              boxShadow: "0 6px 20px rgba(155, 27, 27, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            }}
            className="flex items-center justify-between w-32 h-9 rounded-full px-1"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 3px 8px rgba(155, 27, 27,0.3)" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDecrement}
              style={{
                background: "linear-gradient(135deg, #9B1B1B, #E65100)",
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white select-none cursor-pointer border-0"
            >
              <MinusIcon />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.span
                key={quantityInCart}
                initial={{ opacity: 0, scale: 0.8, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#9B1B1B",
                }}
                className="text-xs font-black px-2 select-none"
              >
                {quantityInCart}
              </motion.span>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 3px 8px rgba(155, 27, 27,0.3)" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleIncrement}
              style={{
                background: "linear-gradient(135deg, #9B1B1B, #E65100)",
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white select-none cursor-pointer border-0"
            >
              <PlusIcon />
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="flex justify-center"
          >
            <button
              onClick={handleAddToCart}
              style={{
                background: "linear-gradient(90deg, #9B1B1B 0%, #E65100 100%)",
                fontFamily: "'Jost', sans-serif",
                boxShadow: "0 4px 18px rgba(155, 27, 27,0.40)",
              }}
              className="text-white text-xs font-semibold tracking-wide uppercase px-5 py-2 rounded-full transition-transform active:scale-95 cursor-pointer"
            >
              Add to Cart
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  // Layout wide (used in ProductCard and ProductModal)
  return (
    <div
      className="w-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isInCart ? (
        <div
          className="flex items-center justify-between w-full h-12 rounded-xl overflow-hidden px-1.5"
          style={{
            background: "rgba(255, 249, 242, 0.98)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(212, 175, 55, 0.6)",
            boxShadow: "0 6px 20px rgba(155, 27, 27, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decrement Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 3px 8px rgba(155, 27, 27,0.35)" }}
            whileTap={{ scale: 0.92 }}
            onClick={handleDecrement}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all shadow-sm cursor-pointer border-0"
            style={{
              background: "linear-gradient(135deg, #9B1B1B, #E65100)",
            }}
          >
            <MinusIcon />
          </motion.button>

          {/* Quantity Display */}
          <AnimatePresence mode="wait">
            <motion.span
              key={quantityInCart}
              initial={{ opacity: 0, scale: 0.8, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="text-base font-black px-4 select-none"
              style={{
                color: "#9B1B1B",
                fontFamily: "'Playfair Display', serif"
              }}
            >
              {quantityInCart}
            </motion.span>
          </AnimatePresence>

          {/* Increment Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 3px 8px rgba(155, 27, 27,0.35)" }}
            whileTap={{ scale: 0.92 }}
            onClick={handleIncrement}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all shadow-sm cursor-pointer border-0"
            style={{
              background: "linear-gradient(135deg, #9B1B1B, #E65100)",
            }}
          >
            <PlusIcon />
          </motion.button>
        </div>
      ) : (
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="relative w-full h-11 rounded-xl overflow-hidden flex items-center justify-center gap-2 text-sm font-semibold tracking-wide select-none"
          style={{
            fontFamily: "'Jost', sans-serif",
            letterSpacing: "0.04em",
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            opacity: isOutOfStock ? 0.65 : 1,
            boxShadow: isOutOfStock ? "none" : "0 4px 16px rgba(155, 27, 27, 0.15)",
          }}
          whileTap={isOutOfStock ? {} : { scale: 0.97 }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background:
                isOutOfStock
                  ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                  : cartState === "added"
                    ? "linear-gradient(135deg, #4a7c59, #2d5a3d)"
                    : "linear-gradient(135deg, #9B1B1B, #E65100)",
            }}
            transition={{ duration: 0.4 }}
          />
          {/* Shimmer overlay */}
          <AnimatePresence>
            {isHovered && cartState === "idle" && !isOutOfStock && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                  backgroundSize: "200% 100%",
                }}
                initial={{ backgroundPosition: "200% 0" }}
                animate={{ backgroundPosition: "-200% 0" }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            )}
          </AnimatePresence>

          <motion.span
            className="relative z-10 flex items-center gap-2 text-white"
            key={cartState}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <AnimatePresence mode="wait">
              {isOutOfStock ? (
                <motion.span
                  key="oos"
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Out of Stock
                </motion.span>
              ) : cartState === "added" ? (
                <motion.span
                  key="check"
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CheckIcon /> Added to Cart
                </motion.span>
              ) : (
                <motion.span
                  key="cart"
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CartIcon /> Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.span>
        </motion.button>
      )}
    </div>
  );
};

export default CartAction;
