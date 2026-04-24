import { useState, useEffect } from 'react';
import axios from 'axios';
import AddCropForm from '../components/AddCropForm';
import CropList from '../components/CropList';

const FarmerDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const res = await axios.get('http://localhost:5000/api/crops', config);
        setCrops(res.data);
      } catch (error) {
        console.error('Error fetching crops', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const handleCropAdded = (newCrop) => {
    setCrops([newCrop, ...crops]);
  };

  const handleCropDeleted = (id) => {
    setCrops(crops.filter(crop => crop._id !== id));
  };

  const handleCropUpdated = (updatedCrop) => {
    setCrops(crops.map(crop => crop._id === updatedCrop._id ? updatedCrop : crop));
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--primary-dark)', fontSize: '28px' }}>Farmer Dashboard</h2>
      </div>

      <AddCropForm onCropAdded={handleCropAdded} />

      <h3 style={{ color: 'var(--text-dark)', marginBottom: '20px' }}>Your Crops</h3>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading your crops...</div>
      ) : (
        <CropList 
          crops={crops} 
          onCropDeleted={handleCropDeleted} 
          onCropUpdated={handleCropUpdated} 
        />
      )}
    </div>
  );
};

export default FarmerDashboard;
