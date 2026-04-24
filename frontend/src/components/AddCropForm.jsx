import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AddCropForm = ({ onCropAdded }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    cropName: '',
    stage: 'Growing',
    quantity: '',
    location: user?.location || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { cropName, stage, quantity, location } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      const res = await axios.post('http://localhost:5000/api/crops', formData, config);
      onCropAdded(res.data);
      setFormData({ ...formData, cropName: '', quantity: '' }); // Reset fields
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding crop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: '100%', marginBottom: '30px' }}>
      <h3 style={{ color: 'var(--primary-dark)', marginBottom: '20px' }}>Add New Crop</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label>Crop Name</label>
          <input
            type="text"
            className="form-control"
            name="cropName"
            value={cropName}
            onChange={onChange}
            required
            placeholder="e.g., Wheat, Rice"
          />
        </div>
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label>Stage</label>
          <select className="form-control" name="stage" value={stage} onChange={onChange}>
            <option value="Planting">Planting</option>
            <option value="Growing">Growing</option>
            <option value="Harvesting">Harvesting</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label>Quantity (kg/tons)</label>
          <input
            type="number"
            className="form-control"
            name="quantity"
            value={quantity}
            onChange={onChange}
            required
            placeholder="e.g., 500"
          />
        </div>
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label>Location</label>
          <input
            type="text"
            className="form-control"
            name="location"
            value={location}
            onChange={onChange}
            required
          />
        </div>
        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Crop'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCropForm;
