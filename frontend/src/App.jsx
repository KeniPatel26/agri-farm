import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import TraderDashboard from './pages/TraderDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import AdminDashboard from './pages/AdminDashboard';
import SchemesDirectory from './components/SchemesDirectory';
import { LanguageProvider } from './context/LanguageContext';
import { ArrowRight, ShieldCheck, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import './App.css';

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Role-based dashboard
const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🌾 India's Digital Agricultural Ecosystem</span>
            </div>
            <h1 className="hero-title">
              Empowering Farmers, Traders &amp; Agri Retailers
            </h1>
            <p className="hero-subtitle">
              Real-time crop advisory, mandi buying rates, direct agricultural retail marketplace, and government schemes — all united on a single platform.
            </p>
            <div className="hero-cta-group">
              <Link to="/register" className="btn btn-hero-primary">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-hero-secondary">
                Sign In to Account
              </Link>
            </div>

            <div className="hero-features-grid">
              <div className="hero-feature-card">
                <div className="feature-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <TrendingUp size={22} />
                </div>
                <h3>Live Mandi Rates</h3>
                <p>Track real-time crop buying rates and receive instant price target alerts.</p>
              </div>

              <div className="hero-feature-card">
                <div className="feature-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                  <ShoppingBag size={22} />
                </div>
                <h3>Agri Input Market</h3>
                <p>Purchase certified seeds, fertilizers, and tools from verified agri retailers.</p>
              </div>

              <div className="hero-feature-card">
                <div className="feature-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <ShieldCheck size={22} />
                </div>
                <h3>Verified Network</h3>
                <p>Transparent trades with admin-verified traders and local mandi yards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const role = (user.role || '').toLowerCase();

  if (role === 'farmer') return <FarmerDashboard />;
  if (role === 'trader') return <TraderDashboard />;
  if (role === 'retailer') return <RetailerDashboard />;
  if (role === 'admin') return <AdminDashboard />;

  return <FarmerDashboard />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <Marketplace />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schemes"
                element={
                  <ProtectedRoute>
                    <SchemesDirectory />
                  </ProtectedRoute>
                }
              />
              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '10px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
              },
              success: {
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                },
              },
              error: {
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                },
              },
            }}
          />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
