import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mail,
  User,
  CheckCircle,
  Lock,
  Unlock,
  Trash2,
  Filter,
  Users,
  ShieldOff,
  ShieldCheck,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { getAllUsers, toggleUserBlock, updateUserRole, deleteUser } from '../../services/userService';
import { AdminCustomerSkeleton } from '../../components/Skeletons';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingUserIds, setUpdatingUserIds] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchCustomers(debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const filteredCustomers = customers.filter(c => !c.isAdmin);

  const handleBlockUnblock = async (customerId, currentBlockStatus) => {
    const newStatus = !currentBlockStatus;
    setUpdatingUserIds(prev => new Set(prev).add(customerId));
    try {
      const updatedUser = await toggleUserBlock(customerId, newStatus);
      if (updatedUser) {
        setCustomers(prev => prev.map(c => (c._id || c.id) === customerId ? { ...updatedUser } : c));
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Failed to update customer status');
      await fetchCustomers();
    } finally {
      setUpdatingUserIds(prev => { const next = new Set(prev); next.delete(customerId); return next; });
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
    const custId = customer._id || customer.id;
    setOpenMenuId(null);
    if (window.confirm(`Delete ${customer.name || customer.email}? This cannot be undone.`)) {
      await handleDeleteCustomer(custId);
    }
  };

  const handleBlock = async (customer) => {
    const custId = customer._id || customer.id;
    setOpenMenuId(null);
    if (window.confirm(`${customer.isBlocked ? 'Unblock' : 'Block'} ${customer.name || customer.email}?`)) {
      const freshCustomer = customers.find(c => (c._id || c.id) === custId);
      const currentBlockStatus = freshCustomer ? freshCustomer.isBlocked : customer.isBlocked;
      await handleBlockUnblock(custId, currentBlockStatus);
    }
  };

  const avatarColor = (name, email) => {
    const str = name || email || '';
    const colors = [
      ['#1a1a2e', '#e94560'],
      ['#0f3460', '#533483'],
      ['#16213e', '#0f3460'],
      ['#1b262c', '#0f4c75'],
      ['#2c003e', '#e60073'],
    ];
    const idx = str.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  const stats = [
    {
      label: 'Total Customers',
      value: filteredCustomers.length,
      icon: Users,
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      label: 'Active',
      value: filteredCustomers.filter(c => !c.isBlocked).length,
      icon: ShieldCheck,
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      label: 'Blocked',
      value: filteredCustomers.filter(c => c.isBlocked).length,
      icon: ShieldOff,
      color: '#ef4444',
      bg: '#fef2f2',
    },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }} className="min-h-screen bg-[#f8f9fc] p-6 lg:p-10">

      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-1">Admin Panel</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage accounts, permissions and access control.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-gray-500">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="rounded-xl p-3" style={{ background: s.bg }}>
                <Icon size={22} style={{ color: s.color }} strokeWidth={2} />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{s.value}</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
          </select>
        </div>
        <div className="ml-auto text-xs font-semibold text-gray-400 hidden md:flex items-center">
          {filteredCustomers.length} result{filteredCustomers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <AdminCustomerSkeleton />
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                      <User className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm">No customers found</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, i) => {
                  const uniqueId = customer._id || customer.id || 'N/A';
                  const isUpdating = updatingUserIds.has(uniqueId);
                  const [bg, accent] = avatarColor(customer.name, customer.email);
                  const initial = (customer.name || customer.email || '?').charAt(0).toUpperCase();

                  return (
                    <tr
                      key={uniqueId}
                      className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60 ${customer.isBlocked ? 'opacity-60' : ''}`}
                    >
                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${bg}, ${accent})` }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-gray-800">{customer.name || 'Unnamed'}</div>
                            <div className="text-[11px] text-gray-400 font-medium">Customer</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                          <Mail className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                          {customer.email}
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-semibold text-gray-300 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          #{uniqueId.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {customer.isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* Block/Unblock button */}
                          <button
                            onClick={() => handleBlock(customer)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              customer.isBlocked
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-orange-50 text-orange-500 border-orange-200 hover:bg-orange-100'
                            }`}
                          >
                            {isUpdating ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : customer.isBlocked ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                            {customer.isBlocked ? 'Unblock' : 'Block'}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(customer)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 text-red-400 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Footer */}
        {!loading && filteredCustomers.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">
              Showing <span className="text-gray-600 font-bold">{filteredCustomers.length}</span> customer{filteredCustomers.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-300 font-medium">
              {filteredCustomers.filter(c => c.isBlocked).length} blocked · {filteredCustomers.filter(c => !c.isBlocked).length} active
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;