const User = require('../models/User');

exports.toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    const user = await User.findById(userId);
    const isExist = user.favorites.includes(productId);

    if (isExist) {
      user.favorites = user.favorites.filter(id => id.toString() !== productId);
    } else {
      user.favorites.push(productId);
    }

    await user.save();
    
    res.status(200).json({ 
      success: true, 
      isFavorite: !isExist, 
      message: isExist ? "Removed from Wishlist" : "Added to Wishlist" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Favorite Engine Error", error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      select: 'name images variants badge'
    });
    
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch Favorites Error", error: error.message });
  }
};