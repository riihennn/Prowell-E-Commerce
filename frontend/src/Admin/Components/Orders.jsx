import React, { useState, useEffect, useRef } from 'react';
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
import { getAllOrders, updateOrderStatus as updateStatusInApi } from '../../services/orderService';
import Loader from '../../components/Loader';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders(debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  // Debounce search — wait 400ms after user stops typing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  const fetchOrders = async (search = debouncedSearch, status = statusFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (status && status !== 'All') params.status = status;

      const data = await getAllOrders(params);

      const formattedOrders = (Array.isArray(data) ? data : []).map(order => ({
        ...order,
        orderId: order._id,
        userName: order.user?.name || 'Unknown User',
        userEmail: order.user?.email || 'No email',
        userId: order.user?._id,
        items: order.orderItems.map(item => ({
          ...item,
          title: item.product?.name,
          image: item.product?.image,
          currentPrice: item.price
        })),
        total: order.totalPrice,
        orderDate: order.createdAt
      }));

      setOrders(formattedOrders);
      setError(null);
    } catch (error) {
      setError(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    
    try {
      await updateStatusInApi(orderId, newStatus);

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
      alert(`Failed to update order status: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Server-side filtered — use orders directly
  const filteredOrders = orders;

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
        return <CheckCircle size={14} className="mr-1.5" />;
      case 'processing':
        return <Package size={14} className="mr-1.5" />;
      case 'shipped':
        return <Truck size={14} className="mr-1.5" />;
      case 'pending':
        return <Clock size={14} className="mr-1.5" />;
      case 'cancelled':
        return <XCircle size={14} className="mr-1.5" />;
      default:
        return <Clock size={14} className="mr-1.5" />;
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getUniqueStatuses = () => {
    return ['All', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];
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



  // Skeleton for the orders list table
  const OrderSkeleton = () => (
    <div className="divide-y divide-gray-50/80">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-6 md:p-8">
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="skeleton-shimmer h-6 w-32 rounded-lg" />
                <div className="skeleton-shimmer h-6 w-24 rounded-full" />
                <div className="skeleton-shimmer h-5 w-36 rounded-lg ml-auto xl:ml-0" />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="skeleton-shimmer h-8 w-36 rounded-xl" />
                <div className="skeleton-shimmer h-8 w-44 rounded-xl" />
                <div className="skeleton-shimmer h-8 w-24 rounded-xl" />
              </div>
              <div className="skeleton-shimmer h-9 w-40 rounded-lg" />
            </div>
            <div className="flex items-center gap-4 w-full xl:w-auto xl:border-l xl:border-gray-100 xl:pl-8">
              <div className="skeleton-shimmer h-12 flex-1 xl:w-48 xl:flex-none rounded-2xl" />
              <div className="skeleton-shimmer h-12 w-12 rounded-2xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center transform transition-all hover:scale-105">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <XCircle className="text-rose-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Oops! Something went wrong</h2>
          <p className="text-gray-500 mb-8 font-medium">{error}</p>
          <button 
            onClick={fetchOrders}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#ffbe00] to-[#e6ab00] text-white rounded-xl font-bold tracking-wide hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Order Management</h1>
            <p className="text-gray-500 mt-2 text-lg">Track and manage all customer orders.</p>
          </div>
        </div>

        {/* Stats Cards - Redesigned to be Premium */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
          {/* Total Orders */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package size={64} className="text-blue-600 transform group-hover:scale-110 transition-transform duration-500 translate-x-4 -translate-y-4" />
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Package size={24} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.total}</p>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
              <Clock size={24} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Pending</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.pending}</p>
          </div>

          {/* Processing */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
              <Package size={24} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Processing</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.processing}</p>
          </div>

          {/* Shipped */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
              <Truck size={24} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Shipped</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.shipped}</p>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              <CheckCircle size={24} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.completed}</p>
          </div>

          {/* Cancelled */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
              <XCircle size={24} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Cancelled</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative w-full lg:w-2/3 group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#ffbe00] transition-colors" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-medium text-gray-700 placeholder-gray-400 tracking-wide"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative w-full lg:w-1/3">
              <Filter className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-14 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-bold text-gray-700 cursor-pointer"
              >
                {getUniqueStatuses().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <OrderSkeleton />
          ) : filteredOrders.length > 0 ? (
            <div className="divide-y divide-gray-50/80">
              {filteredOrders.map((order) => (
                <div key={order.orderId} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors group">
                  <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                    
                    {/* Left Section: Order Info & Stats */}
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-xl font-black text-gray-900 tracking-tight">#{order.orderId.slice(-8).toUpperCase()}</span>
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status || 'Pending'}
                        </span>
                        <span className="text-gray-400 text-sm font-medium ml-auto xl:ml-0 flex items-center gap-1.5">
                          <Calendar w-4 h-4 />
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-medium">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <User size={12} strokeWidth={3} />
                          </div>
                          <span>{order.shippingAddress?.fullName || order.userName}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Mail size={12} strokeWidth={3} />
                          </div>
                          <span>{order.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Package size={12} strokeWidth={3} />
                          </div>
                          <span>{order.items?.length || 0} Item{order.items?.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="flex items-end gap-3 pt-2">
                        <span className="text-3xl font-black text-gray-900 tracking-tight">₹{order.total?.toLocaleString('en-IN')}</span>
                        {order.items && order.items.length > 0 && (
                          <span className="text-sm font-medium text-gray-400 mb-1 line-clamp-1 truncate max-w-sm">
                            Included: {order.items[0].title}
                            {order.items.length > 1 && <span className="text-[#ffbe00]"> +{order.items.length - 1} more</span>}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-4 w-full xl:w-auto xl:justify-end xl:border-l xl:border-gray-100 xl:pl-8">
                      {updatingStatus === order.orderId ? (
                        <div className="px-6 py-3 flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#ffbe00] border-t-transparent"></div>
                          <span className="text-sm font-bold text-gray-600 tracking-wide">Updating...</span>
                        </div>
                      ) : (
                        <div className="relative flex-1 xl:flex-none">
                          <select 
                            value={order.status || 'Pending'}
                            onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                            className="appearance-none w-full xl:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-bold text-gray-700 cursor-pointer text-sm shadow-sm hover:border-gray-300 pr-10"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                        </div>
                      )}
                      
                      <button 
                        onClick={() => viewOrderDetails(order)}
                        className="p-3 bg-gray-50 text-gray-600 rounded-2xl border border-gray-200 hover:bg-[#ffbe00] hover:text-white hover:border-[#ffbe00] transition-all duration-300 shadow-sm group-hover:shadow-md outline-none focus:ring-4 focus:ring-[#ffbe00]/20"
                        title="View Details"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                <Package className="text-gray-300 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No orders found</h3>
              <p className="text-gray-500 font-medium text-lg">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal (Premium Redesign) */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 transition-opacity">
          <div className="bg-white rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transform transition-transform scale-100">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order Details</h2>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="text-gray-500 font-bold font-mono bg-gray-100 px-3 py-1 rounded-lg">#{selectedOrder.orderId.toUpperCase()}</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status || 'Pending'}
                  </span>
                  <span className="text-sm font-medium text-gray-400 flex items-center gap-1"><Calendar size={14}/> {formatDate(selectedOrder.orderDate)}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowOrderDetails(false)}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-rose-50 hover:text-rose-500 text-gray-400 rounded-2xl transition-all duration-300 border border-gray-100"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto bg-gray-50/30 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Items */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Package size={20} strokeWidth={2.5} />
                      </div>
                      Items Ordered
                    </h3>
                    
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex gap-6 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all duration-300 group">
                          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden p-2">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <Package size={32} className="text-gray-300" />
                            )}
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-center">
                            <p className="text-lg font-bold text-gray-900 tracking-tight leading-tight mb-1">{item.title}</p>
                            <p className="text-sm font-medium text-gray-500 mb-2">{item.subtitle}</p>
                            <div className="flex items-center gap-2 mt-auto">
                              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold tracking-wide">
                                Qty: {item.quantity || 1}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right flex flex-col justify-center pl-4 border-l border-gray-100">
                            <p className="text-xl font-black text-gray-900 tracking-tight">₹{item.currentPrice?.toLocaleString('en-IN')}</p>
                            {item.originalPrice > item.currentPrice && (
                              <p className="text-sm font-bold text-gray-400 line-through mt-1">₹{item.originalPrice?.toLocaleString('en-IN')}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer & Summary */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Customer Info */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                        <User size={20} strokeWidth={2.5} />
                      </div>
                      Customer Profile
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-white">
                          {(selectedOrder.shippingAddress?.fullName || selectedOrder.userName).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg tracking-tight">{(selectedOrder.shippingAddress?.fullName || selectedOrder.userName)}</p>
                          <p className="text-sm font-medium text-gray-500">{selectedOrder.userEmail}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Contact</p>
                            <p className="font-semibold text-gray-800">{selectedOrder.shippingAddress?.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Shipping Address</p>
                            <p className="font-semibold text-gray-800 leading-relaxed">
                              {selectedOrder.shippingAddress?.addressLine1}<br/>
                              {selectedOrder.shippingAddress?.addressLine2 && <>{selectedOrder.shippingAddress.addressLine2}<br/></>}
                              {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br/>
                              PIN: {selectedOrder.shippingAddress?.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700 shadow-xl p-6 sm:p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Package size={100} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-6 tracking-tight relative z-10">Payment Summary</h3>
                    <div className="space-y-4 relative z-10 text-gray-300 font-medium">
                      <div className="flex justify-between items-center group">
                        <span className="group-hover:text-white transition-colors">Subtotal</span>
                        <span className="text-white font-bold tracking-wide">₹{selectedOrder.subtotal?.toLocaleString('en-IN') || selectedOrder.total?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="group-hover:text-white transition-colors">Shipping</span>
                        <span className="text-white font-bold tracking-wide">₹{selectedOrder.shipping || 0}</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="group-hover:text-white transition-colors">Tax (Included)</span>
                        <span className="text-white font-bold tracking-wide">₹{selectedOrder.tax?.toLocaleString('en-IN') || 0}</span>
                      </div>
                      <div className="w-full h-px bg-gray-700 my-4"></div>
                      <div className="flex justify-between items-end">
                        <span className="text-lg text-gray-400">Total Paid</span>
                        <span className="text-4xl font-black text-white tracking-tight">₹{selectedOrder.total?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Update Status Actions */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Update Status</p>
                    {updatingStatus === selectedOrder.orderId ? (
                      <div className="w-full py-3 bg-gray-50 rounded-xl flex items-center justify-center gap-3 border border-gray-100">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#ffbe00] border-t-transparent"></div>
                        <span className="font-bold text-gray-600">Updating...</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <select 
                          value={selectedOrder.status || 'Pending'}
                          onChange={(e) => updateOrderStatus(selectedOrder.orderId, e.target.value)}
                          className="appearance-none w-full px-5 py-4 bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-[#ffbe00]/30 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-bold text-gray-800 cursor-pointer shadow-sm tracking-wide"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;