const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.get('/all', getAllCategories);
router.post('/create', upload.single('images'), createCategory);
router.put('/update/:id', upload.single('images'), updateCategory); // 🔥 Naya Edit Route
router.delete('/delete/:id', deleteCategory); // 🔥 Naya Delete Route

module.exports = router;