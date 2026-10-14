import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from './Card';

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral', 
  description 
}) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-emerald-600 bg-emerald-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="h-4 w-4 mr-1" />;
      case 'negative': return <TrendingDown className="h-4 w-4 mr-1" />;
      default: return <Minus className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {Icon && (
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && (
          <span className={`ml-2 flex items-center text-sm font-medium px-2 py-0.5 rounded-full ${getChangeColor()}`}>
            {getChangeIcon()}
            {change}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </Card>
  );
}
