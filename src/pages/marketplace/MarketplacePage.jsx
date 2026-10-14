import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, Clock, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { services } from '../../data/services';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

const CATEGORIES = [
  'All Categories',
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'Logo Design',
  'Digital Marketing',
  'Content Writing',
  'SEO'
];

const MarketplacePage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [servicesList, setServicesList] = useState(services);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      const match = CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase());
      if (match) setSelectedCategory(match);
    }
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/services?limit=50');
        if (isMounted && res.data?.success && Array.isArray(res.data?.data)) {
          setServicesList(res.data.data);
        }
      } catch (err) {
        console.warn('API services fetch error, using fallback:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchServices();
    return () => { isMounted = false; };
  }, []);

  // Filter and sort logic
  const filteredServices = servicesList.filter(service => {
    // Search match (title, category, description, tags, freelancerName)
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = service.title?.toLowerCase().includes(q);
      const catMatch = service.category?.toLowerCase().includes(q);
      const descMatch = service.description?.toLowerCase().includes(q);
      const tagsMatch = service.tags?.some(tag => tag.toLowerCase().includes(q));
      const freelancerMatch = service.freelancerName?.toLowerCase().includes(q);
      if (!titleMatch && !catMatch && !descMatch && !tagsMatch && !freelancerMatch) {
        return false;
      }
    }
    // Category match
    if (selectedCategory !== 'All Categories' && service.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Price match
    if (priceRange.min && service.price < parseInt(priceRange.min)) return false;
    if (priceRange.max && service.price > parseInt(priceRange.max)) return false;
    // Rating match
    if (minRating > 0 && (service.rating || 0) < minRating) return false;
    
    // Status must be active
    if (service.status !== 'active') return false;

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'reviews': return (b.reviewCount || 0) - (a.reviewCount || 0);
      default: return 0; // relevance (keep original order for demo)
    }
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    setSortBy('relevance');
  };

  const FilterSidebar = ({ className = "" }) => (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Filters</h3>
        <button onClick={clearFilters} className="text-sm text-indigo-600 hover:underline">Clear All</button>
      </div>

      <div>
        <h4 className="font-medium text-sm text-slate-900 mb-3">Category</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {CATEGORIES.map(category => (
            <label key={category} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className={`ml-2 text-sm ${selectedCategory === category ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm text-slate-900 mb-3">Price Range (INR)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm text-slate-900 mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => setMinRating(rating)}
                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <div className="ml-2 flex items-center text-sm text-slate-600">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < rating ? "currentColor" : "none"} 
                    className={i < rating ? "text-yellow-400" : "text-slate-300"} 
                  />
                ))}
                <span className="ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Search */}
      <div className="bg-indigo-900 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Find the perfect freelance services</h1>
          <p className="text-indigo-200 text-lg mb-8">Connect with talented professionals to turn your ideas into reality.</p>
          
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="What service are you looking for today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-14 py-4 rounded-full text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/30 text-lg shadow-xl"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white w-12 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <Card className="p-5 sticky top-24">
            <FilterSidebar />
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-slate-600 font-medium">
              <span className="text-slate-900 font-bold">{filteredServices.length}</span> services available
            </p>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
              
              <div className="flex-1 sm:flex-none relative flex items-center">
                <span className="text-sm text-slate-500 mr-2 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="pt-3 flex justify-between">
                      <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                  <Link to={`/services/${service.id}`} className="relative h-48 block overflow-hidden">
                    <img
                      src={getImageUrl(service.image, 'service')}
                      alt={service.title}
                      onError={(e) => handleImageError(e, 'service')}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Link to={`/freelancer/${service.freelancerId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                          {service.freelancerAvatar ? (
                            <img
                              src={getImageUrl(service.freelancerAvatar, 'avatar')}
                              alt={service.freelancerName || 'Freelancer'}
                              onError={(e) => handleImageError(e, 'avatar')}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            service.freelancerName?.charAt(0) || 'F'
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-700 hover:text-indigo-600 truncate">{service.freelancerName}</span>
                      </Link>
                    </div>
                    
                    <Link to={`/services/${service.id}`} className="block flex-1 mb-2">
                      <h3 className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-2 transition-colors">
                        {service.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center text-sm text-yellow-500 mb-3">
                      <Star size={14} fill="currentColor" className="mr-1" />
                      <span className="font-bold text-slate-700">{service.rating || '0.0'}</span>
                      <span className="text-slate-400 ml-1">({service.reviewCount || 0})</span>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div className="flex items-center text-slate-500 text-xs font-medium">
                        <Clock size={14} className="mr-1" />
                        {typeof service.deliveryTime === 'number'
                          ? `${service.deliveryTime} ${service.deliveryTime === 1 ? 'Day' : 'Days'}`
                          : (service.deliveryTime || (service.deliveryTimeDays ? `${service.deliveryTimeDays} Days` : '3 Days'))}
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        {formatCurrency(service.price)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                We couldn't find any services matching your current filters. Try adjusting your search criteria or clearing filters.
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </Card>
          )}

          {/* Pagination (Visual only) */}
          {filteredServices.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-1">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" disabled>&lt;</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-medium">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">2</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">3</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">&gt;</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm h-full bg-white shadow-xl flex flex-col ml-auto animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <FilterSidebar />
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={clearFilters}>Clear</Button>
              <Button className="flex-1" onClick={() => setIsMobileFiltersOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
