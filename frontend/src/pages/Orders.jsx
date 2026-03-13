import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, Clock, ChevronDown, ChevronUp } from "lucide-react";

const OrderCard = ({ order, handleCancelOrder, cancellingLoader }) => (
  <div
    className={`rounded-2xl p-6 md:p-8 transition-all duration-300 ${
      order.status === "Cancelled"
        ? "bg-gray-50/80 border border-gray-200 grayscale-[0.3]"
        : "bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#ffbe00]/30 hover:-translate-y-1"
    }`}
  >
    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center border-b border-gray-100 pb-5 mb-5 gap-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 font-medium">
          <Clock size={16} className={order.status === "Cancelled" ? "text-gray-400" : "text-[#ffbe00]"} />
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      <div className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide flex items-center shadow-sm ${
        order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
        order.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
        order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
        'bg-amber-50 text-amber-700 border border-amber-200'
      }`}>
        <span className="relative flex h-2.5 w-2.5 mr-2">
          {order.status !== 'Cancelled' && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              order.status === 'Processing' ? 'bg-blue-400' :
              order.status === 'Completed' ? 'bg-green-400' : 'bg-amber-400'
            }`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            order.status === 'Processing' ? 'bg-blue-500' :
            order.status === 'Completed' ? 'bg-green-500' :
            order.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'
          }`}></span>
        </span>
        {order.status}
      </div>
    </div>

    <div className="space-y-4 mb-6">
      {order.orderItems.map((item, idx) => (
        <div key={idx} className={`flex items-center gap-5 p-4 rounded-xl transition-colors ${order.status === "Cancelled" ? "bg-gray-100/50" : "bg-gray-50 hover:bg-gray-100/80"}`}>
          <div className="relative h-20 w-20 flex-shrink-0">
            <img
              src={item.product?.image || "/placeholder-product.png"}
              alt={item.product?.name}
              className="absolute inset-0 h-full w-full rounded-lg object-cover border border-gray-200 shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-lg truncate mb-1">{item.product?.name || "Product Unavailable"}</p>
            <p className="text-sm font-medium text-gray-500">
              Quantity: {item.quantity} 
              <span className="mx-2 text-gray-300">|</span> 
              ₹{item.price?.toLocaleString("en-IN")} each
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Subtotal</p>
            <p className="text-xl font-bold text-gray-900">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-5 rounded-xl border border-gray-100 gap-4">
      <div className="text-sm font-medium text-gray-600 w-full sm:w-auto text-center sm:text-left">
        Payment Method: <span className="font-bold text-gray-900 ml-1 px-3 py-1 bg-white rounded-md shadow-sm border border-gray-200">{order.paymentMethod}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
        {order.status === "Processing" && (
          <button
            onClick={() => handleCancelOrder(order._id)}
            disabled={cancellingLoader === order._id}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-red-600 bg-white hover:bg-red-50 rounded-xl transition-all duration-300 border border-red-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {cancellingLoader === order._id ? (
              <>
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                Cancelling...
              </>
            ) : "Cancel Order"}
          </button>
        )}
        <div className="text-center sm:text-right w-full sm:w-auto">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
          <p className={`text-3xl font-black tracking-tight ${order.status === "Cancelled" ? "text-gray-400 line-through" : "text-[#ffbe00]"}`}>
            ₹{order.totalPrice?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  </div>
);
import { UserContext } from "../Context/UserContext";
import { getMyOrders, cancelOrder } from "../services/orderService";
import Loader from "../components/Loader";

const Orders = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingLoader, setCancellingLoader] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const activeOrders = orders.filter((o) => o.status !== "Cancelled");
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order? It cannot be undone.")) {
      setCancellingLoader(orderId);
      try {
        await cancelOrder(orderId);
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "Cancelled" } : order
          )
        );
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert(error?.response?.data?.message || "Failed to cancel order");
      } finally {
        setCancellingLoader(null);
      }
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="w-20 h-20 bg-[#ffbe00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-[#ffbe00]" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Please Log In</h2>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">Sign in to your account to view and manage your orders.</p>
          <button
            onClick={() => navigate("/auth")}
            className="w-full bg-[#ffbe00] text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e6ab00] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-[#ffbe00]/40"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                Order History
              </h1>
              <p className="text-gray-500 font-medium mt-1">Track, manage, and review your purchases</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto">Looks like you haven't made any purchases yet. Start exploring our collection!</p>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-black transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-gray-900/20"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeOrders.length === 0 && cancelledOrders.length > 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <p className="text-gray-900 font-bold text-xl mb-1">No Active Orders</p>
                <p className="text-gray-500">You don't have any orders currently processing or completed.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeOrders.map((order) => (
                  <OrderCard 
                    key={order._id} 
                    order={order} 
                    handleCancelOrder={handleCancelOrder} 
                    cancellingLoader={cancellingLoader} 
                  />
                ))}
              </div>
            )}

            {cancelledOrders.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200/60">
                <button
                  onClick={() => setShowCancelled(!showCancelled)}
                  className="flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl transition-all duration-300 shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 text-gray-500 rounded-xl group-hover:bg-gray-100 group-hover:text-gray-700 transition-colors border border-gray-100">
                      <Package size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-gray-900 text-lg group-hover:text-black transition-colors">
                        View Cancelled Orders
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        {cancelledOrders.length} order{cancelledOrders.length !== 1 && 's'} cancelled
                      </span>
                    </div>
                  </div>
                  <div className={`bg-gray-50 text-gray-500 p-2.5 rounded-full border border-gray-200 transition-all duration-300 ${showCancelled ? 'rotate-180 bg-gray-100' : ''}`}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>

                <div 
                  className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${
                    showCancelled ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden space-y-6">
                    {cancelledOrders.map((order) => (
                      <OrderCard 
                        key={order._id} 
                        order={order} 
                        handleCancelOrder={handleCancelOrder} 
                        cancellingLoader={cancellingLoader} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
