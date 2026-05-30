const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// 1. Order create karne ke liye
router.post('/create', paymentController.createOrder);

// 2. Payment verify karne ke liye
router.post('/verify', paymentController.verifyPayment);

// 3. Webhook (Important: ispe express.raw zaroori hai taki signature verify ho sake)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;