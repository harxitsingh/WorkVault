export const formatCurrency = (amount) => {
  const numeric = typeof amount === 'number' ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numeric);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDifference = Math.round((date - new Date()) / (1000 * 60 * 60 * 24));
  if (Math.abs(daysDifference) < 1) {
    const hoursDifference = Math.round((date - new Date()) / (1000 * 60 * 60));
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
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0]?.[0] || 'U').toUpperCase();
};

export const getStatusColor = (status) => {
  const key = String(status || '').toLowerCase().trim();
  const colors = {
    pending: 'bg-amber-50 text-amber-800 border border-amber-200',
    awaiting_payment: 'bg-amber-50 text-amber-800 border border-amber-200',
    open: 'bg-amber-50 text-amber-800 border border-amber-200',
    created: 'bg-blue-50 text-blue-800 border border-blue-200',
    active: 'bg-blue-50 text-blue-800 border border-blue-200',
    in_progress: 'bg-blue-50 text-blue-800 border border-blue-200',
    held: 'bg-blue-50 text-blue-800 border border-blue-200',
    funded: 'bg-blue-50 text-blue-800 border border-blue-200',
    submitted: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    completed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    released: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    paid: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    resolved: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    disputed: 'bg-orange-50 text-orange-800 border border-orange-200',
    under_review: 'bg-orange-50 text-orange-800 border border-orange-200',
    cancelled: 'bg-rose-50 text-rose-800 border border-rose-200',
    rejected: 'bg-rose-50 text-rose-800 border border-rose-200',
    failed: 'bg-rose-50 text-rose-800 border border-rose-200',
    suspended: 'bg-rose-50 text-rose-800 border border-rose-200',
    refunded: 'bg-slate-100 text-slate-800 border border-slate-200'
  };
  return colors[key] || 'bg-slate-100 text-slate-800 border border-slate-200';
};

export const getStatusLabel = (status) => {
  const key = String(status || '').toLowerCase().trim();
  const labels = {
    pending: 'Pending',
    awaiting_payment: 'Awaiting Payment',
    open: 'Open',
    created: 'Created',
    active: 'Active',
    in_progress: 'In Progress',
    held: 'In Escrow',
    funded: 'Funded',
    submitted: 'In Review',
    completed: 'Completed',
    released: 'Released',
    paid: 'Paid',
    resolved: 'Resolved',
    disputed: 'Disputed',
    under_review: 'Under Review',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    failed: 'Failed',
    suspended: 'Suspended',
    refunded: 'Refunded'
  };
  return labels[key] || (status ? String(status).replace(/_/g, ' ') : '');
};
