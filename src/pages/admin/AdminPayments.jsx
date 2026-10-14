import React, { useState, useEffect } from 'react';
import { Shield, Receipt } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await adminService.getTransactions();
        if (isMounted) setTransactions(data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load transaction ledger');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTransactions();
    return () => { isMounted = false; };
  }, []);

  const totalTransacted = transactions
    .filter(t => ['PAYMENT_FUNDED', 'payment', 'escrow'].includes(t.type))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const currentlyHeld = transactions
    .filter(t => ['HELD', 'held'].includes(t.status))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const totalReleased = transactions
    .filter(t => ['RELEASED', 'released'].includes(t.status))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const platformFees = transactions
    .filter(t => t.type === 'PLATFORM_FEE')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const filtered = transactions.filter(t => {
    const s = (t.status || '').toUpperCase();
    const type = (t.type || '').toUpperCase();

    const matchesStatus = statusFilter === 'All' || s === statusFilter.toUpperCase();
    const matchesType = typeFilter === 'All' || type === typeFilter.toUpperCase();
    return matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments & Escrow Ledger (Admin)</h1>
        <p className="text-sm text-slate-500 mt-1">Supervise all escrow deposits, fee deductions, and released disbursements.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Volume Funded</div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalTransacted)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Currently in Escrow</div>
          <div className="text-2xl font-black text-brand-primary">
            {formatCurrency(currentlyHeld)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Released to Freelancers</div>
          <div className="text-2xl font-black text-emerald-600">
            {formatCurrency(totalReleased)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 bg-blue-50/20">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900 mb-1">Platform Fees Collected</div>
          <div className="text-2xl font-black text-brand-primary">
            {formatCurrency(platformFees)}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Shield className="w-4 h-4 text-brand-primary mr-2" />
            Global Financial Transactions ({transactions.length})
          </h2>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['All', 'HELD', 'RELEASED', 'REFUNDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Receipt}
              title="No transactions recorded"
              description="Platform transaction records will appear here as users fund and release escrow."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Freelancer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id || t._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-brand-primary font-semibold">
                      {(t.referenceId || t.id || t._id).substring(0, 12)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {t.type}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {t.description || t.deal?.title || 'Escrow Payment'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {t.client?.name || 'Client'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {t.freelancer?.name || 'Freelancer'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(t.amount)}
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

