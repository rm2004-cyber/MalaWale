const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createCoupon, getAllCoupons, deleteCoupon, validateCoupon } = require('../controllers/couponController');

router.post('/create', authMiddleware, createCoupon); // Admin Section
router.get('/all', authMiddleware, getAllCoupons);     // Admin Section
router.delete('/delete/:id', authMiddleware, deleteCoupon); // Admin Section

router.post('/validate', authMiddleware, validateCoupon); // Customer Checkout Section

module.exports = router;