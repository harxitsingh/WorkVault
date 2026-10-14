import React, { useState, useEffect } from 'react';
import { Search, IndianRupee, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Shield } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
        if (isMounted) setTransactions(data);
      } catch (err) {
        toast.error('Failed to load transaction ledger');
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

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'RELEASED':
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Released</span>;
      case 'HELD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Held</span>;
      case 'REFUNDED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Refunded</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments & Escrow Ledger (Admin)</h1>
        <p className="text-slate-600 mt-1">Supervise all escrow deposits, fee deductions, and released disbursements.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Volume Funded</div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalTransacted)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Currently Held in Escrow</div>
          <div className="text-2xl font-black text-blue-600">
            {formatCurrency(currentlyHeld)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Released to Freelancers</div>
          <div className="text-2xl font-black text-emerald-600">
            {formatCurrency(totalReleased)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-indigo-50/50 to-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-900 mb-1">Platform Fees Collected</div>
          <div className="text-2xl font-black text-indigo-700">
            {formatCurrency(platformFees)}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center bg-slate-50 gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Shield className="w-4 h-4 text-indigo-600 mr-2" />
            Global Financial Transactions ({transactions.length})
          </h2>

          <div className="flex gap-2">
            {['All', 'HELD', 'RELEASED', 'REFUNDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="font-semibold text-slate-700">No transactions recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
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
                  <tr key={t.id || t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-indigo-600 font-bold">
                      {(t.referenceId || t.id || t._id).substring(0, 12)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {t.type}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {t.description || t.deal?.title || 'Escrow Payment'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {t.client?.name || 'Client'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {t.freelancer?.name || 'Freelancer'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
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
