const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getDashboardStats, getAllOrders } = require('../controllers/adminController');

router.get('/dashboard-stats', authMiddleware, getDashboardStats);
router.get('/orders', authMiddleware, getAllOrders);
module.exports = router;