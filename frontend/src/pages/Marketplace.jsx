import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import {
  Search, Filter, ArrowUpDown, ShoppingBag, Tag, MapPin, Loader2, ArrowRight,
  Heart, CheckCircle2, Phone, ShoppingCart, X, Package, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReviewsManager from '../components/ReviewsManager';
import OrdersManager from '../components/OrdersManager';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = ['All', 'Fertilizer', 'Pesticide', 'Seeds', 'Equipment', 'Other'];
const CROPS = ['All', 'Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Sugarcane', 'Potato', 'Tomato', 'Onion', 'Mustard'];

const Marketplace = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'prices', 'orders'
  const [expandedReviewsProductId, setExpandedReviewsProductId] = useState(null);

  // Products state
  const [products, setProducts] = useState([]);
  const [productCategory, setProductCategory] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [productSort, setProductSort] = useState('newest');
  const [productsLoading, setProductsLoading] = useState(true);

  // Prices state
  const [prices, setPrices] = useState([]);
  const [priceCrop, setPriceCrop] = useState('All');
  const [priceSearch, setPriceSearch] = useState('');
  const [priceSort, setPriceSort] = useState('newest');
  const [pricesLoading, setPricesLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Order Placement Modal State
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: user?.location?.address || '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || '',
    phone: user?.mobileNumber || '',
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Contact Trader Modal State
  const [selectedPriceForContact, setSelectedPriceForContact] = useState(null);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'prices') {
      fetchPrices();
    }
    fetchFavorites();
  }, [activeTab, productCategory, priceCrop]);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data?.data || res.data || []);
    } catch {}
  };

  const toggleFavorite = async (productId, targetType = 'Product') => {
    const isFav = favorites.some((f) => f.targetId === productId);
    try {
      if (isFav) {
        await api.delete(`/favorites/${productId}`);
        setFavorites(favorites.filter((f) => f.targetId !== productId));
        toast.success('Removed from bookmarks');
      } else {
        await api.post('/favorites', { targetId: productId, targetType });
        const res = await api.get('/favorites');
        setFavorites(res.data?.data || res.data || []);
        toast.success('Added to bookmarks!');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const catQuery = productCategory !== 'All' ? `category=${productCategory}` : '';
      const res = await api.get(`/products/all?${catQuery}`);
      setProducts(res.data?.data || res.data || []);
    } catch {
      toast.error('Error fetching marketplace products');
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchPrices = async () => {
    setPricesLoading(true);
    try {
      const cropQuery = priceCrop !== 'All' ? `cropName=${priceCrop}` : '';
      const res = await api.get(`/prices/all?${cropQuery}`);
      setPrices(res.data?.data || res.data || []);
    } catch {
      toast.error('Error fetching market prices');
    } finally {
      setPricesLoading(false);
    }
  };

  const handleOpenOrderModal = (product) => {
    setSelectedProductForOrder(product);
    setOrderQuantity(1);
    setDeliveryAddress({
      address: user?.location?.address || '',
      village: user?.village || '',
      district: user?.district || '',
      state: user?.state || '',
      phone: user?.mobileNumber || '',
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.address || !deliveryAddress.phone) {
      toast.error('Please enter delivery address and contact phone number');
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        retailerId: selectedProductForOrder.retailerId?._id || selectedProductForOrder.retailerId,
        items: [
          {
            productId: selectedProductForOrder._id,
            name: selectedProductForOrder.name,
            price: selectedProductForOrder.price,
            quantity: Number(orderQuantity),
            unit: selectedProductForOrder.unit,
          },
        ],
        deliveryAddress,
        notes: orderNotes,
      };

      await api.post('/orders', payload);
      toast.success(`Order placed successfully! Total: ₹${selectedProductForOrder.price * orderQuantity}`);
      setSelectedProductForOrder(null);
      // Refresh products to show updated stock
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Sort and filter client-side for search queries
  const getFilteredProducts = () => {
    let result = products.filter((p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (productSort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (productSort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  };

  const getFilteredPrices = () => {
    let result = prices.filter((p) =>
      p.cropName.toLowerCase().includes(priceSearch.toLowerCase()) ||
      p.marketName.toLowerCase().includes(priceSearch.toLowerCase())
    );

    if (priceSort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    }
    return result;
  };

  const filteredProducts = getFilteredProducts();
  const filteredPrices = getFilteredPrices();

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h2 style={{ color: 'var(--primary-dark)', fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
          🌾 {t('market.title')}
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '650px', margin: '0 auto' }}>
          {t('market.subtitle')}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div
        style={{
          display: 'flex',
          background: '#e2e8f0',
          borderRadius: '30px',
          padding: '6px',
          maxWidth: '560px',
          margin: '0 auto 36px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => setActiveTab('products')}
          style={{
            flex: 1,
            padding: '10px 18px',
            borderRadius: '24px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            background: activeTab === 'products' ? 'white' : 'transparent',
            color: activeTab === 'products' ? 'var(--primary-dark)' : '#475569',
            boxShadow: activeTab === 'products' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          {t('market.tabProducts')}
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          style={{
            flex: 1,
            padding: '10px 18px',
            borderRadius: '24px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            background: activeTab === 'prices' ? 'white' : 'transparent',
            color: activeTab === 'prices' ? 'var(--primary-dark)' : '#475569',
            boxShadow: activeTab === 'prices' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          {t('market.tabPrices')}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            flex: 1,
            padding: '10px 18px',
            borderRadius: '24px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            background: activeTab === 'orders' ? 'white' : 'transparent',
            color: activeTab === 'orders' ? 'var(--primary-dark)' : '#475569',
            boxShadow: activeTab === 'orders' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          📦 {t('nav.orders')}
        </button>
      </div>

      {activeTab === 'orders' ? (
        <OrdersManager />
      ) : (
        <>
          {/* Filter and Search Panel */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '18px 24px',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '28px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                placeholder={activeTab === 'products' ? t('market.searchProduct') : t('market.searchPrice')}
                value={activeTab === 'products' ? productSearch : priceSearch}
                onChange={(e) => (activeTab === 'products' ? setProductSearch(e.target.value) : setPriceSearch(e.target.value))}
                style={{ paddingLeft: '44px', margin: 0 }}
              />
            </div>

            {/* Filters and Sort */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={15} color="#64748b" />
                <select
                  className="form-control"
                  value={activeTab === 'products' ? productCategory : priceCrop}
                  onChange={(e) => (activeTab === 'products' ? setProductCategory(e.target.value) : setPriceCrop(e.target.value))}
                  style={{ width: 'auto', margin: 0, padding: '8px 12px', fontSize: '13.5px' }}
                >
                  {activeTab === 'products'
                    ? CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)
                    : CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpDown size={15} color="#64748b" />
                <select
                  className="form-control"
                  value={activeTab === 'products' ? productSort : priceSort}
                  onChange={(e) => (activeTab === 'products' ? setProductSort(e.target.value) : setPriceSort(e.target.value))}
                  style={{ width: 'auto', margin: 0, padding: '8px 12px', fontSize: '13.5px' }}
                >
                  <option value="newest">{t('market.newest')}</option>
                  <option value="price-low">{t('market.lowToHigh')}</option>
                  <option value="price-high">{t('market.highToLow')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tab 1: Products Grid */}
          {activeTab === 'products' ? (
            productsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <Loader2 size={36} className="spin" color="var(--primary-color)" style={{ margin: '0 auto 10px' }} />
                <p style={{ color: '#64748b' }}>Loading retail products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <ShoppingBag size={48} color="#94a3b8" style={{ marginBottom: '15px' }} />
                <h4 style={{ color: '#0f172a', marginBottom: '8px' }}>{t('market.noProduct')}</h4>
                <p style={{ color: '#64748b' }}>Try refining your search terms or selecting another category.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="auth-card"
                    style={{
                      margin: 0,
                      padding: '22px',
                      width: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    <div>
                      {/* Badge and Bookmark */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span
                            style={{
                              background: 'var(--primary-light)',
                              color: 'var(--primary-dark)',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700',
                            }}
                          >
                            {product.category}
                          </span>
                          <button
                            onClick={() => toggleFavorite(product._id, 'Product')}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              color: favorites.some((f) => f.targetId === product._id) ? '#ef4444' : '#cbd5e1',
                            }}
                            title="Bookmark item"
                          >
                            <Heart size={16} fill={favorites.some((f) => f.targetId === product._id) ? '#ef4444' : 'none'} />
                          </button>
                        </div>
                        <span
                          style={{
                            color: product.stock > 0 ? '#10b981' : '#ef4444',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {product.stock > 0 ? `${product.stock} ${product.unit} left` : 'Out of stock'}
                        </span>
                      </div>

                      {/* Image preview */}
                      {product.imageUrl && (
                        <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}

                      <h4 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
                        {product.name}
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.45', minHeight: '38px', marginBottom: '14px' }}>
                        {product.description || 'Verified agricultural input product.'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Price</span>
                          <div style={{ color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '800' }}>
                            ₹{product.price} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>/ {product.unit}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                            <MapPin size={11} /> Retailer
                          </span>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                            {product.retailerId?.name || 'Agri Retail Shop'}
                            {product.retailerId?.verificationStatus === 'approved' && (
                              <ShieldCheck size={13} color="#10b981" title="Verified Retailer" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenOrderModal(product)}
                          disabled={product.stock === 0}
                          className="btn"
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px',
                            fontSize: '13.5px',
                          }}
                        >
                          <ShoppingCart size={15} /> {product.stock > 0 ? t('market.orderNow') : 'Out of Stock'}
                        </button>
                        <button
                          onClick={() => setExpandedReviewsProductId(expandedReviewsProductId === product._id ? null : product._id)}
                          className="btn"
                          style={{
                            width: 'auto',
                            padding: '10px 12px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            fontSize: '12.5px',
                          }}
                          title="Reviews"
                        >
                          ★ {expandedReviewsProductId === product._id ? 'Close' : 'Reviews'}
                        </button>
                      </div>

                      {expandedReviewsProductId === product._id && (
                        <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                          <ReviewsManager targetId={product._id} targetType="Product" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Tab 2: Trader Crop Buying Prices Grid */
            pricesLoading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <Loader2 size={36} className="spin" color="var(--primary-color)" style={{ margin: '0 auto 10px' }} />
                <p style={{ color: '#64748b' }}>Loading crop buying rates...</p>
              </div>
            ) : filteredPrices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <Tag size={48} color="#94a3b8" style={{ marginBottom: '15px' }} />
                <h4 style={{ color: '#0f172a', marginBottom: '8px' }}>{t('market.noPrice')}</h4>
                <p style={{ color: '#64748b' }}>Try selecting a different crop or adjusting filters.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {filteredPrices.map((price) => (
                  <div
                    key={price._id}
                    className="auth-card"
                    style={{
                      margin: 0,
                      padding: '22px',
                      width: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#3b82f6',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                          }}
                        >
                          {price.grade || 'Trader Buying Offer'}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>
                          {new Date(price.date || price.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                        {price.cropName} {price.variety ? `(${price.variety})` : ''}
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
                        <MapPin size={12} color="#94a3b8" /> Market: <strong>{price.marketName}</strong>
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Offered Price</span>
                          <div style={{ color: '#10b981', fontSize: '20px', fontWeight: '800' }}>
                            ₹{price.price} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>/ {price.unit || 'Quintal'}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Trader</span>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                            {price.traderId?.name || 'Direct Trader'}
                            {price.traderId?.verificationStatus === 'approved' && (
                              <ShieldCheck size={13} color="#10b981" title="Verified Trader" />
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPriceForContact(price)}
                        className="btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          background: 'var(--primary-dark)',
                          fontSize: '13.5px',
                        }}
                      >
                        <Phone size={14} /> Contact Trader / Mandi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Order Placement Modal */}
      {selectedProductForOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedProductForOrder(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '480px',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProductForOrder(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 16px', color: 'var(--primary-dark)', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} /> Place Order: {selectedProductForOrder.name}
            </h3>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '4px' }}>
                <span>Unit Price:</span>
                <strong>₹{selectedProductForOrder.price} / {selectedProductForOrder.unit}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '4px' }}>
                <span>In Stock:</span>
                <span>{selectedProductForOrder.stock} {selectedProductForOrder.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: 'var(--primary-dark)', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '6px' }}>
                <span>Total Amount:</span>
                <span>₹{selectedProductForOrder.price * orderQuantity}</span>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label>{t('market.quantityToOrder')} ({selectedProductForOrder.unit}) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, Math.min(selectedProductForOrder.stock, Number(e.target.value))))}
                  min="1"
                  max={selectedProductForOrder.stock}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={deliveryAddress.phone}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div className="form-group">
                <label>Delivery Address *</label>
                <input
                  type="text"
                  className="form-control"
                  value={deliveryAddress.address}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
                  placeholder="House/Farm address, Village, Road"
                  required
                />
              </div>

              <div className="form-group">
                <label>Order Notes (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Call before delivery"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedProductForOrder(null)}
                  className="btn"
                  style={{ width: 'auto', padding: '10px 20px', background: '#f1f5f9', color: '#475569' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={placingOrder} className="btn" style={{ flex: 1 }}>
                  {placingOrder ? 'Placing Order...' : `Confirm Order (₹${selectedProductForOrder.price * orderQuantity})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Trader Modal */}
      {selectedPriceForContact && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedPriceForContact(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPriceForContact(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 14px', color: 'var(--primary-dark)', fontSize: '20px' }}>
              Trader Mandi Details
            </h3>

            <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', marginBottom: '20px' }}>
              <p><strong>Crop Offer:</strong> {selectedPriceForContact.cropName} (₹{selectedPriceForContact.price}/{selectedPriceForContact.unit})</p>
              <p><strong>Market / Mandi:</strong> {selectedPriceForContact.marketName}</p>
              <p><strong>Trader Name:</strong> {selectedPriceForContact.traderId?.name || 'Authorized Mandi Trader'}</p>
              <p><strong>Contact Phone:</strong> {selectedPriceForContact.traderId?.mobileNumber || '+91-9876543210'}</p>
            </div>

            <a
              href={`tel:${selectedPriceForContact.traderId?.mobileNumber || '9876543210'}`}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            >
              <Phone size={16} /> Call Trader Directly
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
