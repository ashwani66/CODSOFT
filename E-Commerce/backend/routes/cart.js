const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { verifyUser } = require("../middleware/auth");

// ---------- Get user's cart ----------
router.get("/", verifyUser, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate("products.productId");

    if (!cart) {
      return res.status(200).json({ products: [] });
    }

    // 🔥 Auto-clean: remove any product entries where productId is null
    cart.products = cart.products.filter((p) => p.productId !== null);

    // Save if changes were made
    if (cart.isModified("products")) {
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ---------- Add product to cart ----------
router.post("/", verifyUser, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = new Cart({ userId: req.user._id, products: [] });

    const existing = cart.products.find(
      (p) => p.productId.toString() === productId
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    await cart.save();
    const populatedCart = await cart.populate("products.productId");
    res.status(201).json(populatedCart);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Remove product from cart ----------
router.delete("/:productId", verifyUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId
    );

    await cart.save();
    const populatedCart = await cart.populate("products.productId");
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Update product quantity ----------
router.put("/:productId", verifyUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find((p) => p.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    item.quantity = quantity;
    await cart.save();
    const populatedCart = await cart.populate("products.productId");
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
