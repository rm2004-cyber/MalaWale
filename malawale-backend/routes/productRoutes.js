const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { createProduct, getAllProducts, getBestsellers, getTrendingBase, updateProduct, deleteProduct, toggleVariantStock, searchProducts } = require('../controllers/productController');

router.get('/all', getAllProducts);
router.get('/bestsellers', getBestsellers);
router.get('/trending-base', getTrendingBase);
router.post('/create', upload.array('images', 5), createProduct);
router.put('/update/:id', upload.array('images', 5), updateProduct); // 🔥 Naya Edit Route
router.delete('/delete/:id', deleteProduct); // 🔥 Naya Delete Route
router.put('/admin/toggle-stock', toggleVariantStock); // 🔥 Active
router.get('/search', searchProducts);
module.exports = router;