const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { addReview, getProductReviews } = require('../controllers/reviewController');

router.post('/add', authMiddleware, addReview);
router.get('/product/:productId', getProductReviews);

module.exports = router;