const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
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
    const sizes = { small: 400, medium: 800, large: 1200 };
    const imageObj = {};

    for (const [sizeName, width] of Object.entries(sizes)) {
      const filename = `${baseName}-${sizeName}.webp`;
      const filepath = path.join('uploads', filename);
      await sharp(file.path)
        .resize({ width })
        .webp({ quality: 80 })
        .toFile(filepath);
      imageObj[sizeName] = filepath;
    }

    // Delete original uploaded file
    await fs.unlink(file.path);

    images.push(imageObj);
  }

  return images;
};

// --------------------- Product Routes ---------------------

// GET all products (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
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
    res.status(500).json({ message: 'Server error', error: err.message });
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

    // Handle sizes
    if (updateData.sizes) {
      try { updateData.sizes = JSON.parse(updateData.sizes); } catch { updateData.sizes = []; }
    }

    if (updateData.price) updateData.price = Number(updateData.price);

    // Handle image updates
    if (req.files && req.files.length > 0) {
      if (product.images?.length) {
        for (const imageObj of product.images) {
          for (const sizePath of Object.values(imageObj)) {
            if (typeof sizePath === 'string') {
              const filePath = path.join(process.cwd(), sizePath);
              if (await fs.stat(filePath).catch(() => false)) await fs.unlink(filePath);
            }
          }
        }
      }
      updateData.images = await processImages(req.files);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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

    // Delete all image files
    if (product.images?.length) {
      for (const imageObj of product.images) {
        for (const sizePath of Object.values(imageObj)) {
          if (typeof sizePath === 'string') {
            const filePath = path.join(process.cwd(), sizePath);
            if (await fs.stat(filePath).catch(() => false)) await fs.unlink(filePath);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted', productId: id });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
