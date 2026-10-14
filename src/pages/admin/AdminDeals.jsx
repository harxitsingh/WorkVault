import React, { useState, useEffect } from 'react';
import { Search, Eye, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
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
        if (isMounted) setDeals(data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load deals');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Deals & Contracts Management</h1>
          <p className="text-sm text-slate-500 mt-1">Supervise active contracts, milestone escrows, and participant details.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, project title, or user..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm bg-white placeholder:text-slate-400 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['All', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'RELEASED', 'DISPUTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {status === 'All' ? 'All Contracts' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Handshake}
              title="No platform deals found"
              description={search ? "No contracts matched your search query." : "No deals match the selected filter."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200/80">
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
                  <tr key={deal.id || deal._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-brand-primary">
                      {(deal.id || deal._id).substring(0, 8)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
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
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(deal.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/client/deals/${deal.id || deal._id}`}
                        className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-lg transition-colors inline-block"
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

