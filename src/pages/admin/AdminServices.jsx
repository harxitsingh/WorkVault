import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
        if (isMounted) setServices(data);
      } catch (err) {
        toast.error('Failed to load services');
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
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Services Catalog (Admin)</h1>
        <p className="text-slate-600 mt-1">Supervise marketplace offerings, pricing, and freelancer listings.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or freelancer..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No services found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Freelancer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((service) => (
                  <tr key={service.id || service._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-sm truncate">
                      {service.title}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {service.freelancer?.name || 'Freelancer'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 font-medium">
                        {service.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(service.price)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-xs font-medium text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                        {service.rating || 5.0} ({service.reviewsCount || service.reviewCount || 0})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/services/${service.id || service._id}`}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors inline-block"
                        title="View Public Service Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
