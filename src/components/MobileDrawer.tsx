"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { categoryService } from "../utils/service";
import { useNavigate } from "react-router-dom"; // 🔥 Added navigation matrix 

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect?: (catName: string) => void;
  categories?: string[]; 
}

interface BackendCategory {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
}

export default function MobileDrawer({ isOpen, onClose, onCategorySelect }: MobileDrawerProps) {
  const { user, setIsLoginOpen, logout } = useAuth();
  const navigate = useNavigate(); // 🔥 Router dynamic hook context
  const [liveCategories, setLiveCategories] = useState<BackendCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!isOpen) return;

    async function loadDynamicCategories() {
      setLoadingCats(true);
      try {
        const response = await categoryService.getCategories();
        if (response && response.data && response.data.categories) {
          setLiveCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Failed loading mobile drawer categories from DB:", error);
      } finally {
        setLoadingCats(false);
      }
    }
    loadDynamicCategories();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-y-0 left-0 w-[80%] max-w-[340px] h-full shadow-2xl z-[10000] flex flex-col overflow-y-auto"
            style={{
              background: "linear-gradient(145deg, #fffcf5 0%, #fdf6ec 100%)",
              fontFamily: "'Jost', sans-serif"
            }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          >
            <div 
              className="p-5 flex flex-col gap-1 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #9B1B1B 0%, #D84315 100%)" }}
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white text-xl outline-none cursor-pointer"
              >
                ✕
              </button>
              <span className="text-amber-200 text-xs tracking-widest font-serif">ॐ SANWARIYA</span>
              <h2 className="text-white text-xl font-bold font-serif tracking-wide uppercase leading-none">MalaWale</h2>
              <p className="text-amber-100/80 text-xs italic font-serif mt-1">✦ Handcrafted with pure devotion ✦</p>
            </div>

            {isAuthenticated && (
              <div className="px-5 py-3.5 bg-orange-50/50 border-b border-orange-100/40 flex flex-col gap-0.5">
                <span className="text-[10px] text-amber-800/60 font-medium uppercase tracking-wider">Session Active</span>
                <span className="text-sm font-bold text-[#9B1B1B] truncate">Hari Om, {user?.name || "Devotee"}! 🙏</span>
              </div>
            )}

            <div className="py-4 flex flex-col">
              <div className="px-5 py-2 text-[11px] font-bold tracking-wider text-amber-800/60 uppercase">
                Shop By Category
              </div>

              {loadingCats ? (
                <div className="px-5 py-3 text-xs italic text-amber-700/60 animate-pulse">
                  Aligning dynamic paths...
                </div>
              ) : liveCategories.length > 0 ? (
                liveCategories.map((cat) => (
                  <button
                    key={cat._id || cat.id}
                    onClick={() => {
                      const slugStr = cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-");
                      
                      // 1. Programmatically navigate via React Router Context
                      navigate(`/category/${slugStr}`);
                      
                      // 2. Fire local App.tsx hook filter trigger state loop
                      if (onCategorySelect) {
                        onCategorySelect(slugStr);
                      }
                      
                      onClose();

                      // Smooth visual scroll shift down to the matching grid items
                      setTimeout(() => {
                        const targetSection = document.getElementById("featured-products-section");
                        if (targetSection) {
                          const elementPosition = targetSection.getBoundingClientRect().top + window.scrollY;
                          window.scrollTo({ top: elementPosition - 100, behavior: "smooth" });
                        }
                      }, 180);
                    }}
                    className="w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-medium border-b border-orange-100/40 transition-all active:bg-orange-100/40 cursor-pointer"
                    style={{ color: "#9B1B1B" }}
                  >
                    <span className="tracking-wide">{cat.name}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="opacity-60">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                ))
              ) : (
                <div className="px-5 py-3 text-xs italic text-amber-700/50">
                  No explicit categories found.
                </div>
              )}
            </div>

            <div className="mt-auto border-t border-orange-100/70 bg-orange-50/20 p-4 flex flex-col gap-1">
              <button
                className="w-full py-2.5 px-2 text-left text-xs font-bold uppercase tracking-wider transition-colors hover:bg-orange-100/30 rounded-xl flex items-center justify-between cursor-pointer"
                style={{ color: "#D84315", background: "rgba(212, 175, 55,0.08)" }}
                onClick={() => {
                  navigate("/track-order");
                  onClose();
                }}
              >
                <span className="flex items-center gap-2">📦 Track Your Order</span>
                <span className="text-[10px]">➔</span>
              </button>

              <button
                className="w-full py-2 px-2 text-left text-xs font-medium opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ color: "#D84315" }}
                onClick={() => { navigate("/contact"); onClose(); }}
              >
                Contact Us
              </button>

              <button
                className="w-full py-2 px-2 text-left text-xs font-medium opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ color: "#D84315" }}
                onClick={() => { navigate("/faqs"); onClose(); }}
              >
                FAQs
              </button>

              <div className="h-px bg-orange-100/40 my-1.5" />

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full mt-1 py-3 px-3 text-center text-xs font-bold rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition cursor-pointer uppercase tracking-widest"
                >
                  Logout Session ✕
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (setIsLoginOpen) {
                      setIsLoginOpen(true);
                    }
                  }}
                  className="w-full mt-1 py-3 px-3 text-center text-xs font-bold rounded-xl text-white transition cursor-pointer uppercase tracking-widest shadow-sm"
                  style={{ background: "linear-gradient(135deg, #E65100 0%, #D84315 100%)" }}
                >
                  Login / Register ✦
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}