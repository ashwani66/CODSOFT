const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');

// ---------- Placeholder middleware for admin check ----------
const isAdmin = (req, res, next) => {
  // TODO: Replace with real authentication check
  const admin = true; // replace with real admin check
  if (!admin) return res.status(403).json({ message: "Admin only" });
  next();
};

// ---------- Add a new review ----------
router.post('/', async (req, res) => {
  try {
    const { product, user, rating, comment } = req.body;

    if (!product || !user || !rating) {
      return res.status(400).json({ message: "Product, user, and rating are required." });
    }

    const newReview = new Review({
      product,
      user,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Get all reviews for a product ----------
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Delete a review (admin only) ----------
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
