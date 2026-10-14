import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Star,
  ChevronDown
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ServiceCard from '../../components/marketplace/ServiceCard';

const CATEGORIES = [
  'All Categories',
  'Web Development',
  'UI/UX Design',
  'Mobile Development',
  'Digital Marketing',
  'Video Editing',
  'Content Writing'
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviews' }
];

const ITEMS_PER_PAGE = 9;

// Top-level filter panel component to avoid re-creation during render
function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  minRating,
  onRatingChange,
  onClearFilters
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <h3 className="font-bold text-sm text-slate-900 tracking-tight">Filters</h3>
        <button 
          type="button"
          onClick={onClearFilters} 
          className="text-xs font-semibold text-[#2F5BEA] hover:text-[#2446BD] hover:underline"
        >
          Reset All
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">Category</h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <label 
                key={cat} 
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50 text-[#2F5BEA] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{cat}</span>
                <input
                  type="radio"
                  name="marketplace_category"
                  checked={isSelected}
                  onChange={() => onCategoryChange(cat)}
                  className="sr-only"
                />
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#2F5BEA]" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="price_min" className="sr-only">Min Price</label>
            <input
              id="price_min"
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => onPriceChange('min', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2F5BEA]"
            />
          </div>
          <div>
            <label htmlFor="price_max" className="sr-only">Max Price</label>
            <input
              id="price_max"
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => onPriceChange('max', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2F5BEA]"
            />
          </div>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">Minimum Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
              <input
                type="radio"
                name="min_rating"
                checked={minRating === r}
                onChange={() => onRatingChange(minRating === r ? 0 : r)}
                className="h-3.5 w-3.5 text-[#2F5BEA] focus:ring-[#2F5BEA] border-slate-300 rounded"
              />
              <div className="flex items-center">
                <Star size={13} className="fill-amber-400 text-amber-400 mr-1" />
                <span className="font-medium text-slate-800">{r}.0+</span>
                <span className="text-slate-400 ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter States initialized from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || ''
  });
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [servicesList, setServicesList] = useState([]);

  // Fetch Services from API
  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const res = await api.get('/services?limit=100');
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setServicesList(list);
    } catch (err) {
      setFetchError(err.message || 'Unable to load services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Synchronize URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All Categories') params.set('category', selectedCategory);
    if (priceRange.min) params.set('minPrice', priceRange.min);
    if (priceRange.max) params.set('maxPrice', priceRange.max);
    if (minRating > 0) params.set('rating', String(minRating));
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', String(currentPage));

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, priceRange, minRating, sortBy, currentPage, setSearchParams]);

  // Filter & Sort Logic
  const filteredServices = useMemo(() => {
    return servicesList.filter(service => {
      // Status check
      if (service.status && service.status !== 'active') return false;

      // Query search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = service.title?.toLowerCase().includes(q);
        const catMatch = service.category?.toLowerCase().includes(q);
        const descMatch = service.description?.toLowerCase().includes(q);
        const freelancerMatch = (service.freelancer?.name || service.freelancerName)?.toLowerCase().includes(q);
        if (!titleMatch && !catMatch && !descMatch && !freelancerMatch) {
          return false;
        }
      }

      // Category match
      if (selectedCategory !== 'All Categories') {
        const cat = service.category?.toLowerCase();
        if (cat !== selectedCategory.toLowerCase()) return false;
      }

      // Price match
      const price = Number(service.price) || 0;
      if (priceRange.min && price < Number(priceRange.min)) return false;
      if (priceRange.max && price > Number(priceRange.max)) return false;

      // Rating match
      if (minRating > 0 && (Number(service.rating) || 0) < minRating) return false;

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return (Number(a.price) || 0) - (Number(b.price) || 0);
        case 'price_high': return (Number(b.price) || 0) - (Number(a.price) || 0);
        case 'rating': return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        case 'reviews': return (Number(b.reviewCount) || 0) - (Number(a.reviewCount) || 0);
        default: return 0;
      }
    });
  }, [servicesList, searchQuery, selectedCategory, priceRange, minRating, sortBy]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedServices = useMemo(() => {
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredServices, validPage]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    setSortBy('relevance');
    setCurrentPage(1);
  };

  const handlePriceChange = (field, val) => {
    setPriceRange(prev => ({ ...prev, [field]: val }));
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleRatingChange = (r) => {
    setMinRating(r);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Search Banner */}
      <div className="bg-[#0E1525] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-[#1E293B]">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-[#3B7BF6] mb-2 block">
            WorkVault Marketplace
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Find the perfect service.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            Directly collaborate with top independent freelancers. Every service is protected by escrow milestones.
          </p>
          
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by skill, service title, or freelancer name..."
              className="w-full pl-10 pr-24 py-3 bg-white text-slate-900 rounded-xl text-xs sm:text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#2F5BEA]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Filter & Listing Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sticky Filter Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <Card className="p-5 sticky top-24 border border-slate-200/90 shadow-2xs">
            <FilterPanel
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              minRating={minRating}
              onRatingChange={handleRatingChange}
              onClearFilters={handleClearFilters}
            />
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full min-w-0">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredServices.length}</span> services
            </p>
            
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button 
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
              
              <div className="flex-1 sm:flex-none relative flex items-center">
                <label htmlFor="sort-select" className="text-xs text-slate-500 mr-2 hidden sm:inline font-medium">Sort:</label>
                <div className="relative w-full">
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-auto pl-3 pr-8 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#2F5BEA] appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid or Skeletons or Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4">
                  <Skeleton className="h-44 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <div className="pt-3 border-t border-slate-100 flex justify-between">
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <ErrorState 
              title="Unable to load services" 
              message={fetchError} 
              onRetry={fetchServices} 
            />
          ) : paginatedServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedServices.map(service => (
                <ServiceCard key={service._id || service.id} service={service} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No services match your filters"
              description="Try broadening your category, adjusting your price range, or searching for a different keyword."
              action={
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              }
            />
          )}

          {/* Real Functional Pagination */}
          {!isLoading && totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-between border-t border-slate-200/80 pt-4" aria-label="Pagination">
              <div className="text-xs text-slate-500 font-medium">
                Page {validPage} of {totalPages} ({filteredServices.length} total)
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={validPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  icon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isCurrent = pageNum === validPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                          isCurrent 
                            ? 'bg-[#2F5BEA] text-white shadow-2xs' 
                            : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={validPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col ml-auto z-10">
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">Filters</h2>
              <button 
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <FilterPanel
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                onPriceChange={handlePriceChange}
                minRating={minRating}
                onRatingChange={handleRatingChange}
                onClearFilters={handleClearFilters}
              />
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-2.5">
              <Button variant="outline" className="flex-1" onClick={handleClearFilters}>
                Clear
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => setIsMobileFiltersOpen(false)}>
                Apply ({filteredServices.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
