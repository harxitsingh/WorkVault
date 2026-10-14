export const DEFAULT_SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80';

export const DEFAULT_AVATAR_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80';

/**
 * Normalizes any image URL (local relative upload, absolute URL, or fallback)
 * @param {string} url - Image path or URL
 * @param {'service' | 'avatar'} type - Type of image
 * @returns {string} Fully qualified or safe relative URL
 */
export const getImageUrl = (url, type = 'service') => {
  const fallback = type === 'avatar' ? DEFAULT_AVATAR_IMAGE : DEFAULT_SERVICE_IMAGE;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const cleanUrl = url.trim();

  // If already absolute or data URL
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }

  // If relative upload path
  if (cleanUrl.startsWith('/uploads/')) {
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    return `${backendBase}${cleanUrl}`;
  }

  if (cleanUrl.startsWith('uploads/')) {
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    return `${backendBase}/${cleanUrl}`;
  }

  return cleanUrl;
};

/**
 * Image error handler callback for <img> onError attribute
 * @param {SyntheticEvent} e - Image error event
 * @param {'service' | 'avatar'} type - Type of image
 */
export const handleImageError = (e, type = 'service') => {
  const fallback = type === 'avatar' ? DEFAULT_AVATAR_IMAGE : DEFAULT_SERVICE_IMAGE;
  if (e?.currentTarget) {
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.src = fallback;
  }
};
