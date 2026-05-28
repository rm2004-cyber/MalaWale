"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { authService } from "../utils/service";
import { toast } from "react-hot-toast";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

type PhasePhone = "input" | "otp";

interface FormError {
  id: number;
  message: string;
}

let errorCounter = 0;

const OmWatermark = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse key={i} cx="100" cy="100" rx="12" ry="38" fill="#8b4513" transform={`rotate(${i * 45} 100 100)`} opacity="0.6" />
    ))}
    <text x="100" y="118" textAnchor="middle" fontFamily="serif" fontSize="72" fill="#8b4513" fontWeight="bold">ॐ</text>
    <circle cx="100" cy="100" r="92" fill="none" stroke="#c8843a" strokeWidth="1.5" strokeDasharray="4 6" />
    <circle cx="100" cy="100" r="98" fill="none" stroke="#8b4513" strokeWidth="0.8" opacity="0.5" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8843a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  prefix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  disabled?: boolean;
}

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  prefix,
  inputMode,
  autoComplete,
  disabled = false,
}: InputFieldProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513", opacity: 0.75 }}>
        {label}
      </label>
      <div
        className="flex items-center rounded-xl border transition-all duration-200 bg-white overflow-hidden"
        style={{
          borderColor: focused ? "#c8843a" : "#f3d5b0",
          boxShadow: focused ? "0 0 0 3px rgba(200,132,58,0.15)" : "none",
        }}
      >
        {prefix && (
          <span className="pl-4 pr-2 text-sm font-semibold select-none" style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          disabled={disabled}
          className="flex-1 py-3.5 px-4 text-sm bg-transparent outline-none disabled:opacity-50"
          style={{ fontFamily: "'Jost', sans-serif", color: "#3d1a05" }}
        />
      </div>
    </div>
  );
};

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
}

const OtpInput = ({ value, onChange }: OtpInputProps) => {
  const digits = value.padEnd(6, " ").split("");

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513", opacity: 0.75 }}>
        Enter 6-Digit OTP
      </label>
      <div className="relative">
        <div className="flex gap-2 pointer-events-none select-none" aria-hidden>
          {digits.map((d, i) => (
            <div
              key={i}
              className="flex-1 h-12 flex items-center justify-center rounded-xl border text-lg font-bold transition-all duration-150"
              style={{
                fontFamily: "'Playfair Display', serif",
                borderColor: d.trim() ? "#c8843a" : "#f3d5b0",
                color: "#8b4513",
                background: d.trim() ? "rgba(200,132,58,0.06)" : "#fff",
                boxShadow: d.trim() ? "0 0 0 2px rgba(200,132,58,0.18)" : "none",
              }}
            >
              {d.trim() || ""}
            </div>
          ))}
        </div>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text"
          aria-label="OTP input"
          placeholder="Enter OTP"
        />
      </div>
      <p className="text-xs mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: "#c8843a", opacity: 0.7 }}>
        Tap above and type your OTP code
      </p>
    </div>
  );
};

interface PrimaryButtonProps {
  label: string;
  loading?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const PrimaryButton = ({ label, loading = false, onClick, disabled = false }: PrimaryButtonProps) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    whileHover={{ scale: disabled || loading ? 1 : 1.015 }}
    whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
    className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
    style={{
      fontFamily: "'Jost', sans-serif",
      background: "linear-gradient(135deg, #8b4513 0%, #c8843a 60%, #d4a373 100%)",
      boxShadow: "0 4px 20px rgba(139,69,19,0.35)",
      letterSpacing: "0.04em",
    }}
  >
    {loading && (
      <motion.span
        className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    )}
    {label}
  </motion.button>
);

const ErrorBadge = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 350, damping: 28 }}
    className="flex items-start gap-2.5 px-4 py-3 rounded-xl border"
    style={{
      background: "rgba(220,38,38,0.05)",
      borderColor: "rgba(220,38,38,0.2)",
    }}
  >
    <span className="mt-0.5 flex-shrink-0">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </span>
    <p className="text-xs leading-relaxed" style={{ fontFamily: "'Jost', sans-serif", color: "#b91c1c" }}>
      {message}
    </p>
  </motion.div>
);

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const { sendOtp, verifyOtp } = useAuth(); 
  const [phase, setPhase] = useState<PhasePhone>("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState<FormError | null>(null);

  const triggerError = useCallback((message: string) => {
    errorCounter += 1;
    setError({ id: errorCounter, message });
    const id = errorCounter;
    setTimeout(() => {
      setError((prev) => (prev?.id === id ? null : prev));
    }, 5000);
  }, []);

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // 🧹 Safe structural cleanup node logic to prevent duplicate registration crash
  const cleanRecaptchaContext = () => {
    const globalVerifier = (window as any).recaptchaVerifier;
    if (globalVerifier) {
      try {
        globalVerifier.clear();
        (window as any).recaptchaVerifier = null;
      } catch (e) {
        console.warn("reCAPTCHA contextual clearance bypass:", e);
      }
    }
    const anchor = document.getElementById("admin-recaptcha-anchor");
    if (anchor) anchor.innerHTML = "";
  };

  // Clear reCAPTCHA instance on unmount
  useEffect(() => {
    return () => cleanRecaptchaContext();
  }, []);

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      triggerError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);
    
    // 🔥 Flush active instance before triggering a new registration call
    cleanRecaptchaContext();

    try {
      const res = await sendOtp(cleaned, "admin-recaptcha-anchor");
      if (res.success) {
        toast.success("Security token triggered successfully! 📿");
        setPhase("otp");
        startResendTimer();
      } else {
        triggerError(res.error || "Failed to trigger security OTP loop.");
        cleanRecaptchaContext();
      }
    } catch (err: any) {
      triggerError(err?.message || "Internal network failure context.");
      cleanRecaptchaContext();
    } finally {
      setLoading(false);
    }
  };

const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      triggerError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Verify token context from live Firebase core setup instance
      const res = await verifyOtp(otp);
      
      if (res.success) {
        const idToken = res.token || localStorage.getItem("token");

        // 2. Transmit token grid parameters to synchronized cluster endpoint node
        const apiResponse = await authService.firebaseLogin({
          token: idToken,
          phone: `+91${phone.replace(/\D/g, "")}`
        });

        if (apiResponse && apiResponse.data && apiResponse.data.success) {
          const loggedUser = apiResponse.data.user; // Actual dynamic document layer payload mapping
          
          // Gatekeeper lock protection mapping validator checks
          if (loggedUser?.role !== "admin") {
            triggerError("Access Forbidden: Your credentials are not authorized on the Admin Portal.");
            cleanRecaptchaContext();
            return;
          }

          toast.success("Welcome, Sanwariya Administrator! 🙏");
          
          // 🔥 FIXED LOGIC: Passing real backend user data object back to Admindashboard hierarchy state layer
          onLoginSuccess(loggedUser); 
        } else {
          triggerError(apiResponse?.data?.message || "Database synchronization failed.");
        }
      } else {
        triggerError(res.error || "Makhanchor! Galat OTP daala hai.");
      }
    } catch (err: any) {
      console.error(err);
      triggerError("Authorization failed. Ensure your account role is set to admin.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Jost:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: "#fff9f2" }}>
        <div
          className="pointer-events-none select-none absolute"
          style={{
            width: "min(560px, 90vw)",
            height: "min(560px, 90vw)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.045,
          }}
        >
          <OmWatermark />
        </div>

        <div
          className="pointer-events-none absolute top-0 left-0 w-72 h-72 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(200,132,58,0.12) 0%, transparent 70%)",
            transform: "translate(-30%, -30%)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,69,19,0.08) 0%, transparent 70%)",
            transform: "translate(30%, 30%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md w-full bg-white rounded-3xl p-8 border border-orange-100 shadow-xl"
          style={{ boxShadow: "0 8px 48px rgba(139,69,19,0.13), 0 2px 12px rgba(139,69,19,0.07)" }}
        >
          <div className="flex flex-col items-center mb-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: "backOut" }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(145deg, #8b4513, #c8843a)" }}
            >
              <span style={{ fontSize: 32, lineHeight: 1, color: "#fff9f2" }}>ॐ</span>
            </motion.div>

            <h1 className="text-2xl font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'Playfair Display', serif", color: "#8b4513" }}>
              Mala Wale
            </h1>

            <p className="text-xs tracking-widest uppercase mt-1 font-medium" style={{ fontFamily: "'Jost', sans-serif", color: "#c8843a", opacity: 0.75 }}>
              By Sanwariya Handicraft · Admin Portal
            </p>

            <div className="mt-4 h-px w-24 rounded-full" style={{ background: "linear-gradient(90deg, transparent, #d4a373, transparent)" }} />
          </div>

          <div className="mb-4 min-h-0">
            <AnimatePresence mode="wait">
              {error && <ErrorBadge key={error.id} message={error.message} />}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {phase === "input" ? (
                <motion.div
                  key="phone-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="flex flex-col gap-4"
                >
                  <InputField
                    label="Authorized Mobile Number"
                    type="tel"
                    value={phone}
                    onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10-digit admin number"
                    prefix="+91"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                  />
                  
                  {/* 🔥 Target container node for reCAPTCHA widget binding safely */}
                  <div id="admin-recaptcha-anchor" className="flex justify-center my-1" />

                  <PrimaryButton
                    label={loading ? "Verifying Security Grid…" : "Send Access OTP"}
                    loading={loading}
                    onClick={handleSendOtp}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="otp-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="flex flex-col gap-4"
                >
                  <div
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs"
                    style={{ background: "rgba(139,69,19,0.07)", fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b4513" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7z" />
                    </svg>
                    Secure passkey transmitted to +91 {phone}
                  </div>
                  
                  <OtpInput value={otp} onChange={setOtp} />
                  
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={() => {
                        setOtp("");
                        cleanRecaptchaContext();
                        setPhase("input");
                      }}
                      className="text-xs hover:underline disabled:opacity-40 transition-opacity"
                      style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleSendOtp}
                      className="text-xs hover:underline disabled:opacity-40 transition-opacity"
                      style={{ fontFamily: "'Jost', sans-serif", color: "#c8843a" }}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                  <PrimaryButton
                    label={loading ? "Authorizing Identity…" : "Verify & Open Gateway"}
                    loading={loading}
                    onClick={handleVerifyOtp}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-7 pt-5 border-t border-orange-50 flex items-center justify-center gap-2">
            <LockIcon />
            <p className="text-xs text-center opacity-50" style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}>
              Secured admin gateway · Unauthorized access is prohibited
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}