import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Sprout, LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', formData);
      const data = res.data?.data || res.data;
      login(data, data.token);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Sprout size={28} color="var(--primary-color)" />
          </div>
          <h2>Welcome to AgriConnect</h2>
          <p>Sign in to access your agricultural dashboard</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="email">
              <Mail size={15} /> Email Address / Mobile
            </label>
            <input
              type="text"
              className="form-control"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="Enter your registered email"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label htmlFor="password">
              <Lock size={15} /> Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Enter your account password"
            />
          </div>

          <button type="submit" className="btn btn-primary-action" disabled={loading}>
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                <LogIn size={16} /> Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an AgriConnect account? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
