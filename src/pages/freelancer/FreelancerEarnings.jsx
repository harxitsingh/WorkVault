import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, Download, Plus, CheckCircle, Shield } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function FreelancerEarnings() {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState({ totalEarnings: 0, totalWithdrawn: 0, availableBalance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [accountDetails, setAccountDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifsc: '',
    upiId: ''
  });
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const [balance, txs] = await Promise.all([
        paymentService.getAvailableBalance().catch(() => ({ totalEarnings: 0, totalWithdrawn: 0, availableBalance: 0 })),
        paymentService.getTransactions().catch(() => [])
      ]);
      setBalanceData(balance);
      setTransactions(txs);
    } catch (err) {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      return toast.error('Please enter a valid amount');
    }
    if (amount > balanceData.availableBalance) {
      return toast.error(`Insufficient balance. Maximum available is ₹${balanceData.availableBalance.toLocaleString('en-IN')}`);
    }

    try {
      setIsWithdrawing(true);
      await paymentService.requestWithdrawal({
        amount,
        payoutMethod,
        accountDetails: payoutMethod === 'upi' ? { upiId: accountDetails.upiId } : accountDetails
      });
      toast.success(`Successfully processed simulated payout of ₹${amount.toLocaleString('en-IN')}!`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchEarningsData();
    } catch (err) {
      toast.error(err.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDownloadStatement = async () => {
    try {
      setIsDownloading(true);
      await paymentService.downloadStatement();
      toast.success('Official financial statement downloaded!');
    } catch (err) {
      toast.error('Failed to generate statement');
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredTransactions = activeTab === 'all'
    ? transactions
    : transactions.filter(t => (t.type || '').toUpperCase() === activeTab.toUpperCase());

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'RELEASED':
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Completed</span>;
      case 'HELD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Held in Escrow</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>;
      case 'REFUNDED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Refunded</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings & Financial Ledger</h1>
          <p className="text-gray-600 mt-1">Immutable transaction records, escrow releases, and bank withdrawals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadStatement}
            disabled={isDownloading}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center shadow-sm"
          >
            <Download className="w-4 h-4 mr-1.5" />
            {isDownloading ? 'Generating...' : 'Download Statement (CSV)'}
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center shadow-sm"
          >
            <Wallet className="w-4 h-4 mr-1.5" />
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Available for Payout</p>
            <p className="text-3xl font-black text-gray-900">{formatCurrency(balanceData.availableBalance)}</p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Ready for withdrawal
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Lifetime Earnings</p>
            <p className="text-3xl font-black text-gray-900">{formatCurrency(balanceData.totalEarnings)}</p>
            <p className="text-xs text-gray-500 mt-1">Net released to balance</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Withdrawn</p>
            <p className="text-3xl font-black text-gray-900">{formatCurrency(balanceData.totalWithdrawn)}</p>
            <p className="text-xs text-gray-500 mt-1">Transferred to bank accounts</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Financial Ledger Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50">
          <h2 className="text-base font-bold text-gray-900 flex items-center">
            <Shield className="w-4 h-4 text-indigo-600 mr-2" />
            Immutable Transaction Ledger
          </h2>
          <div className="flex gap-2">
            {['all', 'PAYMENT_RELEASED', 'PAYMENT_FUNDED', 'WITHDRAWAL'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tab === 'all' ? 'All Records' : tab.replace('PAYMENT_', '')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-800">No transactions recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Transactions will appear automatically when escrow funds are released.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => {
                  const isCredit = ['PAYMENT_RELEASED', 'release'].includes(tx.type);
                  return (
                    <tr key={tx._id || tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                        {tx.description || tx.deal?.title || 'Financial transaction'}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-600">
                        {tx.type}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                        {tx.referenceId || tx.paymentReference || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(tx.status)}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${isCredit ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {isCredit ? '+' : ''}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Wallet className="w-5 h-5 text-indigo-600 mr-2" />
              Withdraw Available Balance
            </h3>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs flex justify-between items-center">
              <span className="text-indigo-800 font-medium">Available Payout Balance:</span>
              <span className="font-bold text-indigo-950 text-sm">{formatCurrency(balanceData.availableBalance)}</span>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={balanceData.availableBalance}
                  placeholder={`Max ${balanceData.availableBalance}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payout Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_transfer')}
                    className={`p-2.5 rounded-lg text-xs font-semibold border text-center transition-colors ${
                      payoutMethod === 'bank_transfer'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Direct Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`p-2.5 rounded-lg text-xs font-semibold border text-center transition-colors ${
                      payoutMethod === 'upi'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Instant UPI
                  </button>
                </div>
              </div>

              {payoutMethod === 'bank_transfer' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Bank Name (e.g. HDFC Bank)"
                    value={accountDetails.bankName}
                    onChange={(e) => setAccountDetails({ ...accountDetails, bankName: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Account Number"
                    value={accountDetails.accountNumber}
                    onChange={(e) => setAccountDetails({ ...accountDetails, accountNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="IFSC Code"
                    value={accountDetails.ifsc}
                    onChange={(e) => setAccountDetails({ ...accountDetails, ifsc: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                  />
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    required
                    placeholder="UPI ID (e.g. username@okhdfcbank)"
                    value={accountDetails.upiId}
                    onChange={(e) => setAccountDetails({ ...accountDetails, upiId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              )}

              <p className="text-[11px] text-gray-400">
                Note: In development sandbox mode, the payout is simulated, immutably logged into your ledger, and balance is deducted immediately.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing || balanceData.availableBalance <= 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center shadow-sm disabled:opacity-50"
                >
                  {isWithdrawing ? <LoadingSpinner size="sm" /> : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
