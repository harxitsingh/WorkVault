import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Clock, Download, Shield, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
      setTransactions(data);
    } catch (err) {
      toast.error('Failed to load transaction history');
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

  const amountRefunded = transactions
    .filter(t => ['REFUNDED', 'refunded'].includes(t.status))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const stats = [
    { label: 'Total Escrow Funded', value: formatCurrency(totalFunded), icon: ArrowUpRight, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Currently in Escrow', value: formatCurrency(amountHeld), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Released to Freelancers', value: formatCurrency(amountReleased), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await paymentService.downloadStatement();
      toast.success('Payment ledger statement downloaded!');
    } catch (err) {
      toast.error('Failed to download statement');
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs = ['All', 'HELD', 'RELEASED', 'REFUNDED'];

  const filteredTxns = activeTab === 'All'
    ? transactions
    : transactions.filter(t => (t.status || '').toUpperCase() === activeTab);

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'HELD':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Held in Escrow</span>;
      case 'RELEASED':
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Released</span>;
      case 'REFUNDED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Refunded</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Payments & Escrow Ledger</h1>
          <p className="text-gray-600 mt-1">Audit escrow deposits, released milestones, and platform statements.</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center shadow-sm"
        >
          <Download className="w-4 h-4 mr-1.5" />
          {isDownloading ? 'Generating...' : 'Download Statement (CSV)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className={`p-4 rounded-full ${stat.bg} mr-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50">
          <h2 className="text-base font-bold text-gray-900 flex items-center">
            <Shield className="w-4 h-4 text-indigo-600 mr-2" />
            Payment History ({transactions.length})
          </h2>
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tab === 'All' ? 'All Payments' : tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-800">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
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
              <tbody className="divide-y divide-gray-100">
                {filteredTxns.map((tx) => (
                  <tr key={tx._id || tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                      {tx.description || tx.deal?.title || 'Milestone Escrow'}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-700">
                      {tx.freelancer?.name || tx.freelancerName || 'Freelancer'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        (tx.paymentProvider || 'stripe') === 'stripe'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {(tx.paymentProvider || 'stripe').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-400">
                      {tx.referenceId || tx.paymentReference || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
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
