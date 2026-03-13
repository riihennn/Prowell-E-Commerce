import API from "../api/api";

// Get dashboard statistics (Admin only)
export const getDashboardStats = async () => {
    const res = await API.get("/admin/stats");
    return res.data;
};
