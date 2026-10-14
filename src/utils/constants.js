export const ROLES = {
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
