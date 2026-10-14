import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { disputeService } from '../../services/disputeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
        if (isMounted) setDisputes(data);
      } catch (err) {
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

  const getStatusColor = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'OPEN': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'UNDER_REVIEW': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disputes Management & Arbitration</h1>
        <p className="text-slate-600 mt-1">Review evidence from clients and freelancers, enforce platform rules, and resolve escrow funds.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center bg-slate-50 gap-4">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['All', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status === 'All' ? 'All Disputes' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No disputes found</p>
            <p className="text-sm mt-1">Disputes raised by clients or freelancers will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((dispute) => {
              const deal = dispute.deal || {};
              const raisedByName = dispute.raisedBy?.name || dispute.openedByName || 'User';
              const againstName = dispute.againstUser?.name || 'Party';
              const amount = dispute.milestone?.amount || deal.amount || 0;

              return (
                <div
                  key={dispute.id || dispute._id}
                  className="p-6 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-rose-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-slate-900">{dispute.reason}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(dispute.status)}`}>
                          {dispute.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Project: <span className="font-medium text-slate-900">{deal.title || 'Deal'}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Raised by: <span className="font-medium text-slate-700">{raisedByName}</span> against <span className="font-medium text-slate-700">{againstName}</span> • {formatDate(dispute.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Contested Escrow</p>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(amount)}</p>
                    </div>
                    <Link
                      to={`/admin/disputes/${dispute.id || dispute._id}`}
                      className="inline-flex items-center px-4 py-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                      Arbitrate <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
