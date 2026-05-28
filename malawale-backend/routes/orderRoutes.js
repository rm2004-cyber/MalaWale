const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { 
  placeOrder, 
  updateOrderStatus, 
  getUserOrders, 
  cancelOrderByCustomer, 
  rejectOrderByAdmin 
} = require('../controllers/orderController');

router.post('/place', authMiddleware, placeOrder);
router.get('/my-orders', authMiddleware, getUserOrders);
router.put('/admin/update-status', authMiddleware, updateOrderStatus);
router.post('/customer-cancel', authMiddleware, cancelOrderByCustomer);
router.post('/admin-reject', authMiddleware, rejectOrderByAdmin);

module.exports = router;