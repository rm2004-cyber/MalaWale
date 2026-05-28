// 📄 path: middlewares/upload.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// 🔌 Cloudinary credentials configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🧠 Memory Storage Configuration (Fastest Layer)
// Purana CloudinaryStorage hata diya hai, ab photo seedha RAM buffer mein aayegi
const storage = multer.memoryStorage();

// 🚀 Multer engine initialization with size control
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 🛑 Max 5MB per image lock lagaya hai taaki bandwidth bache
  }
});

module.exports = upload;