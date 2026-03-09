import React, { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  X,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import Loader from '../../components/Loader';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const baseUrl = "http://localhost:8000/api";
      // Fetch directly from the dedicated orders API
      const response = await fetch(`${baseUrl}/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();

      const formattedOrders = data.map(order => ({
        ...order,
        orderId: order._id, // Use DB ID
        userName: order.user?.name || 'Unknown User',
        userEmail: order.user?.email || 'No email',
        userId: order.user?._id,
        items: order.orderItems.map(item => ({
          ...item,
          title: item.product?.name || 'Deleted Product',
          image: item.product?.image,
          currentPrice: item.price
        })),
        total: order.totalPrice,
        orderDate: order.createdAt
      }));

      setOrders(formattedOrders);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, userId) => {
    setUpdatingStatus(orderId);
    
    try {
      const baseUrl = "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/orders/${orderId}`, {
        method: 'PATCH', // Changed to PATCH as it's a partial update
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update order status: ${errorData}`);
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      alert(`Failed to update order status: ${error.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <CheckCircle size={14} />;
      case 'processing':
        return <Package size={14} />;
      case 'shipped':
        return <Truck size={14} />;
      case 'pending':
        return <Clock size={14} />;
      case 'cancelled':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getUniqueStatuses = () => {
    const statuses = [...new Set(orders.map(order => order.status))].filter(Boolean);
    return ['All', ...statuses];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      completed: orders.filter(o => o.status === 'Completed').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
    };
  };

  const stats = getOrderStats();

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-rose-200 p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-rose-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchOrders}
              className="px-6 py-3 bg-[#2eb4ac] text-white rounded-xl font-medium hover:bg-[#27a099] transition-colors inline-flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-[#2eb4ac] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-amber-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Processing</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processing}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Truck size={24} className="text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Shipped</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.shipped}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-rose-400 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <XCircle size={24} className="text-rose-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2eb4ac] focus:border-[#2eb4ac] transition-all"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none px-5 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2eb4ac] focus:border-[#2eb4ac] transition-all font-medium bg-white cursor-pointer"
                >
                  {getUniqueStatuses().map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          {filteredOrders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.orderId} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-bold text-gray-900">#{order.orderId}</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User size={16} className="text-gray-400" />
                          <span className="font-medium">{order.shippingAddress?.fullName || order.userName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} className="text-gray-400" />
                          <span>{order.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package size={16} className="text-gray-400" />
                          <span>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-gray-400" />
                          <span>{formatDate(order.orderDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">₹{order.total?.toLocaleString('en-IN')}</span>
                        {order.items && order.items.length > 0 && (
                          <span className="text-sm text-gray-500">• {order.items[0].title}{order.items.length > 1 && ` +${order.items.length - 1} more`}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {updatingStatus === order.orderId ? (
                        <div className="px-4 py-2 flex items-center gap-2 text-gray-600">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#2eb4ac] border-t-transparent"></div>
                          <span className="text-sm font-medium">Updating...</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <select 
                            value={order.status || 'Pending'}
                            onChange={(e) => updateOrderStatus(order.orderId, e.target.value, order.userId)}
                            className="appearance-none px-4 py-2 pr-8 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2eb4ac] focus:border-[#2eb4ac] transition-all font-medium bg-white cursor-pointer text-sm"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      )}
                      
                      <button 
                        onClick={() => viewOrderDetails(order)}
                        className="px-4 py-2 bg-[#2eb4ac] text-white rounded-xl font-medium hover:bg-[#27a099] transition-all inline-flex items-center gap-2"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b-2 border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="text-lg font-semibold text-gray-700">#{selectedOrder.orderId}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status || 'Pending'}
                    </span>
                    <span className="text-sm text-gray-600">{formatDate(selectedOrder.orderDate)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={18} />
                    Customer Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Name</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.shippingAddress?.fullName || selectedOrder.userName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.userEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.shippingAddress?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={18} />
                    Shipping Address
                  </h3>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-gray-900">{selectedOrder.shippingAddress?.fullName}</p>
                    <p className="text-gray-700">{selectedOrder.shippingAddress?.addressLine1}</p>
                    {selectedOrder.shippingAddress?.addressLine2 && (
                      <p className="text-gray-700">{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-gray-700">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                    </p>
                    <p className="text-gray-700">PIN: {selectedOrder.shippingAddress?.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={18} />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-lg" />
                        ) : (
                          <Package size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.subtitle}</p>
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{item.currentPrice?.toLocaleString('en-IN')}</p>
                        {item.originalPrice > item.currentPrice && (
                          <p className="text-sm text-gray-500 line-through">₹{item.originalPrice?.toLocaleString('en-IN')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold">₹{selectedOrder.shipping || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span className="font-semibold">₹{selectedOrder.tax?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
                    <span>Total</span>
                    <span>₹{selectedOrder.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-[#2eb4ac] bg-opacity-10 rounded-xl p-5 border-2 border-[#2eb4ac]">
                <h3 className="font-bold text-gray-900 mb-4">Update Order Status</h3>
                {updatingStatus === selectedOrder.orderId ? (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#2eb4ac] border-t-transparent"></div>
                    <span className="font-medium">Updating status...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select 
                      value={selectedOrder.status || 'Pending'}
                      onChange={(e) => updateOrderStatus(selectedOrder.orderId, e.target.value, selectedOrder.userId)}
                      className="appearance-none w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2eb4ac] focus:border-[#2eb4ac] transition-all font-medium bg-white cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;