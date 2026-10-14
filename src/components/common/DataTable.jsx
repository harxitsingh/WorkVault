import React from 'react';
import { Inbox } from 'lucide-react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export default function DataTable({ 
  columns = [], 
  data = [], 
  onRowClick, 
  loading = false, 
  emptyMessage = 'No data available', 
  emptyIcon = Inbox 
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <Skeleton height="1.5rem" width="100%" />
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4">
              <Skeleton height="1.25rem" width="100%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState 
        icon={emptyIcon} 
        title="No results found" 
        description={emptyMessage} 
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.width ? `w-[${col.width}]` : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
              >
                {columns.map((col, colIndex) => (
                  <td key={`${rowIndex}-${col.key || colIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
