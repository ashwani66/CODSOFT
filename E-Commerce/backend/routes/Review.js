const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User'); // for fetching username
const { verifyUser } = require('../middleware/auth');

// ---------- Add a new review ----------
router.post('/', verifyUser, async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    const userId = req.user.id;

    if (!product || !rating) return res.status(400).json({ message: "Product and rating are required." });
    if (!mongoose.Types.ObjectId.isValid(product)) return res.status(400).json({ message: "Invalid product ID" });

    const productExists = await Product.findById(product);
    if (!productExists) return res.status(404).json({ message: "Product not found." });

    // Prevent duplicate review by same user
    const existing = await Review.findOne({ product, user: userId });
    if (existing) return res.status(400).json({ message: "You have already reviewed this product." });

    const newReview = new Review({ product, user: userId, rating, comment });
    await newReview.save();

    // Populate username from User collection
    await newReview.populate('user', 'username');

    // Update product average rating
    const reviews = await Review.find({ product });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product, { averageRating: avgRating });

    res.status(201).json(newReview); // now frontend will get user.username
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Get all reviews for a product ----------
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: "Invalid product ID" });

    // Populate username for each review
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .populate('user', 'username'); // key change here

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Update a review ----------
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid review ID" });

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== userId) return res.status(403).json({ message: "Not authorized to update this review." });

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    await review.populate('user', 'username'); // populate username for frontend

    res.status(200).json(review);
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Delete a review ----------
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid review ID" });

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== userId && !req.user.isAdmin)
      return res.status(403).json({ message: "Not authorized to delete this review." });

    await Review.findByIdAndDelete(id);

    // Update product average rating
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    await Product.findByIdAndUpdate(review.product, { averageRating: avgRating });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
