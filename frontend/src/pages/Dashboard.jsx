import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, AlertTriangle, ShoppingCart, ChefHat } from 'lucide-react';

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

  useEffect(() => {
    loadDashboard();
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

  const quickActions = [
    { 
      title: 'Add Items', 
      icon: Package, 
      path: '/items',
      color: '#667eea'
    },
    { 
      title: 'Locations', 
      icon: MapPin, 
      path: '/locations',
      color: '#f59e0b'
    },
    { 
      title: 'Recipes', 
      icon: ChefHat, 
      path: '/recipes',
      color: '#10b981'
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
        <p style={{ color: '#718096' }}>Welcome to your smart kitchen management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
            <Package />
          </div>
          <div>
            <div className="stat-value">{stats.total_items}</div>
            <div className="stat-label">Total Items</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <MapPin />
          </div>
          <div>
            <div className="stat-value">{stats.total_locations}</div>
            <div className="stat-label">Locations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' }}>
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
    </div>
  );
}

export default Dashboard;
