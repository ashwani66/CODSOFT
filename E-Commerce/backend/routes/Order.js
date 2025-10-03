const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// -------------------- GET all orders (Admin) --------------------
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email')
      .populate('products.productId', 'name price images');
    res.status(200).json({ data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// -------------------- GET single order --------------------
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('products.productId', 'name price images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// -------------------- CREATE order --------------------
router.post('/', async (req, res) => {
  try {
    const { userId, products, amount, status, shipping, paymentMethod, paymentStatus } = req.body;

    if (!userId || !Array.isArray(products) || products.length === 0 || !amount) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const newOrder = new Order({
      userId,
      products,
      amount,
      status: status || 'Pending',
      shipping: shipping || {},
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentStatus || "Pending"
    });

    const savedOrder = await newOrder.save();

    // Fetch the saved order with populated fields
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('userId', 'name email')
      .populate('products.productId', 'name price images');

    res.status(201).json({ data: populatedOrder });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// -------------------- UPDATE order --------------------
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('userId', 'username email')
      .populate('products.productId', 'name price images');

    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ data: updatedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// -------------------- DELETE order --------------------
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ message: 'Order deleted successfully', orderId: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
