import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Plus, Trash2, Edit2, X, Check, Package, AlertTriangle, ShieldCheck, ShoppingCart } from 'lucide-react';
import NotificationsPanel from '../components/NotificationsPanel';
import ImageUploader from '../components/ImageUploader';
import OrdersManager from '../components/OrdersManager';

const CATEGORIES = ['Fertilizer', 'Pesticide', 'Seeds', 'Equipment', 'Other'];
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const RetailerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'orders', 'analytics'
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Fertilizer',
    price: '',
    stock: '',
    description: '',
    unit: 'kg',
    imageUrl: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      const data = res.data?.data || res.data || [];
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/products', {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });
      const created = res.data?.data || res.data;
      setProducts([created, ...products]);
      setFormData({ name: '', category: 'Fertilizer', price: '', stock: '', description: '', unit: 'kg', imageUrl: '' });
      setShowForm(false);
      toast.success('Product added to your inventory catalog!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error adding product';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted successfully');
    } catch {
      toast.error('Error deleting product');
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditData({ price: product.price, stock: product.stock, description: product.description || '' });
  };

  const handleUpdate = async (id) => {
    try {
      const res = await api.put(`/products/${id}`, {
        price: Number(editData.price),
        stock: Number(editData.stock),
        description: editData.description,
      });
      const updated = res.data?.data || res.data;
      setProducts(products.map((p) => (p._id === id ? updated : p)));
      setEditingId(null);
      toast.success('Product updated successfully');
    } catch {
      toast.error('Error updating product');
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = filterCategory === 'All' || p.category === filterCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const categoryData = CATEGORIES.map((cat) => ({
    name: cat,
    count: products.filter((p) => p.category === cat).length,
    value: products.filter((p) => p.category === cat).length,
  })).filter((d) => d.count > 0);

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10);
  const outOfStock = products.filter((p) => p.stock === 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * (p.stock || 0), 0);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ color: 'var(--primary-dark)', fontSize: '28px', fontWeight: '800', margin: 0 }}>
              Retailer Shop Hub
            </h2>
            {user?.verificationStatus === 'approved' ? (
              <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={13} /> Verified Retailer
              </span>
            ) : (
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                Verification Pending
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Welcome, {user?.name}</p>
        </div>

        {/* Tab & Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '20px', padding: '3px' }}>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                border: 'none',
                background: activeTab === 'inventory' ? 'white' : 'transparent',
                color: activeTab === 'inventory' ? 'var(--primary-dark)' : '#475569',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Inventory Catalog
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                border: 'none',
                background: activeTab === 'orders' ? 'white' : 'transparent',
                color: activeTab === 'orders' ? 'var(--primary-dark)' : '#475569',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              📦 Incoming Orders
            </button>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '10px 18px' }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStock.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color="#b45309" />
          <span><strong>Inventory Alert:</strong> {lowStock.length} product(s) are running low on stock (under 10 units). Please replenish soon.</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '18px', marginBottom: '30px' }}>
        {[
          { label: 'Total Products', value: products.length, color: '#3b82f6' },
          { label: 'Total Stock Units', value: totalStock, color: '#10b981' },
          { label: 'Out of Stock', value: outOfStock.length, color: '#ef4444' },
          { label: 'Inventory Valuation', value: `₹${totalValue.toLocaleString('en-IN')}`, color: '#8b5cf6' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-sm)',
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div style={{ background: 'white', padding: '26px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
          <h3 style={{ color: 'var(--primary-dark)', fontSize: '18px', margin: '0 0 18px' }}>Add New Agri Product</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Product Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., DAP Fertilizer (50kg)"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Price (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 1350"
                min="0"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Stock Available *</label>
              <input
                type="number"
                className="form-control"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="e.g., 100"
                min="0"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Unit</label>
              <select
                className="form-control"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {['kg', 'litre', 'packet', 'bag', 'piece'].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Description (optional)</label>
              <input
                type="text"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Specifications, brand, active ingredients"
              />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
              <ImageUploader
                label="Product Photo (Optional)"
                onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="btn" style={{ width: 'auto', padding: '10px 24px' }}>
                Save Product
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn"
                style={{ width: 'auto', padding: '10px 20px', background: '#e2e8f0', color: '#334155' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'orders' ? (
        <OrdersManager />
      ) : (
        <div className="dashboard-grid">
          <div>
            {/* Category Analytics */}
            {products.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                  <h4 style={{ margin: '0 0 14px', color: '#0f172a', fontSize: '15px' }}>Stock by Category</h4>
                  <div style={{ height: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Items" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                  <h4 style={{ margin: '0 0 14px', color: '#0f172a', fontSize: '15px' }}>Category Share</h4>
                  <div style={{ height: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                          {categoryData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Table */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                  <Package size={18} color="#3b82f6" /> Inventory Items
                </h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
                  />
                  <select
                    className="form-control"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ width: 'auto', padding: '6px 10px', fontSize: '13px' }}
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Loading inventory...</p>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  {products.length === 0
                    ? 'No products yet. Click "Add Product" to add items.'
                    : 'No products match your search.'}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Product', 'Category', 'Price (₹)', 'Stock', 'Unit', 'Status', 'Actions'].map((h) => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#475569', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {p.imageUrl && (
                                <img src={p.imageUrl} alt={p.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                              )}
                              <div>
                                <div style={{ fontWeight: '600', color: '#0f172a' }}>{p.name}</div>
                                {p.description && <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{p.description}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '600' }}>
                              {p.category}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {editingId === p._id ? (
                              <input
                                type="number"
                                className="form-control"
                                value={editData.price}
                                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                                style={{ width: '80px', padding: '4px 6px' }}
                              />
                            ) : (
                              <span style={{ color: '#10b981', fontWeight: '700' }}>₹{p.price}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {editingId === p._id ? (
                              <input
                                type="number"
                                className="form-control"
                                value={editData.stock}
                                onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
                                style={{ width: '70px', padding: '4px 6px' }}
                              />
                            ) : (
                              <span style={{ color: p.stock === 0 ? '#ef4444' : p.stock < 10 ? '#f59e0b' : '#0f172a', fontWeight: '600' }}>
                                {p.stock}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>{p.unit}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              background: p.available ? '#d1fae5' : '#fee2e2',
                              color: p.available ? '#065f46' : '#991b1b',
                              padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                            }}>
                              {p.available ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {editingId === p._id ? (
                                <>
                                  <button onClick={() => handleUpdate(p._id)} style={actionBtn('#10b981')} title="Save">
                                    <Check size={14} />
                                  </button>
                                  <button onClick={() => setEditingId(null)} style={actionBtn('#94a3b8')} title="Cancel">
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(p)} style={actionBtn('#3b82f6')} title="Edit">
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDelete(p._id)} style={actionBtn('#ef4444')} title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <NotificationsPanel />
          </div>
        </div>
      )}
    </div>
  );
};

const actionBtn = (color) => ({
  background: 'none',
  border: `1px solid ${color}`,
  borderRadius: '6px',
  color: color,
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
});

export default RetailerDashboard;
