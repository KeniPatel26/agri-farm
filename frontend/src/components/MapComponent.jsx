import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axiosInstance';

// Fix Leaflet's default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically change map center
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const MapComponent = () => {
  const [position, setPosition] = useState([20.5937, 78.9629]); // Default to India center
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          
          // 2. Update backend with location (Optional, or just fetch nearby)
          try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            // Optional: Update user's location in backend
            // await api.put('/location/update', { coordinates: [longitude, latitude], address: "Current Location" });
            
            // Fetch nearby users
            const res = await api.get(`/location/nearby?lng=${longitude}&lat=${latitude}&maxDistance=50000`);
            setNearbyUsers(res.data);
          } catch (error) {
            console.error('Error fetching nearby locations', error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location', error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '12px', textAlign: 'center' }}>Loading Map...</div>;

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
      <MapContainer center={position} zoom={10} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={position} zoom={10} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User's Location */}
        <Marker position={position}>
          <Popup>
            <strong>Your Location</strong>
          </Popup>
        </Marker>

        {/* Nearby Users */}
        {nearbyUsers.map(user => (
          <Marker 
            key={user._id} 
            position={[user.location.coordinates[1], user.location.coordinates[0]]}
          >
            <Popup>
              <strong>{user.name}</strong><br />
              Role: {user.role}<br />
              {user.role === 'Trader' ? 'Buying Crops' : 'Selling Products'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
