import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowUpRight, Clock, Download, Shield, CheckCircle, Receipt } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function ClientPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getTransactions();
      setTransactions(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalFunded = transactions
    .filter(t => ['PAYMENT_FUNDED', 'payment', 'escrow'].includes(t.type))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const amountHeld = transactions
    .filter(t => ['HELD', 'held'].includes(t.status))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const amountReleased = transactions
    .filter(t => ['RELEASED', 'released'].includes(t.status))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const stats = [
    { label: 'Total Escrow Funded', value: formatCurrency(totalFunded), icon: ArrowUpRight, color: 'text-brand-primary', bg: 'bg-blue-50 border-blue-100' },
    { label: 'Currently in Escrow', value: formatCurrency(amountHeld), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { label: 'Released to Freelancers', value: formatCurrency(amountReleased), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  ];

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await paymentService.downloadStatement();
      toast.success('Payment ledger statement downloaded!');
    } catch (err) {
      toast.error(err.message || 'Failed to download statement');
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs = ['All', 'HELD', 'RELEASED', 'REFUNDED'];

  const filteredTxns = activeTab === 'All'
    ? transactions
    : transactions.filter(t => (t.status || '').toUpperCase() === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Client Payments & Escrow Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Audit escrow deposits, released milestones, and platform statements.</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors shadow-2xs"
        >
          <Download className="w-4 h-4 mr-1.5" />
          {isDownloading ? 'Generating...' : 'Download Statement (CSV)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 flex items-center">
            <div className={`p-3.5 rounded-xl border ${stat.bg} mr-4 shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Shield className="w-4 h-4 text-brand-primary mr-2" />
            Payment History ({transactions.length})
          </h2>
          <div className="flex gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-colors ${
                  activeTab === tab
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab === 'All' ? 'All Payments' : tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Receipt}
              title="No payment records found"
              description="Transactions will appear here when you fund milestone contracts."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Project / Description</th>
                  <th className="py-3 px-4">Freelancer</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxns.map((tx) => (
                  <tr key={tx._id || tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {tx.description || tx.deal?.title || 'Milestone Escrow'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {tx.freelancer?.name || tx.freelancerName || 'Freelancer'}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                        (tx.paymentProvider || 'stripe') === 'stripe'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {tx.paymentProvider || 'stripe'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                      {tx.referenceId || tx.paymentReference || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(tx.amount)}
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
