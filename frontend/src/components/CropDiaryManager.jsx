import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Calendar, Sprout, DollarSign, Trash2, CheckCircle, AlertTriangle, Plus, Droplet, Bug, Leaf, Scissors } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'react-hot-toast';

const EXPENSE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

const ACTIVITY_TYPES = [
  { value: 'Irrigation', label: '💧 Irrigation & Watering', icon: <Droplet size={14} color="#0284c7" /> },
  { value: 'Fertilizer', label: '🌱 Fertilizer Application', icon: <Sprout size={14} color="#16a34a" /> },
  { value: 'Pesticide', label: '🛡️ Pesticide / Bio-spray', icon: <Bug size={14} color="#ea580c" /> },
  { value: 'Disease Observation', label: '⚠️ Disease / Pest Note', icon: <AlertTriangle size={14} color="#dc2626" /> },
  { value: 'Growth Note', label: '📈 Growth & Flowering', icon: <Leaf size={14} color="#059669" /> },
  { value: 'Harvest', label: '🌾 Harvest Activity', icon: <Scissors size={14} color="#7c3aed" /> },
  { value: 'Field Activity', label: '🚜 Weeding / Tilling / Soil Work', icon: <Calendar size={14} color="#475569" /> },
  { value: 'General', label: '📝 General Field Note', icon: <Calendar size={14} color="#475569" /> },
];

const CropDiaryManager = ({ crop, onCropUpdated }) => {
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [submittingLog, setSubmittingLog] = useState(false);

  // New Log Entry Form State
  const [logForm, setLogForm] = useState({
    activityType: 'General',
    notes: '',
    irrigationLogged: false,
    fertilizerApplied: '',
    pesticideApplied: '',
    diseasesObserved: '',
    cost: '',
  });

  // Expense & Predictions Form State
  const [expenses, setExpenses] = useState({
    seeds: crop.expenses?.seeds || 0,
    fertilizer: crop.expenses?.fertilizer || 0,
    pesticides: crop.expenses?.pesticides || 0,
    labor: crop.expenses?.labor || 0,
    irrigation: crop.expenses?.irrigation || 0,
    transport: crop.expenses?.transport || 0,
    machinery: crop.expenses?.machinery || 0,
    other: crop.expenses?.other || 0,
  });

  const [harvestPrediction, setHarvestPrediction] = useState({
    estHarvestDate: crop.harvestEstimate?.estHarvestDate
      ? new Date(crop.harvestEstimate.estHarvestDate).toISOString().split('T')[0]
      : '',
    estProduction: crop.harvestEstimate?.estProduction || 0,
    estRevenue: crop.harvestEstimate?.estRevenue || 0,
  });

  const [savingFinance, setSavingFinance] = useState(false);

  useEffect(() => {
    if (crop?._id) {
      fetchDiaryEntries();
      setExpenses({
        seeds: crop.expenses?.seeds || 0,
        fertilizer: crop.expenses?.fertilizer || 0,
        pesticides: crop.expenses?.pesticides || 0,
        labor: crop.expenses?.labor || 0,
        irrigation: crop.expenses?.irrigation || 0,
        transport: crop.expenses?.transport || 0,
        machinery: crop.expenses?.machinery || 0,
        other: crop.expenses?.other || 0,
      });
      setHarvestPrediction({
        estHarvestDate: crop.harvestEstimate?.estHarvestDate
          ? new Date(crop.harvestEstimate.estHarvestDate).toISOString().split('T')[0]
          : '',
        estProduction: crop.harvestEstimate?.estProduction || 0,
        estRevenue: crop.harvestEstimate?.estRevenue || 0,
      });
    }
  }, [crop]);

  const fetchDiaryEntries = async () => {
    setLoadingEntries(true);
    try {
      const res = await api.get(`/crops/${crop._id}/diary`);
      setEntries(res.data?.data || res.data || []);
    } catch {
      toast.error('Error loading crop activities timeline');
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!logForm.notes.trim()) {
      toast.error('Please enter activity notes.');
      return;
    }
    setSubmittingLog(true);
    try {
      const res = await api.post(`/crops/${crop._id}/diary`, {
        ...logForm,
        cost: Number(logForm.cost) || 0,
      });
      const created = res.data?.data || res.data;
      setEntries([created, ...entries]);
      setLogForm({
        activityType: 'General',
        notes: '',
        irrigationLogged: false,
        fertilizerApplied: '',
        pesticideApplied: '',
        diseasesObserved: '',
        cost: '',
      });
      setShowLogForm(false);
      toast.success('Activity logged in crop diary!');
    } catch {
      toast.error('Failed to save log entry');
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this diary entry?')) return;
    try {
      await api.delete(`/crops/diary/${id}`);
      setEntries(entries.filter((e) => e._id !== id));
      toast.success('Diary entry deleted');
    } catch {
      toast.error('Error deleting entry');
    }
  };

  const handleSaveFinance = async (e) => {
    e.preventDefault();
    setSavingFinance(true);
    try {
      const res = await api.put(`/crops/${crop._id}/expenses`, {
        expenses,
        harvestEstimate: harvestPrediction,
      });
      const updated = res.data?.data || res.data;
      toast.success('Crop finances & forecasts updated!');
      if (onCropUpdated) {
        onCropUpdated(updated);
      }
    } catch {
      toast.error('Error saving financial details');
    } finally {
      setSavingFinance(false);
    }
  };

  const chartData = [
    { name: 'Seeds', value: Number(expenses.seeds) },
    { name: 'Fertilizers', value: Number(expenses.fertilizer) },
    { name: 'Pesticides', value: Number(expenses.pesticides) },
    { name: 'Labor', value: Number(expenses.labor) },
    { name: 'Irrigation', value: Number(expenses.irrigation) },
    { name: 'Transport', value: Number(expenses.transport) },
    { name: 'Machinery', value: Number(expenses.machinery) },
    { name: 'Other', value: Number(expenses.other) },
  ].filter((d) => d.value > 0);

  const totalCost = Object.values(expenses).reduce((sum, val) => sum + Number(val || 0), 0);

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--primary-dark)', fontSize: '22px', margin: 0 }}>
          📖 Crop Ledger &amp; Activity Diary: {crop.cropName} {crop.variety ? `(${crop.variety})` : ''}
        </h3>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>
          Record chronological farm activities (irrigation, sprays, weed removal), track input costs, and forecast harvest yield.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
        {/* Left Side: Activity Diary Timeline */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: '#0f172a', fontWeight: '700', fontSize: '16px' }}>
              Daily Field Activities Timeline
            </h4>
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="btn"
              style={{
                width: 'auto',
                padding: '8px 14px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={14} /> {showLogForm ? 'Close Form' : 'Log Activity'}
            </button>
          </div>

          {/* New Log Form */}
          {showLogForm && (
            <form
              onSubmit={handleAddLog}
              style={{
                background: '#f8fafc',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
              }}
            >
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px' }}>Activity Type</label>
                <select
                  className="form-control"
                  value={logForm.activityType}
                  onChange={(e) => setLogForm({ ...logForm, activityType: e.target.value })}
                >
                  {ACTIVITY_TYPES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px' }}>Activity Notes / Observations *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Applied Urea @ 50kg/ha, checked drip lines..."
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '12.5px' }}>Fertilizer / Nutrient</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. DAP, NPK 19:19:19"
                    value={logForm.fertilizerApplied}
                    onChange={(e) => setLogForm({ ...logForm, fertilizerApplied: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '12.5px' }}>Pesticide / Spray Used</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Neem Oil 1500ppm"
                    value={logForm.pesticideApplied}
                    onChange={(e) => setLogForm({ ...logForm, pesticideApplied: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '12.5px' }}>Pest/Disease Spotted</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Minor aphid colonies"
                    value={logForm.diseasesObserved}
                    onChange={(e) => setLogForm({ ...logForm, diseasesObserved: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '12.5px' }}>Cost for this activity (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 850"
                    value={logForm.cost}
                    onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  id="irrigationCheck"
                  checked={logForm.irrigationLogged}
                  onChange={(e) => setLogForm({ ...logForm, irrigationLogged: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="irrigationCheck" style={{ margin: 0, fontSize: '13px', cursor: 'pointer' }}>
                  Watered Field / Irrigation Executed
                </label>
              </div>

              <button type="submit" className="btn" style={{ padding: '10px' }} disabled={submittingLog}>
                {submittingLog ? 'Saving Log...' : 'Save Activity Entry'}
              </button>
            </form>
          )}

          {/* Timeline Feed */}
          {loadingEntries ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading activity logs...</p>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', background: '#fafafa', borderRadius: '12px', color: '#94a3b8', fontSize: '13.5px' }}>
              No log entries for this crop. Add observations and farm activities to build the digital history.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '440px', overflowY: 'auto', paddingRight: '6px' }}>
              {entries.map((note) => (
                <div
                  key={note._id}
                  style={{
                    borderLeft: '3px solid var(--primary-color)',
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '0 10px 10px 0',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                      <Calendar size={11} /> {new Date(note.entryDate || note.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '1px 8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: 'bold' }}>
                        {note.activityType || 'General'}
                      </span>
                      <button
                        onClick={() => handleDeleteEntry(note._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}
                        title="Delete log"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 6px', fontSize: '13.5px', color: '#0f172a', fontWeight: '500', lineHeight: '1.4' }}>
                    {note.notes}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11.5px', color: '#475569' }}>
                    {note.fertilizerApplied && <span>🌿 <strong>Fertilizer:</strong> {note.fertilizerApplied}</span>}
                    {note.pesticideApplied && <span>🛡️ <strong>Pesticide:</strong> {note.pesticideApplied}</span>}
                    {note.diseasesObserved && <span style={{ color: '#e11d48' }}>⚠️ <strong>Pest:</strong> {note.diseasesObserved}</span>}
                    {note.cost > 0 && <span style={{ color: '#166534', fontWeight: '600' }}>💰 Cost: ₹{note.cost}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Crop Finances & Projections */}
        <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
          <h4 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={18} color="var(--primary-color)" /> Seasonal Input Expenditures
          </h4>

          <form onSubmit={handleSaveFinance}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11.5px' }}>Seeds (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={expenses.seeds}
                  onChange={(e) => setExpenses({ ...expenses, seeds: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11.5px' }}>Fertilizer (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={expenses.fertilizer}
                  onChange={(e) => setExpenses({ ...expenses, fertilizer: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11.5px' }}>Pesticides (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={expenses.pesticides}
                  onChange={(e) => setExpenses({ ...expenses, pesticides: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11.5px' }}>Labor (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={expenses.labor}
                  onChange={(e) => setExpenses({ ...expenses, labor: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11.5px' }}>Irrigation (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={expenses.irrigation}
                  onChange={(e) => setExpenses({ ...expenses, irrigation: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11.5px' }}>Machinery (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={expenses.machinery}
                  onChange={(e) => setExpenses({ ...expenses, machinery: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11.5px' }}>Transport (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={expenses.transport}
                  onChange={(e) => setExpenses({ ...expenses, transport: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11.5px' }}>Other (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={expenses.other}
                  onChange={(e) => setExpenses({ ...expenses, other: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            {/* Harvest & Revenue Projections */}
            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '12px', border: '1px solid #dcfce7', marginBottom: '16px' }}>
              <h5 style={{ margin: '0 0 8px', color: 'var(--primary-dark)', fontSize: '13px', fontWeight: '700' }}>
                🌾 Harvest &amp; Revenue Projection
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', color: 'var(--primary-dark)' }}>Expected Harvest Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={harvestPrediction.estHarvestDate}
                    onChange={(e) => setHarvestPrediction({ ...harvestPrediction, estHarvestDate: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', color: 'var(--primary-dark)' }}>Est. Production (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={harvestPrediction.estProduction}
                    onChange={(e) => setHarvestPrediction({ ...harvestPrediction, estProduction: Number(e.target.value) })}
                    min="0"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', color: 'var(--primary-dark)' }}>Est. Revenue (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={harvestPrediction.estRevenue}
                    onChange={(e) => setHarvestPrediction({ ...harvestPrediction, estRevenue: Number(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Cost Chart Breakdown */}
            {chartData.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                  <span>Expense Distribution:</span>
                  <span style={{ color: 'var(--error)' }}>Total: ₹{totalCost.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '140px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value" paddingAngle={2}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v}`} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} align="right" layout="vertical" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <button type="submit" className="btn" disabled={savingFinance}>
              {savingFinance ? 'Saving Finances...' : 'Update Finances & Projections'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CropDiaryManager;
