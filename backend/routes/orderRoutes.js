const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  createPayment,
  verifyPayment
} = require("../controllers/orderController");

router.get("/", protect, getAllOrders);
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.post("/create-payment", createPayment);
router.post("/verify-payment", verifyPayment);

module.exports = router;