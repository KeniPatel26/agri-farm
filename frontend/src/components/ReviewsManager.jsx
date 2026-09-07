import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Star, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReviewsManager = ({ targetId, targetType = 'Product' }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [metrics, setMetrics] = useState({ totalReviews: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);

  // New Review Submission Form
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (targetId) {
      fetchReviews();
    }
  }, [targetId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews/${targetId}`);
      setReviews(res.data.reviews || []);
      setMetrics({
        totalReviews: res.data.totalReviews,
        averageRating: res.data.averageRating
      });
    } catch {
      console.warn('Could not fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        targetId,
        targetType,
        rating,
        comment
      });
      toast.success('Thank you! Review posted successfully.');
      setReviews([res.data, ...reviews]);
      // Recalculate metrics
      const newTotal = metrics.totalReviews + 1;
      const newAvg = Number(((metrics.averageRating * metrics.totalReviews + rating) / newTotal).toFixed(1));
      setMetrics({ totalReviews: newTotal, averageRating: newAvg });
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error posting review');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render interactive stars
  const renderInteractiveStars = () => {
    return (
      <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
            fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
            color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
      </div>
    );
  };

  // Helper to render static display stars
  const renderStars = (score) => {
    return (
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={score >= star ? '#f59e0b' : 'none'}
            color={score >= star ? '#f59e0b' : '#cbd5e1'}
          />
        ))}
      </div>
    );
  };

  // Check if current user has already reviewed
  const userHasReviewed = reviews.some(r => r.reviewerId?._id === user?._id);

  return (
    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      {/* Header Metric Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h4 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
          <MessageSquare size={16} /> User Reviews &amp; Ratings
        </h4>
        
        {metrics.totalReviews > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{metrics.averageRating}</span>
            {renderStars(metrics.averageRating)}
            <span style={{ fontSize: '12px', color: '#64748b' }}>({metrics.totalReviews})</span>
          </div>
        ) : (
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>No reviews yet</span>
        )}
      </div>

      {/* Review Submission Form */}
      {!userHasReviewed && user && (
        <form onSubmit={handleReviewSubmit} style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Leave a rating:</div>
          {renderInteractiveStars()}
          
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Share your experience with this item..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{ fontSize: '13px', padding: '10px' }}
            />
          </div>
          <button type="submit" className="btn" style={{ padding: '8px 14px', width: 'auto', fontSize: '13px' }} disabled={submitting}>
            {submitting ? 'Posting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 size={20} className="spin" color="var(--primary-color)" /></div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12.5px' }}>Be the first to submit a review!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
          {reviews.map((rev) => (
            <div key={rev._id} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '26px', height: '26px', background: 'var(--primary-light)',
                    color: 'var(--primary-dark)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 'bold'
                  }}>
                    {rev.reviewerId?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>{rev.reviewerId?.name || 'Deleted User'}</span>
                    <span style={{ fontSize: '9px', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '10px', marginLeft: '6px', fontWeight: '600' }}>
                      {rev.reviewerId?.role}
                    </span>
                  </div>
                </div>
                {renderStars(rev.rating)}
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: '1.4' }}>{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
