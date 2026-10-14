import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  Star, 
  Clock, 
  ShieldCheck, 
  Check, 
  ChevronRight, 
  Shield, 
  X, 
  User, 
  FileText,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { serviceService } from '../../services/serviceService';
import { dealService } from '../../services/dealService';
import { reviewService } from '../../services/reviewService';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';
import toast from 'react-hot-toast';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('description');
  const [service, setService] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  
  const [orderRequirements, setOrderRequirements] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderDays, setOrderDays] = useState(7);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await serviceService.getServiceById(id);
        if (isMounted && data) {
          setService(data);
          setOrderAmount(data.price || '');
          setOrderDays(data.deliveryTime || data.deliveryDays || 7);
        }

        // Fetch real reviews
        try {
          const revs = await reviewService.getReviewsByService(id);
          if (isMounted) setReviewsList(revs || []);
        } catch {
          if (isMounted) setReviewsList([]);
        }

      } catch (err) {
        if (isMounted) {
          toast.error('Service could not be loaded');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <EmptyState
          title="Service Not Found"
          description="The service you are looking for does not exist or may have been unlisted."
          action={
            <Link to="/services">
              <Button variant="primary">Browse Marketplace</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const freelancer = (typeof service.freelancer === 'object' && service.freelancer) || service.user || {};
  const freelancerName = freelancer.name || service.freelancerName || 'Freelancer';
  const freelancerAvatar = freelancer.avatar || freelancer.profileImage || service.freelancerAvatar;
  const freelancerId = freelancer._id || freelancer.id || service.freelancerId;

  const currentUserId = user?._id || user?.id;
  const isOwnService = currentUserId && freelancerId && String(currentUserId) === String(freelancerId);

  const handleStartDeal = () => {
    if (!user) {
      toast('Please log in as a client to order this service');
      navigate('/login', { state: { returnTo: `/services/${id}` } });
      return;
    }
    if (isOwnService) {
      toast.error('You cannot hire yourself for your own service listing');
      return;
    }
    setShowOrderModal(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!orderRequirements.trim()) {
      return toast.error('Please specify your project requirements');
    }
    try {
      setIsCreatingDeal(true);
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (Number(orderDays) || 7));

      const dealPayload = {
        serviceId: service._id || service.id,
        title: service.title,
        requirements: orderRequirements.trim(),
        amount: Number(orderAmount) || service.price,
        deadline: deadlineDate.toISOString()
      };

      const newDeal = await dealService.createDeal(dealPayload);
      toast.success('Project created! Initializing escrow...');
      setShowOrderModal(false);
      navigate(`/client/deals/${newDeal._id || newDeal.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to initiate project deal');
    } finally {
      setIsCreatingDeal(false);
    }
  };

  const deliveryDisplay = typeof service.deliveryTime === 'number'
    ? `${service.deliveryTime} Days`
    : (service.deliveryTime || (service.deliveryTimeDays ? `${service.deliveryTimeDays} Days` : '3 Days'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-[#2F5BEA]">Home</Link>
        <ChevronRight size={13} className="mx-1.5 text-slate-400" />
        <Link to="/services" className="hover:text-[#2F5BEA]">Services</Link>
        <ChevronRight size={13} className="mx-1.5 text-slate-400" />
        <span className="text-slate-900 truncate max-w-[200px]">{service.category || 'General'}</span>
      </nav>

      {/* Main Grid: Details + Sticky Order Card */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Image, Details, Tabs */}
        <div className="w-full lg:w-2/3 space-y-8 min-w-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 leading-tight tracking-tight">
              {service.title}
            </h1>
            
            <div className="flex items-center flex-wrap gap-4 text-xs sm:text-sm">
              <Link 
                to={freelancerId ? `/freelancer/${freelancerId}` : '#'} 
                className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
              >
                <Avatar name={freelancerName} src={freelancerAvatar} size="sm" />
                <span className="font-bold text-slate-900 group-hover:text-[#2F5BEA] transition-colors">
                  {freelancerName}
                </span>
              </Link>

              <div className="flex items-center text-amber-500">
                <Star size={14} className="fill-amber-400 text-amber-400 mr-1" />
                <span className="font-bold text-slate-800">
                  {Number(service.rating) > 0 ? Number(service.rating).toFixed(1) : 'New'}
                </span>
                {service.reviewCount > 0 && (
                  <span className="text-slate-400 ml-1">({service.reviewCount} reviews)</span>
                )}
              </div>

              <div className="text-slate-300">|</div>
              <span className="text-slate-600 font-medium">{service.category || 'Professional Service'}</span>
            </div>
          </div>

          {/* Hero Service Image */}
          <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-video relative border border-slate-200/80 shadow-2xs">
            <img
              src={getImageUrl(service.image, 'service')}
              alt={service.title}
              onError={(e) => handleImageError(e, 'service')}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex space-x-6">
              {[
                { id: 'description', label: 'Service Overview' },
                { id: 'reviews', label: `Client Reviews (${reviewsList.length})` },
                { id: 'escrow', label: 'Escrow Guarantee' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors focus:outline-none ${
                    activeTab === tab.id 
                      ? 'border-[#2F5BEA] text-[#2F5BEA]' 
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {service.description || 'No detailed description provided for this service.'}
                </div>
                
                {Array.isArray(service.skills) && service.skills.length > 0 && (
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">Target Technologies & Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviewsList.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsList.map((rev) => (
                      <div key={rev._id || rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar name={rev.reviewer?.name || rev.reviewerName || 'Client'} size="sm" />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{rev.reviewer?.name || rev.reviewerName || 'Client'}</p>
                              <p className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-amber-500 text-xs font-bold">
                            <Star size={13} className="fill-amber-400 text-amber-400 mr-1" />
                            <span>{rev.rating || 5}.0</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed mt-1">
                          {rev.comment || rev.text || 'Great execution, delivered as agreed.'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No reviews yet"
                    description="This service does not have client feedback yet. Be the first to complete a deal with this freelancer."
                  />
                )}
              </div>
            )}

            {activeTab === 'escrow' && (
              <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-950">
                  <ShieldCheck className="h-5 w-5 text-[#2F5BEA]" />
                  <span>WorkVault 100% Escrow Protection</span>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed">
                  When you start a deal for this service, your payment is placed safely in escrow. The freelancer will begin working on your milestones, but funds are only released after you inspect and approve the completed delivery.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Pricing & Action Card */}
        <div className="w-full lg:w-1/3 shrink-0">
          <Card className="sticky top-24 p-6 border border-slate-200/90 shadow-md space-y-6">
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Fixed Package Price</p>
                <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(service.price)}</p>
              </div>
              <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Clock size={13} className="mr-1 text-slate-500" />
                <span>{deliveryDisplay}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Formal milestone delivery verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Direct client-freelancer revision iterations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>100% Escrow money-back dispute protection</span>
              </div>
            </div>

            {isOwnService ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-center font-medium">
                You own this service listing.
                <div className="mt-2">
                  <Link to={`/freelancer/services/${service._id || service.id}/edit`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Listing
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full py-3 text-sm font-bold shadow-md"
                onClick={handleStartDeal}
              >
                Start Project Deal
              </Button>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-[#2F5BEA]" />
              <span>Funds held safely until approved</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Start Project Deal Modal */}
      {showOrderModal && (
        <Modal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title="Initiate Escrow Deal"
          size="md"
        >
          <form onSubmit={handleConfirmOrder} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900 truncate">{service.title}</p>
              <p className="text-slate-500">Freelancer: <span className="font-medium text-slate-800">{freelancerName}</span></p>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-xs font-semibold text-slate-700 mb-1">
                Project Requirements & Deliverables *
              </label>
              <textarea
                id="requirements"
                rows={4}
                required
                value={orderRequirements}
                onChange={(e) => setOrderRequirements(e.target.value)}
                placeholder="Explain the specific deliverables, assets, and requirements you need delivered..."
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F5BEA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="deal_amount" className="block text-xs font-semibold text-slate-700 mb-1">
                  Agreed Amount (₹)
                </label>
                <input
                  id="deal_amount"
                  type="number"
                  min="1"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F5BEA]"
                />
              </div>

              <div>
                <label htmlFor="deal_days" className="block text-xs font-semibold text-slate-700 mb-1">
                  Timeline (Days)
                </label>
                <input
                  id="deal_days"
                  type="number"
                  min="1"
                  value={orderDays}
                  onChange={(e) => setOrderDays(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F5BEA]"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900">
              <span className="font-bold">Next Step:</span> After deal creation, you will fund the escrow balance before the freelancer begins work.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowOrderModal(false)}
                disabled={isCreatingDeal}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                size="sm" 
                isLoading={isCreatingDeal}
              >
                Create Deal & Initialize Escrow
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ServiceDetailsPage;
