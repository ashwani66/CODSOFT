const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    }
  ],
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  shipping: {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ['card', 'upi', 'cod'], default: 'card' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  deliveryDate: { type: Date },
  trackingNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
