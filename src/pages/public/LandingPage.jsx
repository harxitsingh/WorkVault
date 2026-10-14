import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Handshake, 
  Shield, 
  CheckCircle, 
  BadgeCheck, 
  ArrowRight, 
  CreditCard, 
  Code, 
  Palette, 
  Smartphone, 
  TrendingUp, 
  Film, 
  FileText, 
  ShieldCheck,
  Lock,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';
import ServiceCard from '../../components/marketplace/ServiceCard';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { serviceService } from '../../services/serviceService';
import { useAuth } from '../../context/AuthContext';

const POPULAR_CATEGORIES = [
  { name: 'Web Development', icon: Code, count: 'Full-stack & Frontend' },
  { name: 'UI/UX Design', icon: Palette, count: 'Figma & Systems' },
  { name: 'Mobile Apps', icon: Smartphone, count: 'React Native & Flutter' },
  { name: 'Digital Marketing', icon: TrendingUp, count: 'SEO & Growth' },
  { name: 'Video Editing', icon: Film, count: 'Motion & Post-Production' },
  { name: 'Content Writing', icon: FileText, count: 'Copy & Technical Writing' }
];

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoadingServices(true);
    serviceService.getServices({ limit: 6 })
      .then(res => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.services || [];
        setFeaturedServices(list);
      })
      .catch(() => {
        if (isMounted) setFeaturedServices([]);
      })
      .finally(() => {
        if (isMounted) setLoadingServices(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/services?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/services');
    }
  };

  const dashboardRoute = user?.role === 'freelancer' 
    ? '/freelancer/dashboard' 
    : user?.role === 'admin' 
      ? '/admin/dashboard' 
      : '/client/dashboard';

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Value Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2F5BEA] text-xs font-semibold mb-6 shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Verifiable Escrow Milestone Protection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Hire verified talent.<br />
              <span className="text-[#2F5BEA]">Pay only on approved delivery.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              WorkVault protects clients and freelancers with smart milestone escrow. Your funds remain held safely until work is delivered, reviewed, and approved.
            </p>

            {/* Prominent Search Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-md focus-within:border-[#2F5BEA] focus-within:ring-3 focus-within:ring-[#2F5BEA]/20 transition-all"
            >
              <div className="flex items-center gap-3 px-3 w-full">
                <Search className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service are you looking for? (e.g. React, UI/UX, SEO)"
                  aria-label="Search freelance services"
                  className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none py-2"
                />
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                size="md" 
                className="w-full sm:w-auto px-6 shrink-0"
              >
                Search Services
              </Button>
            </form>

            {/* Auth-Aware Secondary CTAs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
              <span>Popular searches:</span>
              <button 
                type="button" 
                onClick={() => navigate('/services?category=Web%20Development')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Web Development
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/services?category=UI%2FUX%20Design')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                UI/UX Design
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/services?category=Mobile%20Development')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Mobile Apps
              </button>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">For Clients</p>
                <p className="text-xs text-slate-500 mt-0.5">Post deals, hold escrow & approve work</p>
              </div>
              <Link to={user ? dashboardRoute : '/services'}>
                <Button variant="primary" size="sm">
                  {user ? 'My Dashboard' : 'Hire Talent'}
                </Button>
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">For Freelancers</p>
                <p className="text-xs text-slate-500 mt-0.5">Publish services & get paid guaranteed</p>
              </div>
              <Link to={user ? (user.role === 'freelancer' ? '/freelancer/services/new' : dashboardRoute) : '/register'}>
                <Button variant="outline" size="sm">
                  {user ? 'Manage Services' : 'Offer Services'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ESCROW WORKFLOW (Flipkart & Leetcode clarity) */}
      <section className="py-16 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">How Milestone Escrow Works</h2>
            <p className="mt-2 text-sm text-slate-600">Strict payment security for every deal from initiation to completion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs relative">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2F5BEA] flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Deal Initiation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Client and freelancer agree on requirements, deliverables, budget, and deadline milestones.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs relative">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2F5BEA] flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Escrow Funded</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Client funds the milestone into WorkVault escrow. Freelancer begins work knowing payment is locked.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs relative">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2F5BEA] flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Delivery & Inspection</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Freelancer submits work files. Client inspects work against the agreed specification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs relative">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Approval & Release</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Client approves delivery, instantly releasing escrow funds to the freelancer's balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Explore Categories</h2>
              <p className="mt-1 text-sm text-slate-500">Discover top-rated services across specialized disciplines</p>
            </div>
            <Link 
              to="/services" 
              className="text-xs sm:text-sm font-semibold text-[#2F5BEA] hover:text-[#2446BD] flex items-center gap-1 transition-colors"
            >
              <span>All Categories</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POPULAR_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/services?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:bg-white hover:border-[#2F5BEA]/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="h-12 w-12 rounded-xl bg-white border border-slate-200/80 text-[#2F5BEA] group-hover:bg-[#2F5BEA] group-hover:text-white flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#2F5BEA] transition-colors">{cat.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.count}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED SERVICES (Live API Data) */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Featured Marketplace Listings</h2>
              <p className="mt-1 text-sm text-slate-500">Live verified services ready for instant deal collaboration</p>
            </div>
            <Link 
              to="/services" 
              className="text-xs sm:text-sm font-semibold text-[#2F5BEA] hover:text-[#2446BD] flex items-center gap-1 transition-colors"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4">
                  <Skeleton className="h-44 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <div className="pt-3 border-t border-slate-100 flex justify-between">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map(service => (
                <ServiceCard key={service._id || service.id} service={service} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No services listed yet"
              description="Be the first freelancer to publish a service on WorkVault."
              action={
                <Link to="/register">
                  <Button variant="primary">Create Service</Button>
                </Link>
              }
            />
          )}

          <div className="mt-12 text-center">
            <Link to="/services">
              <Button variant="outline" size="lg" className="px-8">
                Browse Full Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TRUST PILLARS (No fake stats, genuine security guarantees) */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Enterprise-Grade Protection</h2>
            <p className="mt-2 text-sm text-slate-600">Built to eliminate payment disputes and establish verifiable trust.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-[#2F5BEA] flex items-center justify-center mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Escrow Protected Funds</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Client funds are held in secure escrow ledger records. Neither party can unilaterally misappropriate project capital.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Verified Delivery Pipeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Formal submission, review, and acceptance workflows ensure that milestones are thoroughly verified before payouts occur.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-5">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Arbitrated Dispute Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If deliverables do not meet agreed criteria, an administrator reviews evidence and enforces impartial escrow refund or release.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
