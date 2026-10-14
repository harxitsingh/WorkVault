import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, MapPin, Mail, Phone, Calendar, 
  ShieldOff, ShieldCheck, Star, CheckCircle2, AlertCircle, ArrowLeft, Briefcase, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { userService } from '../../services/userService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminUserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await adminService.getUserById(id);
      setUser(userData);

      // Fetch user services if freelancer
      if (userData?.role === 'freelancer') {
        userService.getUserServices(id)
          .then(s => setServices(s || []))
          .catch(() => {});
      }

      // Fetch platform deals to filter user's deals
      adminService.getDeals()
        .then(allDeals => {
          const userDeals = (allDeals || []).filter(d => 
            (d.client?._id || d.client?.id || d.client) === id ||
            (d.freelancer?._id || d.freelancer?.id || d.freelancer) === id
          );
          setDeals(userDeals);
        })
        .catch(() => {});

    } catch (err) {
      console.error('Failed to load user details:', err);
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleStatusChange = async () => {
    if (!user || updatingStatus) return;
    const currentStatus = user.status || 'Active';
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';

    try {
      setUpdatingStatus(true);
      await adminService.updateUserStatus(id, { status: nextStatus });
      setUser(prev => ({ ...prev, status: nextStatus }));
      toast.success(`Account has been ${nextStatus === 'Suspended' ? 'suspended' : 'activated'}.`);
      setShowStatusConfirm(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-[60vh] flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">User Account Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Could not find the requested user profile in system records.'}</p>
        <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>
      </div>
    );
  }

  const isFreelancer = user.role === 'freelancer';
  const userStatus = user.status || 'Active';
  const completedDealsCount = deals.filter(d => (d.status || '').toUpperCase() === 'RELEASED' || (d.status || '').toUpperCase() === 'COMPLETED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-slate-500">
        <Link to="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400" />
        <Link to="/admin/users" className="hover:text-primary transition-colors">Users</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-[200px]">{user.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border border-slate-200 shadow-xs">
            <div className="h-20 bg-gradient-to-r from-primary to-primary-hover" />
            <div className="px-6 pb-6 relative">
              <div className="w-18 h-18 rounded-full border-4 border-white absolute -top-9 bg-white shadow-xs">
                <Avatar
                  src={user.avatar || user.profileImage}
                  name={user.name}
                  size="xl"
                  className="w-full h-full"
                />
              </div>

              <div className="mt-12 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h1 className="text-xl font-black text-slate-900">{user.name}</h1>
                    <div className="mt-1">
                      <StatusBadge status={user.role} />
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    userStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {userStatus}
                  </span>
                </div>
                
                {user.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {user.bio}
                  </p>
                )}
                
                <div className="space-y-2.5 pt-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{user.location || 'India'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Member since {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button 
                    variant={userStatus === 'Active' ? 'danger' : 'primary'}
                    className="w-full justify-center gap-2 text-xs"
                    onClick={() => setShowStatusConfirm(true)}
                  >
                    {userStatus === 'Active' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {userStatus === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Summary for Freelancer */}
          {isFreelancer && (
            <Card className="p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                    <span className="font-bold text-slate-900 text-sm">{user.rating || 5.0}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Reputation</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center text-emerald-600 mb-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    <span className="font-bold text-slate-900 text-sm">{completedDealsCount}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Completed Deals</div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Activity & Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services (if freelancer) */}
          {isFreelancer && (
            <Card className="overflow-hidden border border-slate-200 shadow-xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Services Offered ({services.length})
                </h3>
              </div>
              {services.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No services published yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {services.map(service => {
                    const sId = service.id || service._id;
                    return (
                      <div key={sId} className="p-4 sm:p-5 flex justify-between items-center hover:bg-slate-50/70 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{service.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Starting: <strong className="text-slate-800">{formatCurrency(service.price)}</strong> • Category: {service.category}
                          </p>
                        </div>
                        <Link
                          to={`/services/${sId}`}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          View Listing
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Deals Involving User */}
          <Card className="overflow-hidden border border-slate-200 shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Deals Involving User ({deals.length})
              </h3>
              <Link to="/admin/deals" className="text-xs font-bold text-primary hover:underline">
                View All Deals
              </Link>
            </div>
            {deals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No deals recorded for this user account.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 font-bold">Deal Title</th>
                      <th className="py-3 px-4 font-bold">{isFreelancer ? 'Client' : 'Freelancer'}</th>
                      <th className="py-3 px-4 font-bold">Amount</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deals.map(deal => {
                      const dId = deal.id || deal._id;
                      const partnerName = isFreelancer ? (deal.client?.name || 'Client') : (deal.freelancer?.name || 'Freelancer');
                      return (
                        <tr key={dId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{deal.title}</div>
                            <div className="text-[11px] text-slate-400">{formatDate(deal.createdAt)}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{partnerName}</td>
                          <td className="py-3 px-4 font-black text-slate-900">{formatCurrency(deal.amount || 0)}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={deal.status} />
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
      </div>

      {/* Confirmation Modal for Status Change */}
      <ConfirmModal
        isOpen={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        onConfirm={handleStatusChange}
        title={userStatus === 'Active' ? 'Suspend User Account' : 'Reactivate User Account'}
        message={
          userStatus === 'Active'
            ? `Are you sure you want to suspend "${user.name}"? They will lose access to create services, fund deals, or submit deliverables until reactivated.`
            : `Are you sure you want to reactivate "${user.name}"? Their account access and marketplace privileges will be restored immediately.`
        }
        confirmText={userStatus === 'Active' ? 'Yes, Suspend Account' : 'Yes, Reactivate Account'}
        variant={userStatus === 'Active' ? 'danger' : 'primary'}
        isLoading={updatingStatus}
      />
    </div>
  );
}
