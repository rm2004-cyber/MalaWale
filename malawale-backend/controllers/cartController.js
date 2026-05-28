const Cart = require('../models/Cart');

exports.addToCart = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const userId = req.user._id; 
    const qty = quantity || 1;
    const itemSize = size || "Standard";

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID zaroori hai!" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, size: itemSize, quantity: qty }]
      });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId && item.size === itemSize
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += qty;
      } else {
        cart.items.push({ product: productId, size: itemSize, quantity: qty });
      }
    }

    await cart.save();
    res.status(200).json({ success: true, cart, message: "Item cart mein jod diya gaya! 🛒" });
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
      return res.status(200).json({ success: true, items: [], message: "Cart ekdum khali hai." });
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
      item => !(item.product.toString() === productId && item.size === itemSize)
    );

    await cart.save();
    res.status(200).json({ success: true, cart, message: "Item cart se hata diya gaya." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Remove Cart Error", error: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const userId = req.user._id;
    const itemSize = size || "Standard";

    if (!productId || !quantity) {
      return res.status(400).json({ success: false, message: "Product ID aur Quantity zaroori hain!" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart nahi mili!" });

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === itemSize
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.status(200).json({ success: true, cart, message: "Quantity update ho gayi! 🔄" });
    } else {
      cart.items.push({ product: productId, size: itemSize, quantity: quantity });
      await cart.save();
      res.status(200).json({ success: true, cart, message: "Item added with updated quantity!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Update Cart Quantity Error", error: error.message });
  }
};