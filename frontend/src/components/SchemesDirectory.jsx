import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Landmark, ArrowUpRight, Plus, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SchemesDirectory = () => {
  const { user } = useContext(AuthContext);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Scheme Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    eligibility: '',
    benefits: '',
    link: ''
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schemes');
      setSchemes(res.data || []);
    } catch {
      toast.error('Failed to load government schemes directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.eligibility || !form.benefits || !form.link) {
      toast.error('Please fill in all details');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/schemes', form);
      setSchemes([res.data, ...schemes]);
      setForm({ title: '', description: '', eligibility: '', benefits: '', link: '' });
      setShowAddForm(false);
      toast.success('New Government Scheme added to directory!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating scheme');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', background: 'white', borderRadius: '16px', textAlign: 'center' }}><Loader2 size={24} className="spin" color="var(--primary-color)" /></div>;

  return (
    <div style={{ background: 'white', padding: '28px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ color: 'var(--primary-dark)', fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={22} /> Government Welfare Schemes
          </h3>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>Find official subsidies, grants, eligibility details, and application links.</p>
        </div>

        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn"
            style={{ width: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> {showAddForm ? 'Cancel Creation' : 'Publish Scheme'}
          </button>
        )}
      </div>

      {/* Admin Insertion Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} style={{
          background: '#f8fafc', padding: '20px', borderRadius: '12px',
          border: '1px solid #e2e8f0', marginBottom: '24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'
        }}>
          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label>Scheme Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., PM-Kisan Samman Nidhi Yojana"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label>Detailed Description</label>
            <textarea
              className="form-control"
              placeholder="Provide a clear overview of the program's objectives..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={2}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Eligibility Criteria</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Small & marginal farmers owning up to 2 hectares"
              value={form.eligibility}
              onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Benefits &amp; Support Amount</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., ₹6000 annual direct cash benefit"
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label>Official Application Link URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="e.g., https://pmkisan.gov.in/"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Government Scheme'}
            </button>
          </div>
        </form>
      )}

      {/* Directory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {schemes.map((scheme) => (
          <div key={scheme._id} style={{
            border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px',
            background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div>
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--primary-dark)', fontSize: '18px', fontWeight: '700' }}>
                {scheme.title}
              </h4>
              <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                {scheme.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Who is Eligible?</span>
                <p style={{ margin: '4px 0 0', color: '#1e293b', fontSize: '13px', fontWeight: '500' }}>{scheme.eligibility}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Benefits Provided</span>
                <p style={{ margin: '4px 0 0', color: 'var(--primary-dark)', fontSize: '13.5px', fontWeight: '700' }}>{scheme.benefits}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <a
                href={scheme.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  color: '#3b82f6', textDecoration: 'none', fontSize: '13px', fontWeight: '700'
                }}
              >
                Apply Online / Official Portal <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemesDirectory;
