const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require("../controllers/wishlistController");

router.get("/", protect, getWishlist);
router.post("/add", protect, addToWishlist);
router.post("/remove", protect, removeFromWishlist);

module.exports = router;