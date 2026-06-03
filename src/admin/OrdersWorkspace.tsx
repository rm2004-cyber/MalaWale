"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { orderService, adminService } from "../utils/service";
import { toast } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

// Matches backend enum exactly: ['Pending', 'Accepted', 'Packed', 'Shipped', 'Delivered', 'Cancelled']
type OrderStatus =
  | "Pending"
  | "Accepted"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

interface UserAddress {
  receiverName?: string;
  addressLine?: string;
  city?: string;
  pincode?: string;
  state?: string;
  addressType?: string;
}

interface UserInfo {
  name: string;
  phone: string;
  address?: UserAddress;
}

interface OrderItem {
  product?: string | {
    _id: string;
    name: string;
    description?: string;
    images?: string[];
  };
  name?: string;
  size?: string;
  quantity: number;
  price: number;
}

// Matches actual API response structure
interface DBOrder {
  _id: string;           // MongoDB ObjectId — use this as orderId in API calls
  orderId: string;       // Human-readable order reference
  user?: UserInfo;
  address?: UserAddress; // Top-level address from API response
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: string;
  courierName?: string;
  trackingId?: string;
  trackingLink?: string;
  items?: OrderItem[];
  paymentType: "COD" | "Online";
  paymentStatus: "Pending" | "Completed" | "Failed" | "Refunded";
  couponCode?: string | null;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  shippedToday: number;
}

interface PaginationMeta {
  totalPages: number;
  currentPage: number;
  totalOrders: number;
}

// Payload shape required by backend
interface UpdateStatusPayload {
  orderId: string; // Must be order._id (MongoDB ObjectId)
  status: Exclude<OrderStatus, "Pending">; // Backend only accepts transitions, not back to Pending
  courierName?: string;
  trackingId?: string;
  trackingLink?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { pill: string; dot: string; bar: string; label: string }
> = {
  Pending: {
    pill: "bg-sky-100 text-sky-700 border-sky-200",
    dot: "bg-sky-400",
    bar: "bg-sky-400",
    label: "Pending",
  },
  Accepted: {
    pill: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
    label: "Accepted",
  },
  Packed: {
    pill: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    bar: "bg-purple-500",
    label: "Packed",
  },
  Shipped: {
    pill: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
    label: "Shipped",
  },
  Delivered: {
    pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    label: "Delivered",
  },
  Cancelled: {
    pill: "bg-red-100 text-red-600 border-red-200",
    dot: "bg-red-400",
    bar: "bg-red-400",
    label: "Cancelled",
  },
};

const FILTERS: (OrderStatus | "All")[] = [
  "All",
  "Pending",
  "Accepted",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAddress(address?: UserAddress): string | null {
  if (!address) return null;
  const parts = [
    address.receiverName,
    address.addressLine,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function itemDisplayName(item: OrderItem): string {
  if (item.name) return item.name;
  if (item.product && typeof item.product === "object") return item.product.name;
  if (typeof item.product === "string") return item.product;
  return "Unknown Item";
}

function calculateOrderBreakdown(order: DBOrder) {
  let subtotal = 0;
  if (order.items && order.items.length > 0) {
    subtotal = order.items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return sum + (qty * price);
    }, 0);
  } else {
    subtotal = order.totalAmount;
  }

  const shippingCost = subtotal >= 1999 ? 0 : 99;
  const discount = Math.max(0, (subtotal + shippingCost) - order.totalAmount);

  return {
    subtotal,
    shippingCost,
    discount,
  };
}


// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent: string;
  sub?: string;
}

function StatCard({ label, value, icon, accent, sub }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow"
    >
      <div
        className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center text-lg shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-2xl font-black text-stone-800 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: DBOrder;
  index: number;
  onAccept: (order: DBOrder) => void;
  onReject: (order: DBOrder) => void;
  onMarkPacked: (order: DBOrder) => void;
  onMarkDelivered: (order: DBOrder) => void;
  onOpenShipModal: (order: DBOrder) => void;
  onManage: (order: DBOrder) => void;
  onPrint: (order: DBOrder) => void;
}

function OrderCard({
  order,
  index,
  onAccept,
  onReject,
  onMarkPacked,
  onMarkDelivered,
  onOpenShipModal,
  onManage,
  onPrint,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.Pending;
  const { subtotal, shippingCost, discount } = calculateOrderBreakdown(order);

  // Prefer top-level order.address (from API), fall back to user.address
  const resolvedAddress = order.address ?? order.user?.address;
  const formattedAddress = formatAddress(resolvedAddress);

  const renderPhaseActions = () => {
    switch (order.orderStatus) {
      case "Pending":
        return (
          <div className="flex gap-1.5">
            <button
              onClick={() => onAccept(order)}
              className="text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition"
            >
              ✓ Accept
            </button>
            <button
              onClick={() => onReject(order)}
              className="text-[11px] font-bold border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
            >
              ✕ Reject
            </button>
          </div>
        );

      // "Accepted" replaces old "Processing" — matches backend enum
      case "Accepted":
        return (
          <div className="flex gap-1.5">
            <button
              onClick={() => onMarkPacked(order)}
              className="text-[11px] font-bold bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition"
            >
              Mark Packed
            </button>
            <button
              onClick={() => onReject(order)}
              className="text-[11px] font-bold border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        );

      case "Packed":
        return (
          <div className="flex gap-1.5">
            <button
              onClick={() => onOpenShipModal(order)}
              className="text-[11px] font-bold bg-violet-500 hover:bg-violet-600 text-white px-3 py-1.5 rounded-lg transition"
            >
              Ship Order
            </button>
          </div>
        );

      case "Shipped":
        return (
          <div className="flex gap-1.5">
            <button
              onClick={() => onMarkDelivered(order)}
              className="text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition"
            >
              Mark Delivered
            </button>
            <button
              onClick={() => onManage(order)}
              className="text-[11px] font-bold border border-[#9B1B1B] text-[#9B1B1B] hover:bg-[#9B1B1B] hover:text-white px-3 py-1.5 rounded-lg transition"
            >
              Edit Tracking
            </button>
          </div>
        );

      case "Delivered":
      case "Cancelled":
        return null;

      default:
        return (
          <button
            onClick={() => onManage(order)}
            className="text-[11px] font-bold border border-[#9B1B1B] text-[#9B1B1B] hover:bg-[#9B1B1B] hover:text-white px-3 py-1.5 rounded-lg transition"
          >
            Manage
          </button>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="flex items-stretch">
        <div className={`w-1 shrink-0 ${cfg.bar}`} />

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="font-bold text-stone-800 text-sm">
                  {order.user?.name ?? order.address?.receiverName ?? "Anonymous"}
                </span>
                {order.user?.phone && (
                  <span className="text-xs text-stone-400">{order.user.phone}</span>
                )}
                <span className="font-mono text-[11px] text-stone-400">
                  #{order.orderId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.pill}`}
                >
                  {cfg.label}
                </span>
                {order.paymentType === "Online" && order.paymentStatus === "Completed" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white shadow-sm flex items-center gap-1 border border-emerald-600/20">
                    Paid Online
                  </span>
                ) : order.paymentType === "COD" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-sm flex items-center gap-1 animate-cod-pulse border border-red-600/20">
                    COD
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200">
                    {order.paymentType} ({order.paymentStatus})
                  </span>
                )}
                {resolvedAddress?.addressType && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                    {resolvedAddress.addressType}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {order.trackingId && (
                <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1 flex-wrap">
                  <span className="font-mono">{order.trackingId}</span>
                  {order.courierName && (
                    <span className="text-stone-400">· {order.courierName}</span>
                  )}
                  {order.trackingLink && (
                    <a
                      href={order.trackingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 underline underline-offset-2 hover:text-violet-800"
                    >
                      Track →
                    </a>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <p className="font-black text-stone-800 text-lg leading-none">
                ₹{(order.totalAmount ?? 0).toLocaleString("en-IN")}
              </p>
              <div className="flex flex-wrap gap-1.5 justify-end mt-1 items-center">
                {renderPhaseActions()}
                <button
                  onClick={() => onPrint(order)}
                  className="text-[11px] font-bold border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1 shrink-0"
                >
                  Print Label
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 text-[11px] font-semibold text-[#9B1B1B] hover:underline flex items-center gap-1"
          >
            {expanded ? "▲ Hide details" : "▼ View details"}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600">
                  {formattedAddress && (
                    <div>
                      <p className="font-bold text-stone-400 uppercase text-[10px] mb-1">
                        Delivery Address
                      </p>
                      <p className="leading-relaxed">{formattedAddress}</p>
                      {resolvedAddress?.pincode && (
                        <p className="text-stone-400 mt-0.5">
                          PIN: {resolvedAddress.pincode}
                        </p>
                      )}
                    </div>
                  )}

                  {order.items && order.items.length > 0 && (
                    <div>
                      <p className="font-bold text-stone-400 uppercase text-[10px] mb-1">
                        Items
                      </p>
                      <ul className="space-y-1">
                        {order.items.map((item, i) => {
                          // Coerce to Number to prevent NaN
                          const qty = Number(item.quantity) || 0;
                          const unitPrice = Number(item.price) || 0;
                          const lineTotal = qty * unitPrice;
                          return (
                            <li key={i} className="flex justify-between gap-2">
                              <span className="truncate">
                                {itemDisplayName(item)}
                                {item.size && (
                                  <span className="text-stone-400 ml-1">
                                    ({item.size})
                                  </span>
                                )}
                                {" "}× {qty}
                              </span>
                              <span className="font-semibold shrink-0">
                                ₹{lineTotal.toLocaleString("en-IN")}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Payment & Coupon Breakdown Column */}
                  <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-100/80">
                    <p className="font-bold text-stone-400 uppercase text-[10px] mb-2 tracking-wider">
                      Payment &amp; Coupon Details
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Items Subtotal:</span>
                        <span className="font-semibold text-stone-850">₹{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Delivery Charges:</span>
                        <span className={shippingCost === 0 ? "text-emerald-600 font-bold" : "font-semibold text-stone-850"}>
                          {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-100">
                          <span className="flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider">
                            Coupon ({order.couponCode || "COUPON"}):
                          </span>
                          <span className="font-bold">-₹{discount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="border-t border-stone-200/60 my-1 pt-1.5 flex justify-between font-bold text-stone-800">
                        <span>Total Payable:</span>
                        <span className="text-stone-950">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── LogisticsModal ───────────────────────────────────────────────────────────

interface LogisticsModalProps {
  order: DBOrder;
  onClose: () => void;
  onSaved: () => void;
  forceShipped?: boolean; // When true: status locked to "Shipped", dropdown hidden
}

function LogisticsModal({
  order,
  onClose,
  onSaved,
  forceShipped = false,
}: LogisticsModalProps) {
  const [courierName, setCourierName] = useState(order.courierName ?? "");
  const [trackingId, setTrackingId] = useState(order.trackingId ?? "");
  const [trackingLink, setTrackingLink] = useState(order.trackingLink ?? "");
  const [statusVal, setStatusVal] = useState<OrderStatus>(
    forceShipped ? "Shipped" : order.orderStatus
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const resolvedStatus = forceShipped ? "Shipped" : statusVal;

    // Build payload — orderId is always order._id (MongoDB ObjectId)
   const payload = {
    orderId: order._id,
    status: resolvedStatus,
    courierPartnerName: courierName,      // Backend expect karta hai: courierPartnerName
    trackingIdOrNumber: trackingId,       // Backend expect karta hai: trackingIdOrNumber
    trackingLink: trackingLink            // Agar backend mein ye field hai, toh theek hai
  };

    console.log("[LogisticsModal] Sending payload:", payload);

    setSaving(true);
    try {
      await orderService.updateOrderStatus(payload);
      toast.success("Order updated successfully!");
      onSaved();
      onClose();
    } catch (err) {
      console.error("[LogisticsModal] Error:", err);
      toast.error("Failed to update order.");
    } finally {
      setSaving(false);
    }
  };

  const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.Pending;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          <div className="bg-stone-50 border-b px-6 py-4 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-800">
                {forceShipped ? "Ship Order" : "Update Logistics"}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5 font-mono">
                #{order.orderId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.pill}`}
              >
                {cfg.label}
              </span>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-stone-600 transition text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Hide status dropdown when called from "Ship Order" — status is implicitly Shipped */}
            {!forceShipped && (
              <Field label="Update Status">
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as OrderStatus)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-[#9B1B1B]/20 focus:border-[#9B1B1B]/50 transition"
                >
                  {(
                    [
                      "Pending",
                      "Accepted",
                      "Packed",
                      "Shipped",
                      "Delivered",
                      "Cancelled",
                    ] as OrderStatus[]
                  ).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Courier Partner">
              <input
                type="text"
                placeholder="e.g. Delhivery, BlueDart, DTDC…"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="AWB / Tracking ID">
              <input
                type="text"
                placeholder="Tracking number"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Tracking URL">
              <input
                type="text"
                placeholder="https://track.courier.com/..."
                value={trackingLink}
                onChange={(e) => setTrackingLink(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-stone-50">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-[#9B1B1B] hover:bg-[#7a3b10] disabled:opacity-60 text-white font-bold text-xs rounded-xl transition shadow-sm min-w-[100px]"
            >
              {saving
                ? "Saving…"
                : forceShipped
                ? "Confirm Shipment"
                : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-stone-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#9B1B1B]/20 focus:border-[#9B1B1B]/50 transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

function Pagination({ meta, onPageChange }: PaginationProps) {
  const { currentPage, totalPages } = meta;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  const withEllipsis: (number | "…")[] = [];
  let prev: number | null = null;
  for (const p of visiblePages) {
    if (prev !== null && p - prev > 1) withEllipsis.push("…");
    withEllipsis.push(p);
    prev = p;
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-lg border border-stone-200 text-stone-500 text-xs font-bold disabled:opacity-30 hover:bg-stone-100 transition"
      >
        ‹
      </button>
      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="text-stone-400 text-xs px-1">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-8 h-8 rounded-lg text-xs font-bold border transition ${
              p === currentPage
                ? "bg-[#9B1B1B] text-white border-[#9B1B1B]"
                : "border-stone-200 text-stone-600 hover:bg-stone-100"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-lg border border-stone-200 text-stone-500 text-xs font-bold disabled:opacity-30 hover:bg-stone-100 transition"
      >
        ›
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ModalState {
  order: DBOrder;
  forceShipped: boolean;
}

export default function OrdersWorkspace() {
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "All">("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    totalPages: 1,
    currentPage: 1,
    totalOrders: 0,
  });
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [printOrder, setPrintOrder] = useState<DBOrder | null>(null);

  // ── Data fetchers ──────────────────────────────────────────────────────────

const loadStats = useCallback(async () => {
  setStatsLoading(true);
  try {
    const res = await adminService.getDashboardStats();
    const d = res.data;

    // Yahan check kar: agar API stats mein totalOrders nahi bhej raha, 
    // toh tu orders list ki length use kar le.
    const totalCount = d.stats?.totalOrders ?? (orders.length > 0 ? orders.length : 0);

    setStats({
      totalOrders: totalCount, 
      pendingOrders: d.stats?.pendingOrders ?? 0,
      totalRevenue: d.stats?.todaysSales ?? 0, 
      shippedToday: d.stats?.shippedToday ?? 0,
    });
  } catch (err) {
    console.error(err);
  } finally {
    setStatsLoading(false);
  }
}, [orders.length]); // orders dependency add ki taaki length update ho

  const loadOrders = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await adminService.getAllOrders(pageNum);
      if (res?.data) {
        const d = res.data;
        setOrders(d.orders ?? []);
        setPagination({
          totalPages: d.totalPages ?? 1,
          currentPage: d.currentPage ?? pageNum,
          totalOrders: d.totalOrders ?? 0,
        });
      }
    } catch (err) {
      console.error("[loadOrders] Error:", err);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadOrders(page); }, [page, loadOrders]);

  const refresh = () => {
    loadStats();
    loadOrders(page);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  // NOTE: orderId in payload is ALWAYS order._id (MongoDB ObjectId from API response)

  const handleAccept = async (order: DBOrder) => {
    const payload: UpdateStatusPayload = { orderId: order._id, status: "Accepted" };
    console.log("[handleAccept] Payload:", payload);
    try {
      await orderService.updateOrderStatus(payload);
      toast.success("Order accepted!");
      refresh();
    } catch (err: any) {
      console.error("[handleAccept] Error:", err.response?.data ?? err);
      toast.error("Failed to accept order.");
    }
  };

  const handleReject = async (order: DBOrder) => {
    const reason = window.prompt("Enter rejection / cancellation reason:");
    if (reason === null) return;
    console.log("[handleReject] orderId (order._id):", order._id, "reason:", reason);
    try {
      await orderService.rejectOrder({ orderId: order._id, adminReason: reason });
      toast.success("Order cancelled. Stock reverted.");
      refresh();
    } catch (err: any) {
      console.error("[handleReject] Error:", err.response?.data ?? err);
      toast.error("Failed to cancel order.");
    }
  };

  const handleMarkPacked = async (order: DBOrder) => {
    const payload: UpdateStatusPayload = { orderId: order._id, status: "Packed" };
    console.log("[handleMarkPacked] Payload:", payload);
    try {
      await orderService.updateOrderStatus(payload);
      toast.success("Order marked as Packed!");
      refresh();
    } catch (err: any) {
      console.error("[handleMarkPacked] Error:", err.response?.data ?? err);
      toast.error("Failed to update status.");
    }
  };

  const handleMarkDelivered = async (order: DBOrder) => {
    const payload: UpdateStatusPayload = { orderId: order._id, status: "Delivered" };
    console.log("[handleMarkDelivered] Payload:", payload);
    try {
      await orderService.updateOrderStatus(payload);
      toast.success("Order marked as Delivered!");
      refresh();
    } catch (err: any) {
      console.error("[handleMarkDelivered] Error:", err.response?.data ?? err);
      toast.error("Failed to mark as delivered.");
    }
  };

  // Opens LogisticsModal in "Ship" mode — status locked to "Shipped"
  const handleOpenShipModal = (order: DBOrder) => {
    setModalState({ order, forceShipped: true });
  };

  // Opens LogisticsModal in "Edit Tracking" mode — status dropdown shown
  const handleManage = (order: DBOrder) => {
    setModalState({ order, forceShipped: false });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Filtered view ──────────────────────────────────────────────────────────

  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((o) => o.orderStatus === activeFilter);

  const countFor = (f: OrderStatus | "All") =>
    f === "All"
      ? orders.length
      : orders.filter((o) => o.orderStatus === f).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-800 tracking-tight">
            Orders Workspace
          </h2>
          <p className="text-sm text-stone-400 mt-0.5">
            Manage shipping, tracking, and order lifecycle.
          </p>
        </div>
        <button
          onClick={refresh}
          className="text-xs font-semibold text-stone-500 border border-stone-200 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
        >
          <span className="text-sm">↺</span> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-stone-100 animate-pulse" />
          ))
        ) : stats ? (
          <>
            <StatCard
              label="Total Orders"
              value={(stats?.totalOrders ?? 0).toLocaleString("en-IN")}
              icon="O"
              accent="bg-sky-100"
              sub="All time"
            />
            <StatCard
              label="Pending"
              value={stats.pendingOrders}
              icon="P"
              accent="bg-amber-100"
              sub="Awaiting action"
            />
           <StatCard
  label="Revenue"
  value={`₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`} 
  icon="R"
  accent="bg-emerald-100"
  sub="Gross collected"
/>
            <StatCard
              label="Shipped Today"
              value={stats.shippedToday}
              icon="S"
              accent="bg-violet-100"
              sub="Dispatched"
            />
          </>
        ) : (
          <p className="col-span-4 text-xs text-stone-400 italic text-center py-4">
            Stats unavailable
          </p>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f;
          const cfg = f !== "All" ? STATUS_CONFIG[f as OrderStatus] : null;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`
                inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${
                  isActive
                    ? "bg-[#9B1B1B] text-white border-[#9B1B1B] shadow-sm"
                    : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200 hover:border-stone-300"
                }
              `}
            >
              {cfg && (
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-white/70" : cfg.dot
                  }`}
                />
              )}
              {f}
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-stone-200 text-stone-500"
                }`}
              >
                {countFor(f)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Orders List ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">
          No orders found for{" "}
          <span className="font-semibold text-stone-600">{activeFilter}</span>.
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredOrders.map((order, i) => (
              <OrderCard
                key={order._id}
                order={order}
                index={i}
                onAccept={handleAccept}
                onReject={handleReject}
                onMarkPacked={handleMarkPacked}
                onMarkDelivered={handleMarkDelivered}
                onOpenShipModal={handleOpenShipModal}
                onManage={handleManage}
                onPrint={setPrintOrder}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && (
        <Pagination meta={pagination} onPageChange={handlePageChange} />
      )}

      {/* ── Logistics Modal ── */}
      {modalState && (
        <LogisticsModal
          order={modalState.order}
          forceShipped={modalState.forceShipped}
          onClose={() => setModalState(null)}
          onSaved={refresh}
        />
      )}

      {/* ── Print Label Modal ── */}
      {printOrder && (
        <PrintLabelModal
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
}

/* ─── PrintLabelModal ─────────────────────────────────────────────── */

interface PrintLabelModalProps {
  order: DBOrder;
  onClose: () => void;
}

function PrintLabelModal({ order, onClose }: PrintLabelModalProps) {
  const resolvedAddress = order.address ?? order.user?.address;
  const formattedAddress = formatAddress(resolvedAddress);
  const { subtotal, shippingCost, discount } = calculateOrderBreakdown(order);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="bg-stone-50 border-b px-6 py-4 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                Shipping Label &amp; Invoice Generator
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Generate high-resolution printable slip for packing &amp; shipping.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Modal Body: Scrollable Preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-stone-100 flex justify-center">
            {/* Printable Container */}
            <div
              id="print-area-invoice"
              style={{
                width: "100%",
                maxWidth: "650px",
                background: "#ffffff",
                border: "2px dashed #000000",
                padding: "24px",
                boxSizing: "border-box",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "#000000",
              }}
            >
              {/* Slip Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #000000", paddingBottom: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "0.2em" }}>✦ ॐ श्री गणेशाय नमः ✦</span>
                <h1 style={{ fontSize: "28px", fontWeight: 900, margin: "6px 0 2px 0", letterSpacing: "0.05em", fontFamily: "Georgia, serif" }}>MALA WALE</h1>
                <p style={{ fontSize: "11px", fontStyle: "italic", margin: 0, color: "#444444" }}>Divine Handcrafted Treasures &amp; Sacred Beads from Vrindavan</p>
              </div>

              {/* Sender & Recipient Grid */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "20px", fontSize: "12px", lineHeight: "1.5" }}>
                {/* Sender (Left) */}
                <div style={{ flex: 1, borderRight: "1px dashed #cccccc", paddingRight: "20px" }}>
                  <p style={{ margin: "0 0 6px 0", fontWeight: "bold", textTransform: "uppercase", fontSize: "10px", color: "#555555", letterSpacing: "0.05em" }}>From (Sender):</p>
                  <p style={{ margin: "0 0 3px 0", fontWeight: "bold", fontSize: "14px" }}>MalaWale Shipping Hub</p>
                  <p style={{ margin: 0 }}>Gali No. 2, Raman Reti, Vrindavan</p>
                  <p style={{ margin: 0 }}>Mathura, Uttar Pradesh - 281121</p>
                  <p style={{ margin: "6px 0 0 0" }}><strong>Phone:</strong> +91 99999 99999</p>
                  <p style={{ margin: 0 }}><strong>Email:</strong> orders@malawale.com</p>
                </div>

                {/* Recipient (Right) */}
                <div style={{ flex: 1, paddingLeft: "10px" }}>
                  <p style={{ margin: "0 0 6px 0", fontWeight: "bold", textTransform: "uppercase", fontSize: "10px", color: "#555555", letterSpacing: "0.05em" }}>To (Recipient):</p>
                  <p style={{ margin: "0 0 3px 0", fontWeight: "bold", fontSize: "15px" }}>{resolvedAddress?.receiverName || order.user?.name || "Anonymous Recipient"}</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{resolvedAddress?.addressLine}</p>
                  {resolvedAddress?.landmark && <p style={{ margin: 0, fontSize: "11px", fontStyle: "italic" }}>Landmark: {resolvedAddress.landmark}</p>}
                  <p style={{ margin: 0, fontWeight: 600 }}>{resolvedAddress?.city}, {resolvedAddress?.state} - {resolvedAddress?.pincode}</p>
                  <p style={{ margin: "6px 0 0 0" }}><strong>Phone:</strong> {resolvedAddress?.receiverPhone || order.user?.phone || "N/A"}</p>
                  <p style={{ margin: 0 }}><strong>Order Ref:</strong> #{order.orderId}</p>
                </div>
              </div>

              {/* Order Info Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f5f5f5", padding: "10px 14px", borderRadius: "6px", marginBottom: "20px", fontSize: "11px", fontWeight: "bold", border: "1px solid #e0e0e0" }}>
                <span>ORDER DATE: {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                <span style={{ fontSize: "12px", textTransform: "uppercase" }}>PAYMENT: <span style={{ color: order.paymentType === "COD" ? "#d32f2f" : "#2e7d32" }}>{order.paymentType}</span></span>
              </div>

              {/* Items Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #000000" }}>
                    <th style={{ padding: "8px 4px", width: "40px", fontWeight: "bold" }}>No.</th>
                    <th style={{ padding: "8px 4px", fontWeight: "bold" }}>Item Description</th>
                    <th style={{ padding: "8px 4px", width: "80px", fontWeight: "bold", textAlign: "center" }}>Size</th>
                    <th style={{ padding: "8px 4px", width: "60px", fontWeight: "bold", textAlign: "center" }}>Qty</th>
                    <th style={{ padding: "8px 4px", width: "90px", fontWeight: "bold", textAlign: "right" }}>Rate</th>
                    <th style={{ padding: "8px 4px", width: "100px", fontWeight: "bold", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, i) => {
                    const qty = Number(item.quantity) || 0;
                    const price = Number(item.price) || 0;
                    const name = typeof item.product === "object" && item.product?.name ? item.product.name : (item.name || "Sacred Item");
                    const description = typeof item.product === "object" && item.product?.description ? item.product.description : "";
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "10px 4px", verticalAlign: "top" }}>{i + 1}</td>
                        <td style={{ padding: "10px 4px", verticalAlign: "top" }}>
                          <span style={{ fontWeight: "bold", display: "block" }}>{name}</span>
                          {description && <span style={{ fontSize: "10px", color: "#555555", display: "block", marginTop: "2px", lineHeight: "1.3" }}>{description.slice(0, 80)}{description.length > 80 ? "..." : ""}</span>}
                        </td>
                        <td style={{ padding: "10px 4px", verticalAlign: "top", textAlign: "center" }}>{item.size || "Standard"}</td>
                        <td style={{ padding: "10px 4px", verticalAlign: "top", textAlign: "center" }}>{qty}</td>
                        <td style={{ padding: "10px 4px", verticalAlign: "top", textAlign: "right" }}>₹{price.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "10px 4px", verticalAlign: "top", textAlign: "right", fontWeight: "bold" }}>₹{(qty * price).toLocaleString("en-IN")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
                <div style={{ width: "250px", fontSize: "12px", lineHeight: "1.8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Items Subtotal:</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Shipping Charges:</span>
                    <span style={{ color: shippingCost === 0 ? "#2e7d32" : "#000000", fontWeight: shippingCost === 0 ? "bold" : "normal" }}>
                      {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#2e7d32", fontWeight: "bold" }}>
                      <span>Discount ({order.couponCode || "Coupon"}):</span>
                      <span>-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold", paddingTop: "6px", borderTop: "1px solid #000000", marginTop: "4px" }}>
                    <span>Grand Total:</span>
                    <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Footer Blessings */}
              <div style={{ textAlign: "center", borderTop: "1px solid #000000", paddingTop: "12px", fontSize: "11px", lineHeight: "1.4" }}>
                <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>May your blessings multiply a thousandfold! Jai Shri Radhe Krishna!</p>
                <p style={{ margin: 0, color: "#666666", fontSize: "10px" }}>Handcrafted with absolute devotion. For support, contact orders@malawale.com</p>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex justify-between items-center px-6 py-4 border-t bg-stone-50 shrink-0">
            <span className="text-[11px] text-stone-400 italic">
              Tip: Set layout to "Portrait" and enable "Background Graphics" in browser print settings.
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 transition"
              >
                Close Preview
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-[#9B1B1B] hover:bg-[#7a3b10] text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                Print Label &amp; Invoice
              </button>
            </div>
          </div>
        </motion.div>

        {/* Global CSS and Print Styling Injection */}
        <style>{`
          @keyframes codBreathe {
            0%, 100% {
              background-color: #ef4444;
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
              transform: scale(1);
            }
            50% {
              background-color: #dc2626;
              box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
              transform: scale(1.05);
            }
          }
          .animate-cod-pulse {
            animation: codBreathe 2s infinite ease-in-out;
          }

          @media print {
            /* Hide the entire browser viewport elements */
            body * {
              visibility: hidden !important;
            }
            /* Render ONLY the print slip area */
            #print-area-invoice, #print-area-invoice * {
              visibility: visible !important;
            }
            #print-area-invoice {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              border: 1px solid #000000 !important;
              padding: 10px !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            /* Remove margins/headers from printable page */
            @page {
              size: auto;
              margin: 8mm;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}