import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { TrendingUp, Plus, Trash2, Edit2, X, Check, Package, MapPin, Store, ShieldCheck } from 'lucide-react';
import NotificationsPanel from '../components/NotificationsPanel';

const CROP_NAMES = ['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Sugarcane', 'Potato', 'Tomato', 'Onion', 'Mustard'];
const GRADES = ['Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Fair)', 'FAQ (Fair Average Quality)'];

const TraderDashboard = () => {
  const { user } = useContext(AuthContext);
  const [prices, setPrices] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prices'); // 'prices', 'markets', 'analytics'
  const [showForm, setShowForm] = useState(false);
  const [showMarketForm, setShowMarketForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    cropName: 'Wheat',
    variety: '',
    grade: 'Grade A (Premium)',
    marketName: '',
    marketId: '',
    price: '',
    quantity: '',
    unit: 'Quintal',
  });

  const [marketFormData, setMarketFormData] = useState({
    marketName: '',
    address: '',
    district: '',
    state: '',
    workingHours: '8:00 AM - 6:00 PM',
    contactNumber: user?.mobileNumber || '',
  });

  useEffect(() => {
    fetchPrices();
    fetchMarkets();
  }, []);

  useEffect(() => {
    fetchPriceHistory();
  }, [selectedCrop]);

  const fetchPrices = async () => {
    try {
      const res = await api.get('/prices');
      const data = res.data?.data || res.data || [];
      setPrices(data);
    } catch (err) {
      console.error('Error fetching prices', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarkets = async () => {
    try {
      const res = await api.get('/markets?myOnly=true');
      const data = res.data?.data || res.data || [];
      setMarkets(data);
      if (data.length > 0 && !formData.marketName) {
        setFormData((prev) => ({ ...prev, marketName: data[0].marketName, marketId: data[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching markets', err);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const res = await api.get(`/analytics/price/${selectedCrop}`);
      const data = res.data?.data || res.data || [];
      if (data.length > 0) {
        const formatted = data.map((item) => ({
          date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          price: item.price,
        }));
        setPriceHistory(formatted);
      } else {
        setPriceHistory([]);
      }
    } catch {
      setPriceHistory([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/prices', {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity) || 0,
      });
      const created = res.data?.data || res.data;
      setPrices([created, ...prices]);
      setFormData({
        cropName: 'Wheat',
        variety: '',
        grade: 'Grade A (Premium)',
        marketName: markets[0]?.marketName || '',
        marketId: markets[0]?._id || '',
        price: '',
        quantity: '',
        unit: 'Quintal',
      });
      setShowForm(false);
      toast.success('Market buying rate posted! Subscribed farmers with target price alerts have been notified.');
      if (formData.cropName === selectedCrop) fetchPriceHistory();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error adding price';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/markets', marketFormData);
      const created = res.data?.data || res.data;
      setMarkets([created, ...markets]);
      setMarketFormData({
        marketName: '',
        address: '',
        district: '',
        state: '',
        workingHours: '8:00 AM - 6:00 PM',
        contactNumber: user?.mobileNumber || '',
      });
      setShowMarketForm(false);
      toast.success('Market / Mandi registered successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error registering market');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this price listing?')) return;
    try {
      await api.delete(`/prices/${id}`);
      setPrices(prices.filter((p) => p._id !== id));
      toast.success('Price listing deleted successfully');
    } catch {
      toast.error('Error deleting price listing');
    }
  };

  const startEdit = (price) => {
    setEditingId(price._id);
    setEditData({ price: price.price, quantity: price.quantity });
  };

  const handleUpdate = async (id) => {
    try {
      const res = await api.put(`/prices/${id}`, {
        price: Number(editData.price),
        quantity: Number(editData.quantity),
      });
      const updated = res.data?.data || res.data;
      setPrices(prices.map((p) => (p._id === id ? updated : p)));
      setEditingId(null);
      toast.success('Price listing updated successfully');
    } catch {
      toast.error('Error updating price listing');
    }
  };

  const uniqueCrops = [...new Set(prices.map((p) => p.cropName))];
  const avgPrice =
    prices.length > 0
      ? (prices.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / prices.length).toFixed(0)
      : 0;

  const cropBarData = uniqueCrops.map((crop) => ({
    name: crop,
    listings: prices.filter((p) => p.cropName === crop).length,
  }));

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ color: 'var(--primary-dark)', fontSize: '28px', fontWeight: '800', margin: 0 }}>
              Trader Mandi Dashboard
            </h2>
            {user?.verificationStatus === 'approved' ? (
              <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={13} /> Verified Trader
              </span>
            ) : (
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                Verification Pending
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Welcome, {user?.name}</p>
        </div>

        {/* Tab & Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '20px', padding: '3px' }}>
            <button
              onClick={() => setActiveTab('prices')}
              style={{
                border: 'none',
                background: activeTab === 'prices' ? 'white' : 'transparent',
                color: activeTab === 'prices' ? 'var(--primary-dark)' : '#475569',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Price Listings
            </button>
            <button
              onClick={() => setActiveTab('markets')}
              style={{
                border: 'none',
                background: activeTab === 'markets' ? 'white' : 'transparent',
                color: activeTab === 'markets' ? 'var(--primary-dark)' : '#475569',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              My Mandis / Markets
            </button>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '10px 18px' }}
          >
            <Plus size={16} /> Post Buying Rate
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '30px' }}>
        {[
          { label: 'Active Buying Listings', value: prices.length, color: '#3b82f6' },
          { label: 'Crops Supported', value: uniqueCrops.length, color: '#10b981' },
          { label: 'Avg Buying Price', value: `₹${avgPrice}`, color: '#f59e0b' },
          { label: 'Operating Markets', value: markets.length, color: '#8b5cf6' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-sm)',
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <div style={{ fontSize: '26px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Add Price Form */}
      {showForm && (
        <div style={{ background: 'white', padding: '26px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
          <h3 style={{ color: 'var(--primary-dark)', fontSize: '18px', margin: '0 0 18px' }}>Post Crop Buying Rate</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Crop Name *</label>
              <select
                className="form-control"
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                required
              >
                {CROP_NAMES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Quality Grade</label>
              <select
                className="form-control"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Market / Mandi Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.marketName}
                onChange={(e) => setFormData({ ...formData, marketName: e.target.value })}
                placeholder="e.g. APMC Ahmedabad"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Buying Price (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 2550"
                min="1"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Required Quantity</label>
              <input
                type="number"
                className="form-control"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g. 500"
                min="0"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Unit</label>
              <select
                className="form-control"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="Quintal">Quintal</option>
                <option value="Ton">Ton</option>
                <option value="kg">kg</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button type="submit" className="btn" style={{ width: 'auto', padding: '10px 24px' }}>
                Publish Buying Rate
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn"
                style={{ width: 'auto', padding: '10px 20px', background: '#e2e8f0', color: '#334155' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Mandi Management */}
      {activeTab === 'markets' ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={20} color="var(--primary-color)" /> My Operating Mandis &amp; Markets
            </h3>
            <button
              onClick={() => setShowMarketForm(!showMarketForm)}
              className="btn"
              style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
            >
              <Plus size={14} /> Register Mandi
            </button>
          </div>

          {showMarketForm && (
            <form onSubmit={handleCreateMarket} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Market / Mandi Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. APMC Sanand Yard"
                    value={marketFormData.marketName}
                    onChange={(e) => setMarketFormData({ ...marketFormData, marketName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Address *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Yard Road, Sanand"
                    value={marketFormData.address}
                    onChange={(e) => setMarketFormData({ ...marketFormData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>District</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ahmedabad"
                    value={marketFormData.district}
                    onChange={(e) => setMarketFormData({ ...marketFormData, district: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Operating Hours</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="8:00 AM - 6:00 PM"
                    value={marketFormData.workingHours}
                    onChange={(e) => setMarketFormData({ ...marketFormData, workingHours: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn" style={{ width: 'auto', padding: '8px 20px' }}>
                  Save Mandi
                </button>
                <button
                  type="button"
                  onClick={() => setShowMarketForm(false)}
                  className="btn"
                  style={{ width: 'auto', padding: '8px 16px', background: '#e2e8f0', color: '#334155' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {markets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
              No mandis registered yet. Register your market yard to let farmers find you.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {markets.map((m) => (
                <div key={m._id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{m.marketName}</div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {m.address} {m.district ? `(${m.district})` : ''}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                    ⏰ Hours: {m.workingHours}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tab 1: Price Listings Grid */
        <div className="dashboard-grid">
          <div>
            {/* Price History Chart */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px' }}>
                  <TrendingUp size={20} color="#10b981" /> Historical Mandi Price Trend
                </h3>
                <select
                  className="form-control"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                >
                  {CROP_NAMES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="price" name="Price (₹)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13.5px' }}>
                  No historical rate entries logged for {selectedCrop} yet.
                </div>
              )}
            </div>

            {/* Price Listings Table */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ margin: '0 0 18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px' }}>
                <Package size={18} color="#3b82f6" /> My Active Buying Rate Listings
              </h3>

              {loading ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Loading listings...</p>
              ) : prices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No buying listings yet. Click "Post Buying Rate" above to invite farmer supply.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Crop', 'Grade', 'Market', 'Rate (₹)', 'Quantity', 'Date', 'Actions'].map((h) => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#475569', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map((p) => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0f172a' }}>{p.cropName}</td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>{p.grade || 'Standard'}</td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>{p.marketName}</td>
                          <td style={{ padding: '12px 14px' }}>
                            {editingId === p._id ? (
                              <input
                                type="number"
                                className="form-control"
                                value={editData.price}
                                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                                style={{ width: '80px', padding: '4px 6px' }}
                              />
                            ) : (
                              <span style={{ color: '#10b981', fontWeight: '700' }}>₹{p.price}/{p.unit || 'Q'}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {editingId === p._id ? (
                              <input
                                type="number"
                                className="form-control"
                                value={editData.quantity}
                                onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                                style={{ width: '80px', padding: '4px 6px' }}
                              />
                            ) : (
                              p.quantity || '—'
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '12px' }}>
                            {new Date(p.date || p.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {editingId === p._id ? (
                                <>
                                  <button onClick={() => handleUpdate(p._id)} style={actionBtn('#10b981')} title="Save">
                                    <Check size={14} />
                                  </button>
                                  <button onClick={() => setEditingId(null)} style={actionBtn('#94a3b8')} title="Cancel">
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(p)} style={actionBtn('#3b82f6')} title="Edit">
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDelete(p._id)} style={actionBtn('#ef4444')} title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <NotificationsPanel />
          </div>
        </div>
      )}
    </div>
  );
};

const actionBtn = (color) => ({
  background: 'none',
  border: `1px solid ${color}`,
  borderRadius: '6px',
  color: color,
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
});

export default TraderDashboard;
