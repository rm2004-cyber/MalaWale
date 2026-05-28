const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
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
      return res.status(400).json({ success: false, message: "Address aur Payment Type zaroori hain!" });
    }

    if (!address.receiverName || !address.receiverPhone || !address.addressLine || !address.pincode || !address.city || !address.state) {
      return res.status(400).json({ success: false, message: "Delivery ke liye complete shipping address zaroori hai bhai!" });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Aapki cart khali hai bhai!" });
    }

    for (const item of cart.items) {
      let variant;
      if (item.size) {
        variant = item.product.variants.find(v => v.size.trim().toLowerCase() === item.size.trim().toLowerCase());
      } else {
        variant = item.product.variants[0];
      }

      if (!variant) {
        return res.status(404).json({ success: false, message: `${item.product.name} ka variant nahi mila!` });
      }
      if (variant.stock < item.quantity || variant.inStock === false) {
        return res.status(400).json({ success: false, message: `${item.product.name} (${item.size || 'Default'}) ka stock nahi hai!` });
      }
    }

    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      let variant;
      if (item.size) {
        variant = product.variants.find(v => v.size.trim().toLowerCase() === item.size.trim().toLowerCase());
      } else {
        variant = product.variants[0];
      }
      
      const price = variant ? variant.price : product.variants[0].price;
      
      variant.stock -= item.quantity;
      product.soldCount += item.quantity;

      if (variant.stock === 0) {
        variant.inStock = false;
      }

      await product.save();

      orderItems.push({
        product: item.product._id,
        size: item.size || variant.size,
        quantity: item.quantity,
        price: price
      });
    }

    const isOnline = paymentType === 'Online';

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      address: address,
      totalAmount: totalAmount,
      paymentType: paymentType,
      paymentStatus: isOnline ? 'Completed' : 'Pending',
      orderStatus: 'Pending',
      trackingIdOrNumber: "",
      couponCode: couponCode || null
    });

    await newOrder.save();
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({ 
      success: true, 
      order: newOrder, 
      message: "Order successfully place ho gaya! 📦" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Order Placement Error", error: error.message });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, courierPartnerName, trackingIdOrNumber } = req.body;

    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila!" });

    // 1. Status transition check (Optional but Good Practice)
    if (order.orderStatus === 'Cancelled') return res.status(400).json({ success: false, message: "Cancelled order update nahi ho sakta." });

    order.orderStatus = status;

    // 2. Automated Timestamp Management
    if (status === 'Accepted') order.statusTimestamps.acceptedAt = Date.now();
    else if (status === 'Packed') order.statusTimestamps.packedAt = Date.now();
    else if (status === 'Shipped') {
      if (!courierPartnerName || !trackingIdOrNumber) {
        return res.status(400).json({ success: false, message: "Tracking details zaroori hain!" });
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

    let order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila bhai!" });

    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
      return res.status(400).json({ 
        success: false, 
        message: "Order courier ko handover ho chuka hai, ab cancel nahi kiya ja sakta! 🚫" 
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: "Order pehle se hi cancelled hai!" });
    }

    order.orderStatus = 'Cancelled';
    if (order.paymentType === 'Online') {
      order.paymentStatus = 'Failed'; 
    }
    await order.save();

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.soldCount = product.soldCount >= item.quantity ? product.soldCount - item.quantity : 0;
        const variant = product.variants.find(v => v.size === item.size);
        if (variant) {
          variant.stock += item.quantity;
          if (variant.stock > 0) {
            variant.inStock = true;
          }
        }
        await product.save();
      }
    }

    res.status(200).json({ success: true, order, message: "Aapka order successfully cancel ho gaya hai! 🗑️" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Customer Cancellation Error", error: error.message });
  }
};

exports.rejectOrderByAdmin = async (req, res) => {
  try {
    const { orderId } = req.body;

    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila!" });

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: "Order pehle se hi cancelled/rejected hai!" });
    }

    order.orderStatus = 'Cancelled';
    if (order.paymentType === 'Online') {
      order.paymentStatus = 'Failed';
    }
    await order.save();

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.soldCount = product.soldCount >= item.quantity ? product.soldCount - item.quantity : 0;
        const variant = product.variants.find(v => v.size === item.size);
        if (variant) {
          variant.stock += item.quantity;
          if (variant.stock > 0) {
            variant.inStock = true;
          }
        }
        await product.save();
      }
    }

    res.status(200).json({ success: true, order, message: "Admin ne order reject/cancel kar diya hai! ❌" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Admin Rejection Error", error: error.message });
  }
};