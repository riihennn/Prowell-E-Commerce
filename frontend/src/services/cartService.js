import API from "../api/api";

// GET CART
export const getCart = async () => {
  const res = await API.get("/cart");
  return res.data;
};

// ADD TO CART
export const addToCart = async (productId, quantity = 1) => {
  const res = await API.post("/cart/add", { productId, quantity });
  return res.data;
};

// REMOVE ITEM
export const removeFromCart = async (productId) => {
  const res = await API.post("/cart/remove", { productId });
  return res.data;
};

// UPDATE QUANTITY  ⭐ NEW
export const updateCartQuantity = async (productId, quantity) => {

  const res = await API.put("/cart/update", {
    productId,
    quantity
  });

  return res.data;
};