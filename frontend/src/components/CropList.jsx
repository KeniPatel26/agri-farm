import { useState } from 'react';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { BookOpen, Calendar, MapPin, Edit2, Trash2, Sprout, Check, X } from 'lucide-react';

const STAGE_COLORS = {
  Planned: { bg: '#f1f5f9', color: '#475569' },
  Growing: { bg: '#dcfce7', color: '#166534' },
  'Harvest Ready': { bg: '#fef3c7', color: '#92400e' },
  Harvested: { bg: '#dbeafe', color: '#1e40af' },
  Sold: { bg: '#f3e8ff', color: '#6b21a8' },
};

const CropList = ({ crops, onCropDeleted, onCropUpdated, onManageDiary }) => {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this crop and its activity records?')) {
      try {
        await api.delete(`/crops/${id}`);
        onCropDeleted(id);
        toast.success('Crop deleted successfully');
      } catch (err) {
        toast.error('Error deleting crop');
      }
    }
  };

  const startEdit = (crop) => {
    setEditingId(crop._id);
    setEditFormData({
      stage: crop.stage || 'Growing',
      quantity: crop.quantity || 0,
      variety: crop.variety || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id) => {
    try {
      const res = await api.put(`/crops/${id}`, {
        stage: editFormData.stage,
        quantity: Number(editFormData.quantity),
        variety: editFormData.variety,
      });
      const updated = res.data?.data || res.data;
      onCropUpdated(updated);
      setEditingId(null);
      toast.success('Crop updated successfully');
    } catch (err) {
      toast.error('Error updating crop');
    }
  };

  if (crops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <Sprout size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
        <h4 style={{ color: '#0f172a', margin: '0 0 6px' }}>No Active Crops</h4>
        <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>
          You have not added any crops yet. Use the form above to register your first seasonal planting.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
      {crops.map((crop) => {
        const stageStyle = STAGE_COLORS[crop.stage] || STAGE_COLORS.Growing;
        const totalExpenses = Object.values(crop.expenses || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);

        return (
          <div
            key={crop._id}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Top Bar: Title & Stage */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                    {crop.cropName}
                  </h4>
                  {crop.variety && (
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                      Var: {crop.variety}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    background: stageStyle.bg,
                    color: stageStyle.color,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                  }}
                >
                  {crop.stage}
                </span>
              </div>

              {/* Farm association badge */}
              {crop.farmId && (
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '11.5px' }}>
                    🏡 Farm: {crop.farmId.name || 'Registered Farm'}
                  </span>
                </div>
              )}

              {/* Photo preview if exists */}
              {crop.imageUrl && (
                <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                  <img src={crop.imageUrl} alt={crop.cropName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Inline Edit Form */}
              {editingId === crop._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '12px' }}>Lifecycle Stage</label>
                    <select
                      className="form-control"
                      value={editFormData.stage}
                      onChange={(e) => setEditFormData({ ...editFormData, stage: e.target.value })}
                    >
                      <option value="Planned">Planned</option>
                      <option value="Growing">Growing</option>
                      <option value="Harvest Ready">Harvest Ready</option>
                      <option value="Harvested">Harvested</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '12px' }}>Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFormData.quantity}
                      onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '12px' }}>Variety</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.variety}
                      onChange={(e) => setEditFormData({ ...editFormData, variety: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button onClick={() => handleUpdate(crop._id)} className="btn" style={{ padding: '8px', fontSize: '13px' }}>
                      <Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Save
                    </button>
                    <button onClick={cancelEdit} className="btn" style={{ padding: '8px', fontSize: '13px', background: '#e2e8f0', color: '#334155' }}>
                      <X size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '14px' }}>
                  <div><strong>Quantity:</strong> {crop.quantity} {crop.unit || 'kg'}</div>
                  {crop.area && <div><strong>Planted Area:</strong> {crop.area} {crop.areaUnit || 'Acres'}</div>}
                  {crop.sowingDate && (
                    <div><strong>Sown:</strong> {new Date(crop.sowingDate).toLocaleDateString()}</div>
                  )}
                  {totalExpenses > 0 && (
                    <div style={{ color: '#b45309', fontWeight: '600', marginTop: '4px' }}>
                      💰 Total Input Cost: ₹{totalExpenses.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {editingId !== crop._id && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  onClick={() => onManageDiary(crop)}
                  className="btn"
                  style={{
                    width: '100%',
                    padding: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13.5px',
                    marginBottom: '8px',
                  }}
                >
                  <BookOpen size={15} /> Crop Diary &amp; Expenses
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => startEdit(crop)}
                    style={{
                      flex: 1,
                      padding: '7px',
                      border: '1px solid #cbd5e1',
                      background: 'white',
                      color: '#334155',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(crop._id)}
                    style={{
                      flex: 1,
                      padding: '7px',
                      border: '1px solid #fecaca',
                      background: 'white',
                      color: '#ef4444',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CropList;
