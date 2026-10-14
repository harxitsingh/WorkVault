import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { serviceService } from '../../services/serviceService';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Star, Edit, Trash2, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

const FreelancerServices = () => {
  const { user } = useAuth();
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const data = await serviceService.getServicesByFreelancer(userId);
      setServicesList(data);
    } catch (error) {
      toast.error('Failed to load your services');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    try {
      const targetId = serviceToDelete.id || serviceToDelete._id;
      await serviceService.deleteService(targetId);
      setServicesList(prev => prev.filter(s => (s.id || s._id) !== targetId));
      toast.success('Service deleted successfully');
      setServiceToDelete(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (servicesList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">My Services</h1>
        </div>
        
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Plus size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No services created yet</h2>
          <p className="text-slate-500 mb-6 max-w-md">
            Create your first service to start receiving orders from clients across the marketplace.
          </p>
          <Link to="/freelancer/services/new">
            <Button>Create New Service</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Services</h1>
          <p className="text-slate-500">Manage your offerings and pricing.</p>
        </div>
        <Link to="/freelancer/services/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            <span>Create New Service</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesList.map(service => {
          const serviceId = service.id || service._id;
          return (
            <Card key={serviceId} className="overflow-hidden flex flex-col">
              <div className="relative h-48 bg-slate-200">
                <img
                  src={getImageUrl(service.image, 'service')}
                  alt={service.title}
                  onError={(e) => handleImageError(e, 'service')}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    service.status === 'active' || service.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {service.status === 'active' || service.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">
                  {service.category}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">{service.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center text-sm text-slate-500 mb-4">
                  <div className="flex items-center text-yellow-400 mr-1">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="font-medium text-slate-700 mr-1">{service.rating || '5.0'}</span>
                  <span>({service.reviewsCount || service.reviewCount || 0})</span>
                  {service.deliveryTime && (
                    <>
                      <span className="mx-2">&bull;</span>
                      <span>{service.deliveryTime}</span>
                    </>
                  )}
                </div>
                
                <div className="mt-auto">
                  <div className="text-lg font-bold text-slate-900 mb-4">
                    {formatCurrency(service.price)}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex space-x-2">
                      <Link to={`/freelancer/services/${serviceId}/edit`}>
                        <Button variant="outline" size="sm" className="px-3">
                          <Edit size={16} className="mr-1" /> Edit
                        </Button>
                      </Link>
                      <Link to={`/services/${serviceId}`} target="_blank">
                        <Button variant="ghost" size="sm" className="px-2" title="View Public Page">
                          <Eye size={16} />
                        </Button>
                      </Link>
                    </div>
                    <button 
                      onClick={() => setServiceToDelete(service)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Service Listing?"
        message={`Are you sure you want to delete "${serviceToDelete?.title}"? This will remove the listing from marketplace searches.`}
        confirmText="Yes, Delete Listing"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FreelancerServices;
