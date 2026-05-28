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
  product?: string;
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
  if (item.product) return item.product;
  return "Unknown Item";
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
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.Pending;

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
              📦 Mark Packed
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
              🚚 Ship Order
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
              ✅ Mark Delivered
            </button>
            <button
              onClick={() => onManage(order)}
              className="text-[11px] font-bold border border-[#8b4513] text-[#8b4513] hover:bg-[#8b4513] hover:text-white px-3 py-1.5 rounded-lg transition"
            >
              ✏️ Edit Tracking
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
            className="text-[11px] font-bold border border-[#8b4513] text-[#8b4513] hover:bg-[#8b4513] hover:text-white px-3 py-1.5 rounded-lg transition"
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
                  <span>📦</span>
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
              {renderPhaseActions()}
            </div>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 text-[11px] font-semibold text-[#8b4513] hover:underline flex items-center gap-1"
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
                <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
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
      toast.success("Order updated successfully! 📦");
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
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-[#8b4513]/20 focus:border-[#8b4513]/50 transition"
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
              className="px-5 py-2 bg-[#8b4513] hover:bg-[#7a3b10] disabled:opacity-60 text-white font-bold text-xs rounded-xl transition shadow-sm min-w-[100px]"
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
  "w-full border border-stone-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8b4513]/20 focus:border-[#8b4513]/50 transition";

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
                ? "bg-[#8b4513] text-white border-[#8b4513]"
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
      toast.success("Order marked as Packed! 📦");
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
      toast.success("Order marked as Delivered! ✅");
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
              icon="🗂️"
              accent="bg-sky-100"
              sub="All time"
            />
            <StatCard
              label="Pending"
              value={stats.pendingOrders}
              icon="⏳"
              accent="bg-amber-100"
              sub="Awaiting action"
            />
           <StatCard
  label="Revenue"
  value={`₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`} 
  icon="💰"
  accent="bg-emerald-100"
  sub="Gross collected"
/>
            <StatCard
              label="Shipped Today"
              value={stats.shippedToday}
              icon="🚚"
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
                    ? "bg-[#8b4513] text-white border-[#8b4513] shadow-sm"
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
    </div>
  );
}