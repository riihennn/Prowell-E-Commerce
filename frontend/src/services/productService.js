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

// Get all products (Admin only)
export const getAllAdminProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await API.get(`/admin/products${query ? `?${query}` : ""}`);
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

// Create a new product (Admin)
export const createProduct = async (productData) => {
  const res = await API.post("/admin/products", productData);
  return res.data;
};

// Update a product (Admin)
export const updateProduct = async (id, productData) => {
  const res = await API.put(`/admin/products/${id}`, productData);
  return res.data;
};

// Delete a product (Admin)
export const deleteProduct = async (id) => {
  const res = await API.delete(`/admin/products/${id}`);
  return res.data;
};