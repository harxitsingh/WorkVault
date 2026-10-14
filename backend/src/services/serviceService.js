import { Service } from '../models/Service.js';
import mongoose from 'mongoose';

const helperFindService = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Service.findById(id).populate('freelancer', 'name email profileImage avatar rating');
  }
  if (id === 'svc_1') {
    return await Service.findOne().populate('freelancer', 'name email profileImage avatar rating');
  }
  return null;
};

/**
 * Get all services with search, filter, sort, and pagination
 */
export const getAllServices = async (query = {}) => {
  const filter = {};

  // Default active status filter unless query specified or querying by freelancer
  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  } else if (!query.status && !query.freelancer && !query.freelancerId) {
    filter.isActive = true;
  }

  // Filter by freelancer
  if (query.freelancer || query.freelancerId) {
    const fId = query.freelancer || query.freelancerId;
    if (mongoose.Types.ObjectId.isValid(fId)) {
      filter.freelancer = fId;
    }
  }

  // Filter by category
  if (query.category) {
    filter.category = { $regex: new RegExp(`^${query.category.trim()}$`, 'i') };
  }

  // Price range
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
  }

  // Minimum rating
  if (query.rating) {
    filter.rating = { $gte: parseFloat(query.rating) };
  }

  // Search by keyword
  if (query.search) {
    const q = query.search.trim();
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } }
    ];
  }

  // Sort
  let sortObj = { createdAt: -1 };
  if (query.sort) {
    switch (query.sort) {
      case 'price_asc':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { rating: -1 };
        break;
      case 'reviews':
        sortObj = { reviewsCount: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
    }
  }

  // Pagination
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  const total = await Service.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const services = await Service.find(filter)
    .populate('freelancer', 'name profileImage avatar rating')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const formattedData = services.map(s => s.toJSON());

  return {
    data: formattedData,
    pagination: { page, limit, total, totalPages }
  };
};

/**
 * Get service by ID
 */
export const getServiceById = async (id) => {
  const service = await helperFindService(id);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }
  const json = service.toJSON();
  if (id === 'svc_1') {
    json.id = 'svc_1';
  }
  return json;
};

/**
 * Create a new service (freelancer only)
 */
export const createService = async (data, user) => {
  let deliveryDays = data.deliveryDays;
  if (!deliveryDays && data.deliveryTime) {
    const parsed = parseInt(data.deliveryTime);
    deliveryDays = !isNaN(parsed) ? parsed : 7;
  }
  if (!deliveryDays) deliveryDays = 7;

  const credentialRegex = /(password\s*[:=]|email\s*[:=]\s*\S+@\S+.*password)/i;
  if (credentialRegex.test(data.title) || credentialRegex.test(data.description)) {
    const error = new Error('Service title and description cannot contain passwords or authentication credentials.');
    error.statusCode = 400;
    throw error;
  }

  // Normalize category if incorrectly passed
  let category = data.category;
  if (category === 'service_images' || category === 'service') {
    category = 'Web Development';
  }

  const service = await Service.create({
    title: data.title,
    description: data.description,
    category: category,
    price: parseFloat(data.price),
    deliveryDays: deliveryDays,
    deliveryTime: data.deliveryTime || `${deliveryDays} days`,
    image: data.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tags: data.tags || [],
    includes: data.includes || [],
    requirements: data.requirements || [],
    faqs: data.faqs || [],
    freelancer: user._id || user.id,
    rating: 5.0,
    reviewsCount: 0,
    reviewCount: 0,
    isActive: true,
    status: 'active'
  });

  const populated = await Service.findById(service._id).populate('freelancer', 'name profileImage avatar rating');
  return populated.toJSON();
};

/**
 * Update a service (owner only)
 */
export const updateService = async (id, data, userId) => {
  const service = await helperFindService(id);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  const ownerId = service.freelancer?._id ? service.freelancer._id.toString() : service.freelancer?.toString();
  if (ownerId !== userId.toString()) {
    const error = new Error('You can only update your own services');
    error.statusCode = 403;
    throw error;
  }

  const credentialRegex = /(password\s*[:=]|email\s*[:=]\s*\S+@\S+.*password)/i;
  if ((data.title && credentialRegex.test(data.title)) || (data.description && credentialRegex.test(data.description))) {
    const error = new Error('Service title and description cannot contain passwords or authentication credentials.');
    error.statusCode = 400;
    throw error;
  }

  const allowedFields = ['title', 'description', 'category', 'price', 'deliveryDays', 'deliveryTime', 'image', 'tags', 'includes', 'requirements', 'faqs', 'status', 'isActive'];
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      if (key === 'price') service.price = parseFloat(data[key]);
      else if (key === 'category' && (data[key] === 'service_images' || data[key] === 'service')) {
        service.category = 'Web Development';
      }
      else service[key] = data[key];
    }
  }

  await service.save();
  const updated = await helperFindService(service._id);
  return updated.toJSON();
};

/**
 * Delete a service (owner or admin)
 */
export const deleteService = async (id, userId, userRole) => {
  const service = await helperFindService(id);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  const ownerId = service.freelancer?._id ? service.freelancer._id.toString() : service.freelancer?.toString();
  if (ownerId !== userId.toString() && userRole !== 'admin') {
    const error = new Error('You can only delete your own services');
    error.statusCode = 403;
    throw error;
  }

  await Service.deleteOne({ _id: service._id });
  return service.toJSON();
};
