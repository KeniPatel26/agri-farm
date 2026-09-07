import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Sprout, ShieldAlert, User, Mail, Lock, Phone, MapPin, Globe, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'farmer',
    village: '',
    district: '',
    state: 'Gujarat',
    language: 'en',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { name, email, mobile, password, role, village, district, state, language, address } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic mobile validation
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      const errText = 'Please enter a valid 10-digit mobile number';
      setError(errText);
      toast.error(errText);
      return;
    }

    setLoading(true);

    try {
      const fullAddress = address.trim() || `${village ? village + ', ' : ''}${district ? district + ', ' : ''}${state}`.trim();

      const payload = {
        name: name.trim(),
        email: email.trim(),
        mobile: cleanMobile,
        password,
        role: role.toLowerCase().trim(),
        village: village.trim(),
        district: district.trim(),
        state: state.trim(),
        language,
        preferredLanguage: language,
        address: fullAddress,
        location: {
          type: 'Point',
          coordinates: [72.9289, 22.5645], // Default Anand/Gujarat coords
          address: fullAddress,
        },
      };

      const res = await api.post('/auth/register', payload);
      const data = res.data?.data || res.data;
      login(data, data.token);
      toast.success(`Welcome to AgriConnect, ${data.name}!`);
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Sprout size={28} color="var(--primary-color)" />
          </div>
          <h2>Create AgriConnect Account</h2>
          <p>
            Connect directly with farmers, traders, mandis, and agricultural retailers across India.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form-grid">
          {/* Full Name */}
          <div className="form-group full-width">
            <label htmlFor="name">
              <User size={15} /> Full Name *
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              placeholder="e.g. Ramesh Patel"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={15} /> Email Address *
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="name@example.com"
            />
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label htmlFor="mobile">
              <Phone size={15} /> Mobile Number *
            </label>
            <input
              type="tel"
              className="form-control"
              id="mobile"
              name="mobile"
              value={mobile}
              onChange={onChange}
              required
              maxLength="12"
              placeholder="10-digit mobile number"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              <Lock size={15} /> Password *
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
              placeholder="Min 6 characters"
            />
          </div>

          {/* Primary Role */}
          <div className="form-group">
            <label htmlFor="role">
              <Sprout size={15} /> Platform Role *
            </label>
            <select
              className="form-control"
              id="role"
              name="role"
              value={role}
              onChange={onChange}
              required
            >
              <option value="farmer">👨‍🌾 Farmer</option>
              <option value="trader">💰 Trader (Mandi / Buying)</option>
              <option value="retailer">🏪 Agri Retailer (Inputs &amp; Seeds)</option>
            </select>
          </div>

          {/* Verification Notice for Traders & Retailers */}
          {role !== 'farmer' && (
            <div className="role-alert full-width">
              <ShieldAlert size={18} color="#2563eb" style={{ flexShrink: 0 }} />
              <span>
                <strong>Note:</strong> {role === 'trader' ? 'Trader' : 'Retailer'} accounts undergo quick Admin Verification to ensure trusted market trade.
              </span>
            </div>
          )}

          {/* Village / Town */}
          <div className="form-group">
            <label htmlFor="village">
              <MapPin size={15} /> Village / Town
            </label>
            <input
              type="text"
              className="form-control"
              id="village"
              name="village"
              value={village}
              onChange={onChange}
              placeholder="e.g. Mogar / Chikhli"
            />
          </div>

          {/* District */}
          <div className="form-group">
            <label htmlFor="district">
              <MapPin size={15} /> District
            </label>
            <input
              type="text"
              className="form-control"
              id="district"
              name="district"
              value={district}
              onChange={onChange}
              placeholder="e.g. Anand / Navsari"
            />
          </div>

          {/* State */}
          <div className="form-group">
            <label htmlFor="state">
              <MapPin size={15} /> State
            </label>
            <input
              type="text"
              className="form-control"
              id="state"
              name="state"
              value={state}
              onChange={onChange}
              placeholder="e.g. Gujarat"
            />
          </div>

          {/* Preferred Language */}
          <div className="form-group">
            <label htmlFor="language">
              <Globe size={15} /> Language Preference
            </label>
            <select
              className="form-control"
              id="language"
              name="language"
              value={language}
              onChange={onChange}
            >
              <option value="en">English (English)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          {/* Detailed Address */}
          <div className="form-group full-width">
            <label htmlFor="address">
              <MapPin size={15} /> Farm / Business Address
            </label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address"
              value={address}
              onChange={onChange}
              placeholder="e.g. Near Dairy Circle, National Highway 48, Anand"
            />
          </div>

          {/* Submit Button */}
          <div className="full-width" style={{ marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary-action" disabled={loading}>
              {loading ? (
                'Completing Registration...'
              ) : (
                <>
                  Complete Registration <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
