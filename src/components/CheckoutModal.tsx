"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService, couponService, paymentService } from "../utils/service";
import { toast } from "react-hot-toast";

interface CheckoutModalProps {
  onBack: () => void;
  onClose: () => void;
}

/* ─── Load Razorpay Script ───────────────────────────────────────── */
const loadRazorpay = (): Promise<boolean> => {
  return new Promise(resolve => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/* ─── Spinning OM Loader ─────────────────────────────────────────── */
const OmSpinner = ({ size = 44 }: { size?: number }) => {
  const dots = Array.from({ length: 20 });
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ position: "absolute", animation: "omSpin 1.8s linear infinite" }}
      >
        {dots.map((_, i) => {
          const angle = (i / dots.length) * 2 * Math.PI;
          const r = 44;
          const cx = 50 + r * Math.cos(angle);
          const cy = 50 + r * Math.sin(angle);
          const opacity = 0.15 + 0.85 * (i / dots.length);
          const radius = i % 4 === 0 ? 4 : i % 2 === 0 ? 2.5 : 1.5;
          return <circle key={i} cx={cx} cy={cy} r={radius} fill="#c87941" opacity={opacity} />;
        })}
      </svg>
      <span style={{ fontSize: size * 0.42, fontFamily: "serif", color: "#8b4513", zIndex: 1, lineHeight: 1 }}>ॐ</span>
    </div>
  );
};

/* ─── Input Field ────────────────────────────────────────────────── */
const Field = ({
  label, placeholder, value, onChange, type = "text", half = false, required = false,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; half?: boolean; required?: boolean;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: half ? "1 1 0" : "1 1 100%" }}>
    <label style={{ fontSize: "10px", fontWeight: 700, color: "#9a7860", textTransform: "uppercase", letterSpacing: "0.07em" }}>
      {label}{required && <span style={{ color: "#c87941", marginLeft: "2px" }}>*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: "10px 13px",
        borderRadius: "10px",
        border: "1.5px solid #e8d5b7",
        fontSize: "13px",
        outline: "none",
        width: "100%",
        background: "#fffdf9",
        color: "#3d1f08",
        fontFamily: "inherit",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxSizing: "border-box",
      }}
      onFocus={e => { e.target.style.borderColor = "#c87941"; e.target.style.boxShadow = "0 0 0 3px rgba(200,121,65,0.12)"; }}
      onBlur={e => { e.target.style.borderColor = "#e8d5b7"; e.target.style.boxShadow = "none"; }}
    />
  </div>
);

/* ─── Section Header ─────────────────────────────────────────────── */
const SectionLabel = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#fde8cc,#f5c99a)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b4513", flexShrink: 0 }}>
      {icon}
    </div>
    <p style={{ fontSize: "13px", fontWeight: 700, color: "#4a2008", margin: 0, fontFamily: "'Georgia',serif" }}>{title}</p>
  </div>
);

/* ─── SVG Icons ──────────────────────────────────────────────────── */
const IconLocation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <circle cx="12" cy="11" r="3" />
  </svg>
);
const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
  </svg>
);
const IconReceipt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
    <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12" />
  </svg>
);
const IconPayment = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path strokeLinecap="round" d="M2 10h20" />
  </svg>
);

/* ─── Lotus SVG ──────────────────────────────────────────────────── */
const LotusIcon = () => (
  <svg viewBox="0 0 120 120" width="90" height="90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="52" fill="url(#lotusGlow)" opacity="0.18" />
    <path d="M60 90 C45 75 30 65 30 48 C30 35 44 28 60 38 C76 28 90 35 90 48 C90 65 75 75 60 90Z"
      fill="url(#petalOuter)" opacity="0.55" />
    <path d="M60 90 C40 80 20 78 18 60 C16 44 32 34 60 44 C88 34 104 44 102 60 C100 78 80 80 60 90Z"
      fill="url(#petalMid)" opacity="0.4" />
    <path d="M60 80 C50 68 44 55 50 44 C54 36 60 34 60 34 C60 34 66 36 70 44 C76 55 70 68 60 80Z"
      fill="url(#petalInner)" />
    <path d="M60 80 C36 70 26 56 34 44 C40 34 52 32 60 44 C68 32 80 34 86 44 C94 56 84 70 60 80Z"
      fill="url(#petalSide)" opacity="0.7" />
    <circle cx="60" cy="56" r="9" fill="url(#centerGold)" />
    <circle cx="60" cy="56" r="5" fill="#fff8ee" opacity="0.9" />
    <path d="M55 56 L58.5 59.5 L65 53" stroke="#8b4513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M36 92 Q60 86 84 92" stroke="#c8a06a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    <path d="M28 98 Q60 90 92 98" stroke="#c8a06a" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <defs>
      <radialGradient id="lotusGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f5c472" />
        <stop offset="100%" stopColor="#f5c472" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="petalOuter" x1="60" y1="28" x2="60" y2="90" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f7d99a" />
        <stop offset="100%" stopColor="#e8956a" />
      </linearGradient>
      <linearGradient id="petalMid" x1="18" y1="60" x2="102" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f5c472" />
        <stop offset="50%" stopColor="#fce8c0" />
        <stop offset="100%" stopColor="#f5c472" />
      </linearGradient>
      <linearGradient id="petalInner" x1="60" y1="34" x2="60" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fce8c0" />
        <stop offset="100%" stopColor="#e8956a" />
      </linearGradient>
      <linearGradient id="petalSide" x1="26" y1="60" x2="94" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f7d99a" />
        <stop offset="50%" stopColor="#fce8c0" />
        <stop offset="100%" stopColor="#f7d99a" />
      </linearGradient>
      <radialGradient id="centerGold" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#f5c472" />
        <stop offset="100%" stopColor="#c87941" />
      </radialGradient>
    </defs>
  </svg>
);

/* ─── Particle Dot ───────────────────────────────────────────────── */
const Particle = ({ delay, x, size, color }: { delay: number; x: number; size: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], y: -80, x: (Math.random() - 0.5) * 60, scale: [0, 1, 0.5] }}
    transition={{ duration: 1.6, delay, ease: "easeOut" }}
    style={{
      position: "absolute",
      bottom: "50%",
      left: `calc(50% + ${x}px)`,
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      pointerEvents: "none",
    }}
  />
);

/* ─── Order Success View ─────────────────────────────────────────── */
const OrderSuccessView = ({ onClose }: { onClose: () => void }) => {
  const particles = [
    { delay: 0.1, x: -30, size: 6, color: "#f5c472" },
    { delay: 0.2, x: 20, size: 4, color: "#e8956a" },
    { delay: 0.15, x: -50, size: 5, color: "#c87941" },
    { delay: 0.25, x: 40, size: 3, color: "#f5c472" },
    { delay: 0.05, x: 10, size: 7, color: "#fde8cc" },
    { delay: 0.3, x: -15, size: 4, color: "#8b4513" },
    { delay: 0.18, x: 55, size: 5, color: "#e8956a" },
    { delay: 0.08, x: -60, size: 3, color: "#f7d99a" },
  ];

  return (
    <motion.div
      key="success-screen"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: "32px 24px",
        background: "linear-gradient(160deg, #fdf7f0 0%, #fef3e4 50%, #fdf0dc 100%)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,196,114,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }} style={{ position: "absolute", top: "28px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: "10px", color: "#c8a06a", letterSpacing: "0.18em", fontFamily: "Georgia, serif", opacity: 0.7 }}>✦ &nbsp; श्री गणेशाय नमः &nbsp; ✦</span>
      </motion.div>
      <div style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" }}>
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>
      <motion.div initial={{ scale: 0.4, opacity: 0, rotate: -15 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: "relative", marginBottom: "6px" }}>
        {[1, 2].map(ring => (
          <motion.div key={ring} initial={{ scale: 0.6, opacity: 0.6 }} animate={{ scale: 1.8 + ring * 0.3, opacity: 0 }} transition={{ duration: 1.8, delay: 0.4 + ring * 0.3, repeat: Infinity, repeatDelay: 0.8 }} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "90px", height: "90px", borderRadius: "50%", border: "1.5px solid #c87941", pointerEvents: "none" }} />
        ))}
        <LotusIcon />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} style={{ fontSize: "22px", color: "#c87941", fontFamily: "serif", marginBottom: "14px", opacity: 0.85 }}>ॐ</motion.div>
      <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.5 }} style={{ margin: "0 0 8px", fontSize: "24px", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 700, color: "#3d1f08", lineHeight: 1.2, letterSpacing: "-0.01em" }}>Order Placed!</motion.h2>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} style={{ margin: "0 0 6px", fontSize: "13.5px", color: "#7a4a20", fontFamily: "'Georgia', serif", fontStyle: "italic", lineHeight: 1.6, maxWidth: "260px" }}>Your sacred treasures are being prepared with devotion and care.</motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.75 }} style={{ margin: "0 0 28px", fontSize: "12px", color: "#b09070", fontFamily: "'Georgia', serif", letterSpacing: "0.04em" }}>🙏 May your blessings multiply a thousandfold.</motion.p>
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.7 }} style={{ width: "140px", height: "1px", background: "linear-gradient(to right, transparent, #d4a87a, transparent)", marginBottom: "28px" }} />
      <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.85 }} whileHover={{ scale: 1.03, boxShadow: "0 8px 28px rgba(91,32,5,0.44)" }} whileTap={{ scale: 0.97 }} onClick={onClose} style={{ padding: "14px 36px", background: "linear-gradient(135deg, #5c2005 0%, #8b4513 45%, #c8643a 100%)", color: "#fff8ee", border: "none", borderRadius: "14px", cursor: "pointer", fontWeight: 700, fontFamily: "'Georgia', serif", fontSize: "14px", letterSpacing: "0.03em", boxShadow: "0 6px 24px rgba(91,32,5,0.35)", position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)", animation: "shimmer 2.2s infinite" }} />
        Close &amp; Return
      </motion.button>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }} style={{ position: "absolute", bottom: "18px", fontSize: "10px", color: "#c8a06a", letterSpacing: "0.14em", fontFamily: "Georgia, serif", opacity: 0.6 }}>✦ &nbsp; Handcrafted with devotion &nbsp; ✦</motion.p>
    </motion.div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────── */
export default function CheckoutModal({ onBack, onClose }: CheckoutModalProps) {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  // ── Shipping: FREE above ₹1999, else ₹99 ──
  const shippingCost = cartTotal >= 1999 ? 0 : 99;

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: "",
    landmark: "",
    city: "",
    pincode: "",
    state: "Uttar Pradesh",
  });

  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

  // ── Payment Method ──
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Online">("COD");

  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const addr = (k: keyof typeof address) => (v: string) => setAddress(prev => ({ ...prev, [k]: v }));

  // ── Final total: (subtotal - discount) + shipping ──
  const finalTotal = (cartTotal - discount) + shippingCost;

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoadingCoupons(true);
      try {
        const res = await couponService.getAllCoupons();
        if (res?.data) {
          setCoupons((res.data.coupons || res.data).filter((c: any) => c.isActive !== false));
        }
      } catch { /* silent */ }
      finally { setLoadingCoupons(false); }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Please enter a coupon code");
    setCouponLoading(true);
    try {
      const res = await couponService.validateCoupon({ code: couponCode.trim().toUpperCase(), totalAmount: cartTotal });
      if (res.data.success) {
        setDiscount(res.data.discountAmount);
        setAppliedCoupon(res.data);
        toast.success("Discount applied! ✨");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
      setDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
  };

  /* ── Validate address fields ── */
  const validateAddress = (): boolean => {
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.pincode) {
      toast.error("Please fill all required fields");
      return false;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }
    return true;
  };

  /* ── Build order payload ── */
  const buildOrderPayload = (method: "COD" | "Online", razorpayData?: any) => ({
    items: cart.items,
    shippingAddress: address,
    paymentMethod: method,
    couponCode: appliedCoupon?.code || null,
    subtotal: cartTotal,
    discount,
    shippingCost,
    totalAmount: finalTotal,
    ...(razorpayData && {
      razorpayOrderId: razorpayData.razorpay_order_id,
      razorpayPaymentId: razorpayData.razorpay_payment_id,
      razorpaySignature: razorpayData.razorpay_signature,
    }),
  });

  /* ── COD Flow ── */
  const handleCODOrder = async () => {
    setLoading(true);
    try {
      const res = await orderService.placeOrder(buildOrderPayload("COD"));
      if (res?.data?.success) {
        clearCart();
        setIsSuccess(true);
      } else {
        toast.error(res?.data?.message || "Order rejected by server");
      }
    } catch (err: any) {
      if (err.response) {
        toast.error(`Error ${err.response.status}: ${err.response.data?.message || "Server error"}`);
      } else if (err.request) {
        toast.error("Network error: Could not connect to server.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

const handleOnlineOrder = async () => {
  setLoading(true);

  // Step 1: Order Create karo pehle taaki MongoDB ID mile
  let localOrderId: string;
  try {
    const orderRes = await orderService.placeOrder(buildOrderPayload("Online", null));
    if (!orderRes?.data?.order?._id) throw new Error("Order creation failed");
    localOrderId = orderRes.data.order._id;
  } catch (err: any) {
    toast.error("Failed to initialize order.");
    setLoading(false);
    return;
  }

  // Step 2: Razorpay SDK Load karo
  const sdkLoaded = await loadRazorpay();
  if (!sdkLoaded) {
    toast.error("Failed to load payment gateway.");
    setLoading(false);
    return;
  }

  // Step 3: Razorpay Payment Order generate karo
  let razorpayOrderId: string;
  try {
    const res = await paymentService.createOrder({ amount: finalTotal, orderId: localOrderId });
    razorpayOrderId = res.data.razorpayOrderId;
    if (!razorpayOrderId) throw new Error("Razorpay Order ID missing");
  } catch (err: any) {
    toast.error("Payment initiation failed.");
    setLoading(false);
    return;
  }

  setLoading(false);

  // Step 4: Razorpay Popup
  const options = {
    key: "rzp_test_RwyAESgygh78Yf",
    amount: finalTotal * 100,
    currency: "INR",
    name: "MalaWale",
    description: "Sacred Treasures Order",
    order_id: razorpayOrderId,
    prefill: {
      name: address.fullName,
      contact: address.phone,
      email: user?.email || "",
    },
    theme: { color: "#8b4513" },
    handler: async (response: any) => {
      setLoading(true);
      try {
        // Step 5: Verification (Ab localOrderId valid hai!)
        await paymentService.verifyPayment({
          orderId: localOrderId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        // Step 6: Success - Yahan bas status update kar do ya redirect
        clearCart();
        setIsSuccess(true);
      } catch (err: any) {
        toast.error("Payment verification failed.");
      } finally {
        setLoading(false);
      }
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", (resp: any) => {
      toast.error(`Payment failed: ${resp.error?.description}`);
    });
    rzp.open();
  } catch (err) {
    setLoading(false);
  }
};

  /* ── Main handler ── */
  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
    if (paymentMethod === "COD") {
      await handleCODOrder();
    } else {
      await handleOnlineOrder();
    }
  };

  /* ── Success screen ── */
  if (isSuccess) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <OrderSuccessView onClose={onClose} />
        <style>{`
          @keyframes omSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes shimmer { 0% { left: -100%; } 100% { left: 150%; } }
        `}</style>
      </div>
    );
  }

  const indianStates = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
    "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
    "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
    "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
    "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", background: "#fdf7f0" }}>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 0" }}>

        {/* ── ADDRESS SECTION ── */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1px solid #eedcbe", boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <SectionLabel icon={<IconLocation />} title="Delivery Address" />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <Field label="Full Name" placeholder="Recipient name" value={address.fullName} onChange={addr("fullName")} half required />
              <Field label="Mobile Number" placeholder="10-digit number" value={address.phone} onChange={addr("phone")} type="tel" half required />
            </div>
            <Field label="House / Flat / Building, Street" placeholder="e.g. 12B, Ram Nagar Colony" value={address.street} onChange={addr("street")} required />
            <Field label="Landmark (Optional)" placeholder="e.g. Near Hanuman Mandir" value={address.landmark} onChange={addr("landmark")} />
            <div style={{ display: "flex", gap: "10px" }}>
              <Field label="City / District" placeholder="City" value={address.city} onChange={addr("city")} half required />
              <Field label="Pincode" placeholder="6-digit code" value={address.pincode} onChange={addr("pincode")} type="number" half required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: "#9a7860", textTransform: "uppercase", letterSpacing: "0.07em" }}>State</label>
              <select
                value={address.state}
                onChange={e => setAddress(p => ({ ...p, state: e.target.value }))}
                style={{ padding: "10px 13px", borderRadius: "10px", border: "1.5px solid #e8d5b7", fontSize: "13px", outline: "none", background: "#fffdf9", color: "#3d1f08", fontFamily: "inherit", cursor: "pointer", boxSizing: "border-box", width: "100%" }}
                onFocus={e => { e.target.style.borderColor = "#c87941"; e.target.style.boxShadow = "0 0 0 3px rgba(200,121,65,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#e8d5b7"; e.target.style.boxShadow = "none"; }}
              >
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── PAYMENT METHOD SECTION ── */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1px solid #eedcbe", boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <SectionLabel icon={<IconPayment />} title="Payment Method" />
          <div style={{ display: "flex", gap: "10px" }}>

            {/* COD Option */}
            <button
              onClick={() => setPaymentMethod("COD")}
              style={{
                flex: 1,
                padding: "12px 10px",
                borderRadius: "12px",
                border: paymentMethod === "COD" ? "2px solid #8b4513" : "1.5px solid #e8d5b7",
                background: paymentMethod === "COD" ? "linear-gradient(135deg, #fdf0e0, #fde8cc)" : "#fffdf9",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                {/* Radio dot */}
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${paymentMethod === "COD" ? "#8b4513" : "#d4a87a"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {paymentMethod === "COD" && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#8b4513" }} />}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: paymentMethod === "COD" ? "#4a2008" : "#7a6050", fontFamily: "'Georgia',serif" }}>Cash on Delivery</span>
              </div>
              <p style={{ margin: "0 0 0 24px", fontSize: "10.5px", color: "#9a7860" }}>Pay when your order arrives</p>
            </button>

            {/* Online Option */}
            <button
              onClick={() => setPaymentMethod("Online")}
              style={{
                flex: 1,
                padding: "12px 10px",
                borderRadius: "12px",
                border: paymentMethod === "Online" ? "2px solid #8b4513" : "1.5px solid #e8d5b7",
                background: paymentMethod === "Online" ? "linear-gradient(135deg, #fdf0e0, #fde8cc)" : "#fffdf9",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${paymentMethod === "Online" ? "#8b4513" : "#d4a87a"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {paymentMethod === "Online" && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#8b4513" }} />}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: paymentMethod === "Online" ? "#4a2008" : "#7a6050", fontFamily: "'Georgia',serif" }}>Pay Online</span>
              </div>
              <p style={{ margin: "0 0 0 24px", fontSize: "10.5px", color: "#9a7860" }}>UPI · Cards · Net Banking</p>
            </button>
          </div>

          {/* Online hint banner */}
          <AnimatePresence>
            {paymentMethod === "Online" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(to right,#f0fdf4,#dcfce7)", border: "1px dashed #86efac", borderRadius: "8px", padding: "8px 12px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" width="14" height="14">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p style={{ margin: 0, fontSize: "11px", color: "#15803d", fontWeight: 600 }}>
                    Secured by Razorpay · 100% safe & encrypted
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── COUPONS SECTION ── */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1px solid #eedcbe", boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <SectionLabel icon={<IconTag />} title="Offers & Coupons" />

          <AnimatePresence>
            {appliedCoupon && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(to right,#f0fdf4,#dcfce7)", border: "1.5px solid #86efac", borderRadius: "10px", padding: "10px 12px", marginBottom: "12px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconCheck />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#15803d" }}>{appliedCoupon.code}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#16a34a" }}>₹{discount.toLocaleString("en-IN")} saved on this order</p>
                  </div>
                </div>
                <button onClick={handleRemoveCoupon} style={{ fontSize: "11px", color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: "2px 6px" }}>
                  Remove
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loadingCoupons ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
              <OmSpinner size={32} />
            </div>
          ) : coupons.length > 0 && (
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "10px", scrollbarWidth: "none" }}>
              {coupons.map(c => {
                const isSelected = couponCode === c.code;
                return (
                  <button key={c._id} onClick={() => setCouponCode(c.code)} style={{ background: isSelected ? "linear-gradient(135deg,#6e2e08,#9a4a1a)" : "#fffdf9", border: `1.5px ${isSelected ? "solid #8b4513" : "dashed #d4a87a"}`, borderRadius: "10px", padding: "8px 12px", cursor: "pointer", whiteSpace: "nowrap", textAlign: "left", transition: "all 0.18s", flexShrink: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? "#fff8ee" : "#8b4513", margin: "0 0 2px", letterSpacing: "0.04em" }}>{c.code}</p>
                    <p style={{ fontSize: "10px", color: isSelected ? "rgba(255,232,180,0.85)" : "#9a7860", margin: 0 }}>
                      {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {!appliedCoupon && (
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: "10px 13px", borderRadius: "10px", border: "1.5px solid #e8d5b7", fontSize: "13px", outline: "none", background: "#fffdf9", color: "#3d1f08", letterSpacing: "0.06em", fontWeight: 600, boxSizing: "border-box" }}
                onFocus={e => { e.target.style.borderColor = "#c87941"; e.target.style.boxShadow = "0 0 0 3px rgba(200,121,65,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#e8d5b7"; e.target.style.boxShadow = "none"; }}
                onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                style={{ padding: "10px 16px", borderRadius: "10px", border: "none", background: couponLoading ? "#e8d5b7" : "linear-gradient(135deg,#8b4513,#c8643a)", color: couponLoading ? "#b09070" : "#fff8ee", fontSize: "12px", fontWeight: 700, cursor: couponLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, transition: "opacity 0.2s" }}
              >
                {couponLoading ? <OmSpinner size={18} /> : "Apply"}
              </button>
            </div>
          )}
        </div>

        {/* ── ORDER SUMMARY ── */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", marginBottom: "16px", border: "1px solid #eedcbe", boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <SectionLabel icon={<IconReceipt />} title="Order Summary" />

          {cart?.items?.length > 0 && (
            <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {cart.items.map((item: any, i: number) => {
                const product = item.product || item;
                const name = product?.name || "Sacred Item";
                const variant = product?.variants?.find((v: any) => v.size === item.size) || product?.variants?.[0];
                const price = variant?.price ?? variant?.mrp ?? 0;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#fdf7f0", borderRadius: "8px", border: "1px solid #f0e0c8" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "#3d1f08" }}>{name}</p>
                      {item.size && <p style={{ margin: 0, fontSize: "10px", color: "#9a7860" }}>Size: {item.size} · Qty: {item.quantity}</p>}
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#7a3810" }}>₹{(price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pricing breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#7a6050" }}>
              <span>Items subtotal</span>
              <span>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#16a34a" }}>
                <span>Coupon discount</span>
                <span>− ₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Shipping row — dynamic */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#7a6050" }}>
              <span>Delivery charges</span>
              {shippingCost === 0 ? (
                <span style={{ color: "#16a34a", fontWeight: 600 }}>FREE</span>
              ) : (
                <span>₹{shippingCost.toLocaleString("en-IN")}</span>
              )}
            </div>

            {/* Free shipping nudge */}
            {shippingCost > 0 && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{ background: "#fdf7f0", border: "1px dashed #d4a87a", borderRadius: "8px", padding: "6px 10px", overflow: "hidden" }}
                >
                  <p style={{ margin: 0, fontSize: "10.5px", color: "#9a5a20" }}>
                    🚚 Add ₹{(1999 - cartTotal).toLocaleString("en-IN")} more for <strong>FREE delivery</strong>
                  </p>
                </motion.div>
              </AnimatePresence>
            )}

            <div style={{ height: "1px", background: "linear-gradient(to right,transparent,#d4a87a,transparent)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#4a2008", fontFamily: "'Georgia',serif" }}>Total Payable</span>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#8b4513", fontFamily: "'Georgia',serif" }}>
                ₹{finalTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Payment method badge */}
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", background: "#fdf0e0", borderRadius: "8px", padding: "8px 12px", border: "1px dashed #d4a87a" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#8b4513" strokeWidth="1.8" width="16" height="16">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path strokeLinecap="round" d="M2 10h20" />
            </svg>
            <p style={{ margin: 0, fontSize: "11.5px", color: "#7a4a20", fontWeight: 600 }}>
              {paymentMethod === "COD"
                ? "Cash on Delivery — Pay when your order arrives"
                : "Online Payment via Razorpay — UPI · Cards · Net Banking"}
            </p>
          </div>
        </div>
      </div>

      {/* ── STICKY FOOTER — Place Order button ── */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid #e8d4b0", background: "linear-gradient(to bottom,#fdf7f0,#faf0e4)", flexShrink: 0 }}>
        <motion.button
          onClick={handlePlaceOrder}
          disabled={loading}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "14px",
            border: "none",
            background: loading
              ? "linear-gradient(135deg,#c4a882,#b09070)"
              : paymentMethod === "Online"
                ? "linear-gradient(135deg, #1a3a5c 0%, #1e5799 45%, #2980b9 100%)"
                : "linear-gradient(135deg, #5c2005 0%, #8b4513 45%, #c8643a 100%)",
            color: "#fff8ee",
            fontSize: "14px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.03em",
            fontFamily: "'Georgia',serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: loading ? "none" : "0 6px 24px rgba(91,32,5,0.38), 0 2px 6px rgba(91,32,5,0.18)",
            transition: "box-shadow 0.2s, background 0.3s",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!loading && (
            <span style={{ position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", animation: "shimmer 2.4s infinite" }} />
          )}

          {loading ? (
            <>
              <OmSpinner size={22} />
              <span>{paymentMethod === "Online" ? "Initiating Payment…" : "Placing your order…"}</span>
            </>
          ) : (
            <>
              {paymentMethod === "Online" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path strokeLinecap="round" d="M2 10h20" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {paymentMethod === "Online"
                ? `Pay ₹${finalTotal.toLocaleString("en-IN")} Online`
                : `Confirm Order · ₹${finalTotal.toLocaleString("en-IN")}`}
            </>
          )}
        </motion.button>

        <p style={{ textAlign: "center", marginTop: "8px", fontSize: "10.5px", color: "#b09070", fontStyle: "italic", letterSpacing: "0.04em" }}>
          ✦ &nbsp;Secure · Handcrafted with devotion&nbsp; ✦
        </p>
      </div>

      <style>{`
        @keyframes omSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { left: -100%; } 100% { left: 150%; } }
        * { box-sizing: border-box; }
        div::-webkit-scrollbar { width: 3px; height: 3px; }
        div::-webkit-scrollbar-thumb { background: #d4a87a; border-radius: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}