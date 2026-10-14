import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Upload, FileText, AlertTriangle, CheckCircle, ShieldAlert, Download } from 'lucide-react';
import { disputeService } from '../../services/disputeService';
import { statsService } from '../../services/statsService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function FreelancerDisputeDetails() {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceFile && !evidenceNote) {
      return toast.error('Please upload a file or write a note');
    }

    try {
      setIsUploading(true);
      let fileUrl = '';
      let fileName = 'Counter Evidence Note';
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
        note: evidenceNote
      });

      toast.success('Counter-evidence successfully submitted for review');
      setShowEvidenceModal(false);
      setEvidenceFile(null);
      setEvidenceNote('');
      fetchDispute();
    } catch (err) {
      toast.error(err.message || 'Failed to submit evidence');
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
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800">Dispute not found</h2>
        <Link to="/freelancer/disputes" className="mt-4 inline-block text-indigo-600 font-medium">
          ← Back to Disputes
        </Link>
      </div>
    );
  }

  const deal = dispute.deal || {};
  const isResolved = dispute.status === 'RESOLVED';

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto min-h-screen space-y-6">
      <nav className="flex items-center text-sm text-gray-500 mb-2">
        <Link to="/freelancer/dashboard" className="hover:text-indigo-600">Dashboard</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/freelancer/disputes" className="hover:text-indigo-600">Disputes</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-semibold">Dispute #{dispute.id ? dispute.id.substring(0, 8) : dispute._id}</span>
      </nav>

      {/* Main Dispute Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-rose-200 p-6 border-t-4 border-t-rose-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dispute.reason}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Opened on {formatDate(dispute.createdAt)} • Project: <span className="font-semibold text-gray-800">{deal.title || 'Deal'}</span>
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

        {/* Dispute Description */}
        <div className="bg-rose-50 p-4 rounded-lg mb-6 border border-rose-100">
          <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1 text-rose-600" />
            Claim Statement from Client
          </h3>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{dispute.description || 'No detailed statement provided.'}</p>
        </div>

        {/* Resolution Banner if Resolved */}
        {isResolved && (
          <div className="bg-emerald-50 p-4 rounded-lg mb-6 border border-emerald-200">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" />
              Administrator Decision: {dispute.adminDecision || 'RESOLVED'}
            </h3>
            <p className="text-sm text-emerald-950 font-medium">{dispute.resolution}</p>
          </div>
        )}

        {/* Evidence Section */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center">
              <FileText className="w-4 h-4 text-indigo-600 mr-2" />
              Submitted Evidence & Notes ({dispute.evidence?.length || 0})
            </h3>
            {!isResolved && (
              <button
                onClick={() => setShowEvidenceModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Submit Counter-Evidence
              </button>
            )}
          </div>

          {!dispute.evidence || dispute.evidence.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No attachments submitted yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dispute.evidence.map((ev, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 truncate">{ev.fileName || `Attachment ${i + 1}`}</p>
                    {ev.note && <p className="text-xs text-gray-600 italic mt-1">"{ev.note}"</p>}
                  </div>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-xs font-bold text-indigo-600 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> View / Download File
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: SUBMIT COUNTER EVIDENCE */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Upload className="w-5 h-5 text-indigo-600 mr-2" />
              Submit Counter-Evidence
            </h3>

            <form onSubmit={handleUploadEvidence} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Upload Work / Proof (Screenshots, Deliverables, Chat)</label>
                <input
                  type="file"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Response & Explanation for Admin</label>
                <textarea
                  rows={3}
                  placeholder="Explain why the claim is inaccurate, reference agreed terms, or provide status update..."
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center"
                >
                  {isUploading ? <LoadingSpinner size="sm" /> : 'Submit to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
