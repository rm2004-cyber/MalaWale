"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MobileDrawer from "./MobileDrawer";
import ProfileDropdown from "./ProfileDropdown";
import WishlistModal from "./WishlistModal";
import OrdersModal from "./OrdersModal";
import CartModal from "./CartModal";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { productService } from "../utils/service";
import { toast } from "react-hot-toast";

// ── Import the flying bubbles layer ──────────────────────────────────────────
import { FlyingBubblesLayer } from "./CartAction";

type ActiveModalWindow = "none" | "orders" | "wishlist" | "cart";

interface HeaderProps {
  favCount?: number;
  cartCount?: number;
  onProductSelect?: (name: string, id: string) => void;
  onCategoryChange?: (catName: string) => void;
}

interface ActionButtonProps {
  children: React.ReactNode;
  label: string;
  count: number;
  countColor: string;
  onClick?: () => void;
  id?: string;
  bouncing?: boolean;
}

interface SearchProduct {
  _id: string;
  name: string;
  price?: number;
  image?: string;
  category?: string;
}

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

async function safeSearchProducts(query: string): Promise<SearchProduct[]> {
  try {
    const raw: unknown = await productService.searchProducts(query);
    if (raw === null || typeof raw !== "object") return [];
    const withData = raw as Record<string, unknown>;
    if (!withData.data || typeof withData.data !== "object" || withData.data === null) return [];
    const data = withData.data as Record<string, unknown>;
    if (!data.success) return [];
    if (!Array.isArray(data.products)) return [];
    return (data.products as unknown[]).filter(
      (p): p is SearchProduct =>
        p !== null &&
        typeof p === "object" &&
        typeof (p as Record<string, unknown>)._id === "string"
    ) as SearchProduct[];
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Header] Search failed:", err);
    }
    return [];
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9B1B1B"
    strokeWidth="1.8"
    width="20"
    height="20"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" aria-hidden="true">
    <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" aria-hidden="true">
    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

// ─── ActionButton ─────────────────────────────────────────────────────────────
// Added: id prop + bouncing prop for the cart icon bounce animation

function ActionButton({ children, label, count, countColor, onClick, id, bouncing }: ActionButtonProps) {
  return (
    <motion.button
      id={id}
      className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl"
      animate={{
        color: "#9B1B1B",
        opacity: 1,
        // Cart bounce when item lands
        scale: bouncing ? [1, 1.35, 0.9, 1.15, 1] : 1,
      }}
      transition={
        bouncing
          ? { duration: 0.5, times: [0, 0.25, 0.55, 0.75, 1], ease: "easeOut" }
          : undefined
      }
      whileHover={{ scale: 1.07, backgroundColor: "rgba(212, 175, 55,0.12)" }}
      whileTap={{ scale: 0.95 }}
      style={{ color: "#9B1B1B" }}
      aria-label={`${label}${count > 0 ? `, ${count} items` : ""}`}
      type="button"
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center w-5 h-5">
        {children}
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-white z-20"
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
        className="text-[10px] font-medium hidden sm:block mt-0.5"
        style={{ color: "#9B1B1B", fontFamily: "'Jost', sans-serif", letterSpacing: "0.04em" }}
      >
        {label}
      </span>
    </motion.button>
  );
}

// ─── SearchDropdown ───────────────────────────────────────────────────────────

interface SearchDropdownProps {
  loading: boolean;
  results: SearchProduct[];
  query: string;
  onSelect: (name: string, id: string) => void;
}

function SearchDropdown({ loading, results, query, onSelect }: SearchDropdownProps) {
  return (
    <motion.div
      className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden z-[99999]"
      style={{
        background: "rgba(253, 246, 236, 0.98)",
        border: "1px solid rgba(212, 175, 55,0.35)",
        boxShadow: "0 20px 60px rgba(155, 27, 27,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        backdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #D4AF37, #E65100, #D4AF37, transparent)" }} />

      {loading ? (
        <div className="p-5 flex flex-col items-center gap-2">
          <motion.div className="flex gap-1" initial="hidden" animate="visible">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: "#E65100" }}
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
          <p className="text-xs italic" style={{ color: "#E65100", fontFamily: "'Cormorant Garamond', serif" }}>
            Searching sacred scrolls…
          </p>
        </div>
      ) : results.length === 0 && query.length >= 3 ? (
        <div className="p-5 text-center">
          <p className="text-2xl mb-1">🪬</p>
          <p className="text-xs" style={{ color: "#a07850", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            No divine item matches "{query}"
          </p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-0.5">
          {results.map((item, idx) => (
            <motion.button
              key={item._id}
              type="button"
              onClick={() => onSelect(item.name, item._id)}
              className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 group transition-colors"
              style={{ fontFamily: "'Jost', sans-serif" }}
              whileHover={{ backgroundColor: "rgba(212, 175, 55,0.15)", x: 2 }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <span className="text-base flex-shrink-0 group-hover:scale-110 transition-transform">📿</span>
              <span className="flex-1 truncate text-sm font-medium" style={{ color: "#5c3317" }}>
                {item.name}
              </span>
              {item.price !== undefined && (
                <span className="text-xs flex-shrink-0" style={{ color: "#E65100", fontFamily: "'Cormorant Garamond', serif" }}>
                  ₹{item.price}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header({ favCount = 0, cartCount: propCartCount, onProductSelect, onCategoryChange }: HeaderProps) {
  const { user, isLoginModalOpen, closeLoginModal } = useAuth();
  const { cartCount: contextCartCount } = useCart();

  const finalCartCount = typeof propCartCount === "number" ? propCartCount : contextCartCount;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeModalWindow, setActiveModalWindow] = useState<ActiveModalWindow>("none");

  // ── NEW: cart bounce state ─────────────────────────────────────────────────
  const [cartBouncing, setCartBouncing] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchValue("");
  }, []);

  // Listen for "cart-fly-landed" event dispatched by FlyingBubblesLayer
  useEffect(() => {
    const handleLanded = () => {
      setCartBouncing(true);
      setTimeout(() => setCartBouncing(false), 600);
    };
    window.addEventListener("cart-fly-landed", handleLanded);
    return () => window.removeEventListener("cart-fly-landed", handleLanded);
  }, []);

  const { text: placeholderText, visible: placeholderVisible } = useCyclingPlaceholder(searchFocused);

  const isAuthenticated = Boolean(user);
  const profileStatusColor = isAuthenticated ? "#22c55e" : "#E65100";

  useEffect(() => {
    if (isLoginModalOpen) {
      setProfileOpen(true);
      closeLoginModal();
    }
  }, [isLoginModalOpen, closeLoginModal]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const trimmed = searchValue.trim();
    if (trimmed.length < 3) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      const results = await safeSearchProducts(trimmed);
      setSearchResults(results);
      setSearchLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSelectResult = useCallback(
    (name: string, productId: string) => {
      setSearchValue(name);
      setSearchFocused(false);
      setSearchResults([]);
      if (onProductSelect) {
        onProductSelect(name, productId);
      } else {
        const targetSection = document.getElementById("featured-products-section");
        if (targetSection) {
          const headerOffset = 100;
          const elementPosition = targetSection.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
    },
    [onProductSelect]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (searchResults.length > 0) {
        const first = searchResults[0];
        handleSelectResult(first.name, first._id);
      } else if (searchValue.trim().length > 0 && !searchLoading) {
        toast.error(`No products found matching "${searchValue}"`);
      }
    },
    [searchResults, searchValue, searchLoading, handleSelectResult]
  );

  const showDropdown =
    searchFocused &&
    searchValue.trim().length > 0 &&
    (searchLoading || searchResults.length > 0 || searchValue.trim().length >= 3);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Jost:wght@400;500;600&display=swap');

        .header-root { font-family: 'Jost', sans-serif; }
        .brand-title { font-family: 'Cinzel', serif; letter-spacing: 0.12em; font-weight: 600; }
        .brand-subtitle { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 500; }
        .divine-gradient { background: linear-gradient(135deg, #fdf6ec 0%, #fff8f0 50%, #fdf0e0 100%); }
        .header-border { background: linear-gradient(90deg, transparent, #D4AF3766, #E6510099, #D4AF3766, transparent); }
        .om-divider { font-family: serif; color: #E65100; font-size: 10px; opacity: 0.5; }
        .profile-shimmer {
          background: linear-gradient(135deg, #9B1B1B 0%, #D84315 50%, #9B1B1B 100%);
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
        .top-bar { background: linear-gradient(90deg, #6b2d0e, #9B1B1B, #6b2d0e); }
        .search-scroll::-webkit-scrollbar { width: 4px; }
        .search-scroll::-webkit-scrollbar-track { background: transparent; }
        .search-scroll::-webkit-scrollbar-thumb { background: rgba(212, 175, 55,0.4); border-radius: 2px; }
      `}</style>

      {/* ── Flying bubbles layer — renders all in-flight cart animations ── */}
      <FlyingBubblesLayer />

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCategorySelect={onCategoryChange}
      />

      <div className="sticky top-0 z-50 w-full shadow-md">
        <div className="top-bar py-1.5 px-4 text-center">
          <motion.p
            className="text-xs tracking-widest"
            style={{ color: "#fde8c8", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ✦ &nbsp; Free shipping on orders above ₹999 &nbsp;·&nbsp; 100% Authentic Handcrafted Malas &nbsp; ✦
          </motion.p>
        </div>

        <header className="header-root divine-gradient relative" style={{ borderBottom: "1px solid rgba(212, 175, 55,0.25)" }}>
          <div className="absolute inset-0 mandala-bg opacity-60 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 py-4">

              {/* ── Brand ── */}
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
                  <span style={{ color: "#E65100", fontSize: "13px", fontFamily: "serif" }}>ॐ</span>
                  <span className="om-divider">✦ ✦ ✦</span>
                </motion.div>

                <button
                  type="button"
                  className="block sm:hidden mb-2 p-2 rounded-full text-amber-800 hover:bg-amber-100 transition"
                  aria-label="Open mobile menu"
                  onClick={() => setDrawerOpen(true)}
                >
                  <MenuIcon />
                </button>

                <h1
                  className="brand-title text-2xl sm:text-3xl font-black uppercase leading-none"
                  style={{ color: "#9B1B1B", textShadow: "0 1px 2px rgba(155, 27, 27,0.15)" }}
                >
                  MalaWale
                </h1>

                <motion.p
                  className="brand-subtitle italic text-xs sm:text-sm font-medium leading-tight mt-0.5"
                  style={{ color: "#D4AF37", letterSpacing: "0.04em" }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  By Sanwariya Handicraft
                </motion.p>
              </motion.div>

              {/* ── Search ── */}
              <motion.div
                ref={searchContainerRef}
                className="flex-1 max-w-lg hidden sm:block relative"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <form onSubmit={handleSearchSubmit} className="relative">
                  <motion.div
                    className="absolute -inset-px rounded-full pointer-events-none"
                    animate={{
                      boxShadow: searchFocused
                        ? "0 0 0 2px rgba(212, 175, 55, 0.55), 0 0 28px rgba(200, 132, 58, 0.18)"
                        : "0 0 0 1px rgba(212, 175, 55, 0.2)",
                    }}
                    transition={{ duration: 0.35 }}
                  />

                  <div
                    className="flex items-center rounded-full overflow-hidden"
                    style={{
                      background: searchFocused ? "rgba(255, 252, 245, 0.97)" : "rgba(255, 252, 245, 0.8)",
                      border: "1px solid",
                      borderColor: searchFocused ? "rgba(212, 175, 55, 0.6)" : "rgba(212, 175, 55, 0.3)",
                      transition: "background 0.3s ease, border-color 0.3s ease",
                    }}
                  >
                    <motion.div
                      className="pl-4 pr-2 flex-shrink-0"
                      animate={{ color: searchFocused ? "#E65100" : "#c8a07a" }}
                      transition={{ duration: 0.3 }}
                      style={{ cursor: "pointer" }}
                      onClick={() => inputRef.current?.focus()}
                    >
                      <SearchIcon />
                    </motion.div>

                    <div className="relative flex-1 py-2.5 pr-3 overflow-hidden">
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        className="w-full bg-transparent outline-none text-sm relative z-10"
                        style={{ color: "#5c3317", fontFamily: "'Jost', sans-serif", fontWeight: 400, letterSpacing: "0.02em" }}
                        aria-label="Search products"
                        autoComplete="off"
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
                        background: "linear-gradient(135deg, #9B1B1B, #E65100)",
                        color: "#fde8c8",
                        fontFamily: "'Jost', sans-serif",
                        letterSpacing: "0.06em",
                      }}
                      whileHover={{ scale: 1.04, boxShadow: "0 4px 14px rgba(155, 27, 27,0.35)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <SparkleIcon />
                      Search
                    </motion.button>
                  </div>
                </form>

              <AnimatePresence>
                {showDropdown && (
                  <SearchDropdown
                    loading={searchLoading}
                    results={searchResults}
                    query={searchValue.trim()}
                    onSelect={(name, id) => handleSelectResult(name, id)}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Action Buttons ── */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 relative z-[100]">
              <ActionButton
                label="Favourites"
                count={favCount}
                countColor="#e05c7a"
                onClick={() => setActiveModalWindow("wishlist")}
              >
                <HeartIcon />
              </ActionButton>

              {/*
                ── CART BUTTON ──
                id="header-cart-icon" → FlyingBubblesLayer reads this to find the landing target
                bouncing → triggers the spring-bounce animation when a bubble lands
              */}
              <ActionButton
                id="header-cart-icon"
                label="Cart"
                count={typeof finalCartCount === "number" && finalCartCount > 0 ? finalCartCount : 0}
                countColor="#E65100"
                bouncing={cartBouncing}
                onClick={() => setActiveModalWindow("cart")}
              >
                <div style={{ opacity: 1, color: "#9B1B1B" }} className="flex items-center justify-center">
                  <CartIcon />
                </div>
              </ActionButton>

              <div className="w-px h-8 mx-1 hidden sm:block" style={{ background: "rgba(212, 175, 55,0.3)" }} />

              {/* ── Profile ── */}
              <div className="relative z-[100]" ref={profileRef}>
                <motion.button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="relative flex flex-col items-center gap-0.5"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label="User profile"
                  aria-expanded={profileOpen}
                  type="button"
                >
                  <div className="relative flex items-center justify-center w-9 h-9">
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
                      style={{ background: profileStatusColor, borderColor: "#fdf6ec" }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-medium hidden sm:block mt-0.5"
                    style={{ color: "#9B1B1B", fontFamily: "'Jost', sans-serif", letterSpacing: "0.04em" }}
                  >
                    {isAuthenticated ? "Account" : "Login"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <ProfileDropdown
                      onOpenOrders={() => setActiveModalWindow("orders")}
                      onOpenWishlist={() => setActiveModalWindow("wishlist")}
                      onClose={() => setProfileOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="pb-3 sm:hidden">
            <form onSubmit={handleSearchSubmit}>
              <div
                className="flex items-center rounded-full px-3 py-2"
                style={{ background: "rgba(255,252,245,0.9)", border: "1px solid rgba(212, 175, 55,0.35)" }}
              >
                <div style={{ color: "#E65100" }}>
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search malas, bracelets…"
                  className="flex-1 mx-2 bg-transparent outline-none text-sm"
                  style={{ color: "#5c3317", fontFamily: "'Jost', sans-serif" }}
                  autoComplete="off"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="header-border h-px w-full" />
      </header>
    </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {activeModalWindow === "wishlist" && (
          <WishlistModal onClose={() => setActiveModalWindow("none")} />
        )}
        {activeModalWindow === "orders" && (
          <OrdersModal onClose={() => setActiveModalWindow("none")} />
        )}
        {activeModalWindow === "cart" && (
          <CartModal onClose={() => setActiveModalWindow("none")} />
        )}
      </AnimatePresence>
    </>
  );
}