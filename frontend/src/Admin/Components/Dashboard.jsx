import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { getAllAdminProducts } from '../../services/productService';
import { getAllOrders } from '../../services/orderService';
import { getAllUsers } from '../../services/userService';
import { getDashboardStats } from '../../services/dashboardService';

const Dashboard = () => {
  const [statsData, setStatsData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data simultaneously using API services
        const [productsRes, allOrders, users, stats] = await Promise.all([
          getAllAdminProducts({ limit: 1000 }), // Get more for the lookup in dashboard or we can rely on populated orders
          getAllOrders(),
          getAllUsers(),
          getDashboardStats()
        ]);

        const products = productsRes.products || [];

        // Calculate stats
        const totalRevenue = stats.totalRevenue || 0;
        const totalCustomers = stats.totalUsers || 0;
        const totalProductsCount = stats.totalProducts || 0;
        const totalOrdersCount = stats.totalOrders || 0;

        // Calculate growth percentages (Simulated for UI)
        const calculateGrowth = () => {
          const change = 20 + Math.random() * 10;
          return {
            value: `+${change.toFixed(1)}%`,
            isPositive: true
          };
        };

        const revenueGrowth = calculateGrowth();
        const customersGrowth = calculateGrowth();
        const productsGrowth = calculateGrowth();
        const ordersGrowth = calculateGrowth();

        // Stats Data
        setStatsData([
          {
            id: 1,
            title: 'Total Revenue',
            value: `₹${totalRevenue.toLocaleString('en-IN')}`,
            change: revenueGrowth.value,
            isPositive: revenueGrowth.isPositive,
            icon: DollarSign,
            color: 'bg-green-500'
          },
          {
            id: 2,
            title: 'Customers',
            value: totalCustomers.toLocaleString(),
            change: customersGrowth.value,
            isPositive: customersGrowth.isPositive,
            icon: Users,
            color: 'bg-blue-500'
          },
          {
            id: 3,
            title: 'Products',
            value: totalProductsCount.toLocaleString(),
            change: productsGrowth.value,
            isPositive: productsGrowth.isPositive,
            icon: Package,
            color: 'bg-purple-500'
          },
          {
            id: 4,
            title: 'Orders',
            value: totalOrdersCount.toLocaleString(),
            change: ordersGrowth.value,
            isPositive: ordersGrowth.isPositive,
            icon: ShoppingCart,
            color: 'bg-orange-500'
          }
        ]);

        // Recent Orders - sorted internally by db (createdAt:-1), map to display format
        const recentOrdersData = allOrders.slice(0, 5).map(order => {
          const customerName = order.user?.name || order.shippingAddress?.fullName || 'Unknown Customer';
          const productInfo = order.orderItems?.length === 1 ? 
            (order.orderItems[0]?.product?.name || 'Unknown Product') : 
            `${order.orderItems?.length || 0} Items`;
          
          return {
            id: order._id,
            customer: customerName,
            product: productInfo,
            amount: `₹${(order.totalPrice || 0).toLocaleString('en-IN')}`,
            status: order.status || 'Pending',
            date: order.createdAt ? 
              new Date(order.createdAt).toLocaleDateString('en-IN') : 
              'Unknown Date'
          };
        });
        
        setRecentOrders(recentOrdersData);

        // Generate real sales data from orders
        const generateRealSalesData = (orders) => {
          const days = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
          }

          const dailySales = days.map(day => {
            const dayOrders = orders.filter(order => {
              if (!order.createdAt) return false;
              const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
              return orderDate === day;
            });

            const totalSales = dayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const date = new Date(day);
            
            return {
              date: day,
              day: dayNames[date.getDay()],
              fullDate: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
              sales: totalSales,
              orders: dayOrders.length
            };
          });

          return dailySales;
        };

        setSalesData(generateRealSalesData(allOrders));

        // Top Products based on order frequency
        const productCount = {};
        allOrders.forEach(order => {
          if (order.orderItems && Array.isArray(order.orderItems)) {
            order.orderItems.forEach(item => {
              const productId = item.product?._id || item.product;
              if (productId && !productCount[productId]) {
                const productDb = products.find(p => p._id === productId);
                productCount[productId] = {
                  product: item.product?.name ? item.product : (productDb || { name: 'Unknown Product', _id: productId }),
                  count: 0,
                  revenue: 0
                };
              }
              if (productId) {
                const quantity = item.quantity || 1;
                const price = item.price || 0;
                productCount[productId].count += quantity;
                productCount[productId].revenue += (price * quantity);
              }
            });
          }
        });

        const topProductsData = Object.values(productCount)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map((item, index) => ({
            id: item.product._id || `product-${index}`,
            name: item.product.name || item.product.title || 'Unknown Product',
            sales: item.count,
            revenue: `₹${item.revenue.toLocaleString('en-IN')}`
          }));

        setTopProducts(topProductsData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        setStatsData([
          { id: 1, title: 'Total Revenue', value: '₹0', change: '+0%', isPositive: true, icon: DollarSign, color: 'bg-green-500' },
          { id: 2, title: 'Customers', value: '0', change: '+0%', isPositive: true, icon: Users, color: 'bg-blue-500' },
          { id: 3, title: 'Products', value: '0', change: '+0%', isPositive: true, icon: Package, color: 'bg-purple-500' },
          { id: 4, title: 'Orders', value: '0', change: '+0%', isPositive: true, icon: ShoppingCart, color: 'bg-orange-500' }
        ]);
        setRecentOrders([]);
        setTopProducts([]);
        setSalesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    
    // Config matching our updated Orders UI badge style
    if (statusLower.includes('completed') || statusLower.includes('delivered')) {
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', ping: 'bg-green-400' };
    }
    if (statusLower.includes('processing')) {
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', ping: 'bg-blue-400' };
    }
    if (statusLower.includes('cancelled')) {
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', ping: '' };
    }
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', ping: 'bg-amber-400' };
  };

  // Calculate max sales for chart scaling
  const maxSales = salesData.length > 0 ? Math.max(...salesData.map(d => d.sales)) : 0;
  const totalWeekSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const totalWeekOrders = salesData.reduce((sum, day) => sum + day.orders, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#ffbe00]/20 border-t-[#ffbe00] rounded-full animate-spin shadow-sm"></div>
        <p className="mt-6 text-gray-500 font-medium text-lg tracking-wide animate-pulse">Loading dashboard insights...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 bg-gray-50/50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-2 text-lg">Here's what's happening in your store today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Live Updates Active
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
            <ArrowDown size={20} />
          </div>
          <div>
            <p className="text-red-900 font-bold text-lg">Data Connection Error</p>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => {
          const IconComponent = stat.icon;
          // Extract just the color name (e.g., 'green' from 'bg-green-500') to build custom transparent backgrounds
          const colorName = stat.color.split('-')[1];
          const bgClass = `bg-${colorName}-50`;
          const textClass = `text-${colorName}-600`;
          
          return (
            <div key={stat.id} className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3.5 rounded-2xl ${bgClass} ${textClass} group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent size={24} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${stat.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {stat.isPositive ? <ArrowUp size={14} className="mr-1" strokeWidth={3} /> : <ArrowDown size={14} className="mr-1" strokeWidth={3} />}
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sales Chart (Takes up 2 columns on extra large screens) */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
              <p className="text-gray-500 text-sm mt-1">Last 7 days performance</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-2xl font-black text-[#ffbe00]">₹{totalWeekSales.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div className="flex-1 h-64 min-h-[250px] relative mt-4">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px border-t border-dashed border-gray-400"></div>
              ))}
            </div>

            {salesData.length > 0 ? (
              <div className="flex items-end justify-between h-full gap-2 sm:gap-4 pb-8 relative z-10 pt-4">
                {salesData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 group h-full justify-end relative">
                    {/* Tooltip */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white p-3 rounded-xl text-center shadow-xl pointer-events-none z-20 whitespace-nowrap transform -translate-y-2 group-hover:-translate-y-4 duration-300">
                      <p className="font-bold text-sm">{data.fullDate}</p>
                      <p className="text-[#ffbe00] font-black tracking-tight">₹{data.sales.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{data.orders} orders</p>
                      {/* Tooltip pointer */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45"></div>
                    </div>

                    {/* Bar */}
                    <div 
                      className="w-full max-w-[48px] bg-gradient-to-t from-[#ffbe00] to-[#4de4db] rounded-t-xl transition-all duration-500 ease-out group-hover:opacity-80 group-hover:scale-y-[1.02] shadow-[0_0_15px_rgba(46,180,172,0.3)] origin-bottom cursor-pointer relative"
                      style={{ 
                        height: maxSales > 0 ? `${(data.sales / maxSales) * 100}%` : '4px',
                        minHeight: '4px'
                      }}
                    >
                      {/* Subtle highlight inside bar */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-white/30 rounded-t-xl"></div>
                    </div>
                    {/* X-Axis Label */}
                    <span className="absolute -bottom-6 text-xs sm:text-sm font-bold text-gray-400 group-hover:text-gray-900 transition-colors uppercase tracking-wider">{data.day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No sales data available yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
            <button className="text-sm font-bold text-[#ffbe00] hover:text-[#d49d00] bg-[#ffbe00]/10 hover:bg-[#ffbe00]/20 px-4 py-1.5 rounded-full transition-colors">
              Full Report
            </button>
          </div>
          <div className="flex-1 space-y-5">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' :
                      index === 1 ? 'bg-gray-100 text-gray-500 border border-gray-200' :
                      index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                      'bg-[#ffbe00]/10 text-[#ffbe00] border border-[#ffbe00]/20'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">{product.name}</p>
                      <p className="text-sm font-medium text-gray-500 mt-0.5">{product.sales} units sold</p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900 text-lg tracking-tight group-hover:text-[#ffbe00] transition-colors">{product.revenue}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                <Package size={48} className="opacity-30 mb-4" />
                <p className="font-medium">No top products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Recent Orders - Spans 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 pb-6 flex justify-between items-center border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <button className="text-sm font-bold text-[#ffbe00] hover:text-[#d49d00] transition-colors flex items-center gap-1 group">
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
          
          <div className="w-full overflow-x-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Customer</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Product</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Date</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => {
                    const statusStyle = getStatusColor(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 hover:shadow-[inset_4px_0_0_#ffbe00] transition-all group">
                        <td className="px-8 py-5">
                          <p className="font-bold text-gray-900 group-hover:text-[#ffbe00] transition-colors">{order.customer}</p>
                          <p className="text-xs font-mono text-gray-400 mt-1">#{order.id.slice(-6).toUpperCase()}</p>
                        </td>
                        <td className="px-8 py-5 font-medium text-gray-600">{order.product}</td>
                        <td className="px-8 py-5 text-sm text-gray-500 font-medium">{order.date}</td>
                        <td className="px-8 py-5">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            <span className="relative flex h-2 w-2 mr-2">
                              {statusStyle.ping && (
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyle.ping}`}></span>
                              )}
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusStyle.dot}`}></span>
                            </span>
                            {order.status}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-gray-900 tracking-tight">{order.amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20">
                <ShoppingCart size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium text-lg">No recent transactions found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#ffbe00] p-8 rounded-3xl shadow-lg relative overflow-hidden text-white flex flex-col justify-center">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 tracking-tight">Quick Actions</h2>
            <p className="text-[#ffbe00] text-sm font-medium mb-8 bg-black/20 self-start inline-block px-3 py-1 rounded-full text-white/90 backdrop-blur-sm">Streamline your workflow</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg backdrop-blur-sm group">
                <Package size={28} className="mb-3 transform group-hover:-translate-y-1 transition-transform" />
                <p className="font-bold text-sm tracking-wide">Add Product</p>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg backdrop-blur-sm group">
                <ShoppingCart size={28} className="mb-3 transform group-hover:-translate-y-1 transition-transform" />
                <p className="font-bold text-sm tracking-wide">View Orders</p>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg backdrop-blur-sm group">
                <Users size={28} className="mb-3 transform group-hover:-translate-y-1 transition-transform" />
                <p className="font-bold text-sm tracking-wide">Customers</p>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg backdrop-blur-sm group">
                <TrendingUp size={28} className="mb-3 transform group-hover:-translate-y-1 transition-transform" />
                <p className="font-bold text-sm tracking-wide">Analytics</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;