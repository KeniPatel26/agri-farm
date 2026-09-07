import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { CloudRain, Sun, Wind, Thermometer, AlertTriangle, CloudSun, Sunrise, Sunset, Droplets, MapPin, RefreshCw } from 'lucide-react';

const WeatherAdvisory = ({ crops = [], farm = null }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, [farm]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      let url = '/weather';
      if (farm && farm.location?.coordinates) {
        url += `?lat=${farm.location.coordinates[1]}&lon=${farm.location.coordinates[0]}&farmId=${farm._id}`;
      }
      const res = await api.get(url);
      const data = res.data?.data || res.data;
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather intelligence', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !weatherData) {
    return (
      <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', textAlign: 'center', marginBottom: '30px' }}>
        <p style={{ color: '#64748b' }}>Fetching live agricultural weather intelligence...</p>
      </div>
    );
  }

  const current = weatherData?.current || {
    temperature: 29,
    humidity: 60,
    windSpeed: 12,
    precipitationProbability: 20,
    condition: 'Partly Sunny',
    icon: '⛅',
  };

  const forecast = weatherData?.forecast || [];
  const precautions = weatherData?.precautions || [];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #e0f2fe 100%)',
        border: '1px solid #bbf7d0',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
        marginBottom: '30px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
            <span style={{ fontSize: '24px' }}>{current.icon || '⛅'}</span> Hyperlocal Farm Weather &amp; Advisory
          </h3>
          <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} color="var(--primary-color)" /> Location: <strong>{weatherData?.location || (farm ? farm.name : 'Farm Location')}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span
            style={{
              background: 'white',
              border: '1px solid #bbf7d0',
              color: 'var(--primary-dark)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            }}
          >
            {current.condition}
          </span>
          <button
            onClick={fetchWeatherData}
            style={{
              background: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
            }}
            title="Refresh Weather"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Current Conditions Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <Thermometer size={22} color="#ea580c" style={{ margin: '0 auto 6px' }} />
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{current.temperature}°C</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Temperature</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <CloudRain size={22} color="#0284c7" style={{ margin: '0 auto 6px' }} />
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{current.precipitationProbability}%</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Rain Probability</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <Droplets size={22} color="#0d9488" style={{ margin: '0 auto 6px' }} />
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{current.humidity}%</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Humidity</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <Wind size={22} color="#6366f1" style={{ margin: '0 auto 6px' }} />
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{current.windSpeed} km/h</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Wind Speed</div>
        </div>
      </div>

      {/* 7-Day Daily Forecast Carousel / Strip */}
      {forecast.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-dark)', fontSize: '14px', fontWeight: '600' }}>
            7-Day Agricultural Forecast
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', overflowX: 'auto' }}>
            {forecast.map((day, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  border: idx === 0 ? '1.5px solid var(--primary-color)' : '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155' }}>{day.day}</div>
                <div style={{ fontSize: '20px', margin: '4px 0' }}>{day.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                  {day.maxTemp}° <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>{day.minTemp}°</span>
                </div>
                <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px' }}>
                  🌧️ {day.rainProb}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Precautions & Warnings */}
      {precautions.length > 0 ? (
        <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #b45309', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
            <AlertTriangle size={17} /> Actionable Agricultural Precautions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {precautions.map((p, idx) => (
              <div key={idx} style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                <strong>{p.title}:</strong> {p.action}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', padding: '14px 20px', borderRadius: '12px', color: '#166534', fontSize: '13px' }}>
          ✅ Weather conditions are currently optimal for your farm and crops. Standard irrigation schedules apply.
        </div>
      )}
    </div>
  );
};

export default WeatherAdvisory;
