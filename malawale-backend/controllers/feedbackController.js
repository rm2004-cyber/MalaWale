const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ success: false, message: "Naam aur message dono bhariye!" });
    }

    const newFeedback = new Feedback({ name, message });
    await newFeedback.save();

    res.status(201).json({ success: true, message: "Feedback artisan family tak pahunch gaya! 🙏✨" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Feedback Submission Error", error: error.message });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch Feedback Error", error: error.message });
  }
};