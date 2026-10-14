import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await adminService.getServices();
        if (isMounted) setServices(data || []);
      } catch (err) {
        console.error('Failed to load services:', err);
        toast.error('Failed to load services catalog');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchServices();
    return () => { isMounted = false; };
  }, []);

  const categories = ['All', ...new Set(services.map(s => s.category).filter(Boolean))];

  const filteredServices = services.filter((service) => {
    const title = service.title || '';
    const freelancerName = service.freelancer?.name || '';
    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      freelancerName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Services Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Supervise marketplace offerings, pricing tiers, and freelancer service standards.</p>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or freelancer..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-900 font-medium placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredServices.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No services found"
            description={search ? `No listings match "${search}".` : 'No services found under this category filter.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Service Title</th>
                  <th className="py-3.5 px-4">Freelancer</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Starting Price</th>
                  <th className="py-3.5 px-4">Reputation</th>
                  <th className="py-3.5 px-5 text-right">Listing Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((service) => {
                  const sId = service.id || service._id;
                  return (
                    <tr key={sId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900 max-w-sm truncate text-sm">
                        {service.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {service.freelancer?.name || 'Freelancer'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                          {service.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap text-sm">
                        {formatCurrency(service.price || 0)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center text-xs font-semibold text-slate-700">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                          {service.rating || 5.0} ({service.reviewsCount || service.reviewCount || 0})
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          to={`/services/${sId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          title="Open public listing"
                        >
                          View <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
