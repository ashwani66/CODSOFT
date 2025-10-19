const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { verifyUser } = require('../middleware/auth'); // assumes verifyUser sets req.user with id & isAdmin

// ---------- Add a new review (logged-in users only) ----------
router.post('/', verifyUser, async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    const user = req.user.id;

    if (!product || !rating) {
      return res.status(400).json({ message: "Product and rating are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Prevent duplicate reviews by same user
    const existing = await Review.findOne({ product, user });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }

    const newReview = new Review({ product, user, rating, comment });
    await newReview.save();

    // Update product average rating
    const reviews = await Review.find({ product });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product, { averageRating: avgRating });

    res.status(201).json({
      message: "Review added successfully",
      review: newReview,
      averageRating: avgRating,
    });
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

    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Update a review (only owner) ----------
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only owner can update
    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to update this review." });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    // Update product average rating
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(review.product, { averageRating: avgRating });

    res.status(200).json({
      message: "Review updated successfully",
      review,
      averageRating: avgRating,
    });
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Delete a review (owner or admin) ----------
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only owner or admin can delete
    if (review.user.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this review." });
    }

    await Review.findByIdAndDelete(id);

    // Update product average rating
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    await Product.findByIdAndUpdate(review.product, { averageRating: avgRating });

    res.status(200).json({
      message: "Review deleted successfully",
      averageRating: avgRating,
    });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
