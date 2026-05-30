const Cart = require('../models/Cart');

exports.addToCart = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const userId = req.user._id; 
    const qty = quantity || 1;
    const itemSize = size || "Standard";

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    // Atomic increment: try to update existing matching item
    let cart = await Cart.findOneAndUpdate(
      { 
        user: userId, 
        items: { 
          $elemMatch: { 
            product: productId, 
            size: { $regex: new RegExp(`^${itemSize}$`, "i") } 
          } 
        } 
      },
      { $inc: { "items.$.quantity": qty } },
      { returnDocument: 'after' }
    );

    // If item was not found/updated, push new item (upserts the cart if not exists)
    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $push: { items: { product: productId, size: itemSize, quantity: qty } } },
        { returnDocument: 'after', upsert: true }
      );
    }

    res.status(200).json({ success: true, cart, message: "Item added to cart successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Cart Engine Error", error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name images variants badge'
    });

    if (!cart) {
      return res.status(200).json({ success: true, items: [], message: "Cart is empty." });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch Cart Error", error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.user._id;
    const itemSize = size || "Standard";

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart nahi mili." });

    cart.items = cart.items.filter(
      item => !(item.product.toString() === productId && item.size.toLowerCase() === itemSize.toLowerCase())
    );

    await cart.save();
    res.status(200).json({ success: true, cart, message: "Item removed from cart." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Remove Cart Error", error: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const userId = req.user._id;
    const itemSize = size || "Standard";

    if (!productId || typeof quantity === 'undefined') {
      return res.status(400).json({ success: false, message: "Product ID and quantity are required." });
    }

    // Atomic update of quantity
    let cart = await Cart.findOneAndUpdate(
      { 
        user: userId, 
        items: { 
          $elemMatch: { 
            product: productId, 
            size: { $regex: new RegExp(`^${itemSize}$`, "i") } 
          } 
        } 
      },
      { $set: { "items.$.quantity": quantity } },
      { returnDocument: 'after' }
    );

    // If item doesn't exist, push it
    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $push: { items: { product: productId, size: itemSize, quantity: quantity } } },
        { returnDocument: 'after', upsert: true }
      );
    }

    res.status(200).json({ success: true, cart, message: "Quantity update ho gayi! 🔄" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update Cart Quantity Error", error: error.message });
  }
};