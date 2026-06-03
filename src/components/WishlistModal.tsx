import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { favoriteService, cartService } from "../utils/service";
import { useCart } from "../context/CartContext";

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const WishlistTitleIcon = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
    <circle cx="16" cy="16" r="14" stroke="rgba(255,220,160,0.4)" strokeWidth="1" />
    <path fill="rgba(255,220,160,0.9)" d="M16 25l-1.8-1.64C8.5 18.36 5 15.14 5 11.2 5 8.08 7.46 5.5 10.5 5.5c1.74 0 3.42.87 4.5 2.24C16.08 6.37 17.76 5.5 19.5 5.5 22.54 5.5 25 8.08 25 11.2c0 3.94-3.5 7.16-9.2 12.16L16 25z" />
    <circle cx="16" cy="11" r="1.5" fill="rgba(110,46,8,0.5)" />
  </svg>
);

const LotusIcon = () => (
  <svg viewBox="0 0 160 140" width="160" height="140" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="petalGrad1" cx="50%" cy="100%" r="80%">
        <stop offset="0%" stopColor="#f5c89a" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#d4704a" stopOpacity="0.7" />
      </radialGradient>
      <radialGradient id="petalGrad2" cx="50%" cy="100%" r="80%">
        <stop offset="0%" stopColor="#fde8c8" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#c86030" stopOpacity="0.6" />
      </radialGradient>
      <radialGradient id="centerGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fdf0d0" />
        <stop offset="100%" stopColor="#d4984a" />
      </radialGradient>
    </defs>
    {[[-30, 0], [30, 0], [-55, 10], [55, 10]].map(([rx, ry], i) => (
      <ellipse key={`back-${i}`} cx={80 + rx} cy={80 + ry} rx="18" ry="38" transform={`rotate(${rx * 0.6} ${80 + rx} ${80 + ry})`} fill="url(#petalGrad2)" opacity="0.6" />
    ))}
    {[[-15, -5], [15, -5], [-38, 5], [38, 5], [0, -10]].map(([rx, ry], i) => (
      <ellipse key={`mid-${i}`} cx={80 + rx} cy={78 + ry} rx="16" ry="34" transform={`rotate(${rx * 0.5} ${80 + rx} ${78 + ry})`} fill="url(#petalGrad1)" opacity="0.8" />
    ))}
    {[[-8, 0], [8, 0], [0, -5]].map(([rx, ry], i) => (
      <ellipse key={`front-${i}`} cx={80 + rx} cy={76 + ry} rx="13" ry="28" transform={`rotate(${rx * 0.4} ${80 + rx} ${76 + ry})`} fill="url(#petalGrad1)" opacity="0.95" />
    ))}
    <circle cx="80" cy="74" r="12" fill="url(#centerGrad)" stroke="rgba(180,100,40,0.3)" strokeWidth="1" />
    <text x="80" y="78" textAnchor="middle" fontSize="10" fill="rgba(110,46,8,0.8)" fontFamily="serif">ॐ</text>
    <path d="M80 86 Q78 105 75 118 Q80 115 85 118 Q82 105 80 86Z" fill="rgba(120,80,30,0.4)" />
    <path d="M78 108 Q60 100 58 112 Q68 116 78 108Z" fill="rgba(100,140,60,0.35)" />
    <path d="M82 112 Q100 104 102 116 Q92 120 82 112Z" fill="rgba(100,140,60,0.35)" />
  </svg>
);

const MandalaWatermark = () => (
  <svg viewBox="0 0 120 120" width="120" height="120" style={{ position: "absolute", top: -10, right: -10, opacity: 0.07, pointerEvents: "none" }}>
    {[0, 30, 60, 90, 120, 150].map(rot => (
      <g key={rot} transform={`rotate(${rot} 60 60)`}>
        <ellipse cx="60" cy="22" rx="6" ry="18" fill="white" />
        <ellipse cx="60" cy="40" rx="4" ry="12" fill="white" />
      </g>
    ))}
    {[0, 45, 90, 135].map(rot => (
      <g key={`d-${rot}`} transform={`rotate(${rot} 60 60)`}>
        <rect x="57" y="10" width="6" height="24" rx="3" fill="white" />
      </g>
    ))}
    <circle cx="60" cy="60" r="20" fill="none" stroke="white" strokeWidth="1.5" />
    <circle cx="60" cy="60" r="30" fill="none" stroke="white" strokeWidth="0.8" />
    <circle cx="60" cy="60" r="45" fill="none" stroke="white" strokeWidth="0.5" />
    <text x="60" y="65" textAnchor="middle" fontSize="14" fill="white" fontFamily="serif">ॐ</text>
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  backdrop: { position: "absolute", inset: 0, background: "rgba(40, 18, 5, 0.55)", backdropFilter: "blur(4px)" },
  modal: { position: "relative", width: "100%", maxWidth: 640, maxHeight: "90vh", background: "#fdf7f0", borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 -8px 60px rgba(110,46,8,0.25), 0 0 0 1px rgba(200,140,80,0.2)" },
  header: { padding: "20px 22px 18px", background: "linear-gradient(135deg, #6e2e08, #9a4a1a, #b5621e)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerTitle: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 18, fontWeight: "bold", color: "#fdf0d8", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 },
  headerSub: { fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(253,224,180,0.75)", marginTop: 2, fontStyle: "italic" },
  countPill: { background: "rgba(255,220,150,0.22)", border: "1px solid rgba(255,220,150,0.35)", color: "#fde8b0", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontFamily: "Georgia, serif", fontWeight: "bold", marginLeft: 6, display: "inline-block" },
  closeBtn: { width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.9)", flexShrink: 0, transition: "background 0.2s" },
  scrollArea: { flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "thin", scrollbarColor: "#d4a87a transparent" },
  card: { background: "#fff", border: "1px solid #eedcbe", borderRadius: 14, display: "flex", alignItems: "center", gap: 14, padding: "12px 14px 12px 0", boxShadow: "0 2px 12px rgba(110,46,8,0.06)", overflow: "hidden", position: "relative" },
  cardAccent: { width: 3, alignSelf: "stretch", borderRadius: "0 2px 2px 0", background: "linear-gradient(to bottom, #9a4a1a, #c8643a, #e8a060)", flexShrink: 0 },
  productThumb: { width: 56, height: 56, background: "linear-gradient(135deg, #fdf0e0, #f5ddb8)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(200,140,80,0.2)", overflow: "hidden" },
  cardBody: { flex: 1, minWidth: 0 },
  productName: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 13.5, fontWeight: "bold", color: "#3d1a06", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  productPrice: { fontFamily: "Georgia, serif", fontSize: 12, color: "#9a4a1a", marginTop: 3, fontWeight: "bold" },
  cardActions: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginRight: 4 },
  addBtn: { padding: "5px 11px", borderRadius: 20, border: "1.5px solid #c8643a", background: "transparent", color: "#9a4a1a", fontSize: 11, fontFamily: "Georgia, serif", fontWeight: "bold", cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.18s", whiteSpace: "nowrap" },
  addBtnAdded: { padding: "5px 11px", borderRadius: 20, border: "1.5px solid #4a9a6a", background: "rgba(74,154,106,0.08)", color: "#2d7a4a", fontSize: 11, fontFamily: "Georgia, serif", fontWeight: "bold", cursor: "default", letterSpacing: "0.02em", transition: "all 0.18s", whiteSpace: "nowrap" },
  removeBtn: { width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(180,80,30,0.2)", background: "rgba(253,240,220,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9a4a1a", flexShrink: 0, transition: "background 0.18s" },
  emptyWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px 32px", gap: 0 },
  emptyCaption: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14, color: "#9a4a1a", fontStyle: "italic", textAlign: "center", lineHeight: 1.5, marginTop: 14, opacity: 0.85 },
  divider: { fontFamily: "Georgia, serif", fontSize: 12, color: "#c8a060", marginTop: 12, letterSpacing: "0.15em", opacity: 0.7 },
  loadingWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 40 },
  loadingText: { fontFamily: "Georgia, serif", fontSize: 13, color: "#9a4a1a", fontStyle: "italic", opacity: 0.8 },
  footer: { padding: "10px 20px 14px", textAlign: "center", borderTop: "1px solid rgba(200,150,80,0.15)", flexShrink: 0 },
  footerText: { fontFamily: "Georgia, serif", fontSize: 11, color: "#c8a060", fontStyle: "italic", letterSpacing: "0.08em" },
};

export default function WishlistModal({ onClose }: { onClose: () => void }) {
  const { addToCart: globalAddToCart } = useCart();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Tracks which product IDs are currently mid-request to prevent double-taps
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  // Tracks which product IDs have been successfully added (for transient ✓ feedback)
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  useEffect(() => {
    favoriteService.getFavorites()
      .then((res: any) => {
        if (res.data.success) {
          setFavorites(res.data.favorites || []);
        }
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await favoriteService.toggleFavorite({ productId });
      setFavorites((prev) =>
        prev.filter(
          (item) => (item.product?._id || item.product?.id || item._id) !== productId
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Resolves a stable product ID from the nested MongoDB document shape.
   * Handles both populated subdocuments ({ product: { _id, ... } })
   * and flat wishlist entries ({ _id, price, ... }).
   */
  const resolveProductId = (targetProduct: any): string =>
    targetProduct?._id || targetProduct?.id || "";

  /**
   * Wires the "Add to Cart" button to the real cart API pipeline.
   * - Guards against duplicate in-flight requests via the `addingToCart` set.
   * - Falls back through multiple common size field names so the payload is
   *   never sent with an undefined size.
   * - On success, shows a transient "✓ Added" confirmation for 2 s before
   *   resetting the button, giving the user clear visual feedback without
   *   navigating away from the wishlist.
   */
  const handleAddToCart = async (targetProduct: any) => {
    const productId = resolveProductId(targetProduct);
    if (!productId || addingToCart.has(productId)) return;

    setAddingToCart((prev) => new Set(prev).add(productId));

    try {
      const resolvedSize = targetProduct?.variants?.[0]?.size ||
        targetProduct?.sizes?.[0] ||
        targetProduct?.size ||
        targetProduct?.defaultSize ||
        "Standard";

      const res = await globalAddToCart(productId, resolvedSize, 1);
      if (res && res.success) {
        // Automatically remove from favorites after adding to cart
        await handleRemoveFavorite(productId);
      }
    } catch (err) {
      console.error("[WishlistModal] addToCart failed:", err);
    } finally {
      setAddingToCart((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const isDesktop =
    typeof window !== "undefined" && window.innerWidth >= 640;

  const modalVariants = isDesktop
    ? { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.92 } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return (
    <>
      <style>{`
        @keyframes spinDots { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .om-spinner { animation: spinDots 2.4s linear infinite; transform-origin: 36px 36px; }
        .add-btn:hover { background: rgba(200,100,58,0.1) !important; }
        .add-btn-added:hover { background: rgba(74,154,106,0.08) !important; }
        .remove-btn:hover { background: rgba(220,100,60,0.15) !important; }
        .close-btn:hover { background: rgba(255,255,255,0.25) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4a87a; border-radius: 4px; }
      `}</style>

      <motion.div
        style={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div style={styles.backdrop} onClick={onClose} />

        <motion.div
          style={{
            ...styles.modal,
            ...(isDesktop
              ? { borderRadius: 20, position: "relative", alignSelf: "center" }
              : {}),
          }}
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        >
          {/* ── Header ── */}
          <div style={styles.header}>
            <MandalaWatermark />
            <div style={styles.headerLeft}>
              <WishlistTitleIcon />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2 style={styles.headerTitle}>Sacred Wishlist</h2>
                  <span style={styles.countPill}>{favorites.length}</span>
                </div>
                <p style={styles.headerSub}>items preserved with devotion</p>
              </div>
            </div>
            <button
              style={styles.closeBtn}
              className="close-btn"
              onClick={onClose}
              aria-label="Close wishlist"
            >
              <CloseIcon />
            </button>
          </div>

          {/* ── Body ── */}
          <div style={styles.scrollArea}>
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div
                  key="loader"
                  style={styles.loadingWrap}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div style={{ position: "relative", width: 72, height: 72 }}>
                    <svg
                      viewBox="0 0 72 72"
                      width="72"
                      height="72"
                      style={{ position: "absolute", top: 0, left: 0 }}
                    >
                      <g className="om-spinner">
                        {Array.from({ length: 24 }).map((_, i) => {
                          const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
                          const r = 30;
                          const cx = 36 + r * Math.cos(angle);
                          const cy = 36 + r * Math.sin(angle);
                          const opacity = 0.12 + 0.88 * (i / 24);
                          return (
                            <circle
                              key={i}
                              cx={cx}
                              cy={cy}
                              r="2.8"
                              fill={`rgba(180, 100, 30, ${opacity})`}
                            />
                          );
                        })}
                      </g>
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        color: "#9B1B1B",
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      ॐ
                    </div>
                  </div>
                  <p style={styles.loadingText}>Seeking divine connection...</p>
                </motion.div>
              ) : favorites.length === 0 ? (
                <motion.div
                  key="empty"
                  style={styles.emptyWrap}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <LotusIcon />
                  <p style={styles.emptyCaption}>
                    Your sacred collection awaits.<br />
                    Add items to begin your spiritual journey.
                  </p>
                  <p style={styles.divider}>✦ ── ॐ ── ✦</p>
                </motion.div>
              ) : (
                favorites.map((item: any) => {
                  const targetProduct = item.product || item;
                  const productId = resolveProductId(targetProduct);

                  /**
                   * Airtight price extraction: walks through every field name
                   * MongoDB schemas commonly use before falling back to null.
                   * `?? ` (nullish coalescing) ensures 0 is treated as a valid
                   * price while still skipping null / undefined.
                   */
              const primaryVariant = targetProduct?.variants?.[0];

const itemPrice =
  primaryVariant?.price ??
  primaryVariant?.mrp ??
  targetProduct?.price ??
  targetProduct?.basePrice ??
  targetProduct?.originalPrice ??
  null;

                  const itemImage =
                    targetProduct?.images?.[0] || targetProduct?.image;

                  const isAdding = addingToCart.has(productId);
                  const isAdded = addedToCart.has(productId);

                  return (
                    <motion.div
                      key={item._id || item.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: -30,
                        height: 0,
                        marginBottom: 0,
                        padding: 0,
                      }}
                      transition={{ type: "spring", damping: 22, stiffness: 280 }}
                      style={styles.card}
                    >
                      <div style={styles.cardAccent} />

                      {/* Product Thumbnail */}
                      <div style={styles.productThumb}>
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={targetProduct?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xl">📿</div>
                        )}
                      </div>

                      <div style={styles.cardBody}>
                        <p style={styles.productName}>
                          {targetProduct?.name || "Sacred Item"}
                        </p>
                        <p style={styles.productPrice}>
                          {itemPrice !== null
                            ? `₹${Number(itemPrice).toLocaleString("en-IN")}`
                            : "₹—"}
                        </p>
                      </div>

                      <div style={styles.cardActions}>
                        {/* Add to Cart — wired to real backend pipeline */}
                        <button
                          style={isAdded ? styles.addBtnAdded : styles.addBtn}
                          className={isAdded ? "add-btn-added" : "add-btn"}
                          disabled={isAdding || isAdded}
                          onClick={() => handleAddToCart(targetProduct)}
                          aria-label={
                            isAdded
                              ? "Added to cart"
                              : isAdding
                              ? "Adding to cart"
                              : "Add to cart"
                          }
                        >
                          {isAdded ? "✓ Added" : isAdding ? "Adding…" : "Add to Cart"}
                        </button>

                        <button
                          style={styles.removeBtn}
                          className="remove-btn"
                          aria-label="Remove item"
                          onClick={() =>
                            handleRemoveFavorite(productId)
                          }
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          {!loading && favorites.length > 0 && (
            <div style={styles.footer}>
              <p style={styles.footerText}>✦ Handcrafted with devotion ✦</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}