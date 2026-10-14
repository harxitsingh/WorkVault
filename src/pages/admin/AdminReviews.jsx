import React, { useState } from 'react';
import { Star, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const mockReviews = [
  { id: 'RV-101', reviewer: 'Aarav Patel', target: 'Priya Sharma', service: 'Full Stack E-commerce Website', rating: 5, comment: 'Excellent work! Delivered on time and exceeded expectations.', date: '25 Sep 2024' },
  { id: 'RV-102', reviewer: 'Vikram Singh', target: 'Neha Gupta', service: 'UI/UX Design for Mobile App', rating: 4, comment: 'Good designs, but communication could be slightly better.', date: '20 Sep 2024' },
  { id: 'RV-103', reviewer: 'Rahul Desai', target: 'Amit Kumar', service: 'SEO Optimization', rating: 2, comment: 'Did not see much improvement in rankings. Very disappointed.', date: '15 Sep 2024' },
  { id: 'RV-104', reviewer: 'Priya Sharma', target: 'Aarav Patel', service: 'Full Stack E-commerce Website', rating: 5, comment: 'Great client, clear requirements, prompt payment.', date: '25 Sep 2024' },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState(mockReviews);
  const [ratingFilter, setRatingFilter] = useState('All');
  
  const filteredReviews = reviews.filter(r => ratingFilter === 'All' || r.rating.toString() === ratingFilter);

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to remove this review?')) {
      setReviews(reviews.filter(r => r.id !== id));
      toast.success('Review removed successfully');
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
    ));
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reviews Management</h1>
        <p className="text-slate-600">Monitor and moderate platform reviews.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="font-semibold text-slate-800">All Reviews</div>
          <select 
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredReviews.length > 0 ? filteredReviews.map(review => (
            <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{review.reviewer}</span>
                    <span className="text-slate-400 text-sm">reviewed</span>
                    <span className="font-bold text-indigo-600">{review.target}</span>
                  </div>
                  <div className="text-sm text-slate-500 mb-2">For: {review.service} &bull; {review.date}</div>
                </div>
                <div className="flex gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-slate-700 text-sm mb-4">"{review.comment}"</p>
              <div className="flex justify-end">
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-slate-500">
              No reviews found matching your filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
