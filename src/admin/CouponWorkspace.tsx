"use client";

import { useState, useEffect } from "react";
import { couponService } from "../utils/service"; // 2-level parent level path matching utils
import { toast } from "react-hot-toast";

interface DBCoupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minCartValue?: number;
  expiryDate?: string;
  isActive: boolean;
}

export default function CouponWorkspace() {
  const [coupons, setCoupons] = useState<DBCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form payload controller states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [minCartValue, setminCartValue] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState("");

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getAllCoupons();
      // Safe fallback check to ensure compatibility with array wrappers
      if (res?.data) {
        setCoupons(res.data.coupons || res.data || []);
      }
    } catch (err) {
      toast.error("Failed to map dynamic active coupon stack data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCoupons(); }, []);

  const handleCreateCoupon = async () => {
    if (!code.trim() || !discountValue) {
      toast.error("Coupon transactional code and value are compulsory attributes!");
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(), // Clean text schema input to uppercase parameters
      discountType,
      discountValue,
      minCartValue: minCartValue || 0,
      expiryDate: expiryDate || undefined
    };

    try {
      await couponService.createCoupon(payload);
      toast.success(`Discount Code ${payload.code} launched successfully!`);
      // Reset input parameters blocks
      setCode(""); setDiscountValue(0); setminCartValue(0); setExpiryDate("");
      loadCoupons();
    } catch (err) {
      toast.error("Validation rejected token instantiation query parameters.");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to expire and delete this coupon code permanently?")) return;
    try {
      await couponService.deleteCoupon(id);
      toast.success("Coupon code flushed from database catalog nodes.");
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      toast.error("Failed to terminate active discount matrix structural element.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-800">Coupon & Discount Controls</h2>
        <p className="text-sm text-stone-400 mt-0.5">Generate customized promotional voucher offers for devotees.</p>
      </div>

      {/* Creation Segment Block */}
      <div className="bg-amber-50/20 border border-dashed border-orange-200 p-5 rounded-2xl space-y-4">
        <p className="text-sm font-bold text-[#9B1B1B]">Mint Brand New Promotional Voucher</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Coupon Code</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="MALA2026, FESTIVAL50..." className="w-full border p-2.5 text-sm rounded-xl uppercase font-mono outline-none bg-white" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Discount Metric Type</label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-full border p-2.5 text-sm rounded-xl outline-none bg-white font-medium">
              <option value="percentage">Percentage Offer (% Off)</option>
              <option value="flat">Flat Direct Rebate (₹ Off)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Discount Worth Value</label>
            <input type="number" value={discountValue || ""} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} placeholder="e.g. 15 or 250" className="w-full border p-2.5 text-sm rounded-xl outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Minimum Order Basket Value (₹)</label>
            <input type="number" value={minCartValue || ""} onChange={(e) => setminCartValue(parseFloat(e.target.value) || 0)} placeholder="e.g. 499 (0 for no limit)" className="w-full border p-2.5 text-sm rounded-xl outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Optional Lifespan Expiry Date</label>
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full border p-2.5 text-sm rounded-xl outline-none bg-white" />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button onClick={handleCreateCoupon} className="w-full md:w-auto bg-[#9B1B1B] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#7a3b10] transition shadow-sm shadow-[#9B1B1B]/10">
            Activate & Publish Voucher
          </button>
        </div>
      </div>

      {/* Coupons Registry List Table Grid */}
      {loading ? (
        <div className="text-center italic text-stone-400 animate-pulse py-6">Syncing live promotional index maps...</div>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[650px]">
              <thead>
                <tr className="border-b bg-stone-50/70 text-stone-400 text-xs font-bold uppercase tracking-wide">
                  <th className="px-5 py-3.5">Voucher Context</th>
                  <th className="px-4 py-3.5">Rebate Type</th>
                  <th className="px-4 py-3.5">Rule Criteria</th>
                  <th className="px-4 py-3.5">Lifespan Deadline</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 font-medium text-stone-700">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-stone-50/40 transition">
                    <td className="px-5 py-4 font-mono font-black text-stone-900 tracking-wide bg-stone-50/20 text-sm">
                      {c.code}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${c.discountType === "percentage" ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-700"}`}>
                        {c.discountType === "percentage" ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-stone-500">
                      {c.minCartValue ? `Min order worth ₹${c.minCartValue}` : "No minimal threshold boundary"}
                    </td>
                    <td className="px-4 py-4 text-xs font-mono text-stone-400">
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "∞ Infinite Lifespan"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDeleteCoupon(c._id)} className="text-xs text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border font-bold transition">
                        Erase Code
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-xs italic text-stone-400">No active promotional vouchers currently recorded on live infrastructure loops.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}