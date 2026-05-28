const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  address: {
    receiverName: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    addressLine: { type: String, required: true },
    pincode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    addressType: { type: String, default: 'Home' }
  },
  totalAmount: { type: Number, required: true },
  paymentType: { type: String, enum: ['COD', 'Online'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  paymentGateway: { type: String, default: "" },
  transactionId: { type: String, default: "" },
  gatewayResponse: { type: Object, default: null },
  orderStatus: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  courierPartnerName: { type: String, default: "" },
  trackingIdOrNumber: { type: String, default: "" },
  statusTimestamps: {
    acceptedAt: Date,
    packedAt: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
  couponCode: { type: String, default: null }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);