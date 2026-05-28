"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { orderService } from "../utils/service";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

interface BackendOrder {
  _id: string;
  orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  totalAmount: number;
  createdAt: string;
  courierPartnerName?: string;
  trackingIdOrNumber?: string;
  trackingLink?: string;
  items: {
    product: { _id: string; name: string; images: string[] };
    size: string;
    quantity: number;
    price: number;
    _id: string;
  }[];
}

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"] as const;

const STEP_LABELS: Record<string, string> = {
  Pending:    "Placed",
  Processing: "Handcrafted",
  Shipped:    "Dispatched",
  Delivered:  "Delivered",
};

const STEP_ICONS: Record<string, string> = {
  Pending:    "📦",
  Processing: "🪬",
  Shipped:    "🚚",
  Delivered:  "✅",
};

function CancelModal({
  orderId,
  onConfirm,
  onClose,
}: {
  orderId: string;
  onConfirm: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backgroundColor: "rgba(60, 20, 5, 0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 24 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          <div className="bg-gradient-to-br from-[#fff7f0] to-[#fdecd8] px-8 pt-8 pb-6 text-center border-b border-orange-100/60">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚫</span>
            </div>
            <h3
              className="text-xl font-black text-[#8b4513] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Cancel Order?
            </h3>
            <p className="text-sm text-amber-800/70 leading-relaxed">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
          </div>

          <div className="px-8 py-6 flex flex-col gap-3 bg-white">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onConfirm(orderId)}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-xl shadow-md cursor-pointer"
            >
              Yes, Cancel Order
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full bg-[#fdf4ec] border border-orange-200/70 text-[#8b4513] text-xs font-black uppercase tracking-widest py-3.5 rounded-xl cursor-pointer"
            >
              Keep Order
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function TrackOrder() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [orders, setOrders]           = useState<BackendOrder[]>([]);
  const [loading, setLoading]         = useState(true);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const res = await orderService.getUserOrders();
        if (res?.data?.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Unable to fetch orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleCancel = async (id: string) => {
    setCancelTargetId(null);
    try {
      const res = await orderService.cancelOrder({ orderId: id });
      if (res?.data?.success) {
        toast.success("Order cancelled successfully.");
        setOrders(prev =>
          prev.map(o => o._id === id ? { ...o, orderStatus: "Cancelled" } : o)
        );
      } else {
        toast.error(res?.data?.message || "Failed to cancel.");
      }
    } catch {
      toast.error("Network error while cancelling.");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-24 px-4" style={{ fontFamily: "'Jost', sans-serif" }}>
        <p className="text-3xl mb-3">🪬</p>
        <h3 className="text-xl font-bold text-[#8b4513]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Login Required
        </h3>
        <p className="text-sm text-amber-800/70 mt-1 max-w-sm mx-auto">
          Please sign in to view and track your orders.
        </p>
      </div>
    );
  }

  return (
    <section className="w-full py-10 px-4 max-w-4xl mx-auto min-h-[70vh]" style={{ fontFamily: "'Jost', sans-serif" }}>

      {cancelTargetId && (
        <CancelModal
          orderId={cancelTargetId}
          onConfirm={handleCancel}
          onClose={() => setCancelTargetId(null)}
        />
      )}

      <div className="text-center mb-12">
        <span
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-xs uppercase tracking-widest text-[#c8843a] font-medium italic block mb-1"
        >
          Your Devotion Sanctuary
        </span>
        <h2
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-3xl sm:text-4xl font-black text-[#8b4513]"
        >
          Your Orders
        </h2>
        <div className="w-24 h-0.5 mx-auto mt-3 bg-gradient-to-r from-transparent via-[#c8843a] to-transparent opacity-60" />
      </div>

      {loading ? (
        <div className="text-center py-16 italic text-amber-800/60 text-sm animate-pulse tracking-wide">
          Fetching your sacred orders...
        </div>

      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 border border-orange-100/70 p-12 rounded-3xl shadow-lg max-w-xl mx-auto backdrop-blur-md"
        >
          <p className="text-5xl mb-4">📿</p>
          <h3
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-xl font-bold text-[#8b4513] mb-2"
          >
            No Orders Found
          </h3>
          <p className="text-sm text-amber-800/70 max-w-xs mx-auto mb-8 leading-relaxed">
            You haven't placed any orders yet.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#8b4513] via-[#a0522d] to-[#c8843a] text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl cursor-pointer shadow-md"
          >
            Shop Now ✦
          </motion.button>
        </motion.div>

      ) : (
        <div className="flex flex-col gap-10">
          {orders.map((order, orderIdx) => {
            const status      = order.orderStatus;
            const isCancelled = status === "Cancelled";
            const stepIndex   = STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number]);
            const progressPct = stepIndex >= 0
              ? (stepIndex / (STATUS_STEPS.length - 1)) * 100
              : 0;
            const canCancel   = !isCancelled && stepIndex < 2;
            const showNoCancel = !isCancelled && stepIndex >= 2;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: orderIdx * 0.05 }}
                className="bg-white/95 p-6 sm:p-8 rounded-3xl border border-[#d4a373]/20 shadow-md relative overflow-hidden"
              >

                <div className="absolute top-4 right-4 text-8xl opacity-[0.018] select-none pointer-events-none font-serif">ॐ</div>

                <div className="pb-5 mb-6 border-b border-orange-100/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] text-[#a07a5a] font-semibold uppercase tracking-widest block mb-1">Order ID</span>
                    <strong className="text-sm text-[#8b4513] font-black font-mono tracking-wide">
                      #{order._id.slice(-8).toUpperCase()}
                    </strong>
                    <span className="text-[11px] text-gray-400 block mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      &nbsp;·&nbsp;
                      <strong className="text-[#8b4513]">₹{order.totalAmount.toFixed(2)}</strong>
                      &nbsp;·&nbsp;{order.items[0]?.product?.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                    </span>
                  </div>

                  <span className={`px-3 py-1.5 rounded-full font-black uppercase text-[9px] tracking-widest border flex-shrink-0
                    ${isCancelled
                      ? "bg-red-50 text-red-600 border-red-200"
                      : status === "Delivered"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-[#8b4513] border-amber-200"
                    }`}>
                    {status}
                  </span>
                </div>

                {!isCancelled ? (
                  <div className="relative py-2 mb-2">

                    <div
                      className="absolute hidden md:block h-[2px] bg-gray-100 z-0"
                      style={{ top: "1.1rem", left: "calc(12.5%)", right: "calc(12.5%)" }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#8b4513] to-[#c8843a]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>

                    <div
                      className="absolute md:hidden w-[2px] bg-gray-100 z-0"
                      style={{ left: "1.1rem", top: "1rem", bottom: "1rem" }}
                    >
                      <motion.div
                        className="w-full bg-gradient-to-b from-[#8b4513] to-[#c8843a]"
                        initial={{ height: "0%" }}
                        animate={{ height: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-5 md:gap-2">
                      {STATUS_STEPS.map((step, idx) => {
                        const done   = idx < stepIndex;
                        const active = idx === stepIndex;

                        return (
                          <div
                            key={step}
                            className="flex md:flex-col items-center gap-3 md:gap-2 md:text-center flex-1"
                          >
                            <div className={`relative w-9 h-9 rounded-full flex items-center justify-center
                              text-sm font-bold border-2 flex-shrink-0 transition-all duration-300
                              ${done   ? "bg-[#8b4513] border-[#8b4513] text-white shadow-md"
                              : active ? "bg-[#c8843a] border-[#c8843a] text-white shadow-lg shadow-amber-200"
                              :          "bg-white border-gray-200 text-gray-300"}`}>

                              {active && (
                                <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/30" />
                              )}

                              {done ? (
                                <svg viewBox="0 0 14 14" className="w-4 h-4" fill="none"
                                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="2,7 5.5,10.5 12,3" />
                                </svg>
                              ) : active ? (
                                <span className="text-base">{STEP_ICONS[step]}</span>
                              ) : (
                                <span className="text-xs">{idx + 1}</span>
                              )}
                            </div>

                            <div className="flex flex-col md:items-center">
                              <p className={`text-[10px] font-black tracking-widest uppercase
                                ${done || active ? "text-[#3d1c08]" : "text-gray-300"}`}>
                                {STEP_LABELS[step]}
                              </p>
                              {active && (
                                <span className="text-[9px] text-[#c8843a] font-semibold mt-0.5 animate-pulse">
                                  ← Current
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="my-2 bg-red-50/50 border border-red-100 p-4 rounded-2xl text-center text-xs font-semibold text-red-600 uppercase tracking-wider">
                    🚫 Order Cancelled
                  </div>
                )}

                {!isCancelled && order.trackingIdOrNumber && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-5 border-t border-orange-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-orange-50/30 p-4 rounded-2xl"
                  >
                    <div className="text-xs text-[#5c3317]">
                      <p className="font-bold text-[11px] text-[#a0522d] uppercase tracking-wider mb-1.5">Shipping Info</p>
                      {order.courierPartnerName && (
                        <p className="font-medium mb-0.5">
                          Courier: <strong className="text-[#8b4513]">{order.courierPartnerName}</strong>
                        </p>
                      )}
                      <p className="font-medium">
                        AWB: <code className="bg-orange-100/50 px-2 py-0.5 rounded font-mono font-bold text-amber-900">
                          {order.trackingIdOrNumber}
                        </code>
                      </p>
                    </div>
                    {order.trackingLink && (
                      <motion.a
                        href={order.trackingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto text-center bg-gradient-to-r from-[#8b4513] to-[#c8843a] text-white text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-xl shadow-sm"
                      >
                        Live Track ➔
                      </motion.a>
                    )}
                  </motion.div>
                )}

                {(canCancel || showNoCancel) && (
                  <div className="mt-5 pt-4 border-t border-orange-100/40 flex justify-end">
                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => setCancelTargetId(order._id)}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-700
                          bg-red-50 hover:bg-red-100 border border-red-200/60
                          px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel Order ✕
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase
                        tracking-widest text-amber-700 bg-amber-50/70 border border-amber-200/50
                        px-4 py-2.5 rounded-xl">
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor">
                          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3.25a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75ZM6.75 7h2.5v4.5h-2.5V7Z"/>
                        </svg>
                        Order Dispatched — Cancellation Unavailable
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}