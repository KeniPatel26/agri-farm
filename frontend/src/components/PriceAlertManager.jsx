import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Bell, Plus, Trash2, Power, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const POPULAR_CROPS = ['Wheat', 'Rice', 'Cotton', 'Mustard', 'Soybean', 'Corn', 'Potato', 'Tomato', 'Onion', 'Sugarcane'];

const PriceAlertManager = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    cropName: 'Wheat',
    targetPrice: '',
    unit: 'Quintal',
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/price-alerts');
      const data = res.data?.data || res.data || [];
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching price alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!formData.targetPrice || Number(formData.targetPrice) <= 0) {
      toast.error('Please enter a valid target price');
      return;
    }

    try {
      const res = await api.post('/price-alerts', {
        cropName: formData.cropName,
        targetPrice: Number(formData.targetPrice),
        unit: formData.unit,
      });
      const created = res.data?.data || res.data;
      setAlerts([created, ...alerts.filter((a) => a._id !== created._id)]);
      setFormData({ cropName: 'Wheat', targetPrice: '', unit: 'Quintal' });
      setShowForm(false);
      toast.success(`Price alert set for ${created.cropName} at ₹${created.targetPrice}/${created.unit}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error setting price alert');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/price-alerts/${id}/toggle`);
      const updated = res.data?.data || res.data;
      setAlerts(alerts.map((a) => (a._id === id ? updated : a)));
      toast.success(`Alert ${updated.active ? 'activated' : 'paused'}`);
    } catch (err) {
      toast.error('Failed to toggle alert');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/price-alerts/${id}`);
      setAlerts(alerts.filter((a) => a._id !== id));
      toast.success('Price alert deleted');
    } catch (err) {
      toast.error('Failed to delete alert');
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={22} color="var(--primary-color)" /> Crop Price Alerts
          </h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
            Get instant in-app alerts whenever traders post market rates meeting or exceeding your target price.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn"
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}
        >
          <Plus size={16} /> Set Price Alert
        </button>
      </div>

      {/* Add Alert Form */}
      {showForm && (
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 14px', color: 'var(--primary-dark)', fontSize: '15px' }}>
            New Crop Price Alert Threshold
          </h4>
          <form onSubmit={handleCreateAlert} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Crop Name</label>
              <select
                className="form-control"
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
              >
                {POPULAR_CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Target Price (₹) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 2500"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                required
                min="1"
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn" style={{ padding: '10px 20px' }}>
                Set Alert
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn"
                style={{ padding: '10px 16px', background: '#e2e8f0', color: '#334155' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Loading active price alerts...</p>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <Bell size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
          <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>
            No price alerts active. Set target rates to receive automated notifications when mandi buying prices peak.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {alerts.map((alert) => (
            <div
              key={alert._id}
              style={{
                background: alert.active ? '#f0fdf4' : '#f8fafc',
                border: alert.active ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>
                  {alert.cropName}
                </div>
                <div style={{ color: '#166534', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
                  Target: ≥ ₹{alert.targetPrice} / {alert.unit}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  {alert.lastTriggeredAt
                    ? `Last triggered: ${new Date(alert.lastTriggeredAt).toLocaleDateString()}`
                    : 'Monitoring active market offers...'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => handleToggle(alert._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: alert.active ? '#16a34a' : '#94a3b8',
                    padding: '4px',
                  }}
                  title={alert.active ? 'Pause Alert' : 'Resume Alert'}
                >
                  <Power size={18} />
                </button>
                <button
                  onClick={() => handleDelete(alert._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    padding: '4px',
                  }}
                  title="Delete Alert"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceAlertManager;
