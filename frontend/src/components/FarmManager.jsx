import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Plus, MapPin, Trash2, Edit3, CheckCircle, Navigation, Layers, Droplets } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

// Fix Leaflet marker icon asset issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Click handler on the Leaflet map
function LocationPickerMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

const SOIL_TYPES = ['Alluvial', 'Black', 'Red & Yellow', 'Laterite', 'Arid / Desert', 'Saline', 'Clayey / Loamy', 'Other'];
const IRRIGATION_TYPES = ['Drip Irrigation', 'Sprinkler', 'Canal / Flood', 'Borewell / Tube Well', 'Rainfed', 'Other'];
const AREA_UNITS = ['Acres', 'Hectares', 'Bigha', 'Guntha', 'Sq. Meters'];

const FarmManager = ({ onSelectFarm, selectedFarmId }) => {
  const { t } = useLanguage();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFarmId, setEditingFarmId] = useState(null);
  const [markerPos, setMarkerPos] = useState([23.0225, 72.5714]); // Default [lat, lng]

  const [formData, setFormData] = useState({
    name: '',
    area: '',
    unit: 'Acres',
    soilType: 'Alluvial',
    irrigationType: 'Drip Irrigation',
    address: '',
    village: '',
    district: '',
    state: '',
    notes: '',
  });

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/farms');
      const data = res.data?.data || res.data || [];
      setFarms(data);
      if (data.length > 0 && !selectedFarmId && onSelectFarm) {
        onSelectFarm(data[0]);
      }
    } catch (err) {
      console.error('Error fetching farms', err);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setMarkerPos(coords);
          toast.success('Acquired GPS coordinates from device');
        },
        () => {
          toast.error('Unable to retrieve GPS coordinates. Click on the map manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleOpenAdd = () => {
    setEditingFarmId(null);
    setFormData({
      name: '',
      area: '',
      unit: 'Acres',
      soilType: 'Alluvial',
      irrigationType: 'Drip Irrigation',
      address: '',
      village: '',
      district: '',
      state: '',
      notes: '',
    });
    setShowForm(true);
  };

  const handleOpenEdit = (farm) => {
    setEditingFarmId(farm._id);
    const coords = farm.location?.coordinates || [72.5714, 23.0225];
    setMarkerPos([coords[1], coords[0]]); // [lat, lng]
    setFormData({
      name: farm.name,
      area: farm.area,
      unit: farm.unit || 'Acres',
      soilType: farm.soilType || 'Alluvial',
      irrigationType: farm.irrigationType || 'Drip Irrigation',
      address: farm.location?.address || '',
      village: farm.location?.village || '',
      district: farm.location?.district || '',
      state: farm.location?.state || '',
      notes: farm.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.area) {
      toast.error('Please enter farm name and area');
      return;
    }

    const payload = {
      ...formData,
      area: Number(formData.area),
      location: {
        type: 'Point',
        coordinates: [markerPos[1], markerPos[0]], // GeoJSON is [longitude, latitude]
        address: formData.address || `${formData.village || formData.name}, ${formData.district || ''}`,
        village: formData.village,
        district: formData.district,
        state: formData.state,
      },
    };

    try {
      if (editingFarmId) {
        const res = await api.put(`/farms/${editingFarmId}`, payload);
        const updated = res.data?.data || res.data;
        setFarms(farms.map((f) => (f._id === editingFarmId ? updated : f)));
        toast.success('Farm updated successfully!');
      } else {
        const res = await api.post('/farms', payload);
        const created = res.data?.data || res.data;
        setFarms([created, ...farms]);
        if (onSelectFarm) onSelectFarm(created);
        toast.success('Farm registered successfully with GPS location!');
      }
      setShowForm(false);
      setEditingFarmId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving farm');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/farms/${id}`);
      const remaining = farms.filter((f) => f._id !== id);
      setFarms(remaining);
      if (selectedFarmId === id && remaining.length > 0 && onSelectFarm) {
        onSelectFarm(remaining[0]);
      }
      toast.success('Farm removed successfully');
    } catch (err) {
      toast.error('Error deleting farm');
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={22} color="var(--primary-color)" /> {t('farms.title')}
          </h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
            Manage multiple farm locations, soil types, and precise GPS pins for hyperlocal weather intelligence.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn"
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}
        >
          <Plus size={16} /> {t('farms.addFarm')}
        </button>
      </div>

      {/* Farm Switcher Badges */}
      {farms.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
          {farms.map((f) => {
            const isSelected = selectedFarmId === f._id;
            return (
              <div
                key={f._id}
                onClick={() => onSelectFarm && onSelectFarm(f)}
                style={{
                  background: isSelected ? 'var(--primary-light)' : '#f8fafc',
                  border: isSelected ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  cursor: 'pointer',
                  minWidth: '220px',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 6px rgba(46, 125, 50, 0.1)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '700', color: isSelected ? 'var(--primary-dark)' : '#1e293b', fontSize: '15px' }}>
                    {f.name}
                  </div>
                  {isSelected && <CheckCircle size={16} color="var(--primary-color)" />}
                </div>
                <div style={{ color: '#64748b', fontSize: '12.5px', marginTop: '4px' }}>
                  {f.area} {f.unit} • {f.soilType}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
                  <span>{f.irrigationType}</span>
                  <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenEdit(f)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '2px' }}
                      title="Edit Farm"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(f._id, f.name)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}
                      title="Delete Farm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Farm Add / Edit Modal / Form */}
      {showForm && (
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--primary-dark)', fontSize: '17px' }}>
            {editingFarmId ? 'Edit Farm Details & Location' : 'Register New Farm with GPS'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>{t('farms.farmName')} *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Green Valley Farm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>{t('farms.area')} *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 5"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                  <select
                    className="form-control"
                    style={{ width: '110px' }}
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    {AREA_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>{t('farms.soilType')}</label>
                <select
                  className="form-control"
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                >
                  {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>{t('farms.irrigationType')}</label>
                <select
                  className="form-control"
                  value={formData.irrigationType}
                  onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                >
                  {IRRIGATION_TYPES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Village / Town</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sanand"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>District</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ahmedabad"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>State</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Gujarat"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            {/* Interactive Map Coordinate Pin Dropper */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>
                  📍 {t('farms.pickLocation')}
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Lat: {markerPos[0].toFixed(4)}, Lng: {markerPos[1].toFixed(4)}
                  </span>
                  <button
                    type="button"
                    onClick={useCurrentGPS}
                    style={{
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--primary-dark)',
                      fontWeight: '500',
                    }}
                  >
                    <Navigation size={12} /> Use GPS
                  </button>
                </div>
              </div>

              <div style={{ height: '220px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <MapContainer center={markerPos} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPickerMarker position={markerPos} setPosition={setMarkerPos} />
                </MapContainer>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn" style={{ width: 'auto', padding: '10px 24px' }}>
                {editingFarmId ? 'Update Farm' : t('farms.saveFarm')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn"
                style={{ width: 'auto', padding: '10px 24px', background: '#e2e8f0', color: '#334155' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {!loading && farms.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <Layers size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '480px', margin: '0 auto 16px' }}>
            {t('farms.noFarms')}
          </p>
          <button onClick={handleOpenAdd} className="btn" style={{ width: 'auto', padding: '10px 20px' }}>
            <Plus size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            {t('farms.addFarm')}
          </button>
        </div>
      )}
    </div>
  );
};

export default FarmManager;
