const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const { initiateRefund } = require('../controllers/paymentController');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, totalAmount } = req.body;
    const userId = req.user._id;

    const address = {
      receiverName: shippingAddress.fullName,
      receiverPhone: shippingAddress.phone,
      addressLine: shippingAddress.street,
      pincode: shippingAddress.pincode,
      city: shippingAddress.city,
      state: shippingAddress.state,
      addressType: 'Home'
    };

    const paymentType = paymentMethod;

    if (!address || !paymentType) {
      return res.status(400).json({ success: false, message: "Address and payment method are required." });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    for (const item of cart.items) {
      let variant = item.size 
        ? item.product.variants.find(v => v.size.trim().toLowerCase() === item.size.trim().toLowerCase())
        : item.product.variants[0];

      if (!variant || variant.stock < item.quantity || variant.inStock === false) {
        return res.status(400).json({ success: false, message: `${item.product.name} is out of stock.` });
      }
    }

    const isOnline = paymentType === 'Online';
    let razorpayOrderId = null;

    if (isOnline) {
      // 1. Online Flow: Prepare order items and validate stock availability (No DB saves or stock deductions yet)
      const orderItems = [];
      for (const item of cart.items) {
        let variant = item.size 
          ? item.product.variants.find(v => v.size.trim().toLowerCase() === item.size.trim().toLowerCase())
          : item.product.variants[0];
        
        const price = variant ? variant.price : item.product.variants[0].price;
        orderItems.push({
          product: item.product._id,
          size: item.size || variant.size,
          quantity: item.quantity,
          price: price
        });
      }

      // 2. Create Razorpay order to pre-authorize payment
      const options = {
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      };
      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
      console.log("Razorpay Order Created (Not saved to DB yet):", razorpayOrderId);

      // Return initialized details. Carts, DB order, and stock levels remain completely untouched!
      return res.status(200).json({ 
        success: true, 
        razorpayOrderId: razorpayOrderId,
        totalAmount: totalAmount,
        message: "Razorpay order initiated successfully!" 
      });
    }

    // COD Flow: Save order, deduct stock, and clear cart immediately!
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      let variant = item.size 
        ? product.variants.find(v => v.size.trim().toLowerCase() === item.size.trim().toLowerCase())
        : product.variants[0];
      
      const price = variant ? variant.price : product.variants[0].price;
      variant.stock -= item.quantity;
      product.soldCount += item.quantity;
      if (variant.stock === 0) variant.inStock = false;
      await product.save();

      orderItems.push({
        product: item.product._id,
        size: item.size || variant.size,
        quantity: item.quantity,
        price: price
      });
    }

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      address: address,
      totalAmount: totalAmount,
      paymentType: paymentType,
      paymentStatus: 'Completed',
      orderStatus: 'Pending',
      razorpayOrderId: null,
      couponCode: couponCode || null
    });

    await newOrder.save();
    console.log("COD Order Saved to DB:", newOrder._id);
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({ 
      success: true, 
      order: newOrder,
      message: "Order placed successfully!" 
    });
  } catch (error) {
    console.error("Order Placement Error:", error);
    res.status(500).json({ success: false, message: "Order Placement Error", error: error.message });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, courierPartnerName, trackingIdOrNumber } = req.body;

    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    // 1. Status transition check (Optional but Good Practice)
    if (order.orderStatus === 'Cancelled') return res.status(400).json({ success: false, message: "Cancelled order cannot be updated." });

    order.orderStatus = status;

    // 2. Automated Timestamp Management
    if (status === 'Accepted') order.statusTimestamps.acceptedAt = Date.now();
    else if (status === 'Packed') order.statusTimestamps.packedAt = Date.now();
    else if (status === 'Shipped') {
      if (!courierPartnerName || !trackingIdOrNumber) {
        return res.status(400).json({ success: false, message: "Tracking details are required." });
      }
      order.courierPartnerName = courierPartnerName;
      order.trackingIdOrNumber = trackingIdOrNumber;
      order.statusTimestamps.shippedAt = Date.now();
    }
    else if (status === 'Delivered') {
      order.statusTimestamps.deliveredAt = Date.now();
      order.paymentStatus = 'Completed'; // Payment finalize
    }

    await order.save();
    res.status(200).json({ success: true, order, message: `Order updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update Error", error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch Orders Error" });
  }
};

exports.cancelOrderByCustomer = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    console.log(`[CANCEL-REQ] User ${userId} requested cancellation for Order: ${orderId}`);

    let order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      console.warn(`[CANCEL-ERROR] Order ${orderId} not found for User ${userId}`);
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
      console.warn(`[CANCEL-BLOCKED] Order ${orderId} is ${order.orderStatus}, cannot cancel.`);
      return res.status(400).json({ 
        success: false, 
        message: "Order has already been shipped and cannot be cancelled." 
      });
    }

    if (order.orderStatus === 'Cancelled') {
      console.warn(`[CANCEL-BLOCKED] Order ${orderId} already cancelled.`);
      return res.status(400).json({ success: false, message: "Order is already cancelled." });
    }

    // Process Cancellation
    order.orderStatus = 'Cancelled';
    console.log(`[CANCEL-PROCESS] Updating order status to Cancelled for: ${orderId}`);

    if (order.paymentType === 'Online' && order.paymentStatus === 'Completed') {
      console.log(`[REFUND-INIT] Initiating refund for Order: ${orderId}, PaymentId: ${order.paymentId}`);
      await initiateRefund(order._id);
    } else {
      order.paymentStatus = 'Failed';
      console.log(`[CANCEL-PAYMENT] No refund needed or Payment not completed for: ${orderId}`);
    }

    await order.save();
    console.log(`[CANCEL-SUCCESS] Order ${orderId} cancelled successfully.`);

    // Restore Stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.soldCount = product.soldCount >= item.quantity ? product.soldCount - item.quantity : 0;
        const variant = product.variants.find(v => v.size === item.size);
        if (variant) {
          variant.stock += item.quantity;
          variant.inStock = true;
          console.log(`[STOCK-RESTORE] Restored ${item.quantity} for Product: ${product.name}`);
        }
        await product.save();
      }
    }

    res.status(200).json({ success: true, order, message: "Your order has been successfully cancelled." });
  } catch (error) {
    console.error(`[CANCEL-FATAL] Error cancelling order ${req.body.orderId}:`, error);
    res.status(500).json({ success: false, message: "Customer Cancellation Error", error: error.message });
  }
};
exports.rejectOrderByAdmin = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log(`[ADMIN-REJECT-REQ] Admin initiated rejection for Order: ${orderId}`);

    let order = await Order.findById(orderId);
    if (!order) {
      console.error(`[ADMIN-REJECT-ERROR] Order ${orderId} not found.`);
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.orderStatus === 'Cancelled') {
      console.warn(`[ADMIN-REJECT-BLOCKED] Order ${orderId} already cancelled.`);
      return res.status(400).json({ success: false, message: "Order is already cancelled or rejected." });
    }

    order.orderStatus = 'Cancelled';
    console.log(`[ADMIN-REJECT-PROCESS] Updating order status to Cancelled for: ${orderId}`);

    if (order.paymentType === 'Online' && order.paymentStatus === 'Completed') {
      console.log(`[ADMIN-REFUND-INIT] Initiating refund for Order: ${orderId}, PaymentId: ${order.paymentId}`);
      await initiateRefund(order._id);
    } else {
      order.paymentStatus = 'Failed';
      console.log(`[ADMIN-REJECT-PAYMENT] No refund needed or Payment not completed for: ${orderId}`);
    }

    await order.save();
    console.log(`[ADMIN-REJECT-SUCCESS] Order ${orderId} rejected and saved.`);

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.soldCount = product.soldCount >= item.quantity ? product.soldCount - item.quantity : 0;
        const variant = product.variants.find(v => v.size === item.size);
        if (variant) {
          variant.stock += item.quantity;
          variant.inStock = true;
          console.log(`[ADMIN-STOCK-RESTORE] Restored ${item.quantity} for Product: ${product.name}`);
        }
        await product.save();
      }
    }

    res.status(200).json({ success: true, order, message: "Order cancelled by admin." });
  } catch (error) {
    console.error(`[ADMIN-REJECT-FATAL] Error rejecting order ${req.body.orderId}:`, error);
    res.status(500).json({ success: false, message: "Admin Rejection Error", error: error.message });
  }
};