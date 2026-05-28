const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Pranam! Pehle login kariye bhai. Token missing hai." });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User database mein nahi mila." });
    }

    req.user = user; // Agle controller ke liye user data attach kar diya
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token expire ya galat hai bhai!" });
  }
};