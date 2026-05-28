const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');

router.post('/toggle', authMiddleware, toggleFavorite);
router.get('/all', authMiddleware, getFavorites);

module.exports = router;