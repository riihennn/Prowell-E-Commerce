const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const {getDashboad} = require("../controllers/dashboardController") 

const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    updateUserRole,
    toggleUserBlock,
    deleteUser,
    getDashboardStats,
} = require("../controllers/adminController");

// Apply middleware to all routes in this file
// router.use(protect, admin);

// Dashboard
router.route("/stats").get(getDashboardStats);

// Products
router.route("/products")
    .get(getAllProducts)
    .post(createProduct);
router.route("/products/:id")
    .put(updateProduct)
    .delete(deleteProduct);

// Orders
router.route("/orders").get(getAllOrders);
router.route("/orders/:id").put(updateOrderStatus);

// Users
router.route("/users").get(getAllUsers);
router.route("/users/:id").delete(deleteUser);
router.route("/users/:id/role").put(updateUserRole);
router.route("/users/:id/block").put(toggleUserBlock); // custom route for block/unblock

router.get("/dashboard" , getDashboad)

module.exports = router;
