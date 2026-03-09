import API from "../api/api";

// Get wishlist
export const getWishlist = async () => {
  const res = await API.get("/wishlist");
  return res.data;
};

// Add product to wishlist
export const addToWishlist = async (productId) => {
  const res = await API.post("/wishlist/add", {
    productId,
  });

  return res.data;
};

// Remove product from wishlist
export const removeFromWishlist = async (productId) => {
  const res = await API.post("/wishlist/remove", {
    productId,
  });

  return res.data;
};

// Clear entire wishlist (optional feature)
export const clearWishlist = async () => {
  const res = await API.delete("/wishlist/clear");
  return res.data;
};