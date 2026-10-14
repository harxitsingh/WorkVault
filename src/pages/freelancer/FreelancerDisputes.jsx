import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { disputeService } from '../../services/disputeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

export default function FreelancerDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        const data = await disputeService.getDisputes();
        if (isMounted) setDisputes(data || []);
      } catch (err) {
        console.error('Failed to load disputes:', err);
        toast.error('Failed to load disputes');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDisputes();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Project Disputes & Claims</h1>
          <p className="text-sm text-slate-500 mt-1">Review disputes on your orders, submit counter-evidence, and track admin arbitration.</p>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Dispute Records ({disputes.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : disputes.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All projects in good standing"
            description="You have no contested milestones or open client claims. Keep up the high delivery standards!"
            actionLabel="View Active Deals"
            actionTo="/freelancer/deals"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {disputes.map((dispute) => {
              const dealTitle = dispute.deal?.title || 'Contested Order';
              const dispId = dispute.id || dispute._id;
              const amount = dispute.milestone?.amount || dispute.deal?.amount || 0;

              return (
                <Link
                  key={dispId}
                  to={`/freelancer/disputes/${dispId}`}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/80 transition-colors gap-4 block group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors">
                        {dispute.reason}
                      </h3>
                      <StatusBadge status={dispute.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span>Project: <strong className="text-slate-700">{dealTitle}</strong></span>
                      <span>•</span>
                      <span>Filed: {formatDate(dispute.createdAt)}</span>
                      {dispute.disputeNumber && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-400">#{dispute.disputeNumber}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                    <div className="text-left md:text-right">
                      <p className="text-base font-black text-slate-900">
                        {formatCurrency(amount)}
                      </p>
                      <p className="text-xs text-rose-600 font-semibold flex items-center md:justify-end gap-1">
                        <AlertCircle className="w-3 h-3" /> Under Dispute
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
