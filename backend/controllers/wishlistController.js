const Wishlist = require("../models/Wishlist");

// GET user wishlist
exports.getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate("products");

  if (!wishlist) return res.json({ products: [] });

  res.json(wishlist);
};

// ADD product to wishlist
exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: []
    });
  }

  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
  }

  await wishlist.save();
  await wishlist.populate("products");

  res.json(wishlist);
};

// REMOVE from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.body;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

  wishlist.products = wishlist.products.filter(
    p => p.toString() !== productId
  );

  await wishlist.save();
  await wishlist.populate("products");

  res.json(wishlist);
};