const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
discountType: { 
  type: String, 
  enum: ['Flat', 'Percentage', 'Slab'], 
  required: true,
  set: v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() 
},  
  // Flat ya Percentage ke liye use hoga
  discountValue: { type: Number, default: 0 }, 
  
  // Slab based discount ke liye array: [{ minCartValue: 1000, discountAmount: 150 }]
  slabs: [{
    minCartValue: { type: Number, required: true },
    discountAmount: { type: Number, required: true }
  }],
  
  minCartValue: { type: Number, default: 0 }, // Flat/Percentage par lagne wali minimum cart condition
  maxDiscount: { type: Number, default: 0 },   // Percentage coupon par max kitna discount mil sake (Cap limit)
  
  isFirstOrderOnly: { type: Boolean, default: false }, // 🔥 Kya ye sirf pehle order par chalega?
  
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coupon', CouponSchema);