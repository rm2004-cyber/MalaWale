const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: { 
    type: String, 
    default: "" 
  },
  email: { 
    type: String, 
    default: "", 
    trim: true 
  },
  dob: { 
    type: String, 
    default: "" 
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer' 
  },
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', UserSchema);