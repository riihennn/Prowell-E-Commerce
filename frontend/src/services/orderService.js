import API from "../api/api";

// Create a new order
export const placeOrder = async (orderData) => {
    const res = await API.post("/orders", orderData);
    return res.data;
};

// Get current user's orders
export const getMyOrders = async () => {
    const res = await API.get("/orders/myorders");
    return res.data;
};

// Get all orders (Admin)
export const getAllOrders = async (params = {}) => {
    const res = await API.get("/admin/orders", { params });
    return res.data;
};

// Update order status (Admin)
export const updateOrderStatus = async (orderId, status) => {
    const res = await API.put(`/admin/orders/${orderId}`, { status });
    return res.data;
};

// Create Payment
export const createPayment = async (amount) => {
    const res = await API.post("/orders/create-payment", { amount });
    return res.data;
};

// Verify Payment
export const verifyPayment = async (paymentData) => {
    const res = await API.post("/orders/verify-payment", paymentData);
    return res.data;
};

// Cancel Order
export const cancelOrder = async (orderId) => {
    const res = await API.put(`/orders/${orderId}/cancel`);
    return res.data;
};
