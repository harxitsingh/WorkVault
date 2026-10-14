import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.label || index}>
              <div className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 mr-2" aria-hidden="true" />
                )}
                {isLast || !item.to ? (
                  <span className="text-sm font-medium text-gray-500">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.to}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
