const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  mrp: { type: Number, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 10 },
  inStock: { type: Boolean, default: true }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  badge: { type: String, default: "" },
  details: [{ type: String }],
  variants: [VariantSchema],
  soldCount: { type: Number, default: 0 }, // 🔥 Kitne bik chuke hain (Initial 0)
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);