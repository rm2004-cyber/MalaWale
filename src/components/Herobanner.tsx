"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bannerService } from "../utils/service";

const HeroBanner: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await bannerService.getBanners();
        if (res.data.banners) setBanners(res.data.banners);
      } catch (err) { console.error("Banner fetch error"); }
    }
    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length > 1) {
      intervalRef.current = setInterval(nextSlide, 5000);
      return () => clearInterval(intervalRef.current!);
    }
  }, [nextSlide, banners.length]);

  if (banners.length === 0) return null;
  const slide = banners[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "clamp(220px, 52vw, 520px)", background: "#1a0a00" }}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={slide._id}
          src={slide.image}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-0" />

      <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-20 z-10">
        <span className="text-[#D4AF37] uppercase tracking-[0.2em] text-xs font-serif italic mb-2 border border-[#D4AF37]/30 px-3 py-1 w-fit">
          {slide.tag || "DIVINE COLLECTION"}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-[#FCF8F2] mb-4 font-serif">
          {slide.title}
        </h1>
        <p className="text-stone-300 italic font-serif text-lg mb-6 max-w-lg">
          {slide.subtitle}
        </p>
        <a 
          // Yahan maine href mein # prefix add kar diya hai
          href={slide.categoryLink ? `/#/category/${slide.categoryLink._id}` : "#"}
          className="bg-[#9B1B1B] text-white px-8 py-3 w-fit font-medium uppercase tracking-widest text-sm rounded-sm hover:bg-[#D84315] transition-colors"
        >
          Explore {slide.categoryLink?.name || "Collection"}
        </a>
      </div>

      <div className="absolute bottom-6 left-10 text-[#D4AF37] font-serif text-lg z-20">
        {String(current + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
      </div>
    </section>
  );
};

export default HeroBanner;