"use client";

import React, { useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OmSymbolConfig {
  id: number;
  x: number;          // % of viewport width
  y: number;          // % of viewport height
  size: number;       // px
  parallaxStrength: number; // how strongly it reacts to mouse (0.01 – 0.06)
  scrollSpeed: number;      // relative scroll drift multiplier
  rotationBase: number;     // initial rotation in degrees
  opacity: number;          // base opacity (0.02 – 0.04)
  blurPx: number;           // subtle blur to push it further into bg
}

interface SparkleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  parallaxStrength: number;
  opacity: number;
  delay: number;       // pulsing animation delay (seconds)
}

// ─── Static Configuration ─────────────────────────────────────────────────────

const OM_SYMBOLS: OmSymbolConfig[] = [
  { id: 0,  x: 8,   y: 12,  size: 120, parallaxStrength: 0.025, scrollSpeed: 0.35, rotationBase: -8,  opacity: 0.035, blurPx: 0.6 },
  { id: 1,  x: 88,  y: 8,   size: 90,  parallaxStrength: 0.04,  scrollSpeed: 0.5,  rotationBase: 12,  opacity: 0.03,  blurPx: 0.4 },
  { id: 2,  x: 50,  y: 22,  size: 160, parallaxStrength: 0.015, scrollSpeed: 0.25, rotationBase: 0,   opacity: 0.025, blurPx: 0.8 },
  { id: 3,  x: 18,  y: 58,  size: 75,  parallaxStrength: 0.055, scrollSpeed: 0.6,  rotationBase: -15, opacity: 0.04,  blurPx: 0.3 },
  { id: 4,  x: 78,  y: 45,  size: 110, parallaxStrength: 0.02,  scrollSpeed: 0.4,  rotationBase: 8,   opacity: 0.03,  blurPx: 0.5 },
  { id: 5,  x: 35,  y: 75,  size: 95,  parallaxStrength: 0.045, scrollSpeed: 0.55, rotationBase: -5,  opacity: 0.035, blurPx: 0.4 },
  { id: 6,  x: 92,  y: 72,  size: 140, parallaxStrength: 0.018, scrollSpeed: 0.3,  rotationBase: 18,  opacity: 0.025, blurPx: 0.7 },
  { id: 7,  x: 62,  y: 90,  size: 80,  parallaxStrength: 0.05,  scrollSpeed: 0.65, rotationBase: -10, opacity: 0.04,  blurPx: 0.3 },
  { id: 8,  x: 5,   y: 88,  size: 100, parallaxStrength: 0.03,  scrollSpeed: 0.45, rotationBase: 6,   opacity: 0.03,  blurPx: 0.5 },
  { id: 9,  x: 55,  y: 52,  size: 70,  parallaxStrength: 0.06,  scrollSpeed: 0.7,  rotationBase: -20, opacity: 0.035, blurPx: 0.2 },
];

const SPARKLES: SparkleConfig[] = [
  { id: 0,  x: 22,  y: 30,  size: 6,  parallaxStrength: 0.07,  opacity: 0.06, delay: 0 },
  { id: 1,  x: 70,  y: 18,  size: 4,  parallaxStrength: 0.09,  opacity: 0.05, delay: 0.8 },
  { id: 2,  x: 45,  y: 65,  size: 8,  parallaxStrength: 0.05,  opacity: 0.07, delay: 1.6 },
  { id: 3,  x: 85,  y: 55,  size: 5,  parallaxStrength: 0.08,  opacity: 0.055, delay: 0.4 },
  { id: 4,  x: 12,  y: 72,  size: 7,  parallaxStrength: 0.06,  opacity: 0.065, delay: 2.0 },
  { id: 5,  x: 60,  y: 38,  size: 4,  parallaxStrength: 0.10,  opacity: 0.05, delay: 1.2 },
  { id: 6,  x: 30,  y: 92,  size: 6,  parallaxStrength: 0.075, opacity: 0.06, delay: 0.6 },
  { id: 7,  x: 95,  y: 85,  size: 5,  parallaxStrength: 0.085, opacity: 0.055, delay: 1.8 },
  { id: 8,  x: 48,  y: 10,  size: 9,  parallaxStrength: 0.04,  opacity: 0.07, delay: 2.4 },
  { id: 9,  x: 75,  y: 80,  size: 4,  parallaxStrength: 0.095, opacity: 0.05, delay: 0.2 },
  { id: 10, x: 3,   y: 45,  size: 7,  parallaxStrength: 0.065, opacity: 0.06, delay: 1.4 },
  { id: 11, x: 38,  y: 48,  size: 5,  parallaxStrength: 0.08,  opacity: 0.055, delay: 3.0 },
];

// ─── SVG Paths ────────────────────────────────────────────────────────────────

/** Four-pointed star sparkle — fits inside a 20×20 viewBox */
const SPARKLE_PATH = `
  M 10 0 L 11.5 8.5 L 20 10 L 11.5 11.5 L 10 20 L 8.5 11.5 L 0 10 L 8.5 8.5 Z
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface OmElementProps {
  config: OmSymbolConfig;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  scrollY: MotionValue<number>;
}

const OmElement: React.FC<OmElementProps> = ({ config, mouseX, mouseY, scrollY }) => {
  // Smooth spring-based mouse response — staggered stiffness per layer
  const springConfig = {
    stiffness: 30 + config.parallaxStrength * 400,
    damping: 22,
    mass: 1.2,
  };

  const rawMoveX = useTransform(
    mouseX,
    (v: number) => (v - 0.5) * config.parallaxStrength * 180
  );
  const rawMoveY = useTransform(
    mouseY,
    (v: number) => (v - 0.5) * config.parallaxStrength * 180
  );

  const moveX = useSpring(rawMoveX, springConfig);
  const moveY = useSpring(rawMoveY, springConfig);

  // Scroll-driven upward drift + gentle rotation
  const scrollDrift = useTransform(scrollY, [0, 3000], [0, -config.scrollSpeed * 220]);
  const scrollRotation = useTransform(
    scrollY,
    [0, 3000],
    [config.rotationBase, config.rotationBase + (config.id % 2 === 0 ? 18 : -14)]
  );

  const smoothDrift = useSpring(scrollDrift, { stiffness: 20, damping: 30 });
  const smoothRotation = useSpring(scrollRotation, { stiffness: 15, damping: 25 });

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${config.x}%`,
        top: `${config.y}%`,
        x: moveX,
        y: moveY,
        translateY: smoothDrift,
        rotate: smoothRotation,
        width: config.size,
        height: config.size,
        filter: `blur(${config.blurPx}px)`,
        willChange: "transform",
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: config.opacity, scale: 1 }}
      transition={{ duration: 3.5 + config.id * 0.3, ease: "easeOut" }}
    >
      <svg
        viewBox="0 0 100 100"
        width={config.size}
        height={config.size}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fontSize="80"
          fontFamily="serif"
          fill="#c8843a"
          opacity="1"
        >
          ॐ
        </text>
      </svg>
    </motion.div>
  );
};

interface SparkleElementProps {
  config: SparkleConfig;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

const SparkleElement: React.FC<SparkleElementProps> = ({ config, mouseX, mouseY }) => {
  const springConfig = { stiffness: 55, damping: 18, mass: 0.8 };

  const rawMoveX = useTransform(
    mouseX,
    (v: number) => (v - 0.5) * config.parallaxStrength * 200
  );
  const rawMoveY = useTransform(
    mouseY,
    (v: number) => (v - 0.5) * config.parallaxStrength * 200
  );

  const moveX = useSpring(rawMoveX, springConfig);
  const moveY = useSpring(rawMoveY, springConfig);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${config.x}%`,
        top: `${config.y}%`,
        x: moveX,
        y: moveY,
        width: config.size,
        height: config.size,
        willChange: "transform",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, config.opacity, config.opacity * 0.6, config.opacity],
        scale: [0.6, 1, 0.8, 1],
      }}
      transition={{
        duration: 4,
        delay: config.delay,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 20 20"
        width={config.size}
        height={config.size}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d={SPARKLE_PATH} fill="#d4a373" />
      </svg>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DivineBackground: React.FC = () => {
  // Normalized mouse position (0–1 range)
  const mouseX = useMotionValue<number>(0.5);
  const mouseY = useMotionValue<number>(0.5);

  // Page scroll
  const { scrollY } = useScroll();

  // Throttle ref to avoid over-firing on mouse move
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent): void => {
    if (rafId.current !== null) return;

    rafId.current = requestAnimationFrame(() => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
      rafId.current = null;
    });
  }, [mouseX, mouseY]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [handleMouseMove]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* Subtle radial gradient wash for warmth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(212,163,115,0.025) 0%, transparent 70%)",
        }}
      />

      {/* Om symbols — multi-layered parallax */}
      {OM_SYMBOLS.map((config) => (
        <OmElement
          key={config.id}
          config={config}
          mouseX={mouseX}
          mouseY={mouseY}
          scrollY={scrollY}
        />
      ))}

      {/* Sparkle constellation */}
      {SPARKLES.map((config) => (
        <SparkleElement
          key={config.id}
          config={config}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}
    </div>
  );
};

export default DivineBackground;