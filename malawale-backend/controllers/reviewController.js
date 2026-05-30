const Review = require('../models/Review');
const Product = require('../models/Product');

exports.addReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    const user = req.user._id;

    if (!product || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Product, rating, and comment are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found." });
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
      message: "Review successfully submitted." 
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