import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, AlertTriangle, ShoppingCart, ChefHat, Camera, Search, X } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_items: 0,
    total_locations: 0,
    expiring_soon: 0,
    low_stock: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // Image search states
  const [showImageModal, setShowImageModal] = useState(false);
  const [searchImage, setSearchImage] = useState(null);
  const [imageResults, setImageResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
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
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Text search
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setShowResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Search items
    const matchedItems = allItems.filter(item =>
      item.name.toLowerCase().includes(lowerQuery)
    );
    
    // Search locations
    const matchedLocations = allLocations.filter(loc =>
      loc.name.toLowerCase().includes(lowerQuery)
    );
    
    setSearchResults({ items: matchedItems, locations: matchedLocations });
    setShowResults(true);
  };

  // Image search
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
    
    setTimeout(() => {
      const query = prompt('What item are you looking for?');
      
      if (query) {
        const results = allItems.filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );
        setImageResults(results);
      }
      
      setSearching(false);
    }, 1000);
  };

  const getLocationName = (locationId) => {
    const location = allLocations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown';
  };

  const quickActions = [
    { 
      title: 'Add Items', 
      icon: Package, 
      path: '/items',
      color: '#10b981'
    },
    { 
      title: 'Locations', 
      icon: MapPin, 
      path: '/locations',
      color: '#3b82f6'
    },
    { 
      title: 'Recipes', 
      icon: ChefHat, 
      path: '/recipes',
      color: '#8b5cf6'
    },
    { 
      title: 'Grocery Lists', 
      icon: ShoppingCart, 
      path: '/grocery',
      color: '#ef4444'
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Welcome to your smart kitchen management system</p>
      </div>

      {/* Search Bar + Image Search */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-2" style={{ position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="input"
              placeholder="Search items or locations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
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
            className="btn btn-primary"
            onClick={() => setShowImageModal(true)}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Camera size={20} />
            <span className="mobile-hide">Image Search</span>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '10px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {searchResults.items.length === 0 && searchResults.locations.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>No results found</p>
            ) : (
              <>
                {searchResults.items.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
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
                        onClick={() => {
                          setShowResults(false);
                          navigate('/items');
                        }}
                      >
                        {item.photo_url && (
                          <img 
                            src={item.photo_url} 
                            alt={item.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
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
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
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
                        <div style={{ fontWeight: 600 }}>{location.name}</div>
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

      {/* Stats Grid */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Package />
          </div>
          <div>
            <div className="stat-value">{stats.total_items}</div>
            <div className="stat-label">Total Items</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <MapPin />
          </div>
          <div>
            <div className="stat-value">{stats.total_locations}</div>
            <div className="stat-label">Locations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <AlertTriangle />
          </div>
          <div>
            <div className="stat-value">{stats.expiring_soon}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <ShoppingCart />
          </div>
          <div>
            <div className="stat-value">{stats.low_stock}</div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Recent Alerts</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/notifications')}
          >
            View All
          </button>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <p>No alerts yet</p>
          </div>
        ) : (
          <div>
            {recentAlerts.map((alert) => (
              <div key={alert.id} className={`notification notification-${alert.notification_type}`}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {alert.message}
                  </p>
                  <p className="text-sm text-gray">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Quick Actions</h2>
        <div className="grid grid-4">
          {quickActions.map((action) => (
            <div
              key={action.title}
              className="card"
              style={{ cursor: 'pointer', textAlign: 'center' }}
              onClick={() => navigate(action.path)}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '15px',
                background: `${action.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: action.color
              }}>
                <action.icon size={30} />
              </div>
              <h3 style={{ fontSize: '1rem', color: '#2d3748' }}>
                {action.title}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Image Search Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>📸 Image Search</h2>
              <button
                onClick={() => setShowImageModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Upload a photo to find items in your inventory
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="input"
              />
            </div>

            {searchImage && (
              <div style={{ marginBottom: '1.5rem' }}>
                <img 
                  src={searchImage} 
                  alt="Search" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
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
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600 }}>
                  Found {imageResults.length} item(s)
                </h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {imageResults.map((item) => (
                    <div
                      key={item.id}
                      className="card"
                      style={{ marginBottom: '0.75rem', cursor: 'pointer' }}
                      onClick={() => {
                        setShowImageModal(false);
                        navigate('/items');
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {item.photo_url && (
                          <img 
                            src={item.photo_url} 
                            alt={item.name}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'cover', 
                              borderRadius: '8px' 
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.name}</h4>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
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
    </div>
  );
}

export default Dashboard;
