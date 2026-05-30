const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// ➕ 1. Create Coupon (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const couponData = req.body;
    const existing = await Coupon.findOne({ code: couponData.code.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: "This coupon code already exists." });

    const newCoupon = new Coupon(couponData);
    await newCoupon.save();
    res.status(201).json({ success: true, coupon: newCoupon, message: "Coupon successfully created." });
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
    if (!deleted) return res.status(404).json({ success: false, message: "Coupon not found." });
    res.status(200).json({ success: true, message: "Coupon successfully deleted." });
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
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid or expired coupon code." });

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ success: false, message: "This coupon has expired." });
    }

    if (coupon.isFirstOrderOnly) {
      const previousOrder = await Order.findOne({ user: userId, orderStatus: { $ne: 'Cancelled' } });
      if (previousOrder) {
        return res.status(400).json({ success: false, message: "This coupon is only valid for your first order." });
      }
    }

    let discount = 0;
    const cartAmount = totalAmount;

    if (coupon.discountType === 'Slab') {
      const matchedSlab = coupon.slabs
        .filter(slab => cartAmount >= slab.minCartValue)
        .sort((a, b) => b.minCartValue - a.minCartValue)[0];

      if (!matchedSlab) {
        return res.status(400).json({ success: false, message: "Minimum cart amount criteria is not met." });
      }
      discount = matchedSlab.discountAmount;
    } else {
      if (cartAmount < coupon.minCartValue) {
        return res.status(400).json({ success: false, message: `Minimum order value of ₹${coupon.minCartValue} is required to apply this coupon.` });
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
      message: "Coupon applied successfully.",
      discountAmount: discount,
      finalAmount: finalAmount < 0 ? 0 : finalAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Validation Coupon Error", error: error.message });
  }
};