const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.status(200).json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// DELETE a user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Failed to delete user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
