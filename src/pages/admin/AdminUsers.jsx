import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Star, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

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
        if (isMounted) setUsers(data || []);
      } catch (err) {
        console.error('Failed to load users:', err);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Supervise clients, freelancers, and administrator accounts.</p>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-900 font-medium placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['All', 'client', 'freelancer', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  roleFilter === role
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {role === 'All' ? 'All Roles' : `${role}s`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users match query"
            description={search ? `No accounts found matching "${search}".` : 'No users registered in this role category.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const uid = u.id || u._id;
                  return (
                    <tr key={uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={u.profileImage || u.avatar}
                            name={u.name}
                            size="md"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={u.role} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center text-xs font-semibold text-slate-700">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                          {u.rating || 5.0}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                        {u.location || 'India'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          to={`/admin/users/${uid}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
