import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Heart, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BookmarksSidebar = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/favorites');
      setBookmarks(res.data || []);
    } catch {
      console.warn('Could not load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id, name) => {
    try {
      await api.delete(`/favorites/${id}`);
      setBookmarks(bookmarks.filter(b => b.targetId !== id));
      toast.success(`Removed ${name} from bookmarks`);
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  const handleContact = (shopName) => {
    toast.success(`Interest sent to ${shopName}! They will contact you shortly.`);
  };

  if (loading) return <div style={{ padding: '20px', background: 'white', borderRadius: '16px', textAlign: 'center' }}><Loader2 size={20} className="spin" color="var(--primary-color)" /></div>;

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginTop: '20px' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
        <Heart size={20} fill="#ef4444" color="#ef4444" /> 
        Bookmarked Shops
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
        {bookmarks.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', margin: '20px 0' }}>No bookmarked shops or items yet.</p>
        ) : (
          bookmarks.map(fav => (
            <div key={fav._id} style={{ 
              padding: '12px', 
              border: '1px solid #f1f5f9',
              background: '#f8fafc',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', color: '#0f172a', fontSize: '13.5px', fontWeight: '600' }}>
                    {fav.details?.name}
                  </h4>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>
                    Category: {fav.details?.category || 'User'}
                  </small>
                </div>
                <button 
                  onClick={() => removeBookmark(fav.targetId, fav.details?.name)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }}
                  title="Remove Bookmark"
                >
                  <Heart size={14} fill="#ef4444" />
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                  ₹{fav.details?.price} / {fav.details?.unit}
                </span>
                
                <button
                  onClick={() => handleContact(fav.details?.retailerId?.name || 'Retailer')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6',
                    fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px'
                  }}
                >
                  Contact Shop <ArrowRight size={10} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookmarksSidebar;
