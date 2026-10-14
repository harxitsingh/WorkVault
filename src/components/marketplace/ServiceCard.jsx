import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Heart } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

const ServiceCard = ({ service }) => {
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      {/* Favorite Button */}
      <button className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-colors">
        <Heart className="h-5 w-5" />
      </button>

      {/* Image / Placeholder */}
      <Link to={`/services/${service?.id}`} className="block h-48 bg-gray-100 relative overflow-hidden">
        <img
          src={getImageUrl(service?.image, 'service')}
          alt={service?.title || 'Service'}
          onError={(e) => handleImageError(e, 'service')}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="primary" className="text-xs">{service?.category || 'Category'}</Badge>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-bold ml-1 text-gray-900">{service?.rating || '0.0'}</span>
            <span className="text-xs text-gray-500 ml-1">({service?.reviewCount || 0})</span>
          </div>
        </div>

        <Link to={`/services/${service?.id}`} className="block">
          <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {service?.title || 'Service Title'}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-center mb-4">
            <Avatar 
              name={service?.freelancer?.name || service?.freelancerName || 'Freelancer'} 
              src={service?.freelancer?.avatar || service?.freelancerAvatar} 
              size="sm" 
              className="mr-2" 
            />
            <span className="text-sm font-medium text-gray-700 truncate">
              {service?.freelancer?.name || service?.freelancerName || 'Freelancer'}
            </span>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Starting at</p>
              <p className="text-lg font-extrabold text-gray-900">₹{service?.price?.toLocaleString() || '0'}</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {typeof service?.deliveryTime === 'number'
                ? `${service.deliveryTime} ${service.deliveryTime === 1 ? 'day' : 'days'}`
                : (service?.deliveryTime || (service?.deliveryTimeDays ? `${service.deliveryTimeDays} days` : '1 day'))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
