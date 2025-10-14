const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const multer = require('multer');
const sharp = require('sharp');
const { verifyAdmin } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// --------------------- Multer for multiple image uploads ---------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
});
const upload = multer({ storage });

// --------------------- Helper to process images ---------------------
const processImages = async (files) => {
  const images = [];

  for (const file of files) {
    const baseName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');

    // Define sizes (width in px)
    const sizes = {
      small: 400,
      medium: 800,
      large: 1200,
    };

    const imageObj = {};

    // Loop through each size
    for (const [sizeName, width] of Object.entries(sizes)) {
      const filename = `${baseName}-${sizeName}.webp`;
      const filepath = path.join('uploads', filename);

      await sharp(file.path)
        .resize({ width })
        .webp({ quality: 80 }) // high quality, but optimized
        .toFile(filepath);

      imageObj[sizeName] = filepath;
    }

    // Delete original uploaded file
    await fs.unlink(file.path);

    // Push the object containing all sizes
    images.push(imageObj);
  }

  return images;
};

// --------------------- Product Routes ---------------------

// GET all products (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) filter = { name: { $regex: search, $options: 'i' } };
    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid product ID' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (err) {
    console.error('Fetch product by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE product (admin)
router.post('/', verifyAdmin, upload.array('images', 4), async (req, res) => {
  try {
    const { name, price, description, category, sizes } = req.body;
    let sizesArray = [];
    if (sizes) {
      try { sizesArray = JSON.parse(sizes); } catch { sizesArray = []; }
    }

    const images = req.files ? await processImages(req.files) : [];

    const product = new Product({
      name,
      price: Number(price),
      description,
      category,
      sizes: sizesArray,
      images,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE product (admin)
router.put('/:id', verifyAdmin, upload.array('images', 4), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid product ID' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const updateData = { ...req.body };
    if (updateData.sizes) {
      try { updateData.sizes = JSON.parse(updateData.sizes); } catch { updateData.sizes = []; }
    }
    if (updateData.price) updateData.price = Number(updateData.price);

    if (req.files && req.files.length > 0) {
      // Delete old images
      if (product.images?.length) {
        for (const imgPath of product.images) {
          const filePath = path.join(process.cwd(), imgPath);
          if (await fs.stat(filePath).catch(() => false)) await fs.unlink(filePath);
        }
      }
      updateData.images = await processImages(req.files);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE product (admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid product ID' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete images
    if (product.images?.length) {
      for (const imgPath of product.images) {
        const filePath = path.join(process.cwd(), imgPath);
        if (await fs.stat(filePath).catch(() => false)) await fs.unlink(filePath);
      }
    }

    // Delete associated reviews
    await Review.deleteMany({ product: id });
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: 'Product and associated reviews deleted', productId: id });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --------------------- Review Routes ---------------------

// Add review to a product
router.post('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { user, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid product ID' });

    if (!user || !rating)
      return res.status(400).json({ message: 'User and rating are required' });

    const productExists = await Product.findById(id);
    if (!productExists) return res.status(404).json({ message: 'Product not found' });

    const review = new Review({ product: id, user, rating, comment });
    await review.save();

    // Update product average rating
    const reviews = await Review.find({ product: id });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const product = await Product.findByIdAndUpdate(id, { averageRating: avgRating }, { new: true });

    res.status(201).json({ review, averageRating: product.averageRating });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review (admin)
router.delete('/:productId/review/:reviewId', verifyAdmin, async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(400).json({ message: 'Invalid ID(s)' });

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Product.findByIdAndUpdate(productId, { averageRating: avgRating }, { new: true });

    res.status(200).json({ message: 'Review deleted', averageRating: avgRating });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
