import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import { MapPin, Calendar, Star, CheckCircle, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import ServiceCard from '../../components/marketplace/ServiceCard';
import EmptyState from '../../components/common/EmptyState';
import TrustMetricsCard from '../../components/trust/TrustMetricsCard';
import { userService } from '../../services/userService';
import { statsService } from '../../services/statsService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FreelancerProfilePage = () => {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [freelancerServices, setFreelancerServices] = useState([]);
  const [freelancerReviews, setFreelancerReviews] = useState([]);
  const [trustMetrics, setTrustMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

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
          setFreelancerServices(s || []);
          setFreelancerReviews(r || []);
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
      <div className="p-12 text-center max-w-lg mx-auto">
        <EmptyState
          title="Freelancer not found"
          description="The profile you are trying to view does not exist or may have been deactivated."
          action={
            <Link to="/services" className="text-sm font-semibold text-[#2F5BEA] hover:underline">
              ← Browse Marketplace Services
            </Link>
          }
        />
      </div>
    );
  }

  const memberYear = freelancer.createdAt 
    ? new Date(freelancer.createdAt).getFullYear() 
    : 2026;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <Card className="p-6 md:p-8 overflow-hidden relative border border-slate-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
          <Avatar 
            src={freelancer.profileImage || freelancer.avatar} 
            name={freelancer.name} 
            size="2xl" 
          />

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                  <span>{freelancer.name}</span>
                  <CheckCircle className="w-5 h-5 text-[#2F5BEA]" />
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-medium">{freelancer.title || 'Independent Professional'}</p>
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

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-slate-500 pt-1">
              {freelancer.location && (
                <span className="flex items-center">
                  <MapPin size={15} className="mr-1 text-slate-400" /> {freelancer.location}
                </span>
              )}
              <span className="flex items-center text-amber-500 font-semibold">
                <Star size={15} className="fill-amber-400 text-amber-400 mr-1" />
                {freelancer.rating ? Number(freelancer.rating).toFixed(1) : 'New'} ({freelancerReviews.length} reviews)
              </span>
              <span className="flex items-center">
                <Calendar size={15} className="mr-1 text-slate-400" /> Member since {memberYear}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Trust Metrics Section */}
      {trustMetrics && <TrustMetricsCard metrics={trustMetrics} />}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'services'
              ? 'border-[#2F5BEA] text-[#2F5BEA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Services ({freelancerServices.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-[#2F5BEA] text-[#2F5BEA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Reviews ({freelancerReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'about'
              ? 'border-[#2F5BEA] text-[#2F5BEA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          About & Skills
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'services' && (
        <div>
          {freelancerServices.length === 0 ? (
            <EmptyState
              title="No services offered currently"
              description="This freelancer does not have any active service listings published at the moment."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {freelancerServices.map((service) => (
                <ServiceCard key={service.id || service._id} service={service} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {freelancerReviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="This freelancer has not received client reviews yet."
            />
          ) : (
            freelancerReviews.map((rev) => (
              <Card key={rev.id || rev._id} className="p-5 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={rev.client?.name || rev.reviewerName || 'Client'} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.client?.name || rev.reviewerName || 'Client'}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500 text-xs font-bold">
                    <Star size={13} className="fill-amber-400 text-amber-400 mr-1" />
                    <span>{rev.rating || 5}.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic mt-2">
                  "{rev.comment || 'Project successfully approved.'}"
                </p>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-base mb-3">Professional Bio</h3>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
              {freelancer.bio || 'Verified freelance professional delivering high quality milestone projects on WorkVault.'}
            </p>
          </Card>

          <Card className="p-6 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Core Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(freelancer.skills && freelancer.skills.length > 0 ? freelancer.skills : ['Freelancer']).map((skill, i) => (
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
