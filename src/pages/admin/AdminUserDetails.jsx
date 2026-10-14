import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, MapPin, Mail, Phone, Calendar, 
  ShieldOff, Star, CheckCircle, IndianRupee 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

// Format utility placeholder
const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

// Mock User Data
const userData = {
  id: '5',
  name: 'Rahul Desai',
  email: 'r.desai@example.com',
  phone: '+91 98765 43210',
  role: 'Freelancer',
  status: 'Active',
  joined: '10 Apr 2024',
  location: 'Mumbai, Maharashtra',
  avatar: 'https://i.pravatar.cc/150?u=5',
  bio: 'Senior Full Stack Developer with 5+ years of experience in React, Node.js, and MongoDB.',
  
  // Freelancer specific
  rating: 4.8,
  reviewsCount: 15,
  completedProjects: 23,
  earnings: 1250000,
  
  services: [
    { id: 'S1', title: 'MERN Stack Web Development', price: 45000, active: true },
    { id: 'S2', title: 'React Native App Development', price: 65000, active: true },
    { id: 'S3', title: 'API Integration & Optimization', price: 15000, active: false }
  ],
  
  recentDeals: [
    { id: 'DL-1003', service: 'SEO Optimization for 6 Months', otherParty: 'Kiran Rao', amount: 120000, status: 'In Progress', date: '12 Sep 2024' },
    { id: 'DL-098', service: 'E-commerce Frontend', otherParty: 'Vikram Singh', amount: 45000, status: 'Completed', date: '01 Aug 2024' }
  ]
};

export default function AdminUserDetails() {
  const { id } = useParams();
  
  // In a real app, fetch user details based on id
  const user = userData;

  const handleStatusChange = () => {
    toast.success(`User has been ${user.status === 'Active' ? 'suspended' : 'activated'}.`);
  };

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
                className="w-20 h-20 rounded-full border-4 border-white absolute -top-10 bg-white object-cover"
              />
              <div className="mt-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                    <p className="text-sm text-slate-500">{user.role}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {user.status}
                  </span>
                </div>
                
                <p className="mt-4 text-sm text-slate-700 leading-relaxed">{user.bio}</p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" /> {user.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="w-4 h-4 mr-3 text-slate-400" /> {user.phone}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-3 text-slate-400" /> {user.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-3 text-slate-400" /> Joined {user.joined}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <button 
                    onClick={handleStatusChange}
                    className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      user.status === 'Active' 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <ShieldOff className="w-4 h-4" />
                    {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary for Freelancer */}
          {user.role === 'Freelancer' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="font-bold text-slate-900">{user.rating}</span>
                  </div>
                  <div className="text-xs text-slate-500">{user.reviewsCount} Reviews</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center text-emerald-500 mb-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="font-bold text-slate-900">{user.completedProjects}</span>
                  </div>
                  <div className="text-xs text-slate-500">Completed</div>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center text-green-600 mb-1">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    <span className="font-bold text-slate-900">{formatCurrency(user.earnings)}</span>
                  </div>
                  <div className="text-xs text-slate-500">Total Earnings</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Activity & Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services (if freelancer) */}
          {user.role === 'Freelancer' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Services Offered</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {user.services.map(service => (
                  <div key={service.id} className="p-6 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <h4 className="font-medium text-slate-900">{service.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">Base Price: {formatCurrency(service.price)}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      service.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Deals */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Recent Deals</h3>
              <Link to="/admin/deals" className="text-sm text-indigo-600 hover:text-indigo-800">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Deal ID / Service</th>
                    <th className="px-6 py-3 font-medium">{user.role === 'Freelancer' ? 'Client' : 'Freelancer'}</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {user.recentDeals.map(deal => (
                    <tr key={deal.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{deal.service}</div>
                        <div className="text-xs text-slate-500">{deal.id} &bull; {deal.date}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{deal.otherParty}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(deal.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          deal.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          deal.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
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
          </div>
        </div>
      </div>
    </div>
  );
}
