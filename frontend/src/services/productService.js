import API from "../api/api";

// Get all products (returns plain array for backward compatibility with Home page components)
export const getProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await API.get(`/products${query ? `?${query}` : ""}`);
  // Backend now returns { products, total, ... } — extract the array
  return Array.isArray(res.data) ? res.data : (res.data.products || []);
};

// Get all products with pagination info
export const getProductsPaginated = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await API.get(`/products${query ? `?${query}` : ""}`);
  return res.data;
};

// Get product categories
export const getProductCategories = async () => {
  const res = await API.get("/products/categories");
  return res.data;
};

// Get single product
export const getProductById = async (id) => {
  const res = await API.get(`/products/${id}`);
  return res.data;
};