const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity
} = require("../controllers/cartController");

router.get("/", protect, getCart);

router.post("/add", protect, addToCart);

router.post("/remove", protect, removeFromCart);

// NEW ROUTE FOR + -
router.put("/update", protect, updateCartQuantity);

module.exports = router;