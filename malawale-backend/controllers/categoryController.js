const Category = require('../models/Category');
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

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Category name zaroori hai!" });
    if (!req.file) return res.status(400).json({ success: false, message: "Category ki photo missing hai!" });

    const imageUrl = await streamUpload(req.file.buffer);

    const newCategory = new Category({ name, image: imageUrl });
    await newCategory.save();

    res.status(201).json({ success: true, category: newCategory, message: "Category Boom Baam ban gayi! 🔥" });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: "Yeh category pehle se bani hui hai bhai!" });
    res.status(500).json({ success: false, message: "Category Engine Error", error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch Engine Error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    let category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: "Category nahi mili bhai!" });

    if (name) category.name = name;

    if (req.file) {
      const imageUrl = await streamUpload(req.file.buffer);
      category.image = imageUrl;
    }

    await category.save();
    res.status(200).json({ success: true, category, message: "Category makkhan tarike se update ho gayi! 🔄" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update Category Error", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ success: false, message: "Category pehle se hi delete hai!" });

    res.status(200).json({ success: true, message: "Category database se saaf! 🗑️" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete Category Error" });
  }
};