import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, AlertTriangle, FileText, CheckCircle, XCircle, Download, ShieldAlert, ArrowLeft } from 'lucide-react';
import { disputeService } from '../../services/disputeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDisputeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(null); // 'REFUND_CLIENT' or 'RELEASE_FREELANCER'
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchDispute = async () => {
    try {
      setLoading(true);
      const data = await disputeService.getDisputeById(id);
      setDispute(data);
    } catch (err) {
      toast.error('Failed to load dispute details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispute();
  }, [id]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!showResolveModal) return;

    try {
      setIsResolving(true);
      await disputeService.resolveDispute(id, {
        decision: showResolveModal,
        resolutionNotes
      });
      toast.success(`Dispute resolved! Decision: ${showResolveModal}`);
      setShowResolveModal(null);
      setResolutionNotes('');
      fetchDispute();
    } catch (err) {
      toast.error(err.message || 'Failed to resolve dispute');
    } finally {
      setIsResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Dispute not found</h2>
        <Link to="/admin/disputes" className="mt-4 inline-block text-indigo-600 font-medium">
          ← Back to Disputes
        </Link>
      </div>
    );
  }

  const deal = dispute.deal || {};
  const milestone = dispute.milestone || {};
  const amount = milestone.amount || deal.amount || 0;
  const isResolved = dispute.status === 'RESOLVED';
  const raisedByName = dispute.raisedBy?.name || 'User';

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <Link to="/admin" className="hover:text-indigo-600">Admin</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <Link to="/admin/disputes" className="hover:text-indigo-600">Disputes</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-slate-900 font-semibold">Case #{dispute.id ? dispute.id.substring(0, 8) : dispute._id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-t-4 border-t-rose-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{dispute.reason}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Filed on {formatDate(dispute.createdAt)} by <span className="font-semibold text-slate-700">{raisedByName}</span>
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                isResolved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {dispute.status}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contested Escrow Sum</h3>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(amount)}</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                Funds Frozen
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Claim Statement</h3>
                <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                  {dispute.description || 'No detailed statement provided.'}
                </p>
              </div>

              {isResolved && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" />
                    Admin Resolution: {dispute.adminDecision}
                  </h3>
                  <p className="text-sm text-emerald-950 font-medium">{dispute.resolution}</p>
                  <p className="text-xs text-emerald-700 mt-2">
                    Resolved by admin on {formatDate(dispute.resolvedAt || dispute.updatedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Evidence List */}
            <div className="border-t border-slate-100 pt-6 mt-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                Submitted Evidence Files ({dispute.evidence?.length || 0})
              </h3>

              {!dispute.evidence || dispute.evidence.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No attachments submitted.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dispute.evidence.map((ev, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate">{ev.fileName || `Evidence #${i + 1}`}</p>
                        {ev.note && <p className="text-xs text-slate-600 italic mt-1">"{ev.note}"</p>}
                      </div>
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center text-xs font-bold text-indigo-600 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> View Evidence
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Parties & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Case Parties</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase">Client</p>
                <p className="font-bold text-slate-900">{deal.client?.name || 'Client'}</p>
                <p className="text-xs text-slate-500">{deal.client?.email || ''}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase">Freelancer</p>
                <p className="font-bold text-slate-900">{deal.freelancer?.name || 'Freelancer'}</p>
                <p className="text-xs text-slate-500">{deal.freelancer?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Action Box: Arbitration Decisions */}
          {!isResolved ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <ShieldAlert className="w-5 h-5 text-indigo-600 mr-2" />
                Arbitration Actions
              </h3>
              <p className="text-xs text-slate-500">
                Your decision will automatically update the financial ledger and return or release the frozen escrow funds.
              </p>

              <button
                onClick={() => {
                  setShowResolveModal('REFUND_CLIENT');
                  setResolutionNotes('Evidence supports client claim. Full escrow refunded to client account.');
                }}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center shadow-sm"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Refund Escrow to Client
              </button>

              <button
                onClick={() => {
                  setShowResolveModal('RELEASE_FREELANCER');
                  setResolutionNotes('Work deliverables reviewed and deemed compliant. Funds released to freelancer balance.');
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center shadow-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Release Escrow to Freelancer
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-emerald-900">Case Resolved</h4>
              <p className="text-xs text-emerald-700 mt-1">
                The financial ledger has been updated according to decision: {dispute.adminDecision}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADMIN RESOLUTION CONFIRMATION */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm Resolution: {showResolveModal === 'REFUND_CLIENT' ? 'Refund Client' : 'Release Freelancer'}
            </h3>
            <p className="text-xs text-slate-600">
              Amount to resolve: <strong className="text-slate-900">{formatCurrency(amount)}</strong>
            </p>

            <form onSubmit={handleResolve} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Arbitration Notes (Saved to Ledger)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain legal and policy rationale..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(null)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-semibold flex items-center ${
                    showResolveModal === 'REFUND_CLIENT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isResolving ? <LoadingSpinner size="sm" /> : 'Confirm & Execute Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
