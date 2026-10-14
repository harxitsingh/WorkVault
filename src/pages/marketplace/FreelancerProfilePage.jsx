import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { MapPin, Calendar, Star, Clock, CheckCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TrustMetricsCard from '../../components/trust/TrustMetricsCard';
import { userService } from '../../services/userService';
import { statsService } from '../../services/statsService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

const FreelancerProfilePage = () => {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [freelancerServices, setFreelancerServices] = useState([]);
  const [freelancerReviews, setFreelancerReviews] = useState([]);
  const [trustMetrics, setTrustMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services'); // 'services', 'reviews', 'trust'

  useEffect(() => {
    let isMounted = true;
    const fetchFreelancerData = async () => {
      try {
        setLoading(true);
        const [u, s, r, t] = await Promise.all([
          userService.getUserById(id).catch(() => null),
          userService.getUserServices(id).catch(() => []),
          userService.getUserReviews(id).catch(() => []),
          statsService.getTrustMetrics(id).then(res => res.metrics).catch(() => null)
        ]);

        if (isMounted) {
          setFreelancer(u);
          setFreelancerServices(s);
          setFreelancerReviews(r);
          setTrustMetrics(t);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFreelancerData();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Freelancer not found</h2>
        <Link to="/services" className="mt-4 inline-block text-indigo-600 font-semibold">
          ← Browse Marketplace Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <Card className="p-6 md:p-8 overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-indigo-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={getImageUrl(freelancer.profileImage || freelancer.avatar, 'avatar')}
              alt={freelancer.name}
              onError={(e) => handleImageError(e, 'avatar')}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                  {freelancer.name}
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                </h1>
                <p className="text-base text-slate-600 font-medium">{freelancer.title || 'Specialist'}</p>
              </div>

              {trustMetrics && (
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-2 self-center sm:self-auto">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Trust Score</span>
                    <span className="text-lg font-black text-emerald-700">{trustMetrics.trustScore}/100</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 pt-1">
              {freelancer.location && (
                <span className="flex items-center">
                  <MapPin size={16} className="mr-1 text-slate-400" /> {freelancer.location}
                </span>
              )}
              <span className="flex items-center text-amber-500 font-semibold">
                <Star size={16} fill="currentColor" className="mr-1" />
                {freelancer.rating || 5.0} ({freelancerReviews.length} reviews)
              </span>
              <span className="flex items-center">
                <Calendar size={16} className="mr-1 text-slate-400" /> Member since {new Date(freelancer.createdAt || Date.now()).getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Trust Metrics Section */}
      {trustMetrics && <TrustMetricsCard metrics={trustMetrics} />}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'services'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Services ({freelancerServices.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Reviews ({freelancerReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'about'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          About & Skills
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancerServices.length === 0 ? (
            <p className="col-span-3 text-center py-12 text-slate-400">No active services offered currently.</p>
          ) : (
            freelancerServices.map((service) => (
              <Card key={service.id || service._id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col group">
                <Link to={`/services/${service.id || service._id}`} className="h-44 bg-slate-200 block overflow-hidden relative">
                  <img
                    src={getImageUrl(service.image, 'service')}
                    alt={service.title}
                    onError={(e) => handleImageError(e, 'service')}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/services/${service.id || service._id}`}>
                      <h4 className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-2 text-base transition-colors">
                        {service.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">{service.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">{service.deliveryDays || 7} days delivery</span>
                    <span className="font-black text-slate-900 text-base">{formatCurrency(service.price)}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {freelancerReviews.length === 0 ? (
            <p className="text-center py-12 text-slate-400">No reviews on completed deals yet.</p>
          ) : (
            freelancerReviews.map((rev) => (
              <Card key={rev.id || rev._id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-900">{rev.client?.name || rev.reviewerName || 'Client'}</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-700 italic">"{rev.comment}"</p>
                <p className="text-xs text-slate-400 mt-2">{formatDate(rev.createdAt)}</p>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <h3 className="font-bold text-slate-900 text-lg mb-3">Professional Bio</h3>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
              {freelancer.bio || 'Verified freelance professional delivering high quality milestone projects on WorkVault.'}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3">Core Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(freelancer.skills || ['React', 'Node.js', 'UI/UX']).map((skill, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfilePage;
