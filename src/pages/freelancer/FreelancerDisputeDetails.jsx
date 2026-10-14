import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Upload, FileText, AlertTriangle, CheckCircle, Download, ArrowLeft } from 'lucide-react';
import { disputeService } from '../../services/disputeService';
import { statsService } from '../../services/statsService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function FreelancerDisputeDetails() {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceFile && !evidenceNote.trim()) {
      return toast.error('Please upload a file or write an explanatory note');
    }

    try {
      setIsUploading(true);
      let fileUrl = '';
      let fileName = 'Counter-Evidence Note';
      let size = 0;
      let mimeType = 'text/plain';

      if (evidenceFile) {
        const uploadRes = await statsService.uploadFile(evidenceFile, 'dispute_evidence');
        fileUrl = uploadRes.fileUrl || uploadRes.url;
        fileName = evidenceFile.name;
        size = evidenceFile.size;
        mimeType = evidenceFile.type;
      }

      await disputeService.addEvidence(id, {
        url: fileUrl,
        fileName,
        size,
        mimeType,
        note: evidenceNote.trim()
      });

      toast.success('Counter-evidence successfully submitted for administrative review');
      setShowEvidenceModal(false);
      setEvidenceFile(null);
      setEvidenceNote('');
      fetchDispute();
    } catch (err) {
      toast.error(err.message || 'Failed to submit counter-evidence');
    } finally {
      setIsUploading(false);
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
        <h2 className="text-xl font-bold text-slate-800">Dispute record not found</h2>
        <p className="text-sm text-slate-500 mt-2">The dispute case requested may have been resolved or archived.</p>
        <Link to="/freelancer/disputes" className="mt-4 inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Disputes
        </Link>
      </div>
    );
  }

  const deal = dispute.deal || {};
  const milestone = dispute.milestone || {};
  const isResolved = (dispute.status || '').toUpperCase() === 'RESOLVED';
  const amount = milestone.amount || deal.amount || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-xs text-slate-500">
        <Link to="/freelancer/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400" />
        <Link to="/freelancer/disputes" className="hover:text-primary transition-colors">Disputes</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-[200px]">
          Case #{dispute.id ? dispute.id.substring(0, 8) : dispute._id}
        </span>
      </nav>

      {/* Main Dispute Card */}
      <Card className="overflow-hidden border border-slate-200 border-t-4 border-t-rose-500 shadow-xs">
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{dispute.reason}</h1>
                <StatusBadge status={dispute.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Opened on {formatDate(dispute.createdAt)} • Project:{' '}
                <Link to={`/freelancer/deals/${deal.id || deal._id}`} className="font-semibold text-primary hover:underline">
                  {deal.title || 'Deal'}
                </Link>
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Contested Sum</span>
              <span className="text-xl font-black text-slate-900">{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* Dispute Description */}
          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
            <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Claim Statement from Client
            </h3>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {dispute.description || 'No detailed statement provided.'}
            </p>
          </div>

          {/* Resolution Banner if Resolved */}
          {isResolved && (
            <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Administrator Decision: {dispute.adminDecision || 'RESOLVED'}
              </h3>
              <p className="text-sm text-emerald-950 font-medium leading-relaxed">{dispute.resolution}</p>
              {dispute.resolvedAt && (
                <p className="text-xs text-emerald-700 mt-2 font-medium">Arbitrated on {formatDate(dispute.resolvedAt)}</p>
              )}
            </div>
          )}

          {/* Evidence Section */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Evidence & Documentation ({dispute.evidence?.length || 0})
              </h3>
              {!isResolved && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEvidenceModal(true)}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Submit Counter-Evidence
                </Button>
              )}
            </div>

            {!dispute.evidence || dispute.evidence.length === 0 ? (
              <div className="p-6 bg-slate-50/60 rounded-xl border border-slate-200/60 text-center text-xs text-slate-500">
                No attachments submitted yet. Attach files, delivery screenshots, or work files to support your case.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dispute.evidence.map((ev, i) => (
                  <div key={i} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate">{ev.fileName || `Attachment ${i + 1}`}</p>
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

      {/* Modal: Submit Counter Evidence */}
      <Modal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        title="Submit Counter-Evidence for Review"
      >
        <form onSubmit={handleUploadEvidence} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Work Artifact or Screenshots
            </label>
            <input
              type="file"
              onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">Accepts images, code snippets, PDFs, and ZIP archives up to 10MB.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Response & Clarification for Administrator
            </label>
            <textarea
              rows={3}
              placeholder="Explain how work complies with initial deal specifications..."
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEvidenceModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isUploading}
            >
              {isUploading ? <LoadingSpinner size="sm" /> : 'Submit to Admin'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
