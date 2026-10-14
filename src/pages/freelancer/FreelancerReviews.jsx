import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { reviewService } from '../../services/reviewService';
import { formatRelativeTime } from '../../utils/formatters';
import { Star, MessageSquare } from 'lucide-react';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function FreelancerReviews() {
  const { user } = useAuth();
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      const userId = user?.id || user?._id;
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        let data = await userService.getUserReviews(userId).catch(() => []);
        if (!data || data.length === 0) {
          data = await reviewService.getReviewsByUser(userId).catch(() => []);
        }
        if (isMounted) setReviewsList(data || []);
      } catch (err) {
        console.warn('Could not load reviews:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReviews();
    return () => { isMounted = false; };
  }, [user]);

  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)
    : (user?.rating || 5.0).toFixed(1);

  const totalReviews = reviewsList.length;

  const ratingCounts = {
    5: reviewsList.filter(r => Math.floor(r.rating) === 5).length,
    4: reviewsList.filter(r => Math.floor(r.rating) === 4).length,
    3: reviewsList.filter(r => Math.floor(r.rating) === 3).length,
    2: reviewsList.filter(r => Math.floor(r.rating) === 2).length,
    1: reviewsList.filter(r => Math.floor(r.rating) === 1).length,
  };

  const sortedReviews = [...reviewsList].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'lowest') return (a.rating || 0) - (b.rating || 0);
    return 0;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < Math.floor(rating) ? "currentColor" : "none"} 
        className={i < Math.floor(rating) ? "text-amber-400" : "text-slate-200"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Client Reviews & Reputation</h1>
        <p className="text-sm text-slate-500 mt-1">Verified ratings and comments received from completed milestone deliverables.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Summary */}
        <Card className="p-6 md:col-span-1 flex flex-col justify-center items-center text-center border border-slate-200 shadow-xs">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Overall Score</p>
          <div className="text-5xl font-black text-slate-900 mb-2">{averageRating}</div>
          <div className="flex items-center justify-center space-x-1 mb-2 text-amber-400">
            {renderStars(Number(averageRating))}
          </div>
          <p className="text-xs text-slate-500">Based on {totalReviews} client reviews</p>
        </Card>

        {/* Rating Distribution */}
        <Card className="p-6 md:col-span-2 border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-wider">Rating Breakdown</h3>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = ratingCounts[stars];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center text-xs">
                  <div className="flex items-center w-16 text-slate-600 font-semibold">
                    <span className="mr-1">{stars}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-3">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-slate-400 font-bold">{count}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50/50 gap-3">
          <h2 className="text-sm font-bold text-slate-900">All Client Feedback ({sortedReviews.length})</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedReviews.length > 0 ? (
            sortedReviews.map(review => {
              const reviewerName = review.client?.name || review.reviewerName || 'Client';
              const reviewerAvatar = review.client?.profileImage || review.client?.avatar || review.reviewerAvatar;
              const serviceTitle = review.service?.title || review.serviceName || 'Project Delivery';

              return (
                <div key={review.id || review._id} className="p-5 sm:p-6 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={reviewerAvatar}
                        name={reviewerName}
                        size="md"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{reviewerName}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <span>{formatRelativeTime(review.createdAt)}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-600 truncate max-w-xs">{serviceTitle}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-amber-400 shrink-0">
                      {renderStars(review.rating || 5)}
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line pl-13">
                    {review.comment}
                  </p>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No client reviews yet"
              description="Complete client orders and deliver quality milestone deliverables to receive client ratings."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
