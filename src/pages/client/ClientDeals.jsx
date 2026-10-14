import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, ChevronRight, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { dealService } from '../../services/dealService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ClientDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All', 'CREATED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'RELEASED', 'DISPUTED'];

  useEffect(() => {
    let isMounted = true;
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const data = await dealService.getDeals();
        if (isMounted) setDeals(data);
      } catch (err) {
        if (isMounted) toast.error('Failed to load deals');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDeals();
    return () => { isMounted = false; };
  }, []);

  const filteredDeals = deals.filter(deal => {
    const normStatus = (deal.status || '').toUpperCase();
    const matchesTab = activeTab === 'All'
      ? true
      : activeTab === 'IN_PROGRESS'
        ? ['IN_PROGRESS', 'ACTIVE'].includes(normStatus)
        : activeTab === 'RELEASED'
          ? ['RELEASED', 'COMPLETED', 'APPROVED'].includes(normStatus)
          : normStatus === activeTab;

    const matchesSearch = !searchQuery ||
      (deal.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.freelancer?.name || deal.freelancerName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'FUNDED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Escrow Funded</span>;
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">In Progress</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Review Pending</span>;
      case 'APPROVED':
      case 'RELEASED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Payment Released</span>;
      case 'DISPUTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">In Dispute</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Projects & Deals</h1>
          <p className="text-gray-600 mt-1">Manage milestone progress, escrow funding, and work approvals.</p>
        </div>
        <Link
          to="/services"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          Hire a Freelancer
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Tab & Search Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {tabs.map((tab) => {
              const count = tab === 'All'
                ? deals.length
                : deals.filter(d => {
                    const s = (d.status || '').toUpperCase();
                    return tab === 'IN_PROGRESS'
                      ? ['IN_PROGRESS', 'ACTIVE'].includes(s)
                      : tab === 'RELEASED'
                        ? ['RELEASED', 'COMPLETED', 'APPROVED'].includes(s)
                        : s === tab;
                  }).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Deals Table */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium">No deals found in this category</p>
            <p className="text-sm mt-1">Browse services to start a milestone-based project.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDeals.map((deal) => {
              const freelancerName = deal.freelancer?.name || deal.freelancerName || 'Freelancer';
              return (
                <Link
                  key={deal.id || deal._id}
                  to={`/client/deals/${deal.id || deal._id}`}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-4 block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 text-base hover:text-indigo-600 transition-colors">
                        {deal.title}
                      </h3>
                      {getStatusBadge(deal.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Freelancer: <span className="font-medium text-gray-700">{freelancerName}</span>
                      {deal.deadline && (
                        <span className="ml-4 inline-flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Due: {formatDate(deal.deadline)}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(deal.amount)}</p>
                      <p className="text-xs text-gray-500">Milestone Escrow</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
