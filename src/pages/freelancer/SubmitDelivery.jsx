import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { dealService } from '../../services/dealService';
import { statsService } from '../../services/statsService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ChevronRight, Upload, X, Link as LinkIcon, FileText, Info } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SubmitDelivery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      message: '',
      links: [{ url: '' }],
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links"
  });

  useEffect(() => {
    let isMounted = true;
    const fetchDeal = async () => {
      try {
        setLoading(true);
        const data = await dealService.getDealById(id);
        if (isMounted) setDeal(data);
      } catch (err) {
        toast.error('Failed to load project details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDeal();
    return () => { isMounted = false; };
  }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await statsService.uploadFile(file, 'deliverable');
      setUploadedFiles(prev => [
        ...prev,
        {
          name: res.originalName || file.name,
          fileName: res.originalName || file.name,
          fileUrl: res.fileUrl || res.url,
          url: res.fileUrl || res.url,
          size: `${Math.round(file.size / 1024)} KB`,
          type: file.type
        }
      ]);
      toast.success(`Attached "${file.name}"`);
    } catch (err) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    setSubmissionData(data);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!deal) return;
    setIsSubmitting(true);
    try {
      const payload = {
        message: submissionData?.message || 'Work deliverables submitted.',
        files: uploadedFiles.map(f => f.fileUrl || f.url || f.name),
        links: submissionData?.links?.map(l => l.url).filter(Boolean) || [],
        notes: submissionData?.notes || ''
      };

      await dealService.submitDelivery(deal.id || deal._id, payload);
      toast.success('Deliverables submitted successfully! Client notified for review.');
      navigate(`/freelancer/deals/${deal.id || deal._id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to submit delivery.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
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
      <div className="p-12 text-center text-slate-500">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Order Not Found</h2>
        <Link to="/freelancer/deals" className="text-indigo-600 font-semibold hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const clientName = deal.client?.name || deal.clientName || 'Client';
  const dealTitle = deal.title || deal.serviceTitle || 'Project';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <Link to="/freelancer" className="hover:text-indigo-600">Dashboard</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link to="/freelancer/deals" className="hover:text-indigo-600">My Orders</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link to={`/freelancer/deals/${deal.id || deal._id}`} className="hover:text-indigo-600">
          Order #{deal.id ? deal.id.substring(0, 8) : deal._id}
        </Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-slate-900 font-medium">Submit Delivery</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submit Final Delivery</h1>
        <p className="text-slate-500">Upload your completed project deliverables and brief the client.</p>
      </div>

      {/* Order Summary Card */}
      <Card className="p-5 bg-indigo-50/50 border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs uppercase font-bold tracking-wider text-indigo-600 mb-1">Client: {clientName}</p>
          <h3 className="font-bold text-slate-900 text-lg">{dealTitle}</h3>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Total Amount</p>
            <p className="font-bold text-slate-900 text-base">{formatCurrency(deal.amount)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Agreed Deadline</p>
            <p className="font-semibold text-slate-900 text-base">{formatDate(deal.deadline)}</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            
            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Summary & Notes *</label>
              <textarea
                {...register("message", { required: "Message is required", minLength: { value: 15, message: "Minimum 15 characters" } })}
                rows="5"
                placeholder="Explain what has been completed, instructions on how to use files, access credentials if any, or next steps..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y text-sm"
              ></textarea>
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Deliverable Files</label>
              
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 text-center mb-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer block">
                <Upload size={32} className="text-slate-400 mb-2 mx-auto" />
                <p className="text-slate-700 font-medium text-sm mb-1">
                  {isUploading ? 'Uploading file...' : 'Click to browse or drop project files here'}
                </p>
                <p className="text-slate-400 text-xs mb-3">ZIP, PDF, PNG, JPG, or design files up to 10MB</p>
                <span className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold hover:bg-indigo-100">
                  {isUploading ? 'Uploading...' : 'Select File'}
                </span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Attached Deliverables ({uploadedFiles.length})</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                          <FileText size={20} />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.name || file.fileName}</p>
                          <p className="text-xs text-slate-500">{file.size}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* External Links */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1">External Links (Optional)</label>
              <p className="text-xs text-slate-500 mb-3">Add links to live demo, GitHub repository, Figma artboards, or Cloud storage.</p>
              
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon size={16} className="text-slate-400" />
                      </div>
                      <input
                        {...register(`links.${index}.url`)}
                        placeholder="https://..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => append({ url: '' })} className="text-indigo-600 text-sm font-medium mt-2 flex items-center">
                  + Add another link
                </button>
              </div>
            </div>

          </div>
        </Card>

        <div className="flex items-center gap-3 bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200/60">
          <Info size={20} className="flex-shrink-0 text-amber-600" />
          <p className="text-xs sm:text-sm">Once submitted, the client will receive an instant notification and will review the deliverables before approving funds release from escrow.</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            Review & Submit
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Submit Delivery to Client?</h3>
            <p className="text-slate-600 text-sm mb-6">Are you sure you are ready to submit this deliverable package? The client will review your submission and release escrow payment upon approval.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Yes, Submit Deliverable'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubmitDelivery;
