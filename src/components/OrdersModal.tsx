import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { orderService } from "../utils/service";
// @ts-ignore
import { useAuth } from "../context/AuthContext";

interface OrdersModalProps {
  onClose: () => void;
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const MILESTONES = ['Placed', 'Crafted', 'Shipped', 'Transit', 'Delivered'];

export default function OrdersModal({ onClose }: OrdersModalProps) {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setErrorMsg("Please login to track your sacred orders! 🙏");
      setLoading(false);
      return;
    }

    orderService.getUserOrders()
      .then((res) => {
        if (res.data.success) setOrders(res.data.orders || []);
      })
      .catch(() => setErrorMsg("Failed to load orders."))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const getProgressIndex = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 2;
    if (s === 'packed') return 1;
    return 0;
  };

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-orange-50 rounded-3xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#8b4513] flex justify-between items-center text-amber-100">
          <h2 className="font-bold text-lg">My Orders</h2>
          <button onClick={onClose}><CloseIcon /></button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-amber-50 rounded-xl overflow-hidden flex-shrink-0 border border-amber-100">
                   <img src={order.items?.[0]?.product?.images?.[0] || "/placeholder.png"} className="w-full h-full object-cover" alt="product" />
                </div>
                
                {/* Details */}
                <div className="flex-1">
                  <p className="font-bold text-amber-900">{order.items?.[0]?.product?.name || "Spiritual Item"}</p>
                  <p className="text-xs text-amber-700">Order ID: {order._id.slice(-6)}</p>
                  <p className="text-sm font-bold mt-1 text-green-700">₹{order.totalAmount}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full h-fit font-semibold ${order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {order.orderStatus}
                </span>
              </div>

              {/* Address Mini Block */}
              <div className="mt-3 pt-3 border-t border-dashed border-amber-200 text-[11px] text-amber-700">
                <p>Deliver to: <span className="font-semibold">{order.address.receiverName}</span>, {order.address.addressLine}, {order.address.city}</p>
              </div>

              {/* Milestone Tracker */}
              <div className="mt-4 grid grid-cols-5 gap-1">
                {MILESTONES.map((label, idx) => (
                  <div key={label} className={`h-1.5 rounded-full ${idx <= getProgressIndex(order.orderStatus) ? 'bg-amber-600' : 'bg-amber-100'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}