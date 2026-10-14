import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ChevronRight, Plus, X, Trash2, Upload } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { serviceService } from '../../services/serviceService';
import { statsService } from '../../services/statsService';
import { getImageUrl, handleImageError, DEFAULT_SERVICE_IMAGE } from '../../utils/imageHelper';

const CATEGORIES = [
  'Web Development', 'Mobile App Development', 'UI/UX Design', 
  'Logo Design', 'Digital Marketing', 'Content Writing', 
  'SEO', 'Video Editing', 'Data Entry', 'Virtual Assistant'
];

const DELIVERY_TIMES = [
  { value: 1, label: '1 Day' },
  { value: 2, label: '2 Days' },
  { value: 3, label: '3 Days' },
  { value: 5, label: '5 Days' },
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
  { value: 21, label: '21 Days' },
  { value: 30, label: '30 Days' }
];

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      category: '',
      description: '',
      price: '',
      deliveryTime: 3,
      included: [{ value: '' }],
      requirements: [{ value: '' }]
    }
  });

  const { fields: includedFields, append: appendIncluded, remove: removeIncluded } = useFieldArray({
    control,
    name: "included"
  });

  const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
    control,
    name: "requirements"
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const service = await serviceService.getServiceById(id);
        if (service) {
          const days = service.deliveryDays || parseInt(service.deliveryTime) || 3;
          reset({
            title: service.title || '',
            category: service.category || 'Web Development',
            description: service.description || '',
            price: service.price || '',
            deliveryTime: days,
            included: service.includes && service.includes.length > 0 
              ? service.includes.map(i => ({ value: i })) 
              : [{ value: '' }],
            requirements: service.requirements && service.requirements.length > 0 
              ? service.requirements.map(r => ({ value: r })) 
              : [{ value: '' }]
          });
          setTags(service.tags || []);
          setImageUrl(service.image || '');
        }
      } catch (error) {
        toast.error('Service not found or inaccessible');
        navigate('/freelancer/services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [id, reset, navigate]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await statsService.uploadFile(file, 'service');
      const url = res?.url || res?.fullUrl || res?.fileUrl;
      setImageUrl(url);
      toast.success('Service cover image updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        category: data.category,
        description: data.description.trim(),
        price: Number(data.price),
        deliveryDays: Number(data.deliveryTime) || 7,
        deliveryTime: `${data.deliveryTime || 7} days`,
        image: imageUrl || DEFAULT_SERVICE_IMAGE,
        tags: tags || [],
        includes: data.included ? data.included.map(i => i.value).filter(Boolean) : [],
        requirements: data.requirements ? data.requirements.map(r => r.value).filter(Boolean) : []
      };

      await serviceService.updateService(id, payload);
      toast.success('Service updated successfully!');
      navigate('/freelancer/services');
    } catch (error) {
      toast.error(error.message || 'Failed to update service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await serviceService.deleteService(id);
      toast.success('Service deleted successfully');
      navigate('/freelancer/services');
    } catch (error) {
      toast.error(error.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <Link to="/freelancer" className="hover:text-indigo-600">Dashboard</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link to="/freelancer/services" className="hover:text-indigo-600">My Services</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-slate-900 font-medium">Edit Service</span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Service</h1>
          <p className="text-slate-500">Update details for your offering.</p>
        </div>
        <Button variant="danger" className="bg-red-50 text-red-600 border-none hover:bg-red-100 flex items-center gap-2" onClick={() => setShowDeleteModal(true)}>
          <Trash2 size={16} />
          <span>Delete</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">1. Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Title *</label>
              <input
                type="text"
                {...register("title", { required: "Title is required", minLength: { value: 5, message: "Minimum 5 characters" } })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select
                {...register("category", { required: "Category is required" })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea
                {...register("description", { required: "Description is required" })}
                rows="6"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>
        </Card>

        {/* Section 2: Pricing & Delivery */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">2. Pricing & Delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (INR) *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">₹</span>
                <input
                  type="number"
                  {...register("price", { required: "Price is required", min: { value: 1, message: "Price must be positive" } })}
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Time *</label>
              <select
                {...register("deliveryTime")}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {DELIVERY_TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Section 3: Details */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">3. Details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">What's Included</label>
              <div className="space-y-2">
                {includedFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`included.${index}.value`)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button type="button" onClick={() => removeIncluded(index)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg">
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => appendIncluded({ value: '' })} className="text-indigo-600 text-sm font-medium mt-2 flex items-center">
                  <Plus size={16} className="mr-1" /> Add Item
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Requirements</label>
              <div className="space-y-2">
                {reqFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`requirements.${index}.value`)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button type="button" onClick={() => removeReq(index)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg">
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => appendReq({ value: '' })} className="text-indigo-600 text-sm font-medium mt-2 flex items-center">
                  <Plus size={16} className="mr-1" /> Add Requirement
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags / Skills</label>
              <div className="border border-slate-300 rounded-lg p-2 bg-white flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-sm flex items-center">
                    {tag}
                    <button type="button" onClick={() => removeTag(index)} className="ml-1.5 hover:text-indigo-900">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 outline-none min-w-[150px] p-1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: Service Image */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">4. Service Image</h2>
          {imageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 group max-w-md">
              <img
                src={getImageUrl(imageUrl, 'service')}
                alt="Service Cover Preview"
                onError={(e) => handleImageError(e, 'service')}
                className="w-full h-52 object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="cursor-pointer bg-white text-slate-800 text-xs font-bold py-2 px-3 rounded-lg shadow hover:bg-slate-100">
                  Change Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="bg-rose-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow hover:bg-rose-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50 text-center cursor-pointer transition-colors block">
              <Upload size={32} className="text-slate-400 mb-3 mx-auto" />
              <p className="text-slate-700 font-medium mb-1">
                {isUploading ? 'Uploading image...' : 'Click to select or drag and drop a service cover image'}
              </p>
              <p className="text-slate-400 text-xs mb-3">PNG, JPG, WEBP, GIF up to 5MB</p>
              <span className="inline-block px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors">
                {isUploading ? 'Processing...' : 'Browse Images'}
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
            </label>
          )}
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting || isDeleting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isDeleting}>
            {isSubmitting ? 'Updating...' : 'Update Service'}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Service?</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this service? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EditService;
