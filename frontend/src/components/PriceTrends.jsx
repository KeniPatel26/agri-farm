import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const PriceTrends = ({ cropName = "Wheat" }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const res = await api.get(`/analytics/price/${cropName}`);
        
        if (res.data && res.data.length > 0) {
          const formattedData = res.data.map(item => ({
            date: new Date(item.date).toLocaleDateString(),
            price: item.price
          }));
          setData(formattedData);
        } else {
          // Mock Data if no history found
          setData([
            { date: 'Jan', price: 2000 },
            { date: 'Feb', price: 2100 },
            { date: 'Mar', price: 2050 },
            { date: 'Apr', price: 2300 },
            { date: 'May', price: 2450 },
            { date: 'Jun', price: 2400 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching price history', error);
        // Fallback Mock
        setData([
          { date: 'Jan', price: 2000 },
          { date: 'Feb', price: 2100 },
          { date: 'Mar', price: 2050 },
          { date: 'Apr', price: 2300 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [cropName]);

  if (loading) return <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>Loading Price Trends...</div>;

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={24} color="#10b981" /> Market Price Trends: {cropName}
      </h3>
      
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              name="Price (₹/Quintal)" 
              stroke="#10b981" 
              strokeWidth={3}
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceTrends;
