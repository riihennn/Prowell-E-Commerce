import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mail,
  User,
  CheckCircle,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch customers from your backend
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const baseUrl = "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search and status, excluding admin
  const filteredCustomers = customers
    .filter(customer => !customer.isAdmin) // exclude admin
    .filter(customer => {
      const matchesSearch =
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'blocked' && customer.isBlock) ||
        (statusFilter === 'active' && !customer.isBlock);
      return matchesSearch && matchesStatus;
    });

  const handleBlockUnblock = async (customerId, currentBlockStatus) => {
    try {
      const baseUrl = "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/users/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlock: !currentBlockStatus })
      });

      if (!response.ok) throw new Error('Failed to update customer status');
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Failed to update customer status');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      const baseUrl = "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/users/${customerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to delete customer');
      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name || customer.email}? This action cannot be undone.`)) {
      await handleDeleteCustomer(customer.id);
    }
  };

  const handleBlock = async (customer) => {
    if (window.confirm(`Are you sure you want to ${customer.isBlock ? 'unblock' : 'block'} ${customer.name || customer.email}?`)) {
      await handleBlockUnblock(customer.id, customer.isBlock);
    }
  };

  const getStatusBadge = (isBlocked) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit";
    return isBlocked ? (
      <span className={`${baseClasses} bg-red-100 text-red-800`}>
        <Lock className="w-3 h-3" />
        Blocked
      </span>
    ) : (
      <span className={`${baseClasses} bg-green-100 text-green-800`}>
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2eb4ac]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Customers</h1>
        <p className="text-gray-600">Manage your customer accounts and view their activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800">{filteredCustomers.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-800">
                {filteredCustomers.filter(c => !c.isBlock).length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked Customers</p>
              <p className="text-2xl font-bold text-gray-800">
                {filteredCustomers.filter(c => c.isBlock).length}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#2eb4ac] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : customer.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{customer.name || 'Unnamed User'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 text-sm text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(customer.isBlock)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                    <button 
                      onClick={() => handleBlock(customer)}
                      className={`${
                        customer.isBlock 
                          ? 'text-green-600 hover:text-green-900' 
                          : 'text-orange-600 hover:text-orange-900'
                      } transition-colors flex items-center gap-1 px-3 py-1 rounded border ${
                        customer.isBlock 
                          ? 'border-green-300 hover:bg-green-50' 
                          : 'border-orange-300 hover:bg-orange-50'
                      }`}
                      title={customer.isBlock ? 'Unblock user' : 'Block user'}
                    >
                      {customer.isBlock ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span className="text-xs font-medium">Unblock</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span className="text-xs font-medium">Block</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => handleDelete(customer)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No customers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
