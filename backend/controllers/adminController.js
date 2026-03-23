const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

// --- PRODUCTS ---
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { search, category } = req.query;

        let query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (category && category !== "All Categories") {
            query.category = category;
        }

        const totalProduct = await Product.countDocuments(query);
        const activeCategories = await Product.distinct("category");
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            products,
            totalProduct,
            totalCategories: activeCategories.length,
            page,
            pages: Math.ceil(totalProduct / limit)
        });
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
        const { search, status } = req.query;
        let query = {};

        if (status && status !== 'All') {
            query.status = status;
        }

        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i');
            
            // Look up matching users
            const matchingUsers = await User.find({
                $or: [{ name: searchRegex }, { email: searchRegex }]
            }).select('_id');
            const userIds = matchingUsers.map(u => u._id);
            
            // Validating if search is an ObjectId (helps if they search for exact order ID)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search.trim());
            
            const orConditions = [
                { 'shippingAddress.fullName': searchRegex },
                { 'shippingAddress.city': searchRegex }
            ];
            
            if (userIds.length > 0) {
                orConditions.push({ user: { $in: userIds } });
            }
            if (isValidObjectId) {
                orConditions.push({ _id: search.trim() });
            }
            
            query.$or = orConditions;
        }

        const orders = await Order.find(query)
            .populate("user", "name email")
            .populate("orderItems.product", "name image price")
            .sort({ createdAt: -1 });
            
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
            const { search, statusFilter } = req.query;
            let query = { isAdmin: { $ne: true } };
            
            if (search && search.trim() !== '') {
                const searchRegex = new RegExp(search.trim(), 'i');
                query.$or = [
                    { name: searchRegex },
                    { email: searchRegex }
                ];
            }
            
            if (statusFilter === 'blocked') {
                query.$or = query.$or || [];
                // Handle both potential field names
                const blockQuery = { $or: [{ isBlocked: true }, { isBlock: true }] };
                if (query.$or.length > 0) {
                    query.$and = [blockQuery, { $or: query.$or }];
                    delete query.$or;
                } else {
                    query.$or = blockQuery.$or;
                }
            } else if (statusFilter === 'active') {
                query.$and = [
                    { isBlocked: { $ne: true } },
                    { isBlock: { $ne: true } }
                ];
            }

            const users = await User.find(query).select("-password").sort({ createdAt: -1 });
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
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Determine target status — handle boolean and string
        if (req.body.isBlocked !== undefined) {
            user.isBlocked = req.body.isBlocked === 'true' || req.body.isBlocked === true;
        } else {
            user.isBlocked = !user.isBlocked; // fallback: toggle
        }

        await user.save();
        user.password = undefined;

        res.json(user);
    } catch (error) {
        console.error('toggleUserBlock error:', error);
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
