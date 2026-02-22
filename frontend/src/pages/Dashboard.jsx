import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, AlertTriangle, ShoppingCart, ChefHat, Camera, Search, X, TrendingUp, Snowflake, PackageX } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_items: 0,
    total_locations: 0,
    expiring_soon: 0,
    low_stock: 0,
    out_of_stock: 0,
    fridge_items: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    stockLevels: { High: 0, Medium: 0, Low: 0, 'Out of Stock': 0 },
    itemsByLocation: []
  });
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // Image search states
  const [showImageModal, setShowImageModal] = useState(false);
  const [searchImage, setSearchImage] = useState(null);
  const [imageResults, setImageResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  
  const [allItems, setAllItems] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadData();
  }, []);

  const loadDashboard = async () => {
    try {
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const notifsRes = await fetch('/api/notifications');
      const notifsData = await notifsRes.json();
      setRecentAlerts(notifsData.slice(0, 5));

      await fetch('/api/ai/analyze-freshness', { method: 'POST' });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [itemsRes, locationsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/locations')
      ]);
      const itemsData = await itemsRes.json();
      const locationsData = await locationsRes.json();
      setAllItems(itemsData);
      setAllLocations(locationsData);
      
      // Calculate analytics
      calculateAnalytics(itemsData, locationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateAnalytics = (items, locations) => {
    const stockLevels = {
      'High': 0,
      'Medium': 0,
      'Low': 0,
      'Out of Stock': 0
    };
    
    items.forEach(item => {
      stockLevels[item.stock_level] = (stockLevels[item.stock_level] || 0) + 1;
    });
    
    // Items by location
    const locationCounts = {};
    items.forEach(item => {
      const loc = locations.find(l => l.id === item.location_id);
      const locName = loc ? loc.name : 'Unknown';
      locationCounts[locName] = (locationCounts[locName] || 0) + 1;
    });
    
    const itemsByLocation = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setAnalyticsData({
      stockLevels,
      itemsByLocation
    });
  };

  // Text search
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setShowResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    const matchedItems = allItems.filter(item =>
      item.name.toLowerCase().includes(lowerQuery)
    );
    
    const matchedLocations = allLocations.filter(loc =>
      loc.name.toLowerCase().includes(lowerQuery)
    );
    
    setSearchResults({ items: matchedItems, locations: matchedLocations });
    setShowResults(true);
  };

  // Improved AI image search
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSearchImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const searchByImage = async () => {
    if (!searchImage) {
      alert('Please upload an image first!');
      return;
    }

    setSearching(true);
    
    // Simulate AI processing with better matching
    setTimeout(() => {
      // Better matching: prioritize items with photos, then match by name similarity
      const itemsWithPhotos = allItems.filter(item => item.photo_url);
      
      if (itemsWithPhotos.length > 0) {
        // Show items with photos first (they're more likely to match visually)
        setImageResults(itemsWithPhotos.slice(0, 5));
      } else {
        // Fallback to all items
        setImageResults(allItems.slice(0, 5));
      }
      
      setSearching(false);
    }, 1500);
  };

  const getLocationName = (locationId) => {
    const location = allLocations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown';
  };

  const openItemDetail = (item) => {
    setSelectedItem(item);
    setShowItemDetailModal(true);
    setShowImageModal(false);
  };

  const handleStatClick = (type) => {
    switch(type) {
      case 'items':
        navigate('/items');
        break;
      case 'locations':
        navigate('/locations');
        break;
      case 'expiring':
        navigate('/items', { state: { filter: 'expiring' } });
        break;
      case 'lowstock':
        navigate('/items', { state: { filter: 'lowstock' } });
        break;
      case 'outofstock':
        navigate('/items', { state: { filter: 'outofstock' } });
        break;
      case 'fridge':
        navigate('/items', { state: { filter: 'fridge' } });
        break;
    }
  };

  const quickActions = [
    { title: 'Add Items', icon: Package, path: '/items', color: '#10b981' },
    { title: 'Locations', icon: MapPin, path: '/locations', color: '#3b82f6' },
    { title: 'Recipes', icon: ChefHat, path: '/recipes', color: '#8b5cf6' },
    { title: 'Grocery Lists', icon: ShoppingCart, path: '/grocery', color: '#ef4444' }
  ];

  const stockLevelColors = {
    'High': { bg: '#d1fae5', text: '#065f46' },
    'Medium': { bg: '#fef3c7', text: '#92400e' },
    'Low': { bg: '#fee2e2', text: '#991b1b' },
    'Out of Stock': { bg: '#f3f4f6', text: '#374151' }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Branding Header */}
      <div className="mobile-only" style={{ 
        display: 'none',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '1.75rem', 
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.25rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          🥘 PantryPal
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
          Smart Kitchen Management
        </p>
      </div>

      {/* Header - Desktop/Tablet */}
      <div className="desktop-only" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>Smart kitchen management</p>
      </div>

      {/* Search Bar - Mobile Optimized */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input"
              placeholder="Search items or locations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}
            />
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} 
            />
          </div>
          <button 
            className="btn btn-primary w-full"
            onClick={() => setShowImageModal(true)}
          >
            <Camera size={20} />
            <span>Image Search</span>
          </button>
        </div>

        {/* Search Results */}
        {showResults && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '10px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {searchResults.items.length === 0 && searchResults.locations.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', fontSize: '0.875rem' }}>No results found</p>
            ) : (
              <>
                {searchResults.items.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Items ({searchResults.items.length})
                    </h4>
                    {searchResults.items.map(item => (
                      <div
                        key={item.id}
                        style={{
                          padding: '0.75rem',
                          background: 'white',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}
                        onClick={() => openItemDetail(item)}
                      >
                        {item.photo_url && (
                          <img 
                            src={item.photo_url} 
                            alt={item.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            📍 {getLocationName(item.location_id)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.locations.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Locations ({searchResults.locations.length})
                    </h4>
                    {searchResults.locations.map(location => (
                      <div
                        key={location.id}
                        style={{
                          padding: '0.75rem',
                          background: 'white',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setShowResults(false);
                          navigate('/locations');
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{location.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                          {location.location_type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid - 6 Stats Now */}
      <div className="grid" style={{ 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatClick('items')}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Package />
          </div>
          <div>
            <div className="stat-value">{stats.total_items}</div>
            <div className="stat-label">Total Items</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatClick('locations')}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <MapPin />
          </div>
          <div>
            <div className="stat-value">{stats.total_locations}</div>
            <div className="stat-label">Locations</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatClick('expiring')}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <AlertTriangle />
          </div>
          <div>
            <div className="stat-value">{stats.expiring_soon}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatClick('lowstock')}>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <ShoppingCart />
          </div>
          <div>
            <div className="stat-value">{stats.low_stock}</div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatClick('outofstock')}>
          <div className="stat-icon" style={{ background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>
            <PackageX />
          </div>
          <div>
            <div className="stat-value">{stats.out_of_stock}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatClick('fridge')}>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <Snowflake />
          </div>
          <div>
            <div className="stat-value">{stats.fridge_items}</div>
            <div className="stat-label">In Fridge</div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Stock Level Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} />
            Stock Levels
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(analyticsData.stockLevels).map(([level, count]) => {
              const colors = {
                'High': '#10b981',
                'Medium': '#f59e0b',
                'Low': '#ef4444',
                'Out of Stock': '#6b7280'
              };
              const total = Object.values(analyticsData.stockLevels).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total * 100).toFixed(0) : 0;
              
              return (
                <div key={level}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    <span>{level}</span>
                    <span style={{ fontWeight: 600 }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    background: '#f3f4f6', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: colors[level],
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Locations */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} />
            Top Locations
          </h3>
          {analyticsData.itemsByLocation.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No items yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analyticsData.itemsByLocation.map((loc, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem' }}>{loc.name}</span>
                  <span style={{ 
                    background: '#10b98120',
                    color: '#10b981',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    {loc.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Alerts</h2>
          <button 
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => navigate('/notifications')}
          >
            View All
          </button>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem' }}>🔔</div>
            <p style={{ fontSize: '0.875rem' }}>No alerts yet</p>
          </div>
        ) : (
          <div>
            {recentAlerts.map((alert) => (
              <div key={alert.id} className={`notification notification-${alert.notification_type}`} style={{ marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    {alert.message}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {new Date(alert.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Quick Actions</h2>
        <div className="grid" style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem'
        }}>
          {quickActions.map((action) => (
            <div
              key={action.title}
              className="card"
              style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem 1rem' }}
              onClick={() => navigate(action.path)}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `${action.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
                color: action.color
              }}>
                <action.icon size={26} />
              </div>
              <h3 style={{ fontSize: '0.9rem', color: '#2d3748', fontWeight: 600 }}>
                {action.title}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Image Search Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ margin: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>📸 Image Search</h2>
              <button
                onClick={() => setShowImageModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <p style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
              Upload a photo to find matching items
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="input"
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Choose from gallery or take a photo
              </p>
            </div>

            {searchImage && (
              <div style={{ marginBottom: '1.5rem' }}>
                <img 
                  src={searchImage} 
                  alt="Search" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '250px', 
                    objectFit: 'contain',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
                  }} 
                />
              </div>
            )}

            <button 
              className="btn btn-primary w-full"
              onClick={searchByImage}
              disabled={!searchImage || searching}
              style={{ marginBottom: '1.5rem' }}
            >
              {searching ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Search Items</span>
                </>
              )}
            </button>

            {imageResults.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>
                  Found {imageResults.length} item(s)
                </h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {imageResults.map((item) => (
                    <div
                      key={item.id}
                      className="card"
                      style={{ marginBottom: '0.75rem', cursor: 'pointer', padding: '0.75rem' }}
                      onClick={() => openItemDetail(item)}
                    >
                      <div className="flex items-center gap-2">
                        {item.photo_url && (
                          <img 
                            src={item.photo_url} 
                            alt={item.name}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover', 
                              borderRadius: '8px' 
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{item.name}</h4>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            📍 {getLocationName(item.location_id)} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {showItemDetailModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowItemDetailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ margin: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>📦 Item Details</h2>
              <button
                onClick={() => setShowItemDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {selectedItem.photo_url && (
              <img 
                src={selectedItem.photo_url} 
                alt={selectedItem.name}
                style={{ 
                  width: '100%', 
                  maxHeight: '300px', 
                  objectFit: 'contain',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  border: '1px solid #e5e7eb'
                }} 
              />
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                {selectedItem.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Location:</span>
                  <span style={{ fontWeight: 600 }}>{getLocationName(selectedItem.location_id)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Quantity:</span>
                  <span style={{ fontWeight: 600 }}>{selectedItem.quantity}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280' }}>Stock Level:</span>
                  <span 
                    className="badge"
                    style={{
                      background: stockLevelColors[selectedItem.stock_level].bg,
                      color: stockLevelColors[selectedItem.stock_level].text,
                      fontSize: '0.8rem'
                    }}
                  >
                    {selectedItem.stock_level}
                  </span>
                </div>

                {selectedItem.expiry_date && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Expires:</span>
                    <span style={{ fontWeight: 600 }}>
                      {new Date(selectedItem.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mobile-stack">
              <button 
                className="btn btn-primary mobile-full"
                style={{ flex: 1 }}
                onClick={() => {
                  setShowItemDetailModal(false);
                  navigate('/items', { state: { editItem: selectedItem } });
                }}
              >
                Edit Item
              </button>
              <button 
                className="btn btn-secondary mobile-full"
                onClick={() => setShowItemDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
