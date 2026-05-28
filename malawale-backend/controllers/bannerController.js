const Banner = require('../models/Banner');
const cloudinary = require('cloudinary').v2;

const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'MalaWale_Banners' },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    stream.end(fileBuffer);
  });
};

exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, description, tag, categoryLink } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title aur Description zaroori hain!" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image missing hai!" });
    }

    const imageUrl = await streamUpload(req.file.buffer);

    const newBanner = new Banner({
      title,
      subtitle: subtitle || "",
      description,
      tag: tag || "",
      image: imageUrl,
      categoryLink: categoryLink && categoryLink !== "" ? categoryLink : null
    });

    await newBanner.save();
    res.status(201).json({ success: true, banner: newBanner, message: "Banner live ho gaya! 🖼️" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Banner Engine Error", error: error.message });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate('categoryLink') 
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch Banners Error" });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, tag, categoryLink } = req.body;

    let banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner nahi mila!" });
    }

    if (title) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (description) banner.description = description;
    if (tag !== undefined) banner.tag = tag;
    if (categoryLink !== undefined) {
      banner.categoryLink = categoryLink === "" ? null : categoryLink;
    }

    if (req.file) {
      const imageUrl = await streamUpload(req.file.buffer);
      banner.image = imageUrl;
    }

    await banner.save();
    res.status(200).json({ success: true, banner, message: "Banner update ho gaya! 🔄" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update Banner Error", error: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner nahi mila!" });
    }
    res.status(200).json({ success: true, message: "Banner delete ho gaya! 🗑️" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete Banner Error", error: error.message });
  }
};