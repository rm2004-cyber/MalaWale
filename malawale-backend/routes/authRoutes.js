const express = require('express');
const router = express.Router();
const { firebaseLoginOrSignup } = require('../controllers/authController');

// 🚀 Single Entry Point for Login / Signup
router.post('/firebase-login', firebaseLoginOrSignup);

module.exports = router;