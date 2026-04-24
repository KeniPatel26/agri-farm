import { useState } from 'react';
import axios from 'axios';

const CropList = ({ crops, onCropDeleted, onCropUpdated }) => {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        await axios.delete(`http://localhost:5000/api/crops/${id}`, config);
        onCropDeleted(id);
      } catch (err) {
        alert('Error deleting crop');
      }
    }
  };

  const startEdit = (crop) => {
    setEditingId(crop._id);
    setEditFormData({ stage: crop.stage, quantity: crop.quantity });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const res = await axios.put(`http://localhost:5000/api/crops/${id}`, editFormData, config);
      onCropUpdated(res.data);
      setEditingId(null);
    } catch (err) {
      alert('Error updating crop');
    }
  };

  if (crops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
        <p>No crops added yet. Start by adding a crop above.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {crops.map((crop) => (
        <div key={crop._id} className="auth-card" style={{ padding: '20px', margin: 0, width: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
            <h4 style={{ color: 'var(--primary-dark)', fontSize: '20px', margin: 0 }}>{crop.cropName}</h4>
            <span style={{ 
              background: 'var(--primary-light)', 
              color: 'var(--primary-dark)', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {crop.stage}
            </span>
          </div>
          
          {editingId === crop._id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select 
                className="form-control" 
                value={editFormData.stage}
                onChange={(e) => setEditFormData({...editFormData, stage: e.target.value})}
              >
                <option value="Planting">Planting</option>
                <option value="Growing">Growing</option>
                <option value="Harvesting">Harvesting</option>
                <option value="Sold">Sold</option>
              </select>
              <input 
                type="number" 
                className="form-control" 
                value={editFormData.quantity}
                onChange={(e) => setEditFormData({...editFormData, quantity: e.target.value})}
                placeholder="Quantity"
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => handleUpdate(crop._id)} className="btn" style={{ padding: '8px' }}>Save</button>
                <button onClick={cancelEdit} className="btn" style={{ padding: '8px', background: '#ccc', color: '#333' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Quantity:</strong> {crop.quantity}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Location:</strong> {crop.location}</p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>Added: {new Date(crop.createdAt).toLocaleDateString()}</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button 
                  onClick={() => startEdit(crop)}
                  style={{ flex: 1, padding: '8px', border: '1px solid var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(crop._id)}
                  style={{ flex: 1, padding: '8px', border: '1px solid var(--error)', background: 'transparent', color: 'var(--error)', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CropList;
