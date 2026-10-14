import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { disputeService } from '../../services/disputeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        const data = await disputeService.getDisputes();
        if (isMounted) setDisputes(data || []);
      } catch (err) {
        console.error('Failed to load disputes:', err);
        toast.error('Failed to load disputes queue');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDisputes();
    return () => { isMounted = false; };
  }, []);

  const filtered = disputes.filter(d => {
    const s = (d.status || '').toUpperCase();
    if (statusFilter === 'All') return true;
    return s === statusFilter.toUpperCase();
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Disputes Arbitration Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Review contested escrow claims, inspect counter-evidence, and enforce marketplace integrity.</p>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['All', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status === 'All' ? 'All Disputes' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 self-end md:self-auto">
            Showing {filtered.length} of {disputes.length} cases
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Disputes queue empty"
            description={statusFilter === 'All' ? 'No open or under-review disputes in the system.' : `No dispute cases matching status "${statusFilter}".`}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((dispute) => {
              const deal = dispute.deal || {};
              const raisedByName = dispute.raisedBy?.name || dispute.openedByName || 'User';
              const againstName = dispute.againstUser?.name || 'Party';
              const amount = dispute.milestone?.amount || deal.amount || 0;
              const dispId = dispute.id || dispute._id;

              return (
                <div
                  key={dispId}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center"
                >
                  <div className="flex gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 text-rose-600 border border-rose-100">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-slate-900 text-base">{dispute.reason}</span>
                        <StatusBadge status={dispute.status} />
                      </div>
                      <p className="text-xs text-slate-600">
                        Project: <span className="font-semibold text-slate-800">{deal.title || 'Deal'}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Raised by: <strong className="text-slate-700">{raisedByName}</strong> vs <strong className="text-slate-700">{againstName}</strong> • {formatDate(dispute.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Escrow Held</p>
                      <p className="text-base font-black text-slate-900">{formatCurrency(amount)}</p>
                    </div>
                    <Link
                      to={`/admin/disputes/${dispId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      Arbitrate <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
