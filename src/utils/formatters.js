export const formatCurrency = (amount) => {
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
