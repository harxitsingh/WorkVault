import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Clock,
  Shield,
  Upload,
  Send,
  Play
} from 'lucide-react';
import { dealService } from '../../services/dealService';
import { milestoneService } from '../../services/milestoneService';
import { disputeService } from '../../services/disputeService';
import { statsService } from '../../services/statsService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

export default function FreelancerDealDetails() {
  const { id } = useParams();

  const [deal, setDeal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Deliverable Modal
  const [submitModalMilestone, setSubmitModalMilestone] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dispute Modal
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeData, setDisputeData] = useState({ reason: '', description: '', milestoneId: '' });

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
  }, [id]);

  // Start Working on Milestone
  const handleStartWork = async (milestoneId) => {
    try {
      await milestoneService.startMilestoneWork(milestoneId);
      toast.success('Milestone status updated to In Progress. Happy coding!');
      fetchDealAndMilestones();
    } catch (err) {
      toast.error(err.message || 'Failed to start work on milestone');
    }
  };

  // Upload Deliverable File
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await statsService.uploadFile(file, 'deliverable');
      setUploadedFiles(prev => [
        ...prev,
        {
          fileName: res.originalName || file.name,
          fileUrl: res.fileUrl || res.url,
          size: res.size || file.size,
          mimeType: res.mimetype || file.type
        }
      ]);
      toast.success(`Attached "${file.name}"`);
    } catch (err) {
      toast.error('File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Milestone Work
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submitModalMilestone) return;

    try {
      setIsSubmitting(true);
      await milestoneService.submitMilestoneWork(submitModalMilestone._id || submitModalMilestone.id, {
        message: submitMessage,
        files: uploadedFiles
      });
      toast.success('Work deliverables submitted to client for approval!');
      setSubmitModalMilestone(null);
      setSubmitMessage('');
      setUploadedFiles([]);
      fetchDealAndMilestones();
    } catch (err) {
      toast.error(err.message || 'Failed to submit milestone work');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Raise Dispute
  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    if (!disputeData.reason) return toast.error('Please specify dispute reason');

    try {
      await disputeService.createDispute({
        dealId: id,
        milestoneId: disputeData.milestoneId || null,
        reason: disputeData.reason,
        description: disputeData.description
      });
      toast.success('Dispute raised. Admin will review the project.');
      setShowDisputeModal(false);
      setDisputeData({ reason: '', description: '', milestoneId: '' });
      fetchDealAndMilestones();
    } catch (err) {
      toast.error(err.message || 'Failed to raise dispute');
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
        <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
        <Link to="/freelancer/deals" className="mt-4 inline-block text-indigo-600 font-medium">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const client = deal.client || {};
  const isDealDisputed = deal.status === 'DISPUTED';

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-2">
        <Link to="/freelancer/dashboard" className="hover:text-indigo-600">Dashboard</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/freelancer/deals" className="hover:text-indigo-600">Orders</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-semibold">{deal.title}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-100 text-indigo-800">
              {deal.status}
            </span>
          </div>
          <p className="text-gray-600 mt-1 max-w-2xl">{deal.description || 'Project deliverables and milestone execution.'}</p>
        </div>

        <div className="flex items-center gap-3">
          {!isDealDisputed && (
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
        </div>
      </div>

      {/* Main Grid: Milestones & Client Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Milestone Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 text-indigo-600 mr-2" />
                Assigned Milestones ({milestones.length})
              </h2>
              <span className="text-xs text-gray-500 font-medium">Escrow Protected Payouts</span>
            </div>

            {milestones.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-800">No milestones created yet by client</p>
                <p className="text-sm mt-1">Once client creates and funds milestones, you can start work.</p>
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
                  const hasRevision = m.submission?.status === 'REVISION_REQUESTED';

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
                              : 'border-gray-200'
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
                          <p className="text-lg font-black text-gray-900">{formatCurrency(m.amount)}</p>
                          <span
                            className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                              isReleased
                                ? 'bg-emerald-100 text-emerald-800'
                                : isSubmitted
                                  ? 'bg-amber-100 text-amber-800'
                                  : isFunded
                                    ? 'bg-blue-100 text-blue-800'
                                    : isDisputed
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                      </div>

                      {/* Milestone Dates */}
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
                            Released to Balance: {formatDate(m.releasedAt)}
                          </span>
                        )}
                      </div>

                      {/* Client Revision Notes */}
                      {hasRevision && (
                        <div className="mt-3 ml-8 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                          <p className="font-bold text-amber-800 mb-0.5">⚠️ Revision Requested by Client:</p>
                          <p className="text-amber-900">{m.submission?.revisionNotes || 'Please adjust according to feedback.'}</p>
                        </div>
                      )}

                      {/* Freelancer Action Buttons */}
                      <div className="mt-4 pl-8 flex flex-wrap gap-3">
                        {isFunded && (
                          <button
                            onClick={() => handleStartWork(m._id || m.id)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5 mr-1.5" />
                            Start Working
                          </button>
                        )}

                        {(isInProgress || hasRevision) && (
                          <button
                            onClick={() => {
                              setSubmitModalMilestone(m);
                              setSubmitMessage('');
                              setUploadedFiles([]);
                            }}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Submit Deliverables
                          </button>
                        )}

                        {isSubmitted && (
                          <span className="text-xs text-amber-700 font-medium bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Awaiting client approval & escrow release
                          </span>
                        )}

                        {isPending && (
                          <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                            Awaiting client escrow funding before starting work
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Client Info & Financials */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 text-base mb-4">Client Information</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg overflow-hidden">
                <img
                  src={getImageUrl(client.profileImage || client.avatar, 'avatar')}
                  alt={client.name || 'Client'}
                  onError={(e) => handleImageError(e, 'avatar')}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{client.name || 'Client'}</h4>
                <p className="text-xs text-gray-500">{client.email || 'Verified Client'}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Client Verification</span>
                <span className="font-semibold text-emerald-600 flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Payment Verified
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 text-base mb-4">Earnings Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total Project Value</span>
                <span className="font-bold text-gray-900">{formatCurrency(deal.amount)}</span>
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
                <span>Net Released Payout</span>
                <span className="font-bold text-emerald-600 text-base">
                  {formatCurrency(
                    milestones
                      .filter(m => (m.status || '').toUpperCase() === 'RELEASED')
                      .reduce((s, m) => s + Math.round(m.amount * 0.9), 0)
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-400">10% WorkVault platform fee deducted on release.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: SUBMIT DELIVERABLES */}
      {submitModalMilestone && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Send className="w-5 h-5 text-emerald-600 mr-2" />
              Submit Milestone Deliverables
            </h3>
            <p className="text-xs text-gray-600">
              Submitting work for: <strong className="text-indigo-900">{submitModalMilestone.title}</strong>
            </p>

            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message to Client</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain completed deliverables, link to live demos, or instructions..."
                  value={submitMessage}
                  onChange={(e) => setSubmitMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Deliverable File Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Attach Files / Deliverables</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    id="deliverableFileInput"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="deliverableFileInput" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs font-semibold text-emerald-600">
                      {isUploading ? 'Uploading file...' : 'Click to upload files (ZIP, PDF, DOCX, PNG)'}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">Maximum file size: 10MB</span>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded border border-gray-200">
                        <span className="font-medium text-gray-800 truncate">{f.fileName}</span>
                        <span className="text-gray-400">({Math.round((f.size || 0) / 1024)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalMilestone(null)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center"
                >
                  {isSubmitting ? <LoadingSpinner size="sm" /> : 'Submit for Client Review'}
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
              When a dispute is opened, milestone payments are frozen. A WorkVault admin will investigate evidence from both parties.
            </p>

            <form onSubmit={handleRaiseDispute} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dispute Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scope creep, client refusal to approve completed work"
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
                  placeholder="Explain why this dispute is being opened..."
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
    </div>
  );
}
