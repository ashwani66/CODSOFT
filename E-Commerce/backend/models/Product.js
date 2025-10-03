const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true }, // e.g., "Shirts", "Shoes"
    sizes: [{ type: String, trim: true }],                  // e.g., ["S", "M", "L", "XL"]
    images: [{ type: String }],

    // Fields for ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 }, 
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Product", productSchema);
