const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  getAllOrders
} = require("../controllers/orderController");

router.get("/", protect, getAllOrders);
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);

module.exports = router;