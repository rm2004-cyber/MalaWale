"use client";

import { useState, useEffect, useRef, forwardRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type AuthStep = "phone" | "register" | "otp" | "authenticated";

interface ProfileDropdownProps {
  onOpenOrders: () => void;
  onOpenWishlist: () => void;
  onClose: () => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
  </svg>
);

const OmSymbolSVG = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#c87941">
    <text x="50" y="72" textAnchor="middle" fontFamily="serif" fontSize="70" fill="#c87941">ॐ</text>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const GreenCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="11" fill="#22c55e" />
    <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

// ─── Om Loader ────────────────────────────────────────────────────────────────

const OmLoader = () => {
  const dots = Array.from({ length: 28 });
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-5">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg viewBox="0 0 100 100" width="96" height="96" className="absolute top-0 left-0" style={{ animation: "spin 3s linear infinite" }}>
          {dots.map((_, i) => {
            const angle = (i / dots.length) * 2 * Math.PI;
            const radius = 44;
            const cx = 50 + radius * Math.cos(angle);
            const cy = 50 + radius * Math.sin(angle);
            const opacity = 0.25 + 0.75 * (i / dots.length);
            const dotSize = i % 4 === 0 ? 3.2 : 2;
            return <circle key={i} cx={cx} cy={cy} r={dotSize} fill="#c87941" opacity={opacity} />;
          })}
        </svg>
        <div className="z-10 flex items-center justify-center w-14 h-14">
          <OmSymbolSVG />
        </div>
      </div>
      <p style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: "italic", color: "#D84315", fontSize: "15px", letterSpacing: "0.02em" }}>
        Seeking divine connection...
      </p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Custom Date Input ─────────────────────────────────────────────────────────

const CustomDateInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder }, ref) => (
  <input
    ref={ref}
    value={value}
    onClick={onClick}
    placeholder={placeholder}
    readOnly
    style={{
      width: "100%",
      padding: "10px 12px",
      background: "#fff",
      border: "1.5px solid #dfc9a0",
      borderRadius: "10px",
      fontSize: "13px",
      outline: "none",
      color: "#3d1f08",
      boxSizing: "border-box",
      cursor: "pointer",
    }}
  />
));
CustomDateInput.displayName = "CustomDateInput";

// ─── Spiritual OTP Keyframes & Styles ─────────────────────────────────────────

const spiritualStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes mandala-cw {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes mandala-ccw {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes sacred-pulse {
    0%, 100% {
      box-shadow:
        0 0 0 0   rgba(200,121,65,0),
        0 0 8px 2px rgba(200,121,65,0.35);
    }
    50% {
      box-shadow:
        0 0 0 6px rgba(200,121,65,0.10),
        0 0 18px 6px rgba(200,121,65,0.55);
    }
  }
  @keyframes petal-float {
    0%   { opacity: 0.9; transform: translateY(0px)   scale(1)   rotate(0deg); }
    100% { opacity: 0;   transform: translateY(-56px) scale(0.2) rotate(200deg); }
  }
  @keyframes spark-float {
    0%   { opacity: 1;   transform: translateY(0px)   scale(1); }
    100% { opacity: 0;   transform: translateY(-44px) scale(0.3); }
  }
  @keyframes shimmer-sweep {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes diya-bob {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-3px); }
  }
  @keyframes flame-flicker {
    0%, 100% { opacity: 1;    transform: scaleX(1);    }
    30%       { opacity: 0.93; transform: scaleX(1.01); }
    70%       { opacity: 0.96; transform: scaleX(0.99); }
  }
`;

// ─── Mandala Ring SVG (behind each OTP box) ───────────────────────────────────

function MandalaRing({ filled, focused }: { filled: boolean; focused: boolean }) {
  const size   = filled ? 74 : 62;
  const offset = -(size / 2);

  const outerDots   = Array.from({ length: 12 });
  const outerSpikes = Array.from({ length: 8 });
  const innerPetals = Array.from({ length: 6 });

  return (
    <div
      style={{
        position : "absolute",
        top      : "50%",
        left     : "50%",
        width    : `${size}px`,
        height   : `${size}px`,
        marginTop : `${offset}px`,
        marginLeft: `${offset}px`,
        pointerEvents: "none",
        zIndex   : 1,
      }}
    >
      <svg viewBox="0 0 74 74" width={size} height={size}>
        {/* ── outer ring: dharma-chakra spikes (clockwise) ── */}
        <g style={{ transformOrigin: "37px 37px", animation: "mandala-cw 5s linear infinite" }}>
          {outerSpikes.map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const x = 37 + 33 * Math.cos(a);
            const y = 37 + 33 * Math.sin(a);
            return (
              <polygon
                key={i}
                points={`${x},${y - 3} ${x + 2.2},${y + 2.5} ${x - 2.2},${y + 2.5}`}
                fill="#c87941"
                opacity={filled ? "0.75" : "0.45"}
                transform={`rotate(${i * 45},${x},${y})`}
              />
            );
          })}

          {/* tiny dot ring */}
          {outerDots.map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x = 37 + 31 * Math.cos(a);
            const y = 37 + 31 * Math.sin(a);
            return (
              <circle
                key={i}
                cx={x} cy={y} r="1.3"
                fill={filled ? "#D84315" : "#c87941"}
                opacity={filled ? "0.6" : "0.35"}
              />
            );
          })}
        </g>

        {/* ── inner ring: lotus petals (counter-clockwise) ── */}
        <g style={{ transformOrigin: "37px 37px", animation: "mandala-ccw 4s linear infinite" }}>
          {innerPetals.map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const x = 37 + 22 * Math.cos(a);
            const y = 37 + 22 * Math.sin(a);
            return (
              <path
                key={i}
                d={`M${x},${y - 2.8} Q${x + 2.2},${y} ${x},${y + 2.8} Q${x - 2.2},${y} ${x},${y - 2.8}`}
                fill={filled ? "#D84315" : "#9B1B1B"}
                opacity={filled ? "0.7" : "0.4"}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// ─── Floating Petal / Spark Emitter ───────────────────────────────────────────

function useParticleEmitter(
  containerRef: React.RefObject<HTMLDivElement>,
  active: boolean
) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const COLORS = ["#D84315", "#c87941", "#f5a623", "#9B1B1B", "#e8892a"];

    const interval = setInterval(() => {
      const parent = containerRef.current;
      if (!parent) return;

      // ── spark ──
      const spark = document.createElement("div");
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size  = 2.5 + Math.random() * 4;
      const left  = 4 + Math.random() * 34;
      const dur   = 0.85 + Math.random() * 0.55;

      Object.assign(spark.style, {
        position        : "absolute",
        width           : `${size}px`,
        height          : `${size}px`,
        borderRadius    : "50%",
        background      : color,
        left            : `${left}px`,
        top             : "8px",
        opacity         : "0.9",
        pointerEvents   : "none",
        zIndex          : "4",
        animation       : `spark-float ${dur}s ease-out forwards`,
        animationDelay  : `${Math.random() * 0.15}s`,
      });
      parent.appendChild(spark);
      setTimeout(() => spark.remove(), (dur + 0.2) * 1000);

      // ── petal (svg ellipse) every other tick ──
      if (Math.random() > 0.45) {
        const wrap = document.createElement("div");
        const petalLeft = 4 + Math.random() * 28;
        const petalDur  = 1.1 + Math.random() * 0.6;
        Object.assign(wrap.style, {
          position      : "absolute",
          left          : `${petalLeft}px`,
          top           : "6px",
          zIndex        : "4",
          pointerEvents : "none",
          animation     : `petal-float ${petalDur}s ease-out forwards`,
          animationDelay: `${Math.random() * 0.12}s`,
        });
        const ns  = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("width", "12");
        svg.setAttribute("height", "12");
        svg.setAttribute("viewBox", "0 0 12 12");

        const el = document.createElementNS(ns, "ellipse");
        el.setAttribute("cx", "6");
        el.setAttribute("cy", "6");
        el.setAttribute("rx", "2");
        el.setAttribute("ry", "4.5");
        el.setAttribute("fill", "#D84315");
        el.setAttribute("opacity", "0.75");
        el.setAttribute("transform", `rotate(${Math.random() * 360},6,6)`);
        svg.appendChild(el);
        wrap.appendChild(svg);
        parent.appendChild(wrap);
        setTimeout(() => wrap.remove(), (petalDur + 0.2) * 1000);
      }
    }, 550);

    return () => clearInterval(interval);
  }, [active, containerRef]);
}

// ─── Single OTP Box with animation ───────────────────────────────────────────

interface OtpBoxProps {
  digit      : string;
  idx        : number;
  focused    : boolean;
  inputRef   : (el: HTMLInputElement | null) => void;
  onChange   : (idx: number, val: string) => void;
  onKeyDown  : (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste    : (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onFocus    : () => void;
  onBlur     : () => void;
}

function OtpBox({ digit, idx, focused, inputRef, onChange, onKeyDown, onPaste, onFocus, onBlur }: OtpBoxProps) {
  const filled      = digit !== "";
  const showRing    = focused || filled;
  const containerRef = useRef<HTMLDivElement>(null);

  useParticleEmitter(containerRef, showRing);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "42px", height: "46px", flexShrink: 0 }}>
      {showRing && <MandalaRing filled={filled} focused={focused} />}

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        value={digit}
        onChange={(e) => onChange(idx, e.target.value)}
        onKeyDown={(e) => onKeyDown(idx, e)}
        onPaste={onPaste}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          position     : "relative",
          zIndex       : 2,
          width        : "42px",
          height       : "46px",
          textAlign    : "center",
          fontSize     : "20px",
          fontWeight   : 700,
          background   : "#fff",
          border       : focused
            ? "2.5px solid #9B1B1B"
            : filled
            ? "2.5px solid #c87941"
            : "1.5px solid #dfc9a0",
          borderRadius : "10px",
          outline      : "none",
          color        : "#7a3810",
          boxSizing    : "border-box",
          transition   : "border-color 0.18s ease",
          animation    : filled ? "sacred-pulse 2s ease-in-out infinite" : "none",
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfileDropdown({ onOpenOrders, onOpenWishlist, onClose }: ProfileDropdownProps) {
  const { user, checkUserExists, sendOtp, verifyOtp, logout } = useAuth();

  const [authStep, setAuthStep]       = useState<AuthStep>(user ? "authenticated" : "phone");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode]         = useState("");
  const [otpArray, setOtpArray]       = useState<string[]>(Array(6).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [userProfile, setUserProfile] = useState({ name: "", email: "", dob: "" });
  const [loading, setLoading]         = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");

  const isPhoneComplete = mobileNumber.length === 10;

  // Sync otpArray → otpCode string
  useEffect(() => { setOtpCode(otpArray.join("")); }, [otpArray]);

  // Auto-focus first OTP box
  useEffect(() => {
    if (authStep === "otp") {
      setTimeout(() => { otpRefs.current[0]?.focus(); }, 150);
    }
  }, [authStep]);

  // Sync user state
  useEffect(() => { setAuthStep(user ? "authenticated" : "phone"); }, [user]);

  // ── OTP handlers ──
  const handleOtpChange = useCallback((index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otpArray];
    newOtp[index] = cleanValue;
    setOtpArray(newOtp);
    if (cleanValue !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otpArray]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otpArray[index] === "" && index > 0) {
        const newOtp = [...otpArray];
        newOtp[index - 1] = "";
        setOtpArray(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else if (otpArray[index] !== "") {
        const newOtp = [...otpArray];
        newOtp[index] = "";
        setOtpArray(newOtp);
      }
    }
  }, [otpArray]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData.length === 6) {
      setOtpArray(pasteData.split(""));
      otpRefs.current[5]?.focus();
    }
  }, []);

  // ── Submit handlers ──
  const handlePhoneSubmit = async () => {
    if (!isPhoneComplete) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const check = await checkUserExists(mobileNumber);
      if (check && check.exists) {
        const res = await sendOtp(mobileNumber, "sign-in-button");
        setLoading(false);
        if (res.success) setAuthStep("otp");
        else setErrorMsg(res.error || "Firebase OTP Trigger failed!");
      } else {
        setLoading(false);
        setAuthStep("register");
      }
    } catch {
      setLoading(false);
      setAuthStep("register");
    }
  };

  const handleRegisterSubmit = async () => {
    if (!userProfile.name || !userProfile.email || !userProfile.dob) return;
    setLoading(true);
    setErrorMsg("");
    const res = await sendOtp(mobileNumber, "sign-in-button");
    setLoading(false);
    if (res.success) setAuthStep("otp");
    else setErrorMsg(res.error || "OTP delivery error!");
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6) return;
    setLoading(true);
    setErrorMsg("");
    const isSignup = userProfile.name !== "";
    const res = await verifyOtp(otpCode, isSignup ? userProfile : undefined);
    setLoading(false);
    if (res.success) {
      setAuthStep("authenticated");
    } else {
      setErrorMsg(res.error || "Invalid OTP code.");
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    setMobileNumber("");
    setOtpCode("");
    setUserProfile({ name: "", email: "", dob: "" });
    setAuthStep("phone");
  };

  return (
    <motion.div
      className="absolute right-0 top-full mt-3 z-[999]"
      style={{
        width       : "320px",
        borderRadius: "16px",
        boxShadow   : "0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(155, 27, 27,0.12)",
        background  : "#fdf8f2",
        border      : "1px solid rgba(200,155,100,0.2)",
      }}
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Inject all spiritual keyframes once */}
      <style>{spiritualStyles}</style>

      <div id="sign-in-button" />

      {/* ── Header strip ── */}
      <div
        className="relative overflow-hidden px-5 py-4 flex items-center gap-3"
        style={{
          background        : "linear-gradient(135deg, #7a3810 0%, #D84315 55%, #b8642e 100%)",
          minHeight         : "80px",
          borderTopLeftRadius : "15px",
          borderTopRightRadius: "15px",
        }}
      >
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 select-none pointer-events-none"
          style={{ opacity: 0.13 }}
        >
          <span style={{ fontSize: "72px", color: "#fff", fontFamily: "serif", lineHeight: 1 }}>ॐ</span>
        </div>

        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{
            width      : "46px",
            height     : "46px",
            background : "rgba(255,255,255,0.15)",
            border     : "1.5px solid rgba(255,255,255,0.25)",
            color      : "rgba(255,245,230,0.9)",
          }}
        >
          <UserIcon />
        </div>

        <div>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff8ee", fontFamily: "serif", letterSpacing: "0.01em" }}>
            {user ? `Namaste, ${user.name || "Devotee"}` : "Welcome, Devotee"}
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,220,170,0.85)", marginTop: "2px" }}>
            {user ? user.phone : "Sign in to your sacred space"}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "20px 18px 8px" }}>

        {errorMsg && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "8px 12px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", color: "#dc2626", textAlign: "center", fontWeight: 500 }}>{errorMsg}</p>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* Loading */}
          {loading && (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <OmLoader />
            </motion.div>
          )}

          {/* ── Phone step ── */}
          {!loading && !user && authStep === "phone" && (
            <motion.div key="phone" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#7a4010", marginBottom: "14px", textTransform: "uppercase" }}>
                Login via Mobile Number
              </p>

              <div style={{ display: "flex", alignItems: "center", borderRadius: "12px", overflow: "hidden", border: "1.5px solid #dfc9a0", background: "#fff", marginBottom: "14px", boxShadow: "0 1px 4px rgba(139,90,40,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 12px", borderRight: "1px solid #e8d8b8", background: "#fdf5eb", flexShrink: 0 }}>
                  <span style={{ fontSize: "14px" }}>🇮🇳</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#7a4010" }}>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter mobile number"
                  style={{ flex: 1, minWidth: 0, padding: "10px 8px 10px 12px", background: "transparent", outline: "none", border: "none", fontSize: "14px", letterSpacing: "0.08em", color: "#3d1f08" }}
                />
                <AnimatePresence>
                  {isPhoneComplete && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} style={{ paddingRight: "12px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                      <GreenCheckIcon />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                disabled={!isPhoneComplete}
                onClick={handlePhoneSubmit}
                style={{ width: "100%", padding: "11px", borderRadius: "12px", border: "none", background: isPhoneComplete ? "linear-gradient(135deg, #9B1B1B 0%, #D84315 100%)" : "#d4b896", color: "#fff8ee", fontSize: "14px", fontWeight: 600, cursor: isPhoneComplete ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", letterSpacing: "0.02em", boxShadow: isPhoneComplete ? "0 4px 14px rgba(155, 27, 27,0.35)" : "none", transition: "all 0.2s ease" }}
              >
                <PhoneIcon />
                Send OTP
              </button>

              <div style={{ textAlign: "center", marginTop: "14px" }}>
                <p style={{ fontSize: "11px", color: "#b08060", fontStyle: "italic", marginBottom: "8px" }}>secure &amp; quick</p>
                <p style={{ fontSize: "11px", color: "#b08060" }}>
                  By signing in, you agree to our{" "}
                  <a href="#" style={{ color: "#9B1B1B", textDecoration: "underline" }}>Terms</a>
                  {" "}and{" "}
                  <a href="#" style={{ color: "#9B1B1B", textDecoration: "underline" }}>Privacy Policy</a>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Register step ── */}
          {!loading && !user && authStep === "register" && (
            <motion.div key="register" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <button type="button" onClick={() => setAuthStep("phone")} style={{ fontSize: "11px", color: "#9B1B1B", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", marginBottom: "8px", padding: 0 }}>← Change Number</button>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#7a4010", marginBottom: "12px", textTransform: "uppercase" }}>Complete Devotee Profile</p>

              <style>{`
                .react-datepicker-popper { z-index: 10000 !important; }
                .react-datepicker-wrapper { width: 100%; }
                .react-datepicker { font-family: inherit; border: 1.5px solid #dfc9a0; border-radius: 12px; background-color: #fdf8f2; box-shadow: 0 10px 30px rgba(122, 56, 16, 0.15); }
                .react-datepicker__header { background-color: #fdf5eb; border-bottom: 1.5px solid #dfc9a0; border-top-left-radius: 12px; border-top-right-radius: 12px; padding-top: 8px; }
                .react-datepicker__current-month, .react-datepicker__day-name { color: #7a3810; font-weight: 600; }
                .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #D84315 !important; color: white !important; border-radius: 8px; }
                .react-datepicker__day:hover { background-color: #f5e8d0; border-radius: 8px; }
                .react-datepicker__navigation { top: 8px; }
                .react-datepicker__navigation-icon::before { border-color: #7a3810; border-width: 2px 2px 0 0; }
                .react-datepicker__year-dropdown-container--select { margin: 5px 0; }
                .react-datepicker__year-select { background: #fff; border: 1px solid #dfc9a0; border-radius: 6px; padding: 2px 4px; color: #7a3810; outline: none; }
              `}</style>

              {(["name", "email", "dob"] as const).map((field) => {
                if (field === "dob") {
                  return (
                    <div key={field} style={{ marginBottom: "8px", width: "100%" }}>
                      <DatePicker
                        selected={userProfile.dob ? new Date(userProfile.dob) : null}
                        popperPlacement="bottom-start"
                        onChange={(date: Date | null) => {
                          if (date) {
                            const year  = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const day   = String(date.getDate()).padStart(2, "0");
                            setUserProfile({ ...userProfile, dob: `${year}-${month}-${day}` });
                          } else {
                            setUserProfile({ ...userProfile, dob: "" });
                          }
                        }}
                        dateFormat="dd-MM-yyyy"
                        maxDate={new Date()}
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        placeholderText="Date of Birth (DD-MM-YYYY)"
                        customInput={<CustomDateInput />}
                      />
                    </div>
                  );
                }
                return (
                  <div key={field} style={{ position: "relative", marginBottom: "8px", width: "100%" }}>
                    <input
                      type={field === "email" ? "email" : "text"}
                      placeholder={field === "name" ? "Full Name" : "Gmail Address"}
                      value={userProfile[field]}
                      onChange={(e) => setUserProfile({ ...userProfile, [field]: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", background: "#fff", border: "1.5px solid #dfc9a0", borderRadius: "10px", fontSize: "13px", outline: "none", color: "#3d1f08", boxSizing: "border-box" }}
                    />
                  </div>
                );
              })}

              <button
                disabled={!userProfile.name || !userProfile.email || !userProfile.dob}
                onClick={handleRegisterSubmit}
                style={{ width: "100%", padding: "11px", borderRadius: "12px", border: "none", background: userProfile.name && userProfile.email && userProfile.dob ? "linear-gradient(135deg, #9B1B1B 0%, #D84315 100%)" : "#d4b896", color: "#fff8ee", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginTop: "4px", boxShadow: "0 4px 14px rgba(155, 27, 27,0.3)" }}
              >
                Send OTP to Verify
              </button>
            </motion.div>
          )}

          {/* ── OTP step (with spiritual animation) ── */}
          {!loading && !user && authStep === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Back button */}
              <button
                type="button"
                onClick={() => (userProfile.name ? setAuthStep("register") : setAuthStep("phone"))}
                style={{ fontSize: "11px", color: "#9B1B1B", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", marginBottom: "8px", padding: 0 }}
              >
                ← Back
              </button>

              <p style={{ fontSize: "12px", fontWeight: 500, color: "#7a4010", marginBottom: "14px" }}>
                Enter 6-digit OTP sent to +91 {mobileNumber}
              </p>

              {/* ── 6 animated OTP boxes ── */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                {otpArray.map((digit, idx) => (
                  <OtpBox
                    key={idx}
                    digit={digit}
                    idx={idx}
                    focused={focusedIndex === idx}
                    inputRef={(el) => (otpRefs.current[idx] = el)}
                    onChange={handleOtpChange}
                    onKeyDown={handleOtpKeyDown}
                    onPaste={handleOtpPaste}
                    onFocus={() => setFocusedIndex(idx)}
                    onBlur={() => setFocusedIndex(null)}
                  />
                ))}
              </div>

              {/* Sacred subtitle */}
              <p style={{ fontSize: "10px", color: "#c4956a", textAlign: "center", fontStyle: "italic", margin: "6px 0 14px" }}>
                🕉️ Your sacred code awaits
              </p>

              {/* Verify button with shimmer + diya */}
              <div style={{ position: "relative" }}>
                <button
                  disabled={otpCode.length !== 6}
                  onClick={handleVerify}
                  style={{
                    width          : "100%",
                    padding        : "11px",
                    borderRadius   : "12px",
                    border         : "none",
                    background     : otpCode.length === 6
                      ? "linear-gradient(135deg, #9B1B1B 0%, #D84315 100%)"
                      : "#d4b896",
                    color          : "#fff8ee",
                    fontSize       : "14px",
                    fontWeight     : 600,
                    cursor         : otpCode.length === 6 ? "pointer" : "not-allowed",
                    boxShadow      : otpCode.length === 6 ? "0 4px 14px rgba(155, 27, 27,0.35)" : "none",
                    position       : "relative",
                    overflow       : "hidden",
                    display        : "flex",
                    alignItems     : "center",
                    justifyContent : "center",
                    gap            : "8px",
                    animation      : otpCode.length === 6 ? "flame-flicker 3s ease-in-out infinite" : "none",
                  }}
                >
                  {/* Shimmer sweep layer */}
                  {otpCode.length === 6 && (
                    <span
                      aria-hidden="true"
                      style={{
                        position        : "absolute",
                        inset           : 0,
                        background      : "linear-gradient(105deg, transparent 35%, rgba(255,220,150,0.28) 50%, transparent 65%)",
                        backgroundSize  : "200% 100%",
                        animation       : "shimmer-sweep 2.2s linear infinite",
                        borderRadius    : "12px",
                        pointerEvents   : "none",
                      }}
                    />
                  )}

                  {/* Diya icon */}
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize  : "16px",
                      animation : "diya-bob 1.8s ease-in-out infinite",
                      display   : "inline-block",
                      position  : "relative",
                      zIndex    : 1,
                    }}
                  >
                    🪔
                  </span>

                  <span style={{ position: "relative", zIndex: 1 }}>Verify &amp; Activate ✦</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Authenticated ── */}
          {!loading && user && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "10px", textAlign: "center", marginBottom: "12px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#15803d" }}>Jai Shree Ram 🙏 Account Active</p>
              </div>
              <button
                onClick={handleSignOut}
                style={{ width: "100%", padding: "10px", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", fontSize: "12px", fontWeight: 600, color: "#78350f", cursor: "pointer" }}
              >
                Logout Account
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer tagline */}
      {!user && !loading && authStep === "phone" && (
        <div style={{ paddingBottom: "16px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#c4956a", letterSpacing: "0.05em" }}>✦ &nbsp;Handcrafted with devotion&nbsp; ✦</p>
        </div>
      )}

      {/* ── Workspace links (authenticated) ── */}
      {user && (
        <div style={{ borderTop: "1px solid #f0dfc0", padding: "8px 14px 14px" }}>
          {[
            { label: "Your Orders",       action: onOpenOrders },
            { label: "Track Your Orders", action: () => { window.location.hash = "#/track-order"; } },
            { label: "Your Wishlist",     action: onOpenWishlist },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={() => { action(); onClose(); }}
              style={{
                width          : "100%",
                display        : "flex",
                alignItems     : "center",
                justifyContent : "space-between",
                padding        : "9px 10px",
                background     : "transparent",
                border         : "none",
                borderRadius   : "10px",
                cursor         : "pointer",
                fontSize       : "13px",
                fontWeight     : 500,
                color          : "#7a3810",
                transition     : "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5e8d0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span>{label}</span>
              <ChevronRightIcon />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}