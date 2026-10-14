import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Handshake, Shield, CheckCircle, BadgeCheck, Eye, ArrowRight, CreditCard, Code, Palette, PenTool, Smartphone, TrendingUp, Film, FileText, Wallet, Star } from 'lucide-react';
import Button from '../../components/common/Button';
import ServiceCard from '../../components/marketplace/ServiceCard';
import { categories, testimonials } from '../../data/categories';
import staticServices from '../../data/services';
import { serviceService } from '../../services/serviceService';

const categoryIconMap = {
  Code,
  Palette,
  PenTool,
  Smartphone,
  TrendingUp,
  Film,
  FileText
};

const LandingPage = () => {
  const [featuredServices, setFeaturedServices] = useState(staticServices.slice(0, 6));

  useEffect(() => {
    let isMounted = true;
    serviceService.getServices({ limit: 6 })
      .then(res => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.services || [];
        if (list.length > 0) {
          setFeaturedServices(list);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);
  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 pt-20 pb-24 lg:pt-32 lg:pb-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                Find trusted freelancers.<br />
                <span className="text-indigo-600">Work with confidence.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                WorkVault connects you with skilled professionals and keeps your payments secure with our escrow-style protection. No risk, no hassle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/services">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto px-8">Explore Services</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">Become a Freelancer</Button>
                </Link>
              </div>
            </div>
            
            {/* Abstract Stats/Illustration */}
            <div className="hidden lg:block lg:col-span-6 relative h-[500px]">
              <div className="absolute inset-0 bg-indigo-100/50 rounded-full blur-3xl opacity-50 transform -skew-y-12"></div>
              
              <div className="absolute top-10 right-10 bg-white p-5 rounded-2xl shadow-xl w-64 animate-bounce-slow">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Payment Secure</p>
                    <p className="text-lg font-bold text-gray-900">₹45,000</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 w-3/4 h-full"></div>
                </div>
              </div>

              <div className="absolute bottom-20 left-10 bg-white p-5 rounded-2xl shadow-xl w-72 z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-indigo-100"></div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-gray-900">4.9/5 Average</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">Based on 10,000+ client reviews</p>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 p-6 rounded-3xl shadow-2xl w-56 text-white rotate-3">
                <CheckCircle className="h-8 w-8 mb-4 text-indigo-200" />
                <p className="text-3xl font-extrabold mb-1">10k+</p>
                <p className="text-indigo-100 text-sm font-medium">Projects Completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUSTED BY */}
      <section className="py-10 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
            Trusted by 10,000+ freelancers and businesses across India
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale font-bold text-xl sm:text-2xl text-gray-400">
            <span>TechCorp India</span>
            <span>InnovateStudio</span>
            <span>WebWorks Pune</span>
            <span>NextGen Startup</span>
            <span>DigitalCraft</span>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How WorkVault Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Simple, secure, and transparent. We've built a process that protects both clients and freelancers.</p>
          </div>
          
          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {[
                { icon: Search, title: 'Browse & Select', desc: 'Find the perfect freelancer for your project from our curated marketplace.' },
                { icon: Handshake, title: 'Create a Deal', desc: 'Set clear terms, deadlines, and budget. Both parties agree before starting.' },
                { icon: Shield, title: 'Secure Payment', desc: 'Payment is held securely until the work is completed and approved.' },
                { icon: CheckCircle, title: 'Approve & Release', desc: 'Review the delivery, approve the work, and payment is released.' }
              ].map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center">
                  <div className="z-10 bg-white h-24 w-24 rounded-full shadow-md border border-gray-100 flex items-center justify-center mb-6">
                    <step.icon className="h-10 w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Step {idx + 1}: {step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
              <p className="mt-2 text-gray-600">Explore skills from our top professionals</p>
            </div>
            <Link to="/services" className="hidden sm:flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat, idx) => {
              const Icon = categoryIconMap[cat.icon] || Code;
              return (
                <Link key={idx} to={`/services?category=${encodeURIComponent(cat.name)}`} className="group block p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-indigo-100">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                    <Icon className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.count} services</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FEATURED SERVICES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Services</h2>
            <p className="mt-4 text-gray-600">Top rated services handpicked for you</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map(service => (
              <ServiceCard key={service.id || service._id} service={service} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/services">
              <Button variant="outline" size="lg">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. WHY WORKVAULT */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose WorkVault?</h2>
            <p className="mt-4 text-gray-600">Built to solve the biggest challenges in freelancing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center md:text-left">
              <Shield className="h-12 w-12 text-indigo-600 mb-6 mx-auto md:mx-0" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Escrow-Style Protection</h3>
              <p className="text-gray-600">Funds are held securely in our system and only released when the client approves the completed work. No scams, no unpaid invoices.</p>
            </div>
            <div className="p-8 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center md:text-left">
              <BadgeCheck className="h-12 w-12 text-indigo-600 mb-6 mx-auto md:mx-0" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Professionals</h3>
              <p className="text-gray-600">We verify identities and track performance metrics to ensure you only work with reliable, high-quality talent from across India.</p>
            </div>
            <div className="p-8 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center md:text-left">
              <Eye className="h-12 w-12 text-indigo-600 mb-6 mx-auto md:mx-0" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Transparent Process</h3>
              <p className="text-gray-600">Clear milestones, centralized communication, and an integrated dispute resolution center. Everything you need in one unified dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ESCROW-STYLE WORKFLOW */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Money, Protected</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-16 text-lg">Our escrow-style system ensures you only pay when you're satisfied with the work.</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 overflow-x-auto pb-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full md:w-64 flex-shrink-0">
              <div className="h-10 w-10 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <CreditCard className="h-5 w-5 text-indigo-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">1. Client Pays</h4>
              <p className="text-sm text-gray-400">Funds are deposited upfront</p>
            </div>
            
            <ArrowRight className="hidden md:block h-8 w-8 text-gray-600 flex-shrink-0" />
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full md:w-64 flex-shrink-0 relative">
              <div className="absolute -top-3 -right-3 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="h-3 w-3 text-white" />
              </div>
              <div className="h-10 w-10 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">2. Funds Held</h4>
              <p className="text-sm text-gray-400">Securely held in WorkVault</p>
            </div>

            <ArrowRight className="hidden md:block h-8 w-8 text-gray-600 flex-shrink-0" />
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full md:w-64 flex-shrink-0">
              <div className="h-10 w-10 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <CheckCircle className="h-5 w-5 text-indigo-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">3. Work Approved</h4>
              <p className="text-sm text-gray-400">Client reviews & approves</p>
            </div>

            <ArrowRight className="hidden md:block h-8 w-8 text-gray-600 flex-shrink-0" />
            
            <div className="bg-gray-800 p-6 rounded-xl border border-emerald-900 w-full md:w-64 flex-shrink-0">
              <div className="h-10 w-10 bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-emerald-400 mb-2">4. Payment Released</h4>
              <p className="text-sm text-gray-400">Freelancer receives funds</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.slice(0, 3).map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6 flex-1">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            )) || (
              /* Fallback if no mock data */
              <div className="col-span-3 text-center text-gray-500">Testimonials loading...</div>
            )}
          </div>
        </div>
      </section>

      {/* 9. CTA SECTION */}
      <section className="py-20 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to get started?</h2>
          <p className="text-indigo-100 text-lg mb-10">Join thousands of freelancers and clients already using WorkVault to grow their business.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services">
              <Button className="bg-white text-indigo-600 hover:bg-gray-50 border-transparent w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-lg shadow-lg">
                Find Freelancers
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-indigo-800 text-white hover:bg-indigo-900 border-transparent w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-lg shadow-lg">
                Start Freelancing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
