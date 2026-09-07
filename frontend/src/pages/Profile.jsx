import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { User, Mail, Phone, MapPin, Shield, CheckCircle, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
    district: '',
    state: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobile: user.mobile || user.mobileNumber || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/auth/profile', formData);
      const updatedData = res.data?.data || res.data;
      // Update user in context/localStorage
      login(updatedData, localStorage.getItem('token'));
      toast.success('Profile updated successfully!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error updating profile';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const roleFormatted = (user.role || 'farmer').charAt(0).toUpperCase() + (user.role || 'farmer').slice(1).toLowerCase();

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '580px' }}>
        {/* Avatar & Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
              border: '3px solid white',
              boxShadow: '0 4px 10px rgba(46, 125, 50, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <User size={38} color="var(--primary-dark)" />
          </div>
          <h2 style={{ margin: '0 0 6px', color: 'var(--primary-dark)', fontSize: '24px' }}>{user.name}</h2>
          <span
            style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {roleFormatted}
            {user.verificationStatus === 'approved' && (
              <CheckCircle size={13} color="#16a34a" />
            )}
          </span>
        </div>

        {/* Readonly Info Summary */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--primary-color)" />
              <span style={{ color: '#475569', fontSize: '13px' }}>
                <strong>Email:</strong> {user.email}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="var(--primary-color)" />
              <span style={{ color: '#475569', fontSize: '13px' }}>
                <strong>Role:</strong> {roleFormatted}
              </span>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="form-group full-width">
            <label>
              <User size={15} /> Full Name *
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>
              <Phone size={15} /> Mobile Number *
            </label>
            <input
              type="tel"
              className="form-control"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <MapPin size={15} /> Village / Town
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder="e.g. Mogar"
            />
          </div>

          <div className="form-group">
            <label>
              <MapPin size={15} /> District
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="e.g. Anand"
            />
          </div>

          <div className="form-group full-width">
            <label>
              <MapPin size={15} /> Full Address
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Detailed farm, warehouse, or shop address"
            />
          </div>

          <div className="full-width" style={{ marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary-action" disabled={loading}>
              {loading ? (
                'Saving Changes...'
              ) : (
                <>
                  <Save size={16} /> Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
