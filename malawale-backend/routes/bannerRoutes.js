const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // Ensure this is configured for single/array
const { createBanner, getAllBanners, updateBanner, deleteBanner } = require('../controllers/bannerController');

router.get('/all', getAllBanners);

// 'images' field name frontend se match hona chahiye
router.post('/create', upload.single('images'), createBanner); 
router.put('/update/:id', upload.single('images'), updateBanner); 
router.delete('/delete/:id', deleteBanner);

module.exports = router;