import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { DollarSign, TrendingUp, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const EXPENSE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

const ExpenseTracker = () => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/farmer');
      const data = res.data?.data || res.data;
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching financial analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div style={{ background: 'white', borderRadius: '16px', padding: '30px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
        <p style={{ color: '#64748b' }}>Loading farm financial analytics...</p>
      </div>
    );
  }

  const financials = analytics?.financials || {
    totalExpense: 0,
    expenseBreakdown: {},
    totalEstRevenue: 0,
    totalActualRevenue: 0,
    netProfitEst: 0,
    roiPercentage: 0,
  };

  const expenseBreakdown = financials.expenseBreakdown || {};

  const pieData = Object.entries(expenseBreakdown)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: Number(value) || 0,
    }))
    .filter((d) => d.value > 0);

  const comparisonData = [
    {
      category: 'Financials',
      Expenses: financials.totalExpense || 0,
      'Est. Revenue': financials.totalEstRevenue || 0,
      'Net Profit': Math.max(0, financials.netProfitEst || 0),
    },
  ];

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={22} color="var(--primary-color)" /> {t('dashboard.financeTitle')}
          </h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
            Track input costs (seeds, fertilizer, labor, machinery) vs crop harvest revenue &amp; net profitability.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#475569',
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: '600' }}>{t('dashboard.totalCost')}</span>
            <ArrowDownRight size={16} color="#dc2626" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#991b1b', marginTop: '6px' }}>
            ₹{financials.totalExpense.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600' }}>{t('dashboard.estRevenue')}</span>
            <ArrowUpRight size={16} color="#2563eb" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af', marginTop: '6px' }}>
            ₹{financials.totalEstRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>{t('dashboard.netProfit')}</span>
            <TrendingUp size={16} color="#16a34a" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: financials.netProfitEst >= 0 ? '#166534' : '#dc2626', marginTop: '6px' }}>
            ₹{financials.netProfitEst.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6b21a8', fontWeight: '600' }}>{t('dashboard.roi')}</span>
            <TrendingUp size={16} color="#9333ea" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#6b21a8', marginTop: '6px' }}>
            {financials.roiPercentage}%
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {financials.totalExpense > 0 || financials.totalEstRevenue > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Expense Breakdown Pie Chart */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PieIcon size={16} color="#3b82f6" /> Input Cost Breakdown
            </h4>
            <div style={{ height: '230px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11.5px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue vs Cost Comparison Bar Chart */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '15px' }}>
              Cost vs. Revenue Comparison
            </h4>
            <div style={{ height: '230px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11.5px' }} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Est. Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Net Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>
            {t('dashboard.noExpense')} Manage your crops and add input expenditures in the crop diary.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
