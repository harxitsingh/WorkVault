import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dealService } from '../../services/dealService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Search, Calendar, Clock, ChevronRight, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'FUNDED', label: 'Funded (Escrow)', statuses: ['FUNDED'] },
  { id: 'IN_PROGRESS', label: 'In Progress', statuses: ['IN_PROGRESS', 'active'] },
  { id: 'SUBMITTED', label: 'Submitted', statuses: ['SUBMITTED'] },
  { id: 'RELEASED', label: 'Completed & Released', statuses: ['RELEASED', 'APPROVED', 'completed'] },
  { id: 'DISPUTED', label: 'Disputed', statuses: ['DISPUTED'] },
];

export default function FreelancerDeals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const data = await dealService.getDeals();
        if (isMounted) setDeals(data);
      } catch (err) {
        if (isMounted) toast.error('Failed to load orders');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDeals();
    return () => { isMounted = false; };
  }, []);

  const getFilteredDeals = () => {
    let filtered = deals;

    if (activeTab !== 'all') {
      const tab = TABS.find(t => t.id === activeTab);
      if (tab) {
        filtered = filtered.filter(deal => tab.statuses.includes((deal.status || '').toUpperCase()) || tab.statuses.includes(deal.status));
      }
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(deal =>
        (deal.title || '').toLowerCase().includes(lowerQuery) ||
        (deal.client?.name || deal.clientName || '').toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  };

  const filteredDeals = getFilteredDeals();

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'FUNDED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Escrow Funded</span>;
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">In Progress</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Under Client Review</span>;
      case 'APPROVED':
      case 'RELEASED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Payment Released</span>;
      case 'DISPUTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">In Dispute</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assigned Orders & Milestones</h1>
          <p className="text-gray-600 mt-1">Track deliverables, submit work, and monitor escrow-backed earnings.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab & Search */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {TABS.map((tab) => {
              const count = tab.id === 'all'
                ? deals.length
                : deals.filter(d => tab.statuses.includes((d.status || '').toUpperCase()) || tab.statuses.includes(d.status)).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium">No orders found in this category</p>
            <p className="text-sm mt-1">When clients hire your services, orders will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDeals.map((deal) => {
              const clientName = deal.client?.name || deal.clientName || 'Client';
              return (
                <Link
                  key={deal.id || deal._id}
                  to={`/freelancer/deals/${deal.id || deal._id}`}
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
                      Client: <span className="font-medium text-gray-700">{clientName}</span>
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
                      <p className="text-xs text-gray-500">Total Escrow</p>
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
