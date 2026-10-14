import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, MapPin, Mail, Phone, Calendar, 
  ShieldOff, Star, CheckCircle, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';
import { adminService } from '../../services/adminService';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

export default function AdminUserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await adminService.getUserById(id);
        if (!isMounted) return;
        setUser(userData);

        // Fetch user services if freelancer
        if (userData?.role === 'freelancer') {
          userService.getUserServices(id)
            .then(s => isMounted && setServices(s || []))
            .catch(() => {});
        }

        // Fetch platform deals to filter user's deals
        adminService.getDeals()
          .then(allDeals => {
            if (!isMounted) return;
            const userDeals = (allDeals || []).filter(d => 
              (d.client?._id || d.client?.id || d.client) === id ||
              (d.freelancer?._id || d.freelancer?.id || d.freelancer) === id
            );
            setDeals(userDeals);
          })
          .catch(() => {});

      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load user details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserDetails();
    return () => { isMounted = false; };
  }, [id]);

  const handleStatusChange = async () => {
    if (!user || updatingStatus) return;
    const currentStatus = user.status || 'Active';
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';

    try {
      setUpdatingStatus(true);
      await adminService.updateUserStatus(id, { status: nextStatus });
      setUser(prev => ({ ...prev, status: nextStatus }));
      toast.success(`User has been ${nextStatus === 'Suspended' ? 'suspended' : 'activated'}.`);
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">User Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Could not find the requested user profile.'}</p>
          <Link to="/admin/users" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const isFreelancer = user.role === 'freelancer';
  const userStatus = user.status || 'Active';

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-slate-500 mb-6">
        <Link to="/admin" className="hover:text-indigo-600">Admin</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <Link to="/admin/users" className="hover:text-indigo-600">Users</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-slate-900 font-medium">{user.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="px-6 pb-6 relative">
              <img 
                src={getImageUrl(user.avatar || user.profileImage, 'avatar')} 
                alt={user.name} 
                onError={(e) => handleImageError(e, 'avatar')}
                className="w-20 h-20 rounded-full border-4 border-white absolute -top-10 bg-white object-cover shadow-sm"
              />
              <div className="mt-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                    <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    userStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {userStatus}
                  </span>
                </div>
                
                {user.bio && (
                  <p className="mt-4 text-sm text-slate-700 leading-relaxed">{user.bio}</p>
                )}
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" /> {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="w-4 h-4 mr-3 text-slate-400" /> {user.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-3 text-slate-400" /> {user.location || 'India'}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-3 text-slate-400" /> Joined {formatDate(user.createdAt)}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <button 
                    onClick={handleStatusChange}
                    disabled={updatingStatus}
                    className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      userStatus === 'Active' 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <ShieldOff className="w-4 h-4" />
                    {updatingStatus ? 'Updating...' : (userStatus === 'Active' ? 'Suspend User' : 'Activate User')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary for Freelancer */}
          {isFreelancer && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="font-bold text-slate-900">{user.rating || 5.0}</span>
                  </div>
                  <div className="text-xs text-slate-500">Rating</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center text-emerald-500 mb-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="font-bold text-slate-900">{user.completedProjects || deals.filter(d => d.status === 'RELEASED').length}</span>
                  </div>
                  <div className="text-xs text-slate-500">Completed Deals</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Activity & Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services (if freelancer) */}
          {isFreelancer && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Services Offered ({services.length})</h3>
              </div>
              {services.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No services published yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {services.map(service => (
                    <div key={service.id || service._id} className="p-6 flex justify-between items-center hover:bg-slate-50">
                      <div>
                        <h4 className="font-medium text-slate-900">{service.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">Base Price: {formatCurrency(service.price)} &bull; {service.category}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        service.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {service.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Deals */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Deals Involving User ({deals.length})</h3>
              <Link to="/admin/deals" className="text-sm text-indigo-600 hover:text-indigo-800">View All Deals</Link>
            </div>
            {deals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No deals recorded for this user.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 font-medium">Deal Title</th>
                      <th className="px-6 py-3 font-medium">{isFreelancer ? 'Client' : 'Freelancer'}</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {deals.map(deal => (
                      <tr key={deal.id || deal._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{deal.title}</div>
                          <div className="text-xs text-slate-500">{formatDate(deal.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {isFreelancer ? (deal.client?.name || 'Client') : (deal.freelancer?.name || 'Freelancer')}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(deal.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            deal.status === 'RELEASED' ? 'bg-emerald-100 text-emerald-700' :
                            deal.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            deal.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {deal.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
