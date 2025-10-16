const express = require("express");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/auth.middleware");

const router = express.Router();
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Valid question" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "get user faild", error });
  }
});

module.exports = router;