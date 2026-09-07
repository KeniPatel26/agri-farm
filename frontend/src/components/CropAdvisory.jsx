import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { BookOpen, Sprout, Droplet, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CropAdvisory = () => {
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default fallback guidelines in case the database is empty initially
  const defaultGuides = [
    {
      cropName: 'Wheat',
      fertilizers: ['Urea (N)', 'DAP (P)', 'MOP (K)', 'Zinc Sulphate'],
      irrigation: 'Drip irrigation or flood irrigation every 10–14 days depending on soil moisture.',
      precautions: ['Monitor for Rust disease', 'Ensure weed control within first 40 days', 'Avoid waterlogging at flowering stage']
    },
    {
      cropName: 'Rice (Paddy)',
      fertilizers: ['Nitrogen', 'Phosphate', 'Potash', 'Neem coated Urea'],
      irrigation: 'Keep standing water (2-5cm) during vegetative stages, drain 10 days before harvest.',
      precautions: ['Blast disease prevention', 'Stem borer monitoring', 'Maintain proper field drainage']
    },
    {
      cropName: 'Tomato',
      fertilizers: ['Compost / Manure', 'Calcium Nitrate', 'NPK 19:19:19'],
      irrigation: 'Consistent drip irrigation, 1–2 inches per week. Avoid overhead watering to prevent blight.',
      precautions: ['Use stakes for support', 'Watch for early blight and leaf curl virus', 'Prune lower leaves to improve airflow']
    }
  ];

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await api.get('/advisory');
        if (res.data && res.data.length > 0) {
          setGuides(res.data);
          setSelectedGuide(res.data[0]);
        } else {
          // If no database guides, seed/use local defaults
          setGuides(defaultGuides);
          setSelectedGuide(defaultGuides[0]);
        }
      } catch (error) {
        console.warn('Could not load database guides, using defaults:', error.message);
        setGuides(defaultGuides);
        setSelectedGuide(defaultGuides[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  if (loading) return <div style={{ padding: '20px', background: 'white', borderRadius: '16px', textAlign: 'center' }}>Loading advisory database...</div>;

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginBottom: '30px' }}>
      <h3 style={{ margin: '0 0 20px', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={22} /> Scientific Crop Guides &amp; Advisory
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Side: Crop Selector list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid #f1f5f9', paddingRight: '16px' }}>
          {guides.map((guide) => (
            <button
              key={guide.cropName}
              onClick={() => setSelectedGuide(guide)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                background: selectedGuide?.cropName === guide.cropName ? 'var(--primary-light)' : 'transparent',
                color: selectedGuide?.cropName === guide.cropName ? 'var(--primary-dark)' : '#475569'
              }}
            >
              <span>🌱 {guide.cropName}</span>
              <ChevronRight size={14} style={{ opacity: selectedGuide?.cropName === guide.cropName ? 1 : 0 }} />
            </button>
          ))}
        </div>

        {/* Right Side: Crop Guidelines Detail panel */}
        {selectedGuide && (
          <div style={{ animation: 'slideUp 0.3s ease-out' }}>
            <h4 style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={18} color="var(--primary-color)" /> Cultivation Guide: {selectedGuide.cropName}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {/* Fertilizers */}
              <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: 'var(--primary-color)', marginTop: '2px' }}><Sprout size={18} /></div>
                <div>
                  <h5 style={{ margin: '0 0 6px', color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>Recommended Fertilizers</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedGuide.fertilizers.map(f => (
                      <span key={f} style={{ background: '#e2e8f0', color: '#334155', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Irrigation */}
              <div style={{ display: 'flex', gap: '12px', background: '#f0fdfa', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: '#0d9488', marginTop: '2px' }}><Droplet size={18} /></div>
                <div>
                  <h5 style={{ margin: '0 0 6px', color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>Watering &amp; Irrigation Routine</h5>
                  <p style={{ margin: 0, color: '#334155', fontSize: '13px', lineHeight: '1.5' }}>
                    {selectedGuide.irrigation}
                  </p>
                </div>
              </div>

              {/* Precautions */}
              {selectedGuide.precautions && selectedGuide.precautions.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', background: '#fff1f2', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#e11d48', marginTop: '2px' }}><ShieldAlert size={18} /></div>
                  <div>
                    <h5 style={{ margin: '0 0 6px', color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>Critical Safety Precautions</h5>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#4c0519', fontSize: '13px', lineHeight: '1.5' }}>
                      {selectedGuide.precautions.map((p, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropAdvisory;
