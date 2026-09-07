import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, LogOut, Menu, X, Bell, MessageSquareWarning, ShieldCheck, Sprout } from 'lucide-react';
import api from '../api/axiosInstance';
import { useLanguage } from '../context/LanguageContext';
import FeedbackModal from './FeedbackModal';
import './Navbar.css';

const ROLE_CONFIG = {
  farmer: { label: 'Farmer', color: '#15803d', bg: '#dcfce7' },
  trader: { label: 'Trader', color: '#1d4ed8', bg: '#dbeafe' },
  retailer: { label: 'Agri Retailer', color: '#b45309', bg: '#fef3c7' },
  admin: { label: 'Admin', color: '#6d28d9', bg: '#ede9fe' },
};

const formatRole = (role) => {
  const key = (role || '').toLowerCase();
  return ROLE_CONFIG[key] || { label: role || 'User', color: '#15803d', bg: '#dcfce7' };
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem('agri_custom_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agri_custom_lang', selectedLang);
    changeLanguage(selectedLang);
  }, [selectedLang, changeLanguage]);

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then((res) => {
          const data = res.data?.data || res.data || [];
          const count = data.filter((n) => !n.read).length;
          setUnreadCount(count);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const userRoleNormalized = (user?.role || '').toLowerCase();
  const roleBadge = formatRole(user?.role);

  return (
    <>
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <div className="logo-icon-wrapper">
              <Sprout size={20} color="white" />
            </div>
            <span>AgriConnect</span>
          </Link>

          {/* Desktop nav */}
          <ul className="nav-links desktop-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <span
                    style={{
                      background: roleBadge.bg,
                      color: roleBadge.color,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontWeight: '700',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: `1px solid ${roleBadge.color}30`,
                    }}
                  >
                    {roleBadge.label}
                    {user.verificationStatus === 'approved' && userRoleNormalized !== 'farmer' && userRoleNormalized !== 'admin' && (
                      <ShieldCheck size={13} color="#10b981" title="Verified Account" />
                    )}
                  </span>
                </li>

                <li className="nav-item">
                  <Link to="/" className="nav-link">{t('nav.home')}</Link>
                </li>

                <li className="nav-item">
                  <Link to="/marketplace" className="nav-link">{t('nav.marketplace')}</Link>
                </li>

                {(userRoleNormalized === 'farmer' || userRoleNormalized === 'admin') && (
                  <li className="nav-item">
                    <Link to="/schemes" className="nav-link">{t('nav.schemes')}</Link>
                  </li>
                )}

                <li className="nav-item" style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#64748b' }} title={`${unreadCount} unread notifications`}>
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#ef4444',
                          color: 'white',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          borderRadius: '50%',
                          width: '15px',
                          height: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </li>

                <li className="nav-item">
                  <button
                    onClick={() => setFeedbackOpen(true)}
                    style={{
                      background: 'none',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#475569',
                    }}
                    title="Feedback & Support"
                  >
                    <MessageSquareWarning size={14} /> Help
                  </button>
                </li>
              </>
            ) : null}

            {/* Language dropdown */}
            <li className="nav-item" style={{ display: 'flex', alignItems: 'center' }}>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="lang-select"
              >
                <option value="en">English (EN)</option>
                <option value="hi">हिन्दी (HI)</option>
                <option value="gu">ગુજરાતી (GU)</option>
              </select>
            </li>

            {user ? (
              <>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} /> {user.name}
                  </Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn-logout" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LogOut size={16} /> {t('nav.logout')}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn-register">Register</Link>
                </li>
              </>
            )}
          </ul>

          {/* Mobile hamburger button */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div className="mobile-drawer">
            {user ? (
              <ul className="mobile-nav-list">
                <li className="mobile-user-info">
                  Signed in as <strong>{user.name}</strong> ({roleBadge.label})
                </li>
                <li>
                  <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/marketplace" className="nav-link" onClick={() => setMenuOpen(false)}>
                    {t('nav.marketplace')}
                  </Link>
                </li>
                {(userRoleNormalized === 'farmer' || userRoleNormalized === 'admin') && (
                  <li>
                    <Link to="/schemes" className="nav-link" onClick={() => setMenuOpen(false)}>
                      {t('nav.schemes')}
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                    {t('nav.profile')}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => { setFeedbackOpen(true); setMenuOpen(false); }}
                    style={{ background: 'none', border: 'none', color: '#475569', padding: 0, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageSquareWarning size={15} /> Feedback &amp; Grievance
                  </button>
                </li>
                <li style={{ marginTop: '8px' }}>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn-logout" style={{ width: '100%', justifyContent: 'center' }}>
                    <LogOut size={16} /> {t('nav.logout')}
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="mobile-nav-list">
                <li><Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link></li>
                <li><Link to="/register" className="btn-register" onClick={() => setMenuOpen(false)} style={{ display: 'block', textAlign: 'center' }}>Register</Link></li>
              </ul>
            )}
          </div>
        )}
      </nav>

      {/* Global Feedback Dialog */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
};

export default Navbar;
