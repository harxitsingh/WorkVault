const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join('d:', 'freelance', 'workvault');

const files = [
  {
    path: 'src/data/notifications.js',
    content: `export const notifications = [
  { id: 'notif_1', userId: 'usr_5', type: 'deal_accepted', title: 'New Deal Offer', message: 'Aarav Sharma has sent you an offer for "Professional React Web Application Development".', read: false, createdAt: '2023-10-26T10:00:00Z', link: '/freelancer/deals/deal_1' },
  { id: 'notif_2', userId: 'usr_1', type: 'payment_held', title: 'Payment Secured', message: 'Your payment of ₹35,000 has been secured in escrow.', read: true, createdAt: '2023-10-25T11:30:00Z', link: '/client/deals/deal_1' },
  { id: 'notif_3', userId: 'usr_7', type: 'dispute_opened', title: 'Dispute Opened', message: 'Sneha Gupta has opened a dispute on your deal.', read: false, createdAt: '2023-09-24T10:15:00Z', link: '/freelancer/disputes/dsp_1' },
  { id: 'notif_4', userId: 'usr_4', type: 'dispute_opened', title: 'Dispute Submitted', message: 'Your dispute has been received and is under review.', read: true, createdAt: '2023-09-24T10:15:00Z', link: '/client/disputes/dsp_1' },
  { id: 'notif_5', userId: 'usr_1', type: 'delivery_submitted', title: 'Work Delivered', message: 'Vikram Singh has submitted work for review.', read: false, createdAt: '2023-04-22T15:30:00Z', link: '/client/deals/deal_1' },
  { id: 'notif_6', userId: 'usr_5', type: 'deal_completed', title: 'Deal Completed', message: 'Your work was approved! Funds have been released to your account.', read: true, createdAt: '2023-04-24T09:45:00Z', link: '/freelancer/deals/deal_1' },
  { id: 'notif_7', userId: 'usr_6', type: 'review_received', title: 'New Review', message: 'Priya Patel left you a 5-star review.', read: true, createdAt: '2023-10-15T15:00:00Z', link: '/freelancer/profile' },
  { id: 'notif_8', userId: 'usr_8', type: 'new_order', title: 'New Order Received', message: 'Rohan Mehta has ordered your SEO content writing service.', read: false, createdAt: '2023-10-20T09:30:00Z', link: '/freelancer/deals/deal_3' },
  { id: 'notif_9', userId: 'usr_3', type: 'delivery_submitted', title: 'Work Delivered', message: 'Deepika Joshi has submitted work for review.', read: false, createdAt: '2023-10-22T16:45:00Z', link: '/client/deals/deal_3' },
  { id: 'notif_10', userId: 'usr_9', type: 'deal_completed', title: 'Payment Released', message: 'Your payment of ₹12,000 has been released.', read: true, createdAt: '2023-08-20T09:10:00Z', link: '/freelancer/payments' },
  { id: 'notif_11', userId: 'usr_11', type: 'dispute_opened', title: 'New Dispute Action Required', message: 'A new dispute requires admin review.', read: false, createdAt: '2023-09-24T10:15:00Z', link: '/admin/disputes/dsp_1' },
  { id: 'notif_12', userId: 'usr_12', type: 'dispute_opened', title: 'New Dispute Action Required', message: 'A new dispute requires admin review.', read: true, createdAt: '2023-10-24T12:00:00Z', link: '/admin/disputes/dsp_4' },
  { id: 'notif_13', userId: 'usr_2', type: 'payment_released', title: 'Refund Issued', message: 'A refund of ₹7,500 has been processed to your original payment method.', read: true, createdAt: '2023-05-15T15:30:00Z', link: '/client/payments' },
  { id: 'notif_14', userId: 'usr_10', type: 'deal_accepted', title: 'Deal Accepted', message: 'Sneha Gupta accepted your proposal for dashboard development.', read: true, createdAt: '2023-09-15T11:20:00Z', link: '/freelancer/deals/deal_9' },
  { id: 'notif_15', userId: 'usr_7', type: 'payment_held', title: 'Escrow Funded', message: 'Client has funded escrow for WordPress Website Development.', read: true, createdAt: '2023-06-05T10:15:00Z', link: '/freelancer/deals/deal_10' }
];
export default notifications;`
  },
  {
    path: 'src/data/reviews.js',
    content: `export const reviews = [
  { id: 'rev_1', serviceId: 'svc_1', dealId: 'deal_1', reviewerId: 'usr_1', reviewerName: 'Aarav Sharma', rating: 5, comment: 'Vikram delivered an exceptional React application. The code was clean, well-documented, and performance is top-notch. Highly recommended!', createdAt: '2023-04-25T10:00:00Z' },
  { id: 'rev_2', serviceId: 'svc_5', dealId: 'deal_5', reviewerId: 'usr_1', reviewerName: 'Aarav Sharma', rating: 5, comment: 'Arjun did a fantastic job with the promotional video. The transitions and text overlays were exactly what we needed.', createdAt: '2023-08-21T09:30:00Z' },
  { id: 'rev_3', serviceId: 'svc_6', dealId: 'deal_9', reviewerId: 'usr_4', reviewerName: 'Sneha Gupta', rating: 4, comment: 'Good dashboard, but needed a few revisions to get the filters working correctly. Meera was very responsive and fixed it quickly.', createdAt: '2023-09-25T14:15:00Z' },
  { id: 'rev_4', serviceId: 'svc_9', dealId: 'deal_10', reviewerId: 'usr_3', reviewerName: 'Rohan Mehta', rating: 5, comment: 'Karthik set up my WordPress site perfectly. He even optimized the speed and installed essential SEO plugins without me asking.', createdAt: '2023-06-15T11:00:00Z' },
  { id: 'rev_5', serviceId: 'svc_4', dealId: 'deal_3', reviewerId: 'usr_3', reviewerName: 'Rohan Mehta', rating: 5, comment: 'Deepika writes great SEO content. The article is engaging and includes all target keywords naturally.', createdAt: '2023-10-23T09:45:00Z' },
  { id: 'rev_6', serviceId: 'svc_2', dealId: 'deal_2', reviewerId: 'usr_2', reviewerName: 'Priya Patel', rating: 5, comment: 'Ananya has a great eye for design. The app UI is beautiful and intuitive.', createdAt: '2023-11-01T10:20:00Z' },
  { id: 'rev_7', serviceId: 'svc_1', dealId: 'deal_x10', reviewerId: 'usr_2', reviewerName: 'Priya Patel', rating: 4, comment: 'Solid work, delivered on time. Good communication.', createdAt: '2023-05-10T12:00:00Z' },
  { id: 'rev_8', serviceId: 'svc_8', dealId: 'deal_8', reviewerId: 'usr_1', reviewerName: 'Aarav Sharma', rating: 5, comment: 'Excellent React Native skills. The app runs smoothly on both iOS and Android.', createdAt: '2023-11-05T14:30:00Z' },
  { id: 'rev_9', serviceId: 'svc_10', dealId: 'deal_6', reviewerId: 'usr_2', reviewerName: 'Priya Patel', rating: 4, comment: 'Detailed strategy provided. Useful insights for our Instagram growth.', createdAt: '2023-11-02T16:00:00Z' },
  { id: 'rev_10', serviceId: 'svc_12', dealId: 'deal_11', reviewerId: 'usr_2', reviewerName: 'Priya Patel', rating: 5, comment: 'Love the packaging design! It looks premium and stands out.', createdAt: '2023-10-30T10:15:00Z' },
  { id: 'rev_11', serviceId: 'svc_15', dealId: 'deal_x11', reviewerId: 'usr_3', reviewerName: 'Rohan Mehta', rating: 5, comment: 'The Python script saves me 5 hours a week. Fantastic work by Meera.', createdAt: '2024-01-15T09:00:00Z' },
  { id: 'rev_12', serviceId: 'svc_18', dealId: 'deal_x12', reviewerId: 'usr_4', reviewerName: 'Sneha Gupta', rating: 5, comment: 'The explainer video is cute, engaging, and explains our product perfectly.', createdAt: '2024-02-20T11:30:00Z' }
];
export default reviews;`
  },
  {
    path: 'src/data/categories.js',
    content: `export const categories = [
  { id: 'web-dev', name: 'Web Development', icon: 'Code', count: 156 },
  { id: 'ui-ux', name: 'UI/UX Design', icon: 'Palette', count: 98 },
  { id: 'graphic-design', name: 'Graphic Design', icon: 'PenTool', count: 124 },
  { id: 'mobile-dev', name: 'Mobile Development', icon: 'Smartphone', count: 87 },
  { id: 'digital-marketing', name: 'Digital Marketing', icon: 'TrendingUp', count: 112 },
  { id: 'video-editing', name: 'Video Editing', icon: 'Film', count: 65 },
  { id: 'content-writing', name: 'Content Writing', icon: 'FileText', count: 143 }
];

export const testimonials = [
  { id: 1, name: 'Sanjay Gupta', role: 'Startup Founder', quote: 'WorkVault helped us find an incredible React developer within 48 hours. The escrow system gave us peace of mind.', avatar: null },
  { id: 2, name: 'Neha Sharma', role: 'Marketing Director', quote: 'I have hired multiple freelancers here for SEO and content. The quality is consistently high and the platform is easy to use.', avatar: null },
  { id: 3, name: 'Rajesh Kumar', role: 'Freelance UI Designer', quote: 'As a freelancer, I love the guaranteed payments. No more chasing clients for invoices. WorkVault handles everything.', avatar: null },
  { id: 4, name: 'Anita Desai', role: 'E-commerce Owner', quote: 'The dispute resolution team is fair and fast. We had one minor issue and it was resolved professionally in a day.', avatar: null }
];
`
  },
  {
    path: 'src/data/stats.js',
    content: `export const clientStats = {
  activeDeals: 3,
  completedDeals: 12,
  amountHeld: 75000,
  amountReleased: 145000,
  recentActivity: [
    { id: 1, action: 'Payment Released', amount: 12000, date: '2023-10-25T10:00:00Z' },
    { id: 2, action: 'Escrow Funded', amount: 35000, date: '2023-10-24T14:30:00Z' },
    { id: 3, action: 'Deal Accepted', amount: 0, date: '2023-10-22T09:15:00Z' }
  ],
  monthlySpending: [
    { month: 'May', value: 15000 },
    { month: 'Jun', value: 25000 },
    { month: 'Jul', value: 10000 },
    { month: 'Aug', value: 45000 },
    { month: 'Sep', value: 30000 },
    { month: 'Oct', value: 75000 }
  ]
};

export const freelancerStats = {
  activeOrders: 4,
  completedOrders: 32,
  amountHeld: 85000,
  releasedEarnings: 420000,
  averageRating: 4.8,
  monthlyEarnings: [
    { month: 'May', value: 45000 },
    { month: 'Jun', value: 35000 },
    { month: 'Jul', value: 60000 },
    { month: 'Aug', value: 55000 },
    { month: 'Sep', value: 80000 },
    { month: 'Oct', value: 95000 }
  ],
  completedOrdersChart: [
    { month: 'May', value: 3 },
    { month: 'Jun', value: 4 },
    { month: 'Jul', value: 5 },
    { month: 'Aug', value: 4 },
    { month: 'Sep', value: 7 },
    { month: 'Oct', value: 9 }
  ]
};

export const adminStats = {
  totalUsers: 1450,
  clients: 850,
  freelancers: 600,
  activeDeals: 124,
  totalTransactionValue: 4500000,
  heldAmount: 850000,
  openDisputes: 5,
  userGrowth: [
    { month: 'May', users: 100 },
    { month: 'Jun', users: 150 },
    { month: 'Jul', users: 220 },
    { month: 'Aug', users: 350 },
    { month: 'Sep', users: 480 },
    { month: 'Oct', users: 650 }
  ],
  dealVolume: [
    { month: 'May', deals: 45 },
    { month: 'Jun', deals: 60 },
    { month: 'Jul', deals: 85 },
    { month: 'Aug', deals: 110 },
    { month: 'Sep', deals: 140 },
    { month: 'Oct', deals: 185 }
  ],
  transactionValue: [
    { month: 'May', amount: 450000 },
    { month: 'Jun', amount: 600000 },
    { month: 'Jul', amount: 850000 },
    { month: 'Aug', amount: 1100000 },
    { month: 'Sep', amount: 1400000 },
    { month: 'Oct', amount: 1850000 }
  ]
};
`
  },
  {
    path: 'src/services/api.js',
    content: `import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('workvault_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('workvault_token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
`
  },
  {
    path: 'src/services/authService.js',
    content: `import users from '../data/users';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (email, password) => {
    await delay();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Invalid email or password');
    // Mock token
    const token = 'mock_jwt_token_for_' + user.id;
    return { user, token };
  },
  
  register: async (data) => {
    await delay();
    const newUser = {
      id: 'usr_' + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: null,
      joinedDate: new Date().toISOString(),
      status: 'active'
    };
    return { user: newUser, token: 'mock_jwt_token_for_' + newUser.id };
  },
  
  forgotPassword: async (email) => {
    await delay();
    return { message: 'Password reset link sent successfully.' };
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('workvault_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};

export default authService;
`
  },
  {
    path: 'src/services/serviceService.js',
    content: `import services from '../data/services';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const serviceService = {
  getServices: async (filters = {}) => {
    await delay();
    let result = [...services];
    if (filters.category) {
      result = result.filter(s => s.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)));
    }
    // simple sort
    if (filters.sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  },
  
  getServiceById: async (id) => {
    await delay();
    const service = services.find(s => s.id === id);
    if (!service) throw new Error('Service not found');
    return service;
  },
  
  getServicesByFreelancer: async (freelancerId) => {
    await delay();
    return services.filter(s => s.freelancerId === freelancerId);
  },
  
  createService: async (data) => {
    await delay();
    const newSvc = { ...data, id: 'svc_' + Date.now(), createdAt: new Date().toISOString(), status: 'active', rating: 0, reviewCount: 0 };
    return newSvc;
  },
  
  updateService: async (id, data) => {
    await delay();
    return { id, ...data };
  },
  
  deleteService: async (id) => {
    await delay();
    return { success: true };
  }
};

export default serviceService;
`
  },
  {
    path: 'src/services/dealService.js',
    content: `import deals from '../data/deals';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const dealService = {
  getDeals: async (filters = {}) => {
    await delay();
    let result = [...deals];
    if (filters.status) result = result.filter(d => d.status === filters.status);
    return result;
  },
  
  getDealById: async (id) => {
    await delay();
    const deal = deals.find(d => d.id === id);
    if (!deal) throw new Error('Deal not found');
    return deal;
  },
  
  getDealsByClient: async (clientId) => {
    await delay();
    return deals.filter(d => d.clientId === clientId);
  },
  
  getDealsByFreelancer: async (freelancerId) => {
    await delay();
    return deals.filter(d => d.freelancerId === freelancerId);
  },
  
  createDeal: async (data) => {
    await delay();
    return { ...data, id: 'deal_' + Date.now(), status: 'pending', createdAt: new Date().toISOString(), timeline: [{ status: 'pending', date: new Date().toISOString(), description: 'Deal created' }] };
  },
  
  updateDealStatus: async (id, status) => {
    await delay();
    return { id, status };
  },
  
  submitDelivery: async (id, data) => {
    await delay();
    return { success: true };
  },
  
  approveDelivery: async (id) => {
    await delay();
    return { success: true };
  },
  
  requestRevision: async (id, message) => {
    await delay();
    return { success: true };
  }
};

export default dealService;
`
  },
  {
    path: 'src/services/paymentService.js',
    content: `import transactions from '../data/transactions';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  getTransactions: async (filters = {}) => {
    await delay();
    return [...transactions];
  },
  
  getTransactionsByUser: async (userId) => {
    await delay();
    return transactions.filter(t => t.clientId === userId || t.freelancerId === userId);
  },
  
  getPaymentSummary: async (userId) => {
    await delay();
    return { balance: 0, held: 0 };
  }
};

export default paymentService;
`
  },
  {
    path: 'src/services/disputeService.js',
    content: `import disputes from '../data/disputes';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const disputeService = {
  getDisputes: async (filters = {}) => {
    await delay();
    return [...disputes];
  },
  
  getDisputeById: async (id) => {
    await delay();
    const dispute = disputes.find(d => d.id === id);
    if (!dispute) throw new Error('Dispute not found');
    return dispute;
  },
  
  createDispute: async (data) => {
    await delay();
    return { ...data, id: 'dsp_' + Date.now(), status: 'open', createdAt: new Date().toISOString() };
  },
  
  resolveDispute: async (id, resolution) => {
    await delay();
    return { success: true };
  }
};

export default disputeService;
`
  },
  {
    path: 'src/services/reviewService.js',
    content: `import reviews from '../data/reviews';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const reviewService = {
  getReviewsByService: async (serviceId) => {
    await delay();
    return reviews.filter(r => r.serviceId === serviceId);
  },
  
  getReviewsByUser: async (userId) => {
    await delay();
    return reviews.filter(r => r.reviewerId === userId);
  },
  
  createReview: async (data) => {
    await delay();
    return { ...data, id: 'rev_' + Date.now(), createdAt: new Date().toISOString() };
  }
};

export default reviewService;
`
  },
  {
    path: 'src/services/notificationService.js',
    content: `import notifications from '../data/notifications';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  getNotifications: async (userId) => {
    await delay();
    return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  markAsRead: async (id) => {
    await delay();
    return { success: true };
  },
  
  markAllAsRead: async (userId) => {
    await delay();
    return { success: true };
  },
  
  getUnreadCount: async (userId) => {
    await delay();
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }
};

export default notificationService;
`
  },
  {
    path: 'src/services/userService.js',
    content: `import users from '../data/users';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  getUsers: async (filters = {}) => {
    await delay();
    return [...users];
  },
  
  getUserById: async (id) => {
    await delay();
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },
  
  updateUser: async (id, data) => {
    await delay();
    return { success: true };
  },
  
  updateUserStatus: async (id, status) => {
    await delay();
    return { success: true };
  }
};

export default userService;
`
  },
  {
    path: 'src/utils/formatters.js',
    content: `export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDifference = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
  if (Math.abs(daysDifference) < 1) {
    const hoursDifference = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60));
    return rtf.format(hoursDifference, 'hour');
  }
  return rtf.format(daysDifference, 'day');
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-amber-100 text-amber-800',
    held: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    submitted: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-emerald-100 text-emerald-800',
    disputed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    released: 'bg-emerald-100 text-emerald-800',
    open: 'bg-amber-100 text-amber-800',
    under_review: 'bg-blue-100 text-blue-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    refunded: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    held: 'In Escrow',
    in_progress: 'In Progress',
    submitted: 'In Review',
    completed: 'Completed',
    disputed: 'Disputed',
    cancelled: 'Cancelled',
    released: 'Released',
    open: 'Open',
    under_review: 'Under Review',
    resolved: 'Resolved',
    refunded: 'Refunded'
  };
  return labels[status] || status;
};
`
  },
  {
    path: 'src/utils/constants.js',
    content: `export const ROLES = {
  CLIENT: 'client',
  FREELANCER: 'freelancer',
  ADMIN: 'admin'
};

export const DEAL_STATUSES = {
  PENDING: 'pending',
  HELD: 'held',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled'
};

export const DISPUTE_STATUSES = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  REFUNDED: 'refunded',
  RELEASED: 'released'
};

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  FAILED: 'failed'
};

export const CATEGORIES = [
  'Web Development',
  'UI/UX Design',
  'Graphic Design',
  'Mobile Development',
  'Digital Marketing',
  'Video Editing',
  'Content Writing'
];

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest Arrivals' }
];

export const DELIVERY_TIMES = [
  { value: 'any', label: 'Any Delivery Time' },
  { value: '3_days', label: 'Up to 3 days' },
  { value: '7_days', label: 'Up to 7 days' },
  { value: '14_days', label: 'Up to 14 days' },
  { value: '30_days', label: 'Up to 30 days' }
];
`
  },
  {
    path: 'src/context/AuthContext.jsx',
    content: `import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import users from '../data/users';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // For demo purposes, auto-login as client
        const demoUser = users.find(u => u.role === 'client');
        setUser(demoUser);
        localStorage.setItem('workvault_user', JSON.stringify(demoUser));
        localStorage.setItem('workvault_token', 'mock_token');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await authService.login(email, password);
      setUser(res.user);
      localStorage.setItem('workvault_user', JSON.stringify(res.user));
      localStorage.setItem('workvault_token', res.token);
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      const res = await authService.register(data);
      setUser(res.user);
      localStorage.setItem('workvault_user', JSON.stringify(res.user));
      localStorage.setItem('workvault_token', res.token);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('workvault_user');
    localStorage.removeItem('workvault_token');
    toast.success('Logged out successfully');
  };

  const switchRole = (role) => {
    const demoUser = users.find(u => u.role === role);
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem('workvault_user', JSON.stringify(demoUser));
      toast.success(\`Switched to \${role} view (\${demoUser.name})\`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`
  },
  {
    path: 'src/context/UIContext.jsx',
    content: `import React, { createContext, useState, useEffect, useContext } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setThemeState] = useState('light');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const setTheme = (newTheme) => setThemeState(newTheme);

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar, theme, setTheme, isMobile }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
`
  },
  {
    path: 'src/hooks/useDebounce.js',
    content: `import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
`
  },
  {
    path: 'src/hooks/usePagination.js',
    content: `import { useState, useMemo } from 'react';

export const usePagination = (items = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return items.slice(begin, end);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const nextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };

  return {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    totalItems: items.length
  };
};

export default usePagination;
`
  }
];

files.forEach(file => {
  const fullPath = path.join(ROOT_DIR, file.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, file.content, 'utf8');
});

console.log('Batch 2 done');
