import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import './App.css';

// A simple wrapper to conditionally render dashboards
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1 style={{ color: 'var(--primary-dark)' }}>Welcome to Eco Farm</h1>
        <p>Please login or register to manage your farm.</p>
      </div>
    );
  }

  if (user.role === 'Farmer') return <FarmerDashboard />;
  if (user.role === 'Trader') return <div style={{textAlign: 'center', marginTop: '50px'}}>Trader Dashboard (Coming Soon)</div>;
  if (user.role === 'Retailer') return <div style={{textAlign: 'center', marginTop: '50px'}}>Retailer Dashboard (Coming Soon)</div>;
  
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
