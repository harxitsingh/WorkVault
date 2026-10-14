import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { disputeService } from '../../services/disputeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
        if (isMounted) setDisputes(data);
      } catch (err) {
        toast.error('Failed to load disputes');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDisputes();
    return () => { isMounted = false; };
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'OPEN':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Open Dispute</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Under Admin Review</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved by Admin</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Disputes & Claims</h1>
          <p className="text-gray-600 mt-1">Review disputes on your orders, submit counter-evidence, and track admin mediation.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center">
            <ShieldAlert className="w-5 h-5 text-rose-600 mr-2" />
            Dispute Records ({disputes.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : disputes.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-800">No active disputes</p>
            <p className="text-sm mt-1">All your freelance projects and escrow milestones are in good standing.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {disputes.map((dispute) => {
              const dealTitle = dispute.deal?.title || 'Contested Order';
              return (
                <Link
                  key={dispute.id || dispute._id}
                  to={`/freelancer/disputes/${dispute.id || dispute._id}`}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-4 block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 text-base hover:text-indigo-600 transition-colors">
                        {dispute.reason}
                      </h3>
                      {getStatusBadge(dispute.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Project: <span className="font-medium text-gray-700">{dealTitle}</span>
                      <span className="mx-2">•</span>
                      Filed: {formatDate(dispute.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(dispute.milestone?.amount || dispute.deal?.amount || 0)}
                      </p>
                      <p className="text-xs text-rose-600 font-semibold">Under Dispute</p>
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
