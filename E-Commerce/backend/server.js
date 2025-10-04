const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ---------- Routes ----------
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/User");   // Ensure exact file name
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/Order"); // Ensure exact file name
const reviewRoutes = require("./routes/Review"); // Ensure exact file name

// ---------- Initialize App ----------
const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use("api/uploads", express.static("uploads"));

// ---------- MongoDB Connection ----------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // Exit process if DB connection fails
  });

// ---------- API Routes ----------
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/review", reviewRoutes);

// ---------- Error Handling Middleware ----------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
