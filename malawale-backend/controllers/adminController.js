// 1. Dashboard Stats API
const mongoose = require('mongoose');
const Order = require('../models/Order');   
const Product = require('../models/Product');
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, pendingOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments({ orderStatus: 'Pending' })
    ]);

    // Populate sirf user ka basic info, address order mein already hai
    const recentOrders = await Order.find()
      .populate('user', 'name phone') 
      .populate('items.product', 'name description images variants')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySalesData = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfToday }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
    ]);

    res.status(200).json({
      success: true,
      stats: { totalProducts, todaysSales: todaySalesData[0]?.totalAmount || 0, pendingOrders },
      recentOrders: recentOrders || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Dashboard Stats Error", error: error.message });
  }
};

// 2. Paginated Orders API
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Yahan sirf user ka name aur phone populate karo
    const orders = await Order.find()
      .populate('user', 'name phone')
      .populate('items.product', 'name description images variants')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      orders, // Address yahan direct order object mein aayega
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Orders fetch error", error: error.message });
  }
};