import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Package, CheckCircle2, Clock, Truck, XCircle, ChevronRight, Phone, MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const STATUS_CONFIG = {
  Pending: { color: '#f59e0b', bg: '#fef3c7', icon: <Clock size={14} /> },
  Confirmed: { color: '#3b82f6', bg: '#eff6ff', icon: <CheckCircle2 size={14} /> },
  Processing: { color: '#8b5cf6', bg: '#faf5ff', icon: <Package size={14} /> },
  Ready: { color: '#06b6d4', bg: '#ecfeff', icon: <Truck size={14} /> },
  Delivered: { color: '#10b981', bg: '#d1fae5', icon: <CheckCircle2 size={14} /> },
  Cancelled: { color: '#ef4444', bg: '#fee2e2', icon: <XCircle size={14} /> },
};

const OrdersManager = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = filterStatus !== 'All' ? `?status=${filterStatus}` : '';
      const res = await api.get(`/orders${query}`);
      const data = res.data?.data || res.data || [];
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      const updated = res.data?.data || res.data;
      setOrders(orders.map((o) => (o._id === orderId ? updated : o)));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Please enter the reason for cancellation:');
    if (reason === null) return;

    try {
      const res = await api.put(`/orders/${orderId}/status`, {
        status: 'Cancelled',
        cancelledReason: reason || 'Cancelled by user',
      });
      const updated = res.data?.data || res.data;
      setOrders(orders.map((o) => (o._id === orderId ? updated : o)));
      toast.success('Order marked as cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const isRetailer = user?.role === 'Retailer' || user?.role === 'Admin';

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={22} color="var(--primary-color)" /> {t('orders.title')}
          </h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
            {isRetailer
              ? 'Manage incoming orders from farmers, accept and update delivery status in real-time.'
              : 'Track your marketplace purchases, retailer fulfillment, and delivery timelines.'}
          </p>
        </div>

        {/* Filter & Refresh */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 'auto', margin: 0, padding: '8px 12px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            onClick={fetchOrders}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              color: '#475569',
            }}
            title="Refresh Orders"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <Package size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {isRetailer ? t('orders.emptyRetailer') : t('orders.emptyFarmer')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => {
            const conf = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
            return (
              <div
                key={order._id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                {/* Top Info Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>
                      {order.orderNumber}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '10px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: conf.bg,
                        color: conf.color,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {conf.icon} {order.status}
                    </span>
                  </div>
                </div>

                {/* Items & Participant details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                  {/* Items List */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                      Ordered Items:
                    </div>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', padding: '4px 0' }}>
                        <span style={{ color: '#0f172a' }}>
                          {item.name} <span style={{ color: '#64748b' }}>× {item.quantity} {item.unit}</span>
                        </span>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', marginTop: '8px', paddingTop: '8px', fontSize: '14.5px', fontWeight: '700', color: 'var(--primary-dark)' }}>
                      <span>Total Amount:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Delivery & Counterparty info */}
                  <div style={{ fontSize: '13px', color: '#475569', background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '6px', fontWeight: '600', color: '#1e293b' }}>
                      {isRetailer ? `Farmer: ${order.farmerId?.name || 'Customer'}` : `Retailer: ${order.retailerId?.name || 'Agri Shop'}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Phone size={13} color="#64748b" />
                      <span>{order.deliveryAddress?.phone || order.farmerId?.mobileNumber || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <MapPin size={13} color="#64748b" style={{ marginTop: '3px' }} />
                      <span>{order.deliveryAddress?.address || 'Standard Delivery Address'}</span>
                    </div>
                    {order.notes && (
                      <div style={{ marginTop: '6px', fontStyle: 'italic', color: '#94a3b8', fontSize: '12px' }}>
                        Note: {order.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Action Buttons for Retailer / User */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  {isRetailer ? (
                    <>
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Confirmed')}
                          className="btn"
                          style={{ width: 'auto', padding: '6px 16px', fontSize: '13px', background: '#3b82f6' }}
                        >
                          Confirm Order
                        </button>
                      )}
                      {order.status === 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Processing')}
                          className="btn"
                          style={{ width: 'auto', padding: '6px 16px', fontSize: '13px', background: '#8b5cf6' }}
                        >
                          Mark Processing
                        </button>
                      )}
                      {order.status === 'Processing' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Ready')}
                          className="btn"
                          style={{ width: 'auto', padding: '6px 16px', fontSize: '13px', background: '#06b6d4' }}
                        >
                          Mark Ready for Delivery
                        </button>
                      )}
                      {order.status === 'Ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                          className="btn"
                          style={{ width: 'auto', padding: '6px 16px', fontSize: '13px', background: '#10b981' }}
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          style={{
                            background: 'none',
                            border: '1px solid #fca5a5',
                            color: '#ef4444',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          style={{
                            background: 'none',
                            border: '1px solid #fca5a5',
                            color: '#ef4444',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
