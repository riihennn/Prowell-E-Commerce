import API from "../api/api";

// Get all users (Admin only)
export const getAllUsers = async (params = {}) => {
    const res = await API.get("/admin/users", { params });
    return Array.isArray(res.data) ? res.data : (res.data.users || []);
};

// Change user role (Admin only)
export const updateUserRole = async (userId, isAdmin) => {
    const res = await API.put(`/admin/users/${userId}/role`, { isAdmin });
    return res.data;
};

// Block/Unblock user (Admin only)
export const toggleUserBlock = async (userId, isBlocked) => {
    console.log('Sending to backend:', { userId, isBlocked });
    const res = await API.put(`/admin/users/${userId}/block`, { isBlocked });
    console.log('Backend response:', res.data);
    console.log('isBlocked in response:', res.data.isBlocked); // ADD THIS LINE
    return res.data;
};


// Delete user (Admin only)
export const deleteUser = async (userId) => {
    const res = await API.delete(`/admin/users/${userId}`);
    return res.data;
};
