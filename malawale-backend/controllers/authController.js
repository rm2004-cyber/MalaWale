const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.firebaseLoginOrSignup = async (req, res) => {
  try {
    const { firebaseUid, phone, name, email, dob, isNewUser } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number zaroori hai bhai!" });
    }

    let user;
    if (firebaseUid === "verification_trigger_only" || !firebaseUid) {
      user = await User.findOne({ phone });
    } else {
      user = await User.findOne({ firebaseUid });
    }

    if (!user) {
      if (isNewUser) {
        if (!name || !email) {
          return res.status(400).json({ success: false, message: "Naye user ke liye Name aur Email compulsory hain." });
        }
        
        user = new User({
          firebaseUid,
          phone,
          name,
          email,
          dob,
          role: 'customer'
        });
        await user.save();
      } else {
        return res.status(404).json({ success: false, message: "User DB mein nahi mila, naye sir se registration karo." });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } 
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role 
      },
      message: user.role === 'admin' ? "Pranam Admin Sahib! 👑" : "Welcome to MalaWale! ✦"
    });

  } catch (error) {
    console.error("Firebase Auth Engine Error:", error);
    res.status(500).json({ success: false, message: "Internal Auth Engine Error" });
  }
};