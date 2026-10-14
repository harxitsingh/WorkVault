import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dealService } from '../../services/dealService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Search, Calendar, ChevronRight, Package, PlusCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
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
        if (isMounted) setDeals(data || []);
      } catch (err) {
        if (isMounted) toast.error(err.message || 'Failed to load orders');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assigned Orders & Milestones</h1>
          <p className="text-sm text-slate-500 mt-1">Track deliverables, submit work, and monitor escrow-backed earnings.</p>
        </div>
        <Link
          to="/freelancer/services/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Service
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
        {/* Tab & Search */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {TABS.map((tab) => {
              const count = tab.id === 'all'
                ? deals.length
                : deals.filter(deal => tab.statuses.includes((deal.status || '').toUpperCase()) || tab.statuses.includes(deal.status)).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-brand-primary text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search orders or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Package}
              title="No orders found"
              description={searchQuery ? "No client orders matched your search." : "No orders found in this category."}
              action={
                <Link
                  to="/freelancer/services/create"
                  className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-hover shadow-xs"
                >
                  List a New Service
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDeals.map((deal) => {
              const clientName = deal.client?.name || deal.clientName || 'Client';
              return (
                <Link
                  key={deal.id || deal._id}
                  to={`/freelancer/deals/${deal.id || deal._id}`}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/70 transition-colors gap-4 block"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-slate-900 text-base hover:text-brand-primary transition-colors">
                        {deal.title}
                      </h3>
                      <StatusBadge status={deal.status} />
                    </div>
                    <div className="flex items-center text-xs text-slate-500 gap-4">
                      <span>
                        Client: <span className="font-semibold text-slate-700">{clientName}</span>
                      </span>
                      {deal.deadline && (
                        <span className="inline-flex items-center text-slate-400">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Due: {formatDate(deal.deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900">{formatCurrency(deal.amount)}</p>
                      <p className="text-[11px] text-slate-400">Escrow Value</p>
                    </div>
                    <div className="p-1 text-slate-400 hover:text-brand-primary">
                      <ChevronRight className="w-5 h-5" />
                    </div>
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

