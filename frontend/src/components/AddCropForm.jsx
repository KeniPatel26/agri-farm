import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import ImageUploader from './ImageUploader';
import { Sprout, Calendar, MapPin, Layers } from 'lucide-react';

const CROP_STAGES = ['Planned', 'Growing', 'Harvest Ready', 'Harvested', 'Sold'];
const AREA_UNITS = ['Acres', 'Hectares', 'Bigha', 'Guntha'];
const SOIL_TYPES = ['Alluvial', 'Black', 'Red & Yellow', 'Laterite', 'Arid / Desert', 'Saline', 'Clayey / Loamy', 'Other'];
const IRRIGATION_TYPES = ['Drip Irrigation', 'Sprinkler', 'Canal / Flood', 'Borewell / Tube Well', 'Rainfed', 'Other'];

const AddCropForm = ({ onCropAdded, selectedFarmId }) => {
  const { user } = useContext(AuthContext);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    cropName: '',
    variety: '',
    farmId: selectedFarmId || '',
    stage: 'Growing',
    area: '1',
    areaUnit: 'Acres',
    quantity: '',
    unit: 'kg',
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    soilType: 'Alluvial',
    irrigationMethod: 'Drip Irrigation',
    address: user?.location?.address || '',
    imageUrl: '',
    notes: '',
  });

  useEffect(() => {
    api.get('/farms').then((res) => {
      const data = res.data?.data || res.data || [];
      setFarms(data);
      if (selectedFarmId) {
        setFormData((prev) => ({ ...prev, farmId: selectedFarmId }));
      } else if (data.length > 0 && !formData.farmId) {
        setFormData((prev) => ({ ...prev, farmId: data[0]._id }));
      }
    }).catch(() => {});
  }, [selectedFarmId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cropName || !formData.quantity) {
      toast.error('Please provide crop name and estimated quantity');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        cropName: formData.cropName.trim(),
        variety: formData.variety.trim(),
        farmId: formData.farmId || undefined,
        stage: formData.stage,
        area: Number(formData.area) || 1,
        areaUnit: formData.areaUnit,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        sowingDate: formData.sowingDate || new Date(),
        expectedHarvestDate: formData.expectedHarvestDate || undefined,
        soilType: formData.soilType,
        irrigationMethod: formData.irrigationMethod,
        imageUrl: formData.imageUrl,
        notes: formData.notes,
      };

      const res = await api.post('/crops', payload);
      const created = res.data?.data || res.data;
      onCropAdded(created);
      toast.success(`${formData.cropName} added to your active farming ledger!`);

      setFormData({
        cropName: '',
        variety: '',
        farmId: selectedFarmId || (farms[0]?._id || ''),
        stage: 'Growing',
        area: '1',
        areaUnit: 'Acres',
        quantity: '',
        unit: 'kg',
        sowingDate: new Date().toISOString().split('T')[0],
        expectedHarvestDate: '',
        soilType: 'Alluvial',
        irrigationMethod: 'Drip Irrigation',
        address: user?.location?.address || '',
        imageUrl: '',
        notes: '',
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error adding crop';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
      <h3 style={{ color: 'var(--primary-dark)', fontSize: '20px', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sprout size={22} color="var(--primary-color)" /> Add Crop to Farm Ledger
      </h3>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Crop Name */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Crop Name *</label>
          <input
            type="text"
            className="form-control"
            name="cropName"
            value={formData.cropName}
            onChange={onChange}
            required
            placeholder="e.g., Wheat, Rice, Cotton, Tomato"
          />
        </div>

        {/* Variety */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Variety / Cultivar</label>
          <input
            type="text"
            className="form-control"
            name="variety"
            value={formData.variety}
            onChange={onChange}
            placeholder="e.g. Sharbati, HD-2967, Hybrid-1"
          />
        </div>

        {/* Farm Selection */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Belongs to Farm</label>
          <select className="form-control" name="farmId" value={formData.farmId} onChange={onChange}>
            <option value="">Default Farm Field</option>
            {farms.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name} ({f.area} {f.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Lifecycle Stage */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Lifecycle Stage</label>
          <select className="form-control" name="stage" value={formData.stage} onChange={onChange}>
            {CROP_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Area */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Planted Area</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              step="0.1"
              className="form-control"
              name="area"
              value={formData.area}
              onChange={onChange}
              placeholder="e.g. 2.5"
            />
            <select
              className="form-control"
              style={{ width: '100px' }}
              name="areaUnit"
              value={formData.areaUnit}
              onChange={onChange}
            >
              {AREA_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Quantity */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Estimated Quantity *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              className="form-control"
              name="quantity"
              value={formData.quantity}
              onChange={onChange}
              required
              placeholder="e.g. 1500"
              min="0"
            />
            <select
              className="form-control"
              style={{ width: '90px' }}
              name="unit"
              value={formData.unit}
              onChange={onChange}
            >
              <option value="kg">kg</option>
              <option value="Quintal">Quintal</option>
              <option value="Ton">Ton</option>
            </select>
          </div>
        </div>

        {/* Sowing Date */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Sowing Date</label>
          <input
            type="date"
            className="form-control"
            name="sowingDate"
            value={formData.sowingDate}
            onChange={onChange}
          />
        </div>

        {/* Expected Harvest Date */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Expected Harvest Date</label>
          <input
            type="date"
            className="form-control"
            name="expectedHarvestDate"
            value={formData.expectedHarvestDate}
            onChange={onChange}
          />
        </div>

        {/* Soil Type */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Soil Type</label>
          <select className="form-control" name="soilType" value={formData.soilType} onChange={onChange}>
            {SOIL_TYPES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>

        {/* Irrigation Method */}
        <div className="form-group" style={{ margin: 0 }}>
          <label>Irrigation Method</label>
          <select className="form-control" name="irrigationMethod" value={formData.irrigationMethod} onChange={onChange}>
            {IRRIGATION_TYPES.map((it) => <option key={it} value={it}>{it}</option>)}
          </select>
        </div>

        {/* Image Uploader */}
        <div style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
          <ImageUploader
            label="Crop Photo (Optional)"
            onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
          />
        </div>

        {/* Submit */}
        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
          <button type="submit" className="btn" disabled={loading} style={{ padding: '12px 28px', width: 'auto' }}>
            {loading ? 'Adding Crop...' : 'Save & Register Crop'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCropForm;
