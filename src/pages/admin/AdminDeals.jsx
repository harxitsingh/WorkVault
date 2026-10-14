import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Eye, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDeals();
        if (isMounted) setDeals(data);
      } catch (err) {
        toast.error('Failed to load deals');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDeals();
    return () => { isMounted = false; };
  }, []);

  const filteredDeals = deals.filter(deal => {
    const s = (deal.status || '').toUpperCase();
    const clientName = deal.client?.name || '';
    const freelancerName = deal.freelancer?.name || '';
    const title = deal.title || '';

    const matchesSearch =
      (deal.id || deal._id || '').toLowerCase().includes(search.toLowerCase()) ||
      title.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      freelancerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || s === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'RELEASED':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800';
      case 'FUNDED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'SUBMITTED':
        return 'bg-amber-100 text-amber-800';
      case 'DISPUTED':
        return 'bg-rose-100 text-rose-800';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Deals & Contracts Management</h1>
        <p className="text-slate-600 mt-1">Supervise active contracts, milestone escrows, and participant details.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, project title, or user..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['All', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'RELEASED', 'DISPUTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status === 'All' ? 'All Contracts' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No deals found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Deal ID</th>
                  <th className="py-3 px-4">Title / Service</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Freelancer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id || deal._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-600">
                      {(deal.id || deal._id).substring(0, 8)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {deal.title}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {deal.client?.name || 'Client'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {deal.freelancer?.name || 'Freelancer'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(deal.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusStyle(deal.status)}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(deal.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/client/deals/${deal.id || deal._id}`}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors inline-block"
                        title="View Deal"
                      >
                        <Eye className="w-4 h-4" />
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
