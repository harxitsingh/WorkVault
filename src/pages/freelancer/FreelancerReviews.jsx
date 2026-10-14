import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { reviewService } from '../../services/reviewService';
import { formatRelativeTime } from '../../utils/formatters';
import { Star, MessageSquare } from 'lucide-react';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

const FreelancerReviews = () => {
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
        // Try userService first, fallback to reviewService
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
        size={16} 
        fill={i < Math.floor(rating) ? "currentColor" : "none"} 
        className={i < Math.floor(rating) ? "text-yellow-400" : "text-slate-300"}
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Client Reviews & Feedback</h1>
        <p className="text-slate-500">See what clients have rated and written about your completed projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Summary */}
        <Card className="p-6 md:col-span-1 flex flex-col justify-center items-center text-center">
          <p className="text-slate-500 font-medium mb-2 text-sm">Overall Client Rating</p>
          <div className="text-5xl font-black text-slate-900 mb-3">{averageRating}</div>
          <div className="flex items-center justify-center space-x-1 mb-2 text-yellow-400">
            {renderStars(Number(averageRating))}
          </div>
          <p className="text-slate-500 text-xs font-medium">Based on {totalReviews} verified client reviews</p>
        </Card>

        {/* Rating Distribution */}
        <Card className="p-6 md:col-span-2">
          <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = ratingCounts[stars];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center text-sm">
                  <div className="flex items-center w-20">
                    <span className="font-medium mr-1.5">{stars}</span>
                    <Star size={14} className="text-yellow-400" fill="currentColor" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-4">
                    <div 
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right text-slate-500 text-xs">{count}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-base font-bold text-slate-900">All Reviews ({sortedReviews.length})</h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-500 text-xs">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg py-1 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
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
                <div key={review.id || review._id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 overflow-hidden flex items-center justify-center font-bold text-sm">
                        <img
                          src={getImageUrl(reviewerAvatar, 'avatar')}
                          alt={reviewerName}
                          onError={(e) => handleImageError(e, 'avatar')}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{reviewerName}</h4>
                        <div className="flex items-center text-xs text-slate-500">
                          <span>{formatRelativeTime(review.createdAt)}</span>
                          <span className="mx-2">&bull;</span>
                          <span className="truncate max-w-[220px] sm:max-w-md font-medium text-slate-700">{serviceTitle}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-0.5 text-yellow-400">
                      {renderStars(review.rating || 5)}
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line pl-13">{review.comment}</p>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No client reviews yet</p>
              <p className="text-xs text-slate-400">Complete client orders and deliver milestone deliverables to earn ratings.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FreelancerReviews;
