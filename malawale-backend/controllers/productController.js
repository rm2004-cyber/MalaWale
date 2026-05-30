const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'MalaWale_Assets' },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    stream.end(fileBuffer);
  });
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, badge, isFeatured, variants, details } = req.body;

    if (!name || !description || !category || !variants) {
      return res.status(400).json({ success: false, message: "All mandatory fields are required." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product image upload is required." });
    }

    let parsedVariants;
    try {
      parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid variants format." });
    }

    let parsedDetails = [];
    if (details) {
      try {
        parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
      } catch (e) {
        parsedDetails = [details]; 
      }
    }

    const uploadPromises = req.files.map(file => streamUpload(file.buffer));
    const imageUrls = await Promise.all(uploadPromises);

    const newProduct = new Product({
      name,
      description,
      category,
      badge: badge || "",
      isFeatured: isFeatured === 'true' || isFeatured === true,
      variants: parsedVariants,
      details: parsedDetails,
      images: imageUrls
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct, message: "Product details successfully saved." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Product Engine Error", error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category, isFeatured } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (isFeatured) filter.isFeatured = isFeatured === 'true';

    const products = await Product.find(filter).populate('category').sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch Products Error" });
  }
};

exports.getBestsellers = async (req, res) => {
  try {
    const products = await Product.find({ badge: 'Bestseller' }).populate('category').limit(10);
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bestseller Engine Error", error: error.message });
  }
};

exports.getTrendingBase = async (req, res) => {
  try {
    const products = await Product.find({ badge: { $ne: 'Bestseller' } })
      .populate('category')
      .sort({ soldCount: 1 }) 
      .limit(30);
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Trending Engine Error", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, badge, isFeatured, variants, details, soldCount } = req.body;

    let product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (badge !== undefined) product.badge = badge;
    if (soldCount !== undefined) product.soldCount = soldCount;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;

    if (variants) {
      try {
        // Isme ab size, mrp, price, stock ke saath inStock boolean status bhi makkhan tarike se update ho jayega
        product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid variants JSON." });
      }
    }

    if (details) {
      try {
        product.details = typeof details === 'string' ? JSON.parse(details) : details;
      } catch (e) {
        product.details = [details];
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => streamUpload(file.buffer));
      const imageUrls = await Promise.all(uploadPromises);
      product.images = imageUrls;
    }

    await product.save();
    res.status(200).json({ success: true, product, message: "Product details successfully updated." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update Product Error", error: error.message });
  }
};
// 🔥 File ke end mein ye append karo aur exports mein shamil rakho:
exports.toggleVariantStock = async (req, res) => {
  try {
    const { productId, size, inStock } = req.body;

    if (!productId || !size || inStock === undefined) {
      return res.status(400).json({ success: false, message: "Product ID, size, and stock status are required." });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    const variantIndex = product.variants.findIndex(v => v.size === size);
    if (variantIndex === -1) {
      return res.status(404).json({ success: false, message: "Size variant not found in product." });
    }

    // Status update (true/false)
    product.variants[variantIndex].inStock = inStock;
    
    // Agar manually Out of Stock kiya hai, toh frontend safety ke liye stock integer ko bhi 0 set kar dete hain
    if (inStock === false || inStock === 'false') {
      product.variants[variantIndex].stock = 0;
    }

    await product.save();

    res.status(200).json({ 
      success: true, 
      product, 
      message: `Product variant ${size} successfully marked as ${inStock ? 'In Stock' : 'Out of Stock'}.` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Toggle Stock Error", error: error.message });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ success: false, message: "Product is already deleted." });

    res.status(200).json({ success: true, message: "Product successfully deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete Product Error" });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sortBy, badge } = req.query;
    let queryFilter = {};

    if (q) {
      queryFilter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (category) {
      queryFilter.category = category;
    }

    if (badge) {
      queryFilter.badge = badge;
    }

    if (minPrice || maxPrice) {
      queryFilter['variants.price'] = {};
      if (minPrice) queryFilter['variants.price'].$gte = Number(minPrice);
      if (maxPrice) queryFilter['variants.price'].$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 }; 
    if (sortBy === 'lowToHigh') {
      sortOption = { 'variants.price': 1 };
    } else if (sortBy === 'highToLow') {
      sortOption = { 'variants.price': -1 };
    } else if (sortBy === 'popular') {
      sortOption = { soldCount: -1 };
    }

    const products = await Product.find(queryFilter).sort(sortOption).limit(10);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Search API Error", error: error.message });
  }
};