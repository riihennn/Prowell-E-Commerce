const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

// --- PRODUCTS ---
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch products" });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: "Failed to create product" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: "Failed to update product" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        await product.deleteOne();
        res.json({ message: "Product removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete product" });
    }
};


// --- ORDERS ---
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "name email");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.status = req.body.status || order.status;

        // Auto-update paid status if delivered
        if (order.status === "Delivered" && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: "Failed to update order status" });
    }
};


// --- USERS ---
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isAdmin = req.body.isAdmin;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: "Failed to update user role" });
    }
};

exports.toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Assuming we might add an isBlocked field in the future, 
        // or just toggling admin for now if blocking isn't in schema yet.
        // Let's add isBlocked logically to support block/unblock.
        if (user.isBlocked === undefined) {
            user.set('isBlocked', true, { strict: false });
        } else {
            user.set('isBlocked', !user.isBlocked, { strict: false });
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: "Failed to block/unblock user" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.deleteOne();
        res.json({ message: "User removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user" });
    }
};

// --- DASHBOARD ---
exports.getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        const orders = await Order.find({});
        // Calculate total revenue from all non-cancelled orders (or all depending on business logic, here we do all paid orders)
        const totalRevenue = orders
            .filter(order => order.status !== 'Cancelled')
            .reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        res.json({
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUsers
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};
