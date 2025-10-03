const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, min: 1 },
      }
    ],
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('Cart', cartSchema);
