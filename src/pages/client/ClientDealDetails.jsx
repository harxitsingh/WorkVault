import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Clock,
  Plus,
  Shield,
  CreditCard,
  Send,
  Star,
  ExternalLink
} from 'lucide-react';
import { dealService } from '../../services/dealService';
import { milestoneService } from '../../services/milestoneService';
import { disputeService } from '../../services/disputeService';
import { reviewService } from '../../services/reviewService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Avatar from '../../components/common/Avatar';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function ClientDealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', amount: '', dueDate: '' });

  const [showFundModal, setShowFundModal] = useState(null); // stores milestone object to fund
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [confirmApproveMilestone, setConfirmApproveMilestone] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  const [showRevisionModal, setShowRevisionModal] = useState(null); // milestone object
  const [revisionNotes, setRevisionNotes] = useState('');

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeData, setDisputeData] = useState({ reason: '', description: '', milestoneId: '' });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const fetchDealAndMilestones = async () => {
    try {
      setLoading(true);
      const [dealData, milestonesData] = await Promise.all([
        dealService.getDealById(id),
        milestoneService.getMilestonesByDeal(id).catch(() => [])
      ]);
      setDeal(dealData);
      setMilestones(milestonesData);
    } catch (err) {
      toast.error(err.message || 'Failed to load deal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealAndMilestones();

    // Handle return from Stripe Checkout redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('funded') === 'true') {
      toast.success('Payment completed! Your escrow funds are being processed and confirmed.', { duration: 5000 });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('cancelled') === 'true') {
      toast.error('Payment checkout was cancelled. Milestone remains unfunded.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [id]);

  // Create Milestone Handler
  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.title || !newMilestone.amount) {
      return toast.error('Please enter title and amount');
    }

    try {
      await milestoneService.createMilestone(id, {
        title: newMilestone.title,
        description: newMilestone.description,
        amount: parseFloat(newMilestone.amount),
        dueDate: newMilestone.dueDate || null
      });
      toast.success('Milestone created successfully!');
      setShowAddMilestone(false);
      setNewMilestone({ title: '', description: '', amount: '', dueDate: '' });
      fetchDealAndMilestones();
    } catch (err) {
      toast.error(err.message || 'Failed to create milestone');
    }
  };

  // Fund Milestone (Stripe or Instant Test Mode)
  const handleFundMilestone = async (useStripeRedirect = true) => {
    if (!showFundModal) return;
    setIsProcessingPayment(true);
    try {
      if (useStripeRedirect) {
        const session = await paymentService.createCheckoutSession({
          milestoneId: showFundModal._id || showFundModal.id
        });
        if (session && session.url) {
          toast.success('Redirecting to Stripe Checkout...');
          window.location.href = session.url;
          return;
        } else {
          throw new Error('No Stripe checkout session URL received from server');
        }
      }

      // Test sandbox funding (if enabled via dev flag)
      await milestoneService.fundMilestone(showFundModal._id || showFundModal.id);
      toast.success(`₹${showFundModal.amount.toLocaleString('en-IN')} deposited into Escrow!`);
      setShowFundModal(null);
      fetchDealAndMilestones();
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Approve Milestone & Release Payment
  const handleConfirmApprove = async () => {
    if (!confirmApproveMilestone) return;
    try {
      setIsApproving(true);
      await milestoneService.approveAndReleaseMilestone(confirmApproveMilestone._id || confirmApproveMilestone.id);
      toast.success('Milestone approved! Funds released to freelancer.');
      setConfirmApproveMilestone(null);
      fetchDealAndMilestones();
    } catch (err) {
      toast.error(err.message || 'Failed to approve milestone');
    } finally {
      setIsApproving(false);
    }
  };

  // Request Revision
  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!revisionNotes) return toast.error('Please describe requested revisions');

    try {
      await milestoneService.requestMilestoneRevision(showRevisionModal._id || showRevisionModal.id, {
        revisionNotes
      });
      toast.success('Revision requested. Milestone status updated.');
      setShowRevisionModal(null);
      setRevisionNotes('');
      fetchDealAndMilestones();
    } catch (err) {
      toast.error(err.message || 'Failed to request revision');
    }
  };

  // Raise Dispute
  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    if (!disputeData.reason) return toast.error('Please specify a dispute reason');

    try {
      await disputeService.createDispute({
        dealId: id,
        milestoneId: disputeData.milestoneId || null,
        reason: disputeData.reason,
        description: disputeData.description
      });
      toast.success('Dispute raised. Milestone and funds have been frozen for admin review.');
      setShowDisputeModal(false);
      setDisputeData({ reason: '', description: '', milestoneId: '' });
      fetchDealAndMilestones();
    } catch (err) {
      toast.error(err.message || 'Failed to raise dispute');
    }
  };

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await reviewService.createReview({
        dealId: id,
        serviceId: deal.service?._id || deal.serviceId || deal.service,
        targetUser: deal.freelancer?._id || deal.freelancerId || deal.freelancer,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      toast.success('Review submitted successfully! Thank you for rating the freelancer.');
      setShowReviewModal(false);
      fetchDealAndMilestones();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800">Deal not found</h2>
        <Link to="/client/deals" className="mt-4 inline-block text-indigo-600 font-medium">
          ← Back to Deals
        </Link>
      </div>
    );
  }

  const freelancer = deal.freelancer || {};
  const isDealDisputed = deal.status === 'DISPUTED';
  const isDealFinished = ['RELEASED', 'APPROVED', 'completed'].includes(deal.status);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-2">
        <Link to="/client/dashboard" className="hover:text-indigo-600">Dashboard</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/client/deals" className="hover:text-indigo-600">Deals</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-semibold">{deal.title}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{deal.title}</h1>
            <StatusBadge status={deal.status} />
          </div>
          <p className="text-gray-600 mt-1 max-w-2xl">{deal.description || 'Project deal with milestone escrow protection.'}</p>
        </div>

        <div className="flex items-center gap-3">
          {!isDealDisputed && !isDealFinished && (
            <button
              onClick={() => {
                setDisputeData({ reason: '', description: '', milestoneId: '' });
                setShowDisputeModal(true);
              }}
              className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm font-semibold rounded-lg transition-colors flex items-center"
            >
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Raise Dispute
            </button>
          )}

          {isDealFinished && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center"
            >
              <Star className="w-4 h-4 mr-1.5" />
              Rate & Review Freelancer
            </button>
          )}

          <button
            onClick={() => setShowAddMilestone(true)}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-xl transition-colors flex items-center shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Milestone
          </button>
        </div>
      </div>

      {/* Main Grid: Milestones & Freelancer Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Milestone Lifecycle */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 text-indigo-600 mr-2" />
                Project Milestones & Escrow ({milestones.length})
              </h2>
              <span className="text-xs text-gray-500 font-medium">Escrow Protected</span>
            </div>

            {milestones.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-800">No milestones defined yet</p>
                <p className="text-sm mt-1">Add your first milestone to define deliverables and fund escrow.</p>
                <button
                  onClick={() => setShowAddMilestone(true)}
                  className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100"
                >
                  Create Milestone
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((m, idx) => {
                  const mStatus = (m.status || '').toUpperCase();
                  const isPending = mStatus === 'PENDING';
                  const isFunded = mStatus === 'FUNDED';
                  const isInProgress = mStatus === 'IN_PROGRESS';
                  const isSubmitted = mStatus === 'SUBMITTED';
                  const isReleased = mStatus === 'RELEASED';
                  const isDisputed = mStatus === 'DISPUTED';

                  return (
                    <div
                      key={m._id || m.id || idx}
                      className={`border rounded-xl p-5 transition-all ${
                        isSubmitted
                          ? 'border-amber-300 bg-amber-50/20'
                          : isReleased
                            ? 'border-emerald-200 bg-emerald-50/10'
                            : isDisputed
                              ? 'border-rose-300 bg-rose-50/10'
                              : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                              {m.order || idx + 1}
                            </span>
                            <h3 className="font-bold text-gray-900 text-base">{m.title}</h3>
                          </div>
                          {m.description && <p className="text-sm text-gray-600 mt-1 pl-8">{m.description}</p>}
                        </div>

                        <div className="text-right sm:shrink-0">
                          <p className="text-lg font-black text-slate-900">{formatCurrency(m.amount)}</p>
                          <div className="mt-1 flex justify-end">
                            <StatusBadge status={m.status} />
                          </div>
                        </div>
                      </div>

                      {/* Milestone metadata: Due date, submission files */}
                      <div className="mt-3 pl-8 text-xs text-gray-500 flex flex-wrap gap-4 border-t border-gray-100 pt-3">
                        {m.dueDate && (
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            Due: {formatDate(m.dueDate)}
                          </span>
                        )}
                        {m.submittedAt && (
                          <span className="flex items-center text-amber-700">
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Submitted: {formatDate(m.submittedAt)}
                          </span>
                        )}
                        {m.releasedAt && (
                          <span className="flex items-center text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Released: {formatDate(m.releasedAt)}
                          </span>
                        )}
                      </div>

                      {/* Submitted Work Delivery Block */}
                      {isSubmitted && m.submission && (
                        <div className="mt-4 ml-8 p-4 bg-white border border-amber-200 rounded-lg shadow-sm">
                          <h4 className="font-bold text-gray-900 text-sm flex items-center mb-1 text-amber-900">
                            <FileText className="w-4 h-4 mr-1.5 text-amber-600" />
                            Deliverables Submitted by Freelancer
                          </h4>
                          {m.submission.message && (
                            <p className="text-sm text-gray-700 italic mt-1 bg-amber-50/50 p-2.5 rounded border border-amber-100">
                              "{m.submission.message}"
                            </p>
                          )}
                          {m.submission.files && m.submission.files.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-semibold text-gray-600">Attached Deliverable Files:</p>
                              {m.submission.files.map((f, fi) => (
                                <a
                                  key={fi}
                                  href={f.fileUrl || f}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded mr-2"
                                >
                                  <Download className="w-3.5 h-3.5 mr-1" />
                                  {f.fileName || `Deliverable File ${fi + 1}`}
                                </a>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-amber-100">
                            <button
                              onClick={() => setConfirmApproveMilestone(m)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-xs"
                            >
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              Approve & Release Payment
                            </button>
                            <button
                              onClick={() => {
                                setShowRevisionModal(m);
                                setRevisionNotes('');
                              }}
                              className="px-3.5 py-1.5 border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Request Revision
                            </button>
                            <button
                              onClick={() => {
                                setDisputeData({ reason: '', description: '', milestoneId: m._id || m.id });
                                setShowDisputeModal(true);
                              }}
                              className="px-3.5 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Dispute Milestone
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Button: Fund Escrow if PENDING */}
                      {isPending && (
                        <div className="mt-3 pl-8 flex gap-3">
                          <button
                            onClick={() => setShowFundModal(m)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                            Fund Milestone ({formatCurrency(m.amount)})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Freelancer Info & Financial Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-slate-900 text-base mb-4">Assigned Freelancer</h3>
            <div className="flex items-center space-x-3 mb-4">
              <Avatar
                src={freelancer.profileImage || freelancer.avatar}
                name={freelancer.name}
                size="lg"
              />
              <div>
                <h4 className="font-bold text-slate-900">{freelancer.name || 'Freelancer'}</h4>
                <p className="text-xs text-slate-500">{freelancer.title || 'Verified Specialist'}</p>
                <Link
                  to={`/freelancer/${freelancer._id || freelancer.id}`}
                  className="text-xs text-brand-primary hover:underline mt-0.5 inline-flex items-center"
                >
                  View Trust Profile <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Rating</span>
                <span className="font-semibold text-gray-900 flex items-center">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                  {freelancer.rating || 5.0} / 5.0
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Trust</span>
                <span className="font-semibold text-emerald-600">98% Verified</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 text-base mb-4">Financial Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total Deal Value</span>
                <span className="font-bold text-gray-900">{formatCurrency(deal.amount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Milestones Total</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(milestones.reduce((s, m) => s + (m.amount || 0), 0))}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Held in Escrow</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(
                    milestones
                      .filter(m => ['FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'DISPUTED'].includes((m.status || '').toUpperCase()))
                      .reduce((s, m) => s + (m.amount || 0), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-2">
                <span>Released to Freelancer</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(
                    milestones
                      .filter(m => (m.status || '').toUpperCase() === 'RELEASED')
                      .reduce((s, m) => s + (m.amount || 0), 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD MILESTONE */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Create Project Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Wireframes & User Journey"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Deliverable</label>
                <textarea
                  rows={2}
                  placeholder="Describe specific outputs expected"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="10000"
                    value={newMilestone.amount}
                    onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FUND ESCROW (STRIPE OR SIMULATED) */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 text-indigo-600 mr-2" />
              Fund Milestone into Escrow
            </h3>
            <p className="text-sm text-gray-600">
              Deposit <span className="font-bold text-gray-900">{formatCurrency(showFundModal.amount)}</span> into WorkVault Escrow for milestone:
              <br />
              <strong className="text-indigo-900 font-semibold">{showFundModal.title}</strong>.
            </p>
            <p className="text-xs text-gray-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
              Funds are held safely in escrow until you approve the delivered work. Neither party can withdraw without approval or dispute resolution.
            </p>

            <div className="space-y-2 pt-2">
              <button
                disabled={isProcessingPayment}
                onClick={() => handleFundMilestone(true)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center shadow-sm"
              >
                {isProcessingPayment ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹{showFundModal.amount.toLocaleString('en-IN')} via Stripe Checkout
                  </>
                )}
              </button>

              {import.meta.env.VITE_ENABLE_ESCROW_SANDBOX === 'true' && (
                <button
                  disabled={isProcessingPayment}
                  onClick={() => handleFundMilestone(false)}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition-colors flex items-center justify-center border border-slate-200"
                >
                  Deposit ₹{showFundModal.amount.toLocaleString('en-IN')} (Dev Test Sandbox)
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowFundModal(null)}
                className="w-full py-2 text-center text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST REVISION */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Request Revision</h3>
            <p className="text-xs text-gray-600">
              Detail the adjustments needed for milestone: <strong>{showRevisionModal.title}</strong>
            </p>
            <form onSubmit={handleRequestRevision} className="space-y-3">
              <textarea
                rows={4}
                required
                placeholder="Specific changes requested..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(null)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold"
                >
                  Submit Revision Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RAISE DISPUTE */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-rose-700 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Raise Dispute to Platform Admin
            </h3>
            <p className="text-xs text-gray-600">
              When a dispute is opened, milestone payments are frozen. A WorkVault admin will review submitted evidence and decide whether to refund you or release funds to the freelancer.
            </p>

            <form onSubmit={handleRaiseDispute} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dispute Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incomplete work, missed deadline, non-responsive"
                  value={disputeData.reason}
                  onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Explanation</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue in detail for admin investigation..."
                  value={disputeData.description}
                  onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold"
                >
                  Open Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT REVIEW */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Star className="w-5 h-5 text-amber-500 mr-2" />
              Rate Your Experience
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewData.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Review</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share feedback on communication, quality of delivery, and speed..."
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg text-sm font-semibold"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM APPROVE MODAL */}
      <ConfirmModal
        isOpen={Boolean(confirmApproveMilestone)}
        onClose={() => setConfirmApproveMilestone(null)}
        onConfirm={handleConfirmApprove}
        title="Approve Work & Release Payment"
        message={`Are you sure you want to approve "${confirmApproveMilestone?.title}" and release ${confirmApproveMilestone ? formatCurrency(confirmApproveMilestone.amount) : ''} from escrow to the freelancer? This release is irreversible.`}
        confirmText="Release Funds"
        variant="warning"
        loading={isApproving}
      />
    </div>
  );
}
