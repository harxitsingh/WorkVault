import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { services } from '../../data/services';
import { users } from '../../data/users';
import { reviews } from '../../data/reviews';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { Star, Clock, Shield, Check, ChevronRight, MessageSquare, MapPin, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

import { serviceService } from '../../services/serviceService';
import { dealService } from '../../services/dealService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('description');
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const [orderRequirements, setOrderRequirements] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderDays, setOrderDays] = useState(7);

  React.useEffect(() => {
    let isMounted = true;
    const loadService = async () => {
      try {
        const data = await serviceService.getServiceById(id);
        if (isMounted && data) {
          setService(data);
          setOrderAmount(data.price || '');
          setOrderDays(data.deliveryDays || 7);
        }
      } catch (err) {
        // Fallback to static services
        const fallback = services.find(s => s.id === id);
        if (isMounted && fallback) {
          setService(fallback);
          setOrderAmount(fallback.price || '');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadService();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!service) {
    return <div className="p-20 text-center text-xl font-bold">Service not found</div>;
  }

  const freelancer = (typeof service.freelancer === 'object' && service.freelancer) || users.find(u => u.id === service.freelancerId) || {
    name: service.freelancerName || 'Freelancer',
    avatar: service.freelancerAvatar,
    location: 'Bangalore, India',
    completedProjects: 45,
    responseTime: '1 hour'
  };

  const serviceReviews = reviews.filter(r => r.serviceId === id) || reviews.slice(0, 2);

  const handleStartDeal = () => {
    if (!user) {
      toast('Please log in as a client to order this service');
      navigate('/login', { state: { returnTo: `/services/${id}` } });
      return;
    }
    const freelancerId = service.freelancerId || service.freelancer?._id || service.freelancer;
    const userId = user.id || user._id;
    if (freelancerId && freelancerId.toString() === userId.toString()) {
      toast.error('You cannot hire yourself for your own service');
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
        serviceId: service.id || service._id,
        title: service.title,
        requirements: orderRequirements.trim(),
        amount: Number(orderAmount) || service.price,
        deadline: deadlineDate.toISOString()
      };

      const newDeal = await dealService.createDeal(dealPayload);
      toast.success('Project created! Initializing escrow...');
      setShowOrderModal(false);
      navigate(`/client/deals/${newDeal.id || newDeal._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to start project');
    } finally {
      setIsCreatingDeal(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link to="/services" className="hover:text-indigo-600">Services</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="hover:text-indigo-600 cursor-pointer">{service.category || 'Category'}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column - Main Content */}
        <div className="w-full lg:w-2/3 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">{service.title}</h1>
            
            <div className="flex items-center flex-wrap gap-4 text-sm">
              <Link to={`/freelancer/${service.freelancerId}`} className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-500">
                  {freelancer.avatar ? (
                    <img
                      src={getImageUrl(freelancer.avatar, 'avatar')}
                      alt={freelancer.name}
                      onError={(e) => handleImageError(e, 'avatar')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    freelancer.name?.charAt(0)
                  )}
                </div>
                <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{freelancer.name}</span>
              </Link>
              <div className="flex items-center text-yellow-500">
                <Star size={16} fill="currentColor" className="mr-1" />
                <span className="font-bold text-slate-800">{service.rating || '4.9'}</span>
                <span className="text-slate-500 ml-1">({service.reviewCount || 12} reviews)</span>
              </div>
              <div className="text-slate-300">|</div>
              <span className="text-slate-600">{service.ordersCount || 4} orders in queue</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-slate-100 aspect-video relative">
            <img
              src={getImageUrl(service.image, 'service')}
              alt={service.title}
              onError={(e) => handleImageError(e, 'service')}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto hide-scrollbar space-x-8">
              {['description', 'requirements', 'reviews', 'faq'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-bold capitalize whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'description' ? 'About This Service' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-line">
                  {service.description || 'Detailed description of the service goes here. The freelancer will explain what they offer, their process, and why you should choose them.'}
                </div>
                
                {service.skills && service.skills.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">What the freelancer needs to start:</h3>
                <ul className="space-y-3">
                  {(service.requirements || ['Detailed project brief', 'Reference materials or examples', 'Access credentials if required']).map((req, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mt-0.5 mr-3 text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-slate-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="font-bold text-slate-900 text-lg">Reviews ({serviceReviews.length})</h3>
                <div className="space-y-6">
                  {serviceReviews.length > 0 ? serviceReviews.map(review => (
                    <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-600">
                          {review.reviewerAvatar ? (
                            <img
                              src={getImageUrl(review.reviewerAvatar, 'avatar')}
                              alt={review.reviewerName || 'Reviewer'}
                              onError={(e) => handleImageError(e, 'avatar')}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            review.reviewerName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{review.reviewerName}</p>
                          <div className="flex items-center text-xs text-slate-500">
                            <div className="flex items-center text-yellow-400 mr-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-300" : ""} />
                              ))}
                            </div>
                            {formatRelativeTime(review.createdAt)}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-700">{review.comment}</p>
                    </div>
                  )) : (
                    <p className="text-slate-500">No reviews yet for this service.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                {(service.faqs || [
                  { question: 'Do you offer revisions?', answer: 'Yes, I offer up to 3 revisions to ensure you are completely satisfied with the final result.' },
                  { question: 'What file formats will I receive?', answer: 'Depending on the project, you will receive all standard formats including source files (e.g., .fig, .psd, .ai) and exported assets.' }
                ]).map((faq, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-bold text-slate-900 mb-2">{faq.question}</h4>
                    <p className="text-slate-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="sticky top-24 space-y-6">
            
            {/* Pricing Card */}
            <Card className="p-6 border-indigo-100 shadow-xl shadow-indigo-900/5">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-xl font-bold text-slate-900">Fixed Price</h3>
                <div className="text-3xl font-black text-slate-900">{formatCurrency(service.price)}</div>
              </div>
              
              <div className="flex items-center text-slate-600 mb-6 font-medium">
                <Clock size={18} className="mr-2 text-indigo-600" />
                {typeof service.deliveryTime === 'number'
                  ? `${service.deliveryTime} Days Delivery`
                  : (service.deliveryTime || (service.deliveryTimeDays ? `${service.deliveryTimeDays} Days` : '3 Days Delivery'))}
              </div>
              
              <div className="space-y-3 mb-6">
                <p className="font-bold text-sm text-slate-900">What's Included:</p>
                <ul className="space-y-2">
                  {(service.included || ['Source files', 'High resolution', 'Commercial use']).map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-600">
                      <Check size={16} className="text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={handleStartDeal} className="w-full py-3 text-lg mb-3 shadow-lg shadow-indigo-600/20">
                Continue ({formatCurrency(service.price)})
              </Button>
              <p className="text-center text-xs text-slate-500 font-medium">You won't be charged yet</p>
            </Card>

            {/* Freelancer Info Card */}
            <Card className="p-6">
              <div className="flex flex-col items-center text-center mb-4">
                <Link to={`/freelancer/${service.freelancerId}`}>
                  <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden mb-3">
                    {freelancer.avatar ? (
                      <img
                        src={getImageUrl(freelancer.avatar, 'avatar')}
                        alt={freelancer.name}
                        onError={(e) => handleImageError(e, 'avatar')}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500">
                        {freelancer.name?.charAt(0) || 'F'}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">{freelancer.name}</h3>
                </Link>
                <p className="text-sm text-slate-500 mb-2">{freelancer.title || 'Freelance Professional'}</p>
                
                <div className="flex items-center text-yellow-500 text-sm">
                  <Star size={14} fill="currentColor" className="mr-1" />
                  <span className="font-bold text-slate-800">{freelancer.rating || '4.9'}</span>
                  <span className="text-slate-500 ml-1">({freelancer.reviewsCount || 45})</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mb-6">Contact Me</Button>

              <div className="space-y-3 text-sm pt-4 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">From</span>
                  <span className="font-medium text-slate-900 flex items-center"><MapPin size={14} className="mr-1 text-slate-400"/> {freelancer.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg. Response Time</span>
                  <span className="font-medium text-slate-900">{freelancer.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed Orders</span>
                  <span className="font-medium text-slate-900">{freelancer.completedProjects}</span>
                </div>
              </div>
            </Card>

            {/* Trust Card */}
            <Card className="p-4 bg-slate-50 border-none">
              <div className="flex gap-3">
                <Shield className="text-indigo-600 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">WorkVault Protection</h4>
                  <p className="text-xs text-slate-600 mt-1">Payment is held securely in escrow until you approve the delivered work.</p>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden z-40 flex justify-between items-center">
        <div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</div>
          <div className="text-xl font-black text-slate-900">{formatCurrency(service.price)}</div>
        </div>
        <Button onClick={handleStartDeal} className="px-8">
          Continue
        </Button>
      </div>

      {/* START ORDER & ESCROW MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Start Project & Escrow</h3>
                <p className="text-xs text-slate-500 mt-0.5">Hiring <span className="font-semibold text-indigo-600">{freelancer.name}</span></p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100/60 flex items-start gap-3">
              <Shield className="text-indigo-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-xs text-indigo-900 leading-relaxed">
                <span className="font-bold">WorkVault Escrow Protection:</span> Your funds will be safely deposited into platform escrow and only released to the freelancer after you approve final work.
              </div>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Project Requirements *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail your goals, specifications, links to references, or assets the freelancer will need..."
                  value={orderRequirements}
                  onChange={(e) => setOrderRequirements(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Timeline (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={orderDays}
                    onChange={(e) => setOrderDays(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDeal}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isCreatingDeal ? <LoadingSpinner size="sm" /> : 'Confirm Order & Proceed to Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailsPage;
