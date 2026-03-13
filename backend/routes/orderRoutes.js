const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  createPayment,
  verifyPayment,
  cancelOrder
} = require("../controllers/orderController");

router.get("/", protect, getAllOrders);
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.post("/create-payment", createPayment);
router.post("/verify-payment", verifyPayment);
router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;