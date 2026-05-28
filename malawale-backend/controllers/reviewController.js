const Review = require('../models/Review');
const Product = require('../models/Product');

exports.addReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    const user = req.user._id;

    if (!product || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Product, rating aur comment sab zaroori hain!" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating sirf 1 se 5 ke beech ho sakti hai!" });
    }

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Yeh product database mein nahi mila!" });
    }

    const newReview = new Review({
      product,
      user,
      rating,
      comment
    });

    await newReview.save();

    res.status(201).json({ 
      success: true, 
      review: newReview, 
      message: "Review boom baam save ho gaya! ⭐" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Review Engine Error", error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch Reviews Error", error: error.message });
  }
};