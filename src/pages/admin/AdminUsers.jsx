import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Shield, Check, X, Users, Star } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUsers();
        if (isMounted) setUsers(data);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUsers();
    return () => { isMounted = false; };
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-1">Supervise clients, freelancers, and administrator accounts.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {['All', 'client', 'freelancer', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  roleFilter === role
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {role === 'All' ? 'All Roles' : `${role}s`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id || u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                          <img
                            src={getImageUrl(u.profileImage || u.avatar, 'avatar')}
                            alt={u.name}
                            onError={(e) => handleImageError(e, 'avatar')}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'freelancer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-xs font-medium text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                        {u.rating || 5.0}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {u.location || 'India'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/users/${u.id || u._id}`}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
