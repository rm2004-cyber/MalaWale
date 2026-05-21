import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

type AuthMethod = "gmail" | "phone";
type PhasePhone = "input" | "otp";

interface FormError {
  id: number;
  message: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_EMAIL = "admin@malawale.com";
const VALID_PASSWORD = "mala2026";
const VALID_OTP = "123456";

// ─── Spiritual Watermark SVG ─────────────────────────────────────────────────

const OmWatermark = () => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    aria-hidden="true"
  >
    {/* Decorative lotus petals */}
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse
        key={i}
        cx="100"
        cy="100"
        rx="12"
        ry="38"
        fill="#8b4513"
        transform={`rotate(${i * 45} 100 100)`}
        opacity="0.6"
      />
    ))}
    {/* OM symbol approximated with paths */}
    <text
      x="100"
      y="118"
      textAnchor="middle"
      fontFamily="serif"
      fontSize="72"
      fill="#8b4513"
      fontWeight="bold"
    >
      ॐ
    </text>
    {/* Outer decorative ring */}
    <circle cx="100" cy="100" r="92" fill="none" stroke="#c8843a" strokeWidth="1.5" strokeDasharray="4 6" />
    <circle cx="100" cy="100" r="98" fill="none" stroke="#8b4513" strokeWidth="0.8" opacity="0.5" />
  </svg>
);

// ─── Toggle Pill ──────────────────────────────────────────────────────────────

interface ToggleProps {
  method: AuthMethod;
  onChange: (m: AuthMethod) => void;
}

const AuthToggle = ({ method, onChange }: ToggleProps) => (
  <div className="relative flex items-center rounded-2xl bg-orange-50 border border-orange-100 p-1 gap-1">
    {(["gmail", "phone"] as AuthMethod[]).map((m) => {
      const active = method === m;
      return (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors duration-200 z-10"
          style={{
            fontFamily: "'Jost', sans-serif",
            color: active ? "#fff" : "#8b4513",
          }}
        >
          {active && (
            <motion.div
              layoutId="auth-pill"
              className="absolute inset-0 rounded-xl"
              style={{ background: "linear-gradient(135deg, #8b4513 0%, #c8843a 100%)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">
            {m === "gmail" ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <GmailIcon active={active} />
                  Gmail
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <PhoneIcon active={active} />
                Phone / OTP
              </span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

// ─── Micro-icons ──────────────────────────────────────────────────────────────

const GmailIcon = ({ active }: { active: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#c8843a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);

const PhoneIcon = ({ active }: { active: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#c8843a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8843a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ show }: { show: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

// ─── Input Field ──────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  prefix?: string;
  rightSlot?: React.ReactNode;
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
  rightSlot,
  inputMode,
  autoComplete,
  disabled = false,
}: InputFieldProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513", opacity: 0.75 }}
      >
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
          <span
            className="pl-4 pr-2 text-sm font-semibold select-none"
            style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
          >
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
        {rightSlot && <div className="pr-4">{rightSlot}</div>}
      </div>
    </div>
  );
};

// ─── OTP Boxes ────────────────────────────────────────────────────────────────

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
}

const OtpInput = ({ value, onChange }: OtpInputProps) => {
  const digits = value.padEnd(6, " ").split("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(raw);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513", opacity: 0.75 }}
      >
        Enter 6-Digit OTP
      </label>
      <div className="relative">
        {/* Visual digit boxes */}
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
        {/* Transparent real input overlaid */}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={value}
          onChange={handleChange}
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

// ─── Primary Button ───────────────────────────────────────────────────────────

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
    {loading ? (
      <motion.span
        className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    ) : null}
    {label}
  </motion.button>
);

// ─── Error Badge ──────────────────────────────────────────────────────────────

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

// ─── Gmail Login Form ─────────────────────────────────────────────────────────

interface GmailFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const GmailForm = ({ onSuccess, onError }: GmailFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(() => {
    if (!email.trim()) { onError("Please enter your admin email address."); return; }
    if (!password) { onError("Password is required."); return; }

    setLoading(true);
    // Simulate async auth check
    setTimeout(() => {
      setLoading(false);
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        onSuccess();
      } else {
        onError("Invalid credentials. Please check your email and password.");
      }
    }, 1100);
  }, [email, password, onSuccess, onError]);

  return (
    <div className="flex flex-col gap-4">
      <InputField
        label="Admin Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="admin@malawale.com"
        autoComplete="email"
      />
      <InputField
        label="Password"
        type={showPw ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="Enter secure password"
        autoComplete="current-password"
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="text-orange-300 hover:text-orange-500 transition-colors"
            tabIndex={-1}
          >
            <EyeIcon show={showPw} />
          </button>
        }
      />
      <div className="flex items-center justify-end">
        <button
          type="button"
          className="text-xs hover:underline transition-opacity opacity-60 hover:opacity-100"
          style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
        >
          Forgot password?
        </button>
      </div>
      <PrimaryButton label="Sign In Securely" loading={loading} onClick={handleLogin} />
    </div>
  );
};

// ─── Phone OTP Form ───────────────────────────────────────────────────────────

interface PhoneFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const PhoneForm = ({ onSuccess, onError }: PhoneFormProps) => {
  const [phase, setPhase] = useState<PhasePhone>("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = useCallback(() => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) { onError("Please enter a valid 10-digit mobile number."); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setPhase("otp");
      startResendTimer();
    }, 900);
  }, [phone, onError]);

  const handleVerifyOtp = useCallback(() => {
    if (otp.length !== 6) { onError("Please enter the complete 6-digit OTP."); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otp === VALID_OTP) {
        onSuccess();
      } else {
        onError("Incorrect OTP. Please try again or request a new one.");
      }
    }, 1000);
  }, [otp, onSuccess, onError]);

  return (
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
              label="Mobile Number"
              type="tel"
              value={phone}
              onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter 10-digit number"
              prefix="+91"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
            />
            <PrimaryButton
              label={loading ? "Sending OTP…" : "Send OTP"}
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
            {/* Sent confirmation */}
            {otpSent && (
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs"
                style={{ background: "rgba(139,69,19,0.07)", fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b4513" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7z" />
                </svg>
                OTP sent to +91 {phone}
              </div>
            )}
            <OtpInput value={otp} onChange={setOtp} />
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={() => {
                  setOtp("");
                  setPhase("input");
                  setOtpSent(false);
                }}
                className="text-xs hover:underline disabled:opacity-40 transition-opacity"
                style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
              >
                ← Change number
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
              label={loading ? "Verifying…" : "Verify & Enter"}
              loading={loading}
              onClick={handleVerifyOtp}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

let errorCounter = 0;

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [method, setMethod] = useState<AuthMethod>("gmail");
  const [error, setError] = useState<FormError | null>(null);

  const triggerError = useCallback((message: string) => {
    errorCounter += 1;
    setError({ id: errorCounter, message });
    // Auto-clear after 5s
    const id = errorCounter;
    setTimeout(() => {
      setError((prev) => (prev?.id === id ? null : prev));
    }, 5000);
  }, []);

  const handleMethodChange = (m: AuthMethod) => {
    setError(null);
    setMethod(m);
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Jost:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div
        className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden"
        style={{ background: "#fff9f2" }}
      >
        {/* ── Watermark ──────────────────────────────────────────── */}
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

        {/* ── Ambient gradient blobs ──────────────────────────────── */}
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

        {/* ── Card ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md w-full bg-white rounded-3xl p-8 border border-orange-100 shadow-xl"
          style={{ boxShadow: "0 8px 48px rgba(139,69,19,0.13), 0 2px 12px rgba(139,69,19,0.07)" }}
        >

          {/* ── Brand Header ───────────────────────────────────────── */}
          <div className="flex flex-col items-center mb-7">
            {/* Logo mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: "backOut" }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(145deg, #8b4513, #c8843a)" }}
            >
              <span style={{ fontSize: 32, lineHeight: 1, color: "#fff9f2" }}>ॐ</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="text-2xl font-bold tracking-[0.15em] uppercase"
              style={{ fontFamily: "'Playfair Display', serif", color: "#8b4513" }}
            >
              Mala Wale
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-xs tracking-widest uppercase mt-1 font-medium"
              style={{ fontFamily: "'Jost', sans-serif", color: "#c8843a", opacity: 0.75 }}
            >
              By Sanwariya Handicraft · Admin Portal
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 h-px w-24 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, #d4a373, transparent)" }}
            />
          </div>

          {/* ── Error Banner ────────────────────────────────────────── */}
          <div className="mb-4 min-h-0">
            <AnimatePresence mode="wait">
              {error && <ErrorBadge key={error.id} message={error.message} />}
            </AnimatePresence>
          </div>

          {/* ── Auth Method Toggle ──────────────────────────────────── */}
          <div className="mb-6">
            <AuthToggle method={method} onChange={handleMethodChange} />
          </div>

          {/* ── Form Area ──────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {method === "gmail" ? (
              <motion.div
                key="gmail-form"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <GmailForm onSuccess={onLoginSuccess} onError={triggerError} />
              </motion.div>
            ) : (
              <motion.div
                key="phone-form"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <PhoneForm onSuccess={onLoginSuccess} onError={triggerError} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Security Footer ─────────────────────────────────────── */}
          <div className="mt-7 pt-5 border-t border-orange-50 flex items-center justify-center gap-2">
            <LockIcon />
            <p
              className="text-xs text-center opacity-50"
              style={{ fontFamily: "'Jost', sans-serif", color: "#8b4513" }}
            >
              Secured admin gateway · Unauthorized access is prohibited
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}