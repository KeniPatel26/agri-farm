import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import {
  Users, Sprout, ShoppingBag, BarChart, Search, Trash2, Filter,
  ShieldCheck, ShieldAlert, CheckCircle, XCircle, Send,
  FileText, MessageSquareWarning, RefreshCw, Layers, Shield
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'react-hot-toast';
import NotificationsPanel from '../components/NotificationsPanel';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'verification', 'complaints', 'broadcast', 'audit'
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  // Broadcast state
  const [broadcastForm, setBroadcastForm] = useState({
    targetRole: 'All',
    title: '',
    message: '',
    type: 'ANNOUNCEMENT',
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    fetchStatsAndUsers();
  }, [filterRole]);

  useEffect(() => {
    if (activeTab === 'complaints') fetchComplaints();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const fetchStatsAndUsers = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data?.data || statsRes.data);

      const roleParam = filterRole !== 'All' ? `role=${filterRole}` : '';
      const usersRes = await api.get(`/admin/users?${roleParam}`);
      setUsers(usersRes.data?.data || usersRes.data || []);
    } catch {
      toast.error('Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data?.data || res.data || []);
    } catch {
      toast.error('Error fetching complaints');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setAuditLogs(res.data?.data || res.data || []);
    } catch {
      toast.error('Error fetching audit logs');
    }
  };

  const handleVerifyUser = async (userId, verificationStatus) => {
    try {
      await api.put(`/admin/users/${userId}/verify`, { verificationStatus });
      setUsers(users.map((u) => (u._id === userId ? { ...u, verificationStatus } : u)));
      toast.success(`User verification set to ${verificationStatus}`);
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data?.data || statsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating verification');
    }
  };

  const handleUpdateStatus = async (userId, accountStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { accountStatus });
      setUsers(users.map((u) => (u._id === userId ? { ...u, accountStatus } : u)));
      toast.success(`User account marked as ${accountStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all associated data permanently?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      toast.success(`User ${name} deleted successfully.`);
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data?.data || statsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user');
    }
  };

  const handleResolveComplaint = async (id, status) => {
    const notes = window.prompt(`Resolution notes for status "${status}":`);
    try {
      await api.put(`/complaints/${id}`, { status, adminNotes: notes || '' });
      setComplaints(complaints.map((c) => (c._id === id ? { ...c, status, adminNotes: notes } : c)));
      toast.success(`Complaint status updated to ${status}`);
    } catch {
      toast.error('Error updating complaint');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.message.trim()) {
      toast.error('Please enter broadcast message');
      return;
    }
    setSendingBroadcast(true);
    try {
      const res = await api.post('/admin/broadcast', broadcastForm);
      toast.success(res.data?.message || 'Notification broadcasted successfully!');
      setBroadcastForm({ targetRole: 'All', title: '', message: '', type: 'ANNOUNCEMENT' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Broadcast failed');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.mobileNumber && u.mobileNumber.includes(search))
  );

  const pendingVerificationUsers = users.filter(
    (u) => (u.role === 'Trader' || u.role === 'Retailer') && u.verificationStatus === 'pending'
  );

  const chartData = stats
    ? [
        { name: 'Farmers', value: stats.users.farmers },
        { name: 'Traders', value: stats.users.traders },
        { name: 'Retailers', value: stats.users.retailers },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '30px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={28} color="var(--primary-color)" /> Administrative Command Center
          </h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>
            AgriConnect Governance, Verification Desk, Audit Trail &amp; Operational Analytics
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '24px', padding: '4px', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { id: 'users', label: '👥 Users' },
            { id: 'verification', label: `🛡️ Verification (${pendingVerificationUsers.length})` },
            { id: 'complaints', label: '📩 Help & Complaints' },
            { id: 'broadcast', label: '📢 Broadcast' },
            { id: 'audit', label: '📝 Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-dark)' : '#475569',
                padding: '7px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metrics Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Registered Users', value: stats.users.total, icon: <Users size={20} />, color: '#6366f1' },
            { label: 'Pending Verifications', value: stats.users.pendingVerifications || 0, icon: <ShieldAlert size={20} />, color: '#f59e0b' },
            { label: 'Active Crops', value: stats.crops, icon: <Sprout size={20} />, color: '#10b981' },
            { label: 'Agri Products', value: stats.products, icon: <ShoppingBag size={20} />, color: '#3b82f6' },
            { label: 'Mandi Rates', value: stats.listings, icon: <BarChart size={20} />, color: '#8b5cf6' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                padding: '18px 20px',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderBottom: `4px solid ${stat.color}`,
              }}
            >
              <div
                style={{
                  background: stat.color + '15',
                  color: stat.color,
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="dashboard-grid">
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '700', fontSize: '18px' }}>User Directory</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search name/email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '30px', margin: 0, padding: '6px 10px 6px 30px', fontSize: '13px' }}
                  />
                </div>
                <select
                  className="form-control"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={{ margin: 0, padding: '6px 10px', fontSize: '13px', width: 'auto' }}
                >
                  <option value="All">All Roles</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Trader">Trader</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['Name', 'Email & Phone', 'Role', 'Verification', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0f172a' }}>{u.name}</td>
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12.5px' }}>
                        <div>{u.email}</div>
                        {u.mobileNumber && <div style={{ color: '#94a3b8' }}>{u.mobileNumber}</div>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: u.role === 'Admin' ? '#fee2e2' : u.role === 'Farmer' ? '#d1fae5' : u.role === 'Trader' ? '#dbeafe' : '#fef3c7',
                          color: u.role === 'Admin' ? '#991b1b' : u.role === 'Farmer' ? '#065f46' : u.role === 'Trader' ? '#1e40af' : '#92400e',
                          padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: u.verificationStatus === 'approved' ? '#d1fae5' : u.verificationStatus === 'rejected' ? '#fee2e2' : '#fef3c7',
                          color: u.verificationStatus === 'approved' ? '#065f46' : u.verificationStatus === 'rejected' ? '#991b1b' : '#92400e',
                          padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                        }}>
                          {u.verificationStatus || 'approved'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          color: u.accountStatus === 'active' ? '#10b981' : '#ef4444',
                          fontWeight: '600', fontSize: '12px',
                        }}>
                          {u.accountStatus || 'active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {u.role !== 'Admin' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {u.accountStatus === 'active' ? (
                              <button
                                onClick={() => handleUpdateStatus(u._id, 'suspended')}
                                style={{ background: 'none', border: '1px solid #fef08a', borderRadius: '6px', color: '#b45309', padding: '4px 8px', cursor: 'pointer', fontSize: '11.5px' }}
                                title="Suspend Account"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(u._id, 'active')}
                                style={{ background: 'none', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#16a34a', padding: '4px 8px', cursor: 'pointer', fontSize: '11.5px' }}
                                title="Activate Account"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              style={{ background: 'none', border: '1px solid #fecaca', borderRadius: '6px', color: '#ef4444', padding: '4px 6px', cursor: 'pointer' }}
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {chartData.length > 0 && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 14px', color: '#0f172a', fontSize: '15px' }}>Role Demographics</h4>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            <NotificationsPanel />
          </div>
        </div>
      )}

      {/* Main Tab 2: Verification Queue */}
      {activeTab === 'verification' && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 18px', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--primary-color)" /> Trader &amp; Retailer Verification Requests
          </h3>

          {pendingVerificationUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              🎉 All Trader and Retailer business accounts are currently verified! No pending reviews in queue.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingVerificationUsers.map((u) => (
                <div
                  key={u._id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>{u.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Role: <strong>{u.role}</strong> • Email: {u.email} • Mobile: {u.mobileNumber || 'N/A'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      Location: {u.location?.address || `${u.district || ''}, ${u.state || ''}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleVerifyUser(u._id, 'approved')}
                      className="btn"
                      style={{ width: 'auto', padding: '8px 18px', fontSize: '13px', background: '#10b981' }}
                    >
                      <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      Approve &amp; Verify
                    </button>
                    <button
                      onClick={() => handleVerifyUser(u._id, 'rejected')}
                      style={{
                        background: 'none',
                        border: '1px solid #fecaca',
                        color: '#ef4444',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      <XCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Tab 3: Complaints Desk */}
      {activeTab === 'complaints' && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 18px', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquareWarning size={20} color="#b45309" /> User Grievances &amp; Bug Reports
          </h3>

          {complaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No complaints or feedback submitted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {complaints.map((c) => (
                <div
                  key={c._id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '18px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        {c.type}
                      </span>
                      <h4 style={{ margin: '6px 0 2px', color: '#0f172a', fontSize: '16px' }}>{c.subject}</h4>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        From: {c.userId?.name} ({c.userId?.role}) • {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{
                      background: c.status === 'Resolved' ? '#d1fae5' : c.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                      color: c.status === 'Resolved' ? '#065f46' : c.status === 'Rejected' ? '#991b1b' : '#92400e',
                      padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                    }}>
                      {c.status}
                    </span>
                  </div>

                  <p style={{ color: '#334155', fontSize: '13.5px', margin: '8px 0', lineHeight: '1.5' }}>
                    {c.description}
                  </p>

                  {c.adminNotes && (
                    <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px', color: '#475569', marginTop: '6px' }}>
                      <strong>Admin Resolution Note:</strong> {c.adminNotes}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleResolveComplaint(c._id, 'In Progress')}
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleResolveComplaint(c._id, 'Resolved')}
                      style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleResolveComplaint(c._id, 'Rejected')}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Tab 4: Broadcast Announcements */}
      {activeTab === 'broadcast' && (
        <div style={{ background: 'white', padding: '28px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', maxWidth: '650px' }}>
          <h3 style={{ margin: '0 0 18px', color: 'var(--primary-dark)', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={20} color="var(--primary-color)" /> Broadcast Notification to Users
          </h3>
          <form onSubmit={handleSendBroadcast}>
            <div className="form-group">
              <label>Target Audience Role</label>
              <select
                className="form-control"
                value={broadcastForm.targetRole}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
              >
                <option value="All">All Platform Users (Farmers, Traders, Retailers)</option>
                <option value="Farmer">Farmers Only</option>
                <option value="Trader">Traders Only</option>
                <option value="Retailer">Agri Retailers Only</option>
              </select>
            </div>

            <div className="form-group">
              <label>Announcement Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 🌧️ Severe Weather Advisory or New Mandi Listing"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Message Content *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Enter detailed announcement message..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                required
              />
            </div>

            <button type="submit" disabled={sendingBroadcast} className="btn" style={{ width: 'auto', padding: '12px 28px' }}>
              {sendingBroadcast ? 'Broadcasting...' : 'Send Broadcast Notification'}
            </button>
          </form>
        </div>
      )}

      {/* Main Tab 5: System Audit Logs */}
      {activeTab === 'audit' && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#3b82f6" /> Administrative Operations Audit Trail
            </h3>
            <button
              onClick={fetchAuditLogs}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#475569' }}
            >
              <RefreshCw size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Refresh
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
              No audit logs recorded yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['Timestamp', 'Admin', 'Action Executed', 'Entity', 'Details', 'IP'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: '600', color: '#0f172a' }}>{log.adminName}</td>
                      <td style={{ padding: '10px 12px', color: '#1e293b' }}>{log.action}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                          {log.entity}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{log.details || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: '11.5px' }}>{log.ipAddress || 'Local'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
