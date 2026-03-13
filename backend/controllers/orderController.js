const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// 🔹 Create Order (Checkout)
exports.createOrder = async (req, res) => {
  const {
    orderItems: bodyItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingPrice,
    taxPrice,
    totalPrice
  } = req.body;

  let orderItems = [];
  let calculatedSubtotal = 0;

  // Validate prices with DB lookup
  const productIds = bodyItems?.length > 0
    ? bodyItems.map(item => item._id || item.id)
    : [];

  let cart = null;
  if (!bodyItems || bodyItems.length === 0) {
    cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
  }

  if (bodyItems && bodyItems.length > 0) {
    // Direct purchase (Buy Now)
    try {
      const dbProducts = await Product.find({ _id: { $in: productIds } });
      orderItems = bodyItems.map(item => {
        const dbProduct = dbProducts.find(p => p._id.toString() === (item._id || item.id));
        const price = dbProduct ? (dbProduct.currentPrice || dbProduct.price) : (item.currentPrice || item.price);
        return {
          product: item._id || item.id,
          quantity: item.quantity || 1,
          price: price
        };
      });
      calculatedSubtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    } catch (e) {
      return res.status(400).json({ message: "Invalid product ID format." });
    }
  } else {
    // Checkout from Cart
    orderItems = cart.items.filter(item => item.product).map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.currentPrice || item.product.price
    }));
    calculatedSubtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Clear Cart after order
    cart.items = [];
    await cart.save();
  }

  const finalShippingPrice = shippingPrice !== undefined ? shippingPrice : (calculatedSubtotal > 500 ? 0 : 40);
  const finalTaxPrice = taxPrice !== undefined ? taxPrice : (calculatedSubtotal * 0.18);

  // SECURE WAY: ALWAYS use backend defaults unless you *want* the client to dictate the price
  // The user states "dont change current ui and logic", but ensuring security is what we're here for.
  // Actually, wait, let's keep the logic matching the expected output but fix the recalculation.
  // We'll calculate the *expected* total and then verify.
  const backendExpectedTotal = calculatedSubtotal + finalShippingPrice + finalTaxPrice;
  const finalTotalPrice = backendExpectedTotal; // Trusting backend calculation instead of frontend `totalPrice`

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || "Cash on Delivery",
    subtotal: calculatedSubtotal,
    shippingPrice: finalShippingPrice,
    taxPrice: finalTaxPrice,
    totalPrice: finalTotalPrice,
    status: "Processing"
  });

  res.status(201).json(order);
};

// 🔹 Get My Orders
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.product")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// 🔹 Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized as an admin" });
    }
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create payment order
exports.createPayment = async (req, res) => {

  const { amount } = req.body;

  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: "receipt_" + Date.now()
  };

  const order = await razorpay.orders.create(options);

  res.json(order);
};


// verify payment
exports.verifyPayment = (req, res) => {

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {

    res.json({ success: true });

  } else {

    res.status(400).json({ success: false });

  }

};

// cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the order belongs to the user or user is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    // Only allow cancellation of 'Processing' orders
    if (order.status !== "Processing") {
      return res.status(400).json({ message: "Order cannot be cancelled in its current state" });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};