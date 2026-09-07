import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import FarmManager from '../components/FarmManager';
import AddCropForm from '../components/AddCropForm';
import CropList from '../components/CropList';
import MapComponent from '../components/MapComponent';
import WeatherAdvisory from '../components/WeatherAdvisory';
import CropAdvisory from '../components/CropAdvisory';
import PriceTrends from '../components/PriceTrends';
import PriceAlertManager from '../components/PriceAlertManager';
import ExpenseTracker from '../components/ExpenseTracker';
import NotificationsPanel from '../components/NotificationsPanel';
import CropDiaryManager from '../components/CropDiaryManager';
import BookmarksSidebar from '../components/BookmarksSidebar';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, DollarSign, CloudSun, MapPin, Bell, Layers } from 'lucide-react';

const FarmerDashboard = () => {
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview', 'farms', 'expenses', 'alerts'

  useEffect(() => {
    fetchCrops();
  }, [selectedFarm]);

  const fetchCrops = async () => {
    try {
      const url = selectedFarm ? `/crops?farmId=${selectedFarm._id}` : '/crops';
      const res = await api.get(url);
      const data = res.data?.data || res.data || [];
      setCrops(data);
    } catch (error) {
      console.error('Error fetching crops', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCropAdded = (newCrop) => {
    setCrops([newCrop, ...crops]);
  };

  const handleCropDeleted = (id) => {
    setCrops(crops.filter((crop) => crop._id !== id));
  };

  const handleCropUpdated = (updatedCrop) => {
    setCrops(crops.map((crop) => (crop._id === updatedCrop._id ? updatedCrop : crop)));
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '28px', fontWeight: '800', margin: 0 }}>
            {t('dashboard.farmerTitle')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            {selectedFarm
              ? `Active Location: ${selectedFarm.name} (${selectedFarm.area} ${selectedFarm.unit})`
              : 'Managing all connected farm fields and active crops'}
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '24px', padding: '4px', gap: '4px' }}>
          {[
            { id: 'overview', label: '🌾 Crops & Weather' },
            { id: 'farms', label: '🏡 My Farms & GPS' },
            { id: 'expenses', label: '💰 Expenses & P&L' },
            { id: 'alerts', label: '🔔 Price Alerts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                border: 'none',
                background: activeSubTab === tab.id ? 'white' : 'transparent',
                color: activeSubTab === tab.id ? 'var(--primary-dark)' : '#475569',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeSubTab === tab.id ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Main Content Area */}
        <div>
          {selectedCrop ? (
            <div>
              <button
                onClick={() => setSelectedCrop(null)}
                className="btn"
                style={{ width: 'auto', padding: '8px 18px', background: '#e2e8f0', color: '#334155', marginBottom: '20px', fontWeight: '600' }}
              >
                {t('dashboard.back')}
              </button>
              <CropDiaryManager
                crop={selectedCrop}
                onCropUpdated={(updated) => {
                  handleCropUpdated(updated);
                  setSelectedCrop(updated);
                }}
              />
            </div>
          ) : (
            <>
              {/* Tab: Overview */}
              {activeSubTab === 'overview' && (
                <>
                  <WeatherAdvisory crops={crops} farm={selectedFarm} />
                  <CropAdvisory />

                  <h3 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>
                    {t('dashboard.cropsInventory')}
                  </h3>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading your crops...</div>
                  ) : (
                    <CropList
                      crops={crops}
                      onCropDeleted={handleCropDeleted}
                      onCropUpdated={handleCropUpdated}
                      onManageDiary={(crop) => setSelectedCrop(crop)}
                    />
                  )}

                  <div style={{ marginTop: '30px' }}>
                    <AddCropForm onCropAdded={handleCropAdded} selectedFarmId={selectedFarm?._id} />
                  </div>

                  <h3 style={{ color: '#0f172a', marginBottom: '16px', marginTop: '30px', fontSize: '18px', fontWeight: '700' }}>
                    {t('dashboard.priceTrends')}
                  </h3>
                  <PriceTrends cropName={crops.length > 0 ? crops[0].cropName : 'Wheat'} />

                  <h3 style={{ color: '#0f172a', marginBottom: '16px', marginTop: '30px', fontSize: '18px', fontWeight: '700' }}>
                    {t('dashboard.nearbyMarkets')}
                  </h3>
                  <MapComponent />
                </>
              )}

              {/* Tab: Farms & GPS */}
              {activeSubTab === 'farms' && (
                <>
                  <FarmManager
                    onSelectFarm={(farm) => setSelectedFarm(farm)}
                    selectedFarmId={selectedFarm?._id}
                  />
                  <h3 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>
                    Nearby Mandis &amp; Agricultural Hubs
                  </h3>
                  <MapComponent />
                </>
              )}

              {/* Tab: Expenses & Financials */}
              {activeSubTab === 'expenses' && (
                <>
                  <ExpenseTracker />
                  <h3 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>
                    Select a Crop to Log Daily Expenditures
                  </h3>
                  <CropList
                    crops={crops}
                    onCropDeleted={handleCropDeleted}
                    onCropUpdated={handleCropUpdated}
                    onManageDiary={(crop) => setSelectedCrop(crop)}
                  />
                </>
              )}

              {/* Tab: Price Alerts */}
              {activeSubTab === 'alerts' && (
                <>
                  <PriceAlertManager />
                  <PriceTrends cropName={crops.length > 0 ? crops[0].cropName : 'Wheat'} />
                </>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <NotificationsPanel />
          <BookmarksSidebar />
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
