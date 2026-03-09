import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, Clock } from "lucide-react";
import { UserContext } from "../Context/UserContext";
import { getMyOrders } from "../services/orderService";
import Loader from "../components/Loader";

const Orders = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please log in</h2>
          <p className="text-gray-600 mb-6">You need to log in to view your orders.</p>
          <button
            onClick={() => navigate("/auth")}
            className="bg-[#ffbe00] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e6ab00] transition-all transform hover:scale-105 shadow-lg"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-7 w-7 text-[#ffbe00]" />
            Your Orders
          </h1>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#ffbe00] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e6ab00] transition-all transform hover:scale-105 shadow-lg"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border-2 border-gray-100 rounded-2xl p-6 hover:border-[#ffbe00] transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#ffbe00] transition-colors">
                      Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Clock size={14} />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${
                    order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                    order.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {order.status}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                      <img
                        src={item.product?.image || "/placeholder-product.png"}
                        alt={item.product?.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{item.product?.name || "Deleted Product"}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-6">
                  <div className="text-sm text-gray-500">
                    Payment: <span className="font-bold text-gray-700">{order.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-[#ffbe00]">
                      ₹{order.totalPrice?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
