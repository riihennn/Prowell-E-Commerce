import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mail,
  User,
  CheckCircle,
  Lock,
  Unlock,
  Trash2,
  Filter
} from 'lucide-react';
import { getAllUsers, toggleUserBlock, updateUserRole, deleteUser } from '../../services/userService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch on mount AND whenever debouncedSearch or statusFilter changes
  useEffect(() => {
    fetchCustomers(debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  // Debounce the search input — 400ms after typing stops
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  const fetchCustomers = async (search = debouncedSearch, status = statusFilter) => {
    try {
      setLoading(true);
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (status && status !== 'all') params.statusFilter = status;
      const data = await getAllUsers(params);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Server-side filtered — use customers directly
  const filteredCustomers = customers;

  const handleBlockUnblock = async (customerId, currentBlockStatus) => {
    try {
      await toggleUserBlock(customerId);
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Failed to update customer status');
    }
  };

  const handleRoleChange = async (customerId, currentRole) => {
    try {
      await updateUserRole(customerId, !currentRole);
      await fetchCustomers();
    } catch (error) {
       console.error('Error updating customer role:', error);
       alert('Failed to update customer role');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await deleteUser(customerId);
      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const handleDelete = async (customer) => {
    // Determine the unique identifier (fallback to _id if id isn't present)
    const custId = customer._id || customer.id;
    if (window.confirm(`Are you sure you want to delete ${customer.name || customer.email}? This action cannot be undone.`)) {
      await handleDeleteCustomer(custId);
    }
  };

  const handleBlock = async (customer) => {
    const custId = customer._id || customer.id;
    if (window.confirm(`Are you sure you want to ${customer.isBlock ? 'unblock' : 'block'} ${customer.name || customer.email}?`)) {
      await handleBlockUnblock(custId, customer.isBlock);
    }
  };

  const getStatusBadge = (isBlocked) => {
    return isBlocked ? (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border bg-red-50 text-red-700 border-red-200 w-fit">
        <Lock className="w-3.5 h-3.5 mr-1.5" />
        Blocked
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border bg-green-50 text-green-700 border-green-200 w-fit">
        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
        Active
      </span>
    );
  };



  return (
    <div className="flex-1 p-6 sm:p-8 lg:p-10 bg-gray-50/50 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Customers</h1>
        <p className="text-gray-500 mt-2 text-lg">Manage your customer accounts and view their activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
              <User size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">{filteredCustomers.length}</h3>
            <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Total Customers</p>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3.5 rounded-2xl bg-green-50 text-green-600 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">{filteredCustomers.filter(c => !c.isBlock).length}</h3>
            <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Active Customers</p>
          </div>
        </div>

        {/* Blocked */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform duration-300">
              <Lock size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">{filteredCustomers.filter(c => c.isBlock).length}</h3>
            <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Blocked Customers</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#ffbe00] transition-colors" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#ffbe00]/20 focus:border-[#ffbe00] transition-all font-medium"
              />
            </div>
            {/* Status Filter */}
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto appearance-none pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#ffbe00]/20 focus:border-[#ffbe00] transition-all font-bold text-gray-700 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Customer</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Email</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Customer ID</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                // Skeleton rows
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="skeleton-shimmer w-12 h-12 rounded-xl flex-shrink-0" />
                        <div className="skeleton-shimmer h-5 w-32 rounded-lg" />
                      </div>
                    </td>
                    <td className="px-8 py-5"><div className="skeleton-shimmer h-8 w-48 rounded-lg" /></td>
                    <td className="px-8 py-5"><div className="skeleton-shimmer h-5 w-20 rounded-lg" /></td>
                    <td className="px-8 py-5"><div className="skeleton-shimmer h-7 w-20 rounded-full" /></td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-3">
                        <div className="skeleton-shimmer h-9 w-20 rounded-xl" />
                        <div className="skeleton-shimmer h-9 w-9 rounded-xl" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredCustomers.map((customer) => {
                const uniqueId = customer._id || customer.id || 'N/A';
                return (
                  <tr key={uniqueId} className="hover:bg-gray-50/50 hover:shadow-[inset_4px_0_0_#ffbe00] transition-all group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#ffbe00] to-[#e6ab00] rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-105 transition-transform">
                          <span className="text-white font-black text-lg">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : customer.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-base font-bold text-gray-900 group-hover:text-[#ffbe00] transition-colors">{customer.name || 'Unnamed User'}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-xs font-mono font-medium text-gray-400">
                      #{uniqueId.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">{getStatusBadge(customer.isBlock)}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleBlock(customer)}
                          className={`${
                            customer.isBlock 
                              ? 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200' 
                              : 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200'
                          } transition-all flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-xs shadow-sm`}
                          title={customer.isBlock ? 'Unblock user' : 'Block user'}
                        >
                          {customer.isBlock ? (
                            <>
                              <Unlock className="w-4 h-4" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Block
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => handleDelete(customer)}
                          className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 transition-all p-2 rounded-xl shadow-sm"
                          title="Delete user"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredCustomers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <User className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No customers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
