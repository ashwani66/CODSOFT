const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true }, // e.g., "Shirts", "Shoes"
    sizes: [{ type: String, trim: true }],                  // e.g., ["S", "M", "L", "XL"]

    // Updated images field to store multiple sizes
    images: [
      {
        small: { type: String, required: true },
        medium: { type: String, required: true },
        large: { type: String, required: true },
      }
    ],

    // Fields for ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Product", productSchema);
