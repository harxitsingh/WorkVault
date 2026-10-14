import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, FileText, CheckCircle2, XCircle, Download, ShieldAlert, ArrowLeft, Scale } from 'lucide-react';
import { disputeService } from '../../services/disputeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminDisputeDetails() {
  const { id } = useParams();

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(null); // 'REFUND_CLIENT' or 'RELEASE_FREELANCER'
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchDispute = useCallback(async () => {
    try {
      setLoading(true);
      const data = await disputeService.getDisputeById(id);
      setDispute(data);
    } catch (err) {
      console.error('Failed to load dispute:', err);
      toast.error('Failed to load dispute details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDispute();
  }, [fetchDispute]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!showResolveModal) return;
    if (!resolutionNotes.trim()) {
      return toast.error('Please enter resolution notes explaining the decision.');
    }

    try {
      setIsResolving(true);
      await disputeService.resolveDispute(id, {
        decision: showResolveModal,
        resolutionNotes: resolutionNotes.trim()
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
      <div className="p-8 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-slate-800">Dispute case not found</h2>
        <Link to="/admin/disputes" className="mt-4 inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Disputes Queue
        </Link>
      </div>
    );
  }

  const deal = dispute.deal || {};
  const milestone = dispute.milestone || {};
  const amount = milestone.amount || deal.amount || 0;
  const isResolved = (dispute.status || '').toUpperCase() === 'RESOLVED';
  const raisedByName = dispute.raisedBy?.name || 'User';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-slate-500">
        <Link to="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400" />
        <Link to="/admin/disputes" className="hover:text-primary transition-colors">Disputes Queue</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-[200px]">
          Case #{dispute.id ? dispute.id.substring(0, 8) : dispute._id}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border border-slate-200 border-t-4 border-t-rose-500 shadow-xs">
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{dispute.reason}</h1>
                    <StatusBadge status={dispute.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Filed on {formatDate(dispute.createdAt)} by <strong className="text-slate-700">{raisedByName}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Contested Sum</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(amount)}</span>
                </div>
              </div>

              {/* Claim Statement */}
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-rose-600" />
                  Claim Statement
                </h3>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {dispute.description || 'No detailed statement provided.'}
                </p>
              </div>

              {/* Admin Resolution Summary */}
              {isResolved && (
                <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Arbitration Verdict: {dispute.adminDecision || 'RESOLVED'}
                  </h3>
                  <p className="text-sm text-emerald-950 font-medium leading-relaxed">{dispute.resolution}</p>
                  <p className="text-xs text-emerald-700 mt-2 font-medium">
                    Arbitrated on {formatDate(dispute.resolvedAt || dispute.updatedAt)}
                  </p>
                </div>
              )}

              {/* Evidence Section */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Submitted Evidence Records ({dispute.evidence?.length || 0})
                </h3>

                {!dispute.evidence || dispute.evidence.length === 0 ? (
                  <div className="p-6 bg-slate-50/60 rounded-xl border border-slate-200/60 text-center text-xs text-slate-500">
                    No attachments submitted by either party.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dispute.evidence.map((ev, i) => (
                      <div key={i} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900 truncate">{ev.fileName || `Evidence #${i + 1}`}</p>
                          {ev.note && <p className="text-xs text-slate-600 italic mt-1 leading-relaxed">"{ev.note}"</p>}
                        </div>
                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center text-xs font-bold text-primary hover:underline gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> View / Download Document
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Parties & Actions */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Project & Parties</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Project</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{deal.title || 'Deal'}</p>
                <p className="text-xs text-slate-500 mt-0.5">Budget: {formatCurrency(deal.amount || 0)}</p>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Client</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{deal.client?.name || 'Client'}</p>
                <p className="text-xs text-slate-500">{deal.client?.email || ''}</p>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Freelancer</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{deal.freelancer?.name || 'Freelancer'}</p>
                <p className="text-xs text-slate-500">{deal.freelancer?.email || ''}</p>
              </div>
            </div>
          </Card>

          {/* Action Box: Arbitration Decisions */}
          {!isResolved ? (
            <Card className="p-6 space-y-4 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Arbitration Enforcement
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Executing a decision will automatically release or refund the contested escrow funds according to policy.
              </p>

              <div className="space-y-2.5 pt-2">
                <Button
                  variant="danger"
                  className="w-full justify-center gap-2"
                  onClick={() => {
                    setShowResolveModal('REFUND_CLIENT');
                    setResolutionNotes('Evidence supports client claim. Escrow funds refunded to client.');
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  Refund Escrow to Client
                </Button>

                <Button
                  variant="primary"
                  className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setShowResolveModal('RELEASE_FREELANCER');
                    setResolutionNotes('Deliverables verified and compliant with milestone terms. Funds released to freelancer.');
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Release Escrow to Freelancer
                </Button>
              </div>
            </Card>
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-950 text-sm">Dispute Case Closed</h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Escrow balances have been disbursed according to ruling: <strong>{dispute.adminDecision}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      <Modal
        isOpen={Boolean(showResolveModal)}
        onClose={() => setShowResolveModal(null)}
        title={showResolveModal === 'REFUND_CLIENT' ? 'Confirm Escrow Refund to Client' : 'Confirm Escrow Release to Freelancer'}
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="text-slate-500">Contested Escrow Sum:</p>
            <p className="text-lg font-black text-slate-900">{formatCurrency(amount)}</p>
            <p className="text-slate-500 mt-1">
              Action: <strong className={showResolveModal === 'REFUND_CLIENT' ? 'text-rose-600' : 'text-emerald-600'}>
                {showResolveModal === 'REFUND_CLIENT' ? 'Return funds to Client' : 'Disburse funds to Freelancer'}
              </strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Arbitration Ruling Rationale (Recorded to Audit Trail)
            </label>
            <textarea
              rows={3}
              required
              placeholder="State the findings from provided evidence..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowResolveModal(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={showResolveModal === 'REFUND_CLIENT' ? 'danger' : 'primary'}
              size="sm"
              disabled={isResolving}
            >
              {isResolving ? <LoadingSpinner size="sm" /> : 'Confirm & Execute Ruling'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
