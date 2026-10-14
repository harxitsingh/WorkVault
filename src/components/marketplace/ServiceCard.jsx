import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';
import { formatCurrency } from '../../utils/formatters';

const ServiceCard = ({ service }) => {
  const serviceId = service?._id || service?.id;
  const freelancer = service?.freelancer || service?.user || {};
  const freelancerName = freelancer?.name || service?.freelancerName || 'Freelancer';
  const freelancerAvatar = freelancer?.avatar || freelancer?.profileImage || service?.freelancerAvatar;
  const freelancerId = freelancer?._id || freelancer?.id;

  const rating = Number(service?.rating) > 0 ? Number(service?.rating).toFixed(1) : 'New';
  const reviewCount = service?.reviewCount || 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col h-full relative">
      {/* Service Image */}
      <Link to={`/services/${serviceId}`} className="block h-48 bg-slate-100 relative overflow-hidden">
        <img
          src={getImageUrl(service?.image, 'service')}
          alt={service?.title || 'Service listing'}
          onError={(e) => handleImageError(e, 'service')}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="default" className="bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-semibold shadow-2xs border-slate-200">
            {service?.category || 'General'}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Rating & Review summary */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center text-amber-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-sm font-bold ml-1 text-slate-900">{rating}</span>
            {reviewCount > 0 && (
              <span className="text-xs text-slate-500 ml-1 font-medium">({reviewCount})</span>
            )}
          </div>
          <div className="flex items-center text-xs font-medium text-slate-500">
            <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" aria-hidden="true" />
            {typeof service?.deliveryTime === 'number'
              ? `${service.deliveryTime}d delivery`
              : (service?.deliveryTime || (service?.deliveryTimeDays ? `${service.deliveryTimeDays}d delivery` : '3d delivery'))}
          </div>
        </div>

        {/* Title */}
        <Link to={`/services/${serviceId}`} className="block mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA] rounded-md">
          <h3 className="text-base font-semibold text-slate-900 leading-snug group-hover:text-[#2F5BEA] transition-colors line-clamp-2">
            {service?.title || 'Untitled Service'}
          </h3>
        </Link>

        {/* Description Snippet */}
        {service?.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Footer Area */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center min-w-0 pr-2">
            {freelancerId ? (
              <Link 
                to={`/freelancer/${freelancerId}`} 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA] rounded-md"
              >
                <Avatar 
                  name={freelancerName} 
                  src={freelancerAvatar} 
                  size="sm" 
                />
                <span className="text-xs font-medium text-slate-700 truncate max-w-[110px]">
                  {freelancerName}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 truncate">
                <Avatar 
                  name={freelancerName} 
                  src={freelancerAvatar} 
                  size="sm" 
                />
                <span className="text-xs font-medium text-slate-700 truncate max-w-[110px]">
                  {freelancerName}
                </span>
              </div>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Starting at</p>
            <p className="text-base font-bold text-slate-900">{formatCurrency(service?.price || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
