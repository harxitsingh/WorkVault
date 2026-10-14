import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, ChevronRight, Briefcase, PlusCircle } from 'lucide-react';
import { dealService } from '../../services/dealService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
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
        if (isMounted) setDeals(data || []);
      } catch (err) {
        if (isMounted) toast.error(err.message || 'Failed to load deals');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Client Projects & Deals</h1>
          <p className="text-sm text-slate-500 mt-1">Manage milestone progress, escrow funding, and work approvals.</p>
        </div>
        <Link
          to="/marketplace"
          className="inline-flex items-center justify-center px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Hire a Freelancer
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
        {/* Tab & Search Bar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'bg-brand-primary text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {tab === 'All' ? 'All Deals' : tab.replace('_', ' ')} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search projects or talent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Deals Table */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Briefcase}
              title="No deals found"
              description={searchQuery ? "No contracts match your search criteria." : "You have no contracts in this category."}
              action={
                <Link
                  to="/marketplace"
                  className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-hover shadow-xs"
                >
                  Explore Marketplace
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDeals.map((deal) => {
              const freelancerName = deal.freelancer?.name || deal.freelancerName || 'Freelancer';
              return (
                <Link
                  key={deal.id || deal._id}
                  to={`/client/deals/${deal.id || deal._id}`}
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
                        Freelancer: <span className="font-semibold text-slate-700">{freelancerName}</span>
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
                      <p className="text-[11px] text-slate-400">Milestone Escrow</p>
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

