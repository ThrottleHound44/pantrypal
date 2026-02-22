import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, AlertTriangle, ShoppingCart, ChefHat, Camera, Search, X, Eye, Edit } from 'lucide-react';

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
  
  // Image search states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchImage, setSearchImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadItems();
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

  const loadItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setAllItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

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
    
    // Simulate AI processing time
    setTimeout(() => {
      // Simple text matching based on item names
      // In a real implementation, this would call an AI vision API
      const query = prompt('What are you looking for in this image? (e.g., milk, eggs, chicken)');
      
      if (query) {
        const results = allItems.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
      }
      
      setSearching(false);
    }, 1500);
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
      <div className="flex items-center justify-between mobile-stack" style={{ marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
          <p style={{ color: '#6b7280' }}>Welcome to your smart kitchen management system</p>
        </div>
        <button 
          className="btn btn-primary mobile-full"
          onClick={() => setShowSearchModal(true)}
        >
          <Camera size={20} />
          <span>Image Search</span>
        </button>
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
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>🔍 AI Image Search</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Upload a photo to find items in your inventory
            </p>

            {/* Image Upload */}
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

            {/* Image Preview */}
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

            {/* Search Button */}
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

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600 }}>
                  Found {searchResults.length} item(s)
                </h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="card"
                      style={{ marginBottom: '0.75rem', cursor: 'pointer' }}
                      onClick={() => {
                        setShowSearchModal(false);
                        navigate('/items', { state: { highlightItem: item.id } });
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
                            Location: {item.location_id} • Qty: {item.quantity}
                          </p>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                          <Eye size={18} />
                        </button>
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
