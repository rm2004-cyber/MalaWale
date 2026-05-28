const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// ➕ 1. Create Coupon (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const couponData = req.body;
    const existing = await Coupon.findOne({ code: couponData.code.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: "Ye coupon code pehle se bana hua hai!" });

    const newCoupon = new Coupon(couponData);
    await newCoupon.save();
    res.status(201).json({ success: true, coupon: newCoupon, message: "Coupon successfully ban gaya! 🎟️" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Create Coupon Error", error: error.message });
  }
};

// 📄 2. Get All Coupons (Admin Dashboard / Checkout List)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch Coupons Error" });
  }
};

// 🗑️ 3. Delete Coupon (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Coupon nahi mila!" });
    res.status(200).json({ success: true, message: "Coupon delete ho gaya! 🗑️" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete Coupon Error" });
  }
};

// 🔍 4. Validate Coupon API (Customer Checkout Layer)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid ya expired coupon code hai bhai!" });

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ success: false, message: "Ye coupon expire ho chuka hai! ⏳" });
    }

    if (coupon.isFirstOrderOnly) {
      const previousOrder = await Order.findOne({ user: userId, orderStatus: { $ne: 'Cancelled' } });
      if (previousOrder) {
        return res.status(400).json({ success: false, message: "Ye coupon sirf first order ke liye valid hai! 🛍️" });
      }
    }

    let discount = 0;
    const cartAmount = totalAmount;

    if (coupon.discountType === 'Slab') {
      const matchedSlab = coupon.slabs
        .filter(slab => cartAmount >= slab.minCartValue)
        .sort((a, b) => b.minCartValue - a.minCartValue)[0];

      if (!matchedSlab) {
        return res.status(400).json({ success: false, message: `Is coupon ke liye minimum cart amount kam hai!` });
      }
      discount = matchedSlab.discountAmount;
    } else {
      if (cartAmount < coupon.minCartValue) {
        return res.status(400).json({ success: false, message: `Ye coupon lagane ke liye kam se kam ₹${coupon.minCartValue} ki shopping karo!` });
      }

      if (coupon.discountType === 'Flat') {
        discount = coupon.discountValue;
      } else if (coupon.discountType === 'Percentage') {
        discount = (cartAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }
    }

    const finalAmount = cartAmount - discount;
    res.status(200).json({
      success: true,
      message: "Coupon applied successfully! 🎉",
      discountAmount: discount,
      finalAmount: finalAmount < 0 ? 0 : finalAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Validation Coupon Error", error: error.message });
  }
};