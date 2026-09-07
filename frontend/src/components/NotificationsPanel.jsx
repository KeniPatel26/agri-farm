import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Bell, CheckCircle } from 'lucide-react';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (error) {
        console.error('Error fetching notifications', error);
        // Fallback Mock
        setNotifications([
          { _id: '1', message: 'Wheat prices have increased by 5% in your nearby market.', type: 'PriceAlert', read: false, createdAt: new Date().toISOString() },
          { _id: '2', message: 'New retailer (AgriShop) registered within 10km of your farm.', type: 'SystemAlert', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {}).catch(() => {});
      
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return null; // Or a small skeleton

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
        <Bell size={20} color={unreadCount > 0 ? "#ef4444" : "#64748b"} /> 
        Notifications {unreadCount > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{unreadCount}</span>}
      </h3>
      
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>No new notifications.</p>
        ) : (
          notifications.map(note => (
            <div key={note._id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px', 
              borderBottom: '1px solid #f1f5f9',
              background: note.read ? 'transparent' : '#f0fdf4',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <div>
                <p style={{ margin: '0 0 4px 0', color: note.read ? '#475569' : '#0f172a', fontSize: '14px', fontWeight: note.read ? 'normal' : '500' }}>
                  {note.message}
                </p>
                <small style={{ color: '#94a3b8', fontSize: '12px' }}>
                  {new Date(note.createdAt).toLocaleDateString()}
                </small>
              </div>
              {!note.read && (
                <button 
                  onClick={() => markAsRead(note._id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}
                  title="Mark as read"
                >
                  <CheckCircle size={20} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
