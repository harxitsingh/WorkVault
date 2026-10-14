import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getAllReviews();
        if (isMounted) setReviews(data || []);
      } catch (err) {
        console.error('Failed to load reviews:', err);
        toast.error('Failed to load reviews from platform');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReviews();
    return () => { isMounted = false; };
  }, []);

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter === 'All') return true;
    return Math.floor(r.rating || 0).toString() === ratingFilter;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
      />
    ));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Platform Reviews & Moderation</h1>
          <p className="text-sm text-slate-500 mt-1">Audit verified client feedback, ratings distribution, and reputation authenticity.</p>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50/50 gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Platform Feedback ({reviews.length})</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Filter by Rating:</span>
            <select 
              className="bg-white border border-slate-200 rounded-lg py-1 px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No platform reviews found"
            description={ratingFilter === 'All' ? 'No client reviews submitted in the system yet.' : `No reviews found matching ${ratingFilter} stars.`}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => {
              const reviewerName = review.client?.name || review.reviewerName || 'Client';
              const targetName = review.freelancer?.name || review.targetUser?.name || 'Freelancer';
              const serviceTitle = review.service?.title || 'Milestone Order';

              return (
                <div key={review.id || review._id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors space-y-2.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 text-sm">
                        <strong className="text-slate-900">{reviewerName}</strong>
                        <span className="text-slate-400 text-xs">reviewed</span>
                        <strong className="text-primary">{targetName}</strong>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Service: <span className="font-medium text-slate-600">{serviceTitle}</span> • {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating || 5)}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    "{review.comment}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
