const express = require("express");
const router = express.Router();

const {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", getProducts);
router.get("/categories", getCategories);  // ⚠️ must be BEFORE /:id
router.get("/:id", getSingleProduct);

// 🔐 Protected routes
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;