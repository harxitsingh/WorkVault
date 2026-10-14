import React from 'react';
import ServiceCard from './ServiceCard';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { Search } from 'lucide-react';

const ServiceGrid = ({ services = [], loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-[400px]">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-5 flex-1 flex flex-col">
              <Skeleton className="h-5 w-24 mb-3" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-6 w-20 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No services found"
        description="Try adjusting your search filters or browse different categories."
        actionLabel="Clear Filters"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};

export default ServiceGrid;
