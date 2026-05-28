const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  subtitle: { 
    type: String, 
    default: "" 
  },
  description: { 
    type: String, 
    required: true 
  },
  tag: { 
    type: String, 
    default: "" 
  },
  image: { 
    type: String, 
    required: true 
  },
  categoryLink: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Banner', BannerSchema);