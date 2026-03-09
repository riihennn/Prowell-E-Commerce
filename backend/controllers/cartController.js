const Cart = require("../models/Cart");


// 🔹 GET USER CART
exports.getCart = async (req, res) => {

  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product");

  if (!cart) {
    return res.json({ items: [] });
  }

  res.json(cart);

};



// 🔹 ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const validatedQuantity = Math.max(1, Number(quantity) || 1);

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {

      cart = await Cart.create({
        user: req.user._id,
        items: []
      });

    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {

      cart.items[itemIndex].quantity += quantity;

    } else {

      cart.items.push({
        product: productId,
        quantity: validatedQuantity
      });

    }

    await cart.save();
    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🔹 REMOVE FROM CART
exports.removeFromCart = async (req, res) => {

  const { productId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();

  res.json(cart);

};



// 🔹 UPDATE CART QUANTITY (FOR + / - BUTTONS)
exports.updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const validatedQuantity = Math.max(1, Number(quantity) || 1);

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = validatedQuantity;

    await cart.save();

    res.json(cart);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};