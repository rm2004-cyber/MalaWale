const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { addToCart, getCart, removeFromCart, updateQuantity } = require('../controllers/cartController');

router.post('/add', authMiddleware, addToCart);
router.get('/get', authMiddleware, getCart);
router.post('/remove', authMiddleware, removeFromCart);
router.put('/update-quantity', authMiddleware, updateQuantity); // 🔥 Naya Quantity Handler

module.exports = router;