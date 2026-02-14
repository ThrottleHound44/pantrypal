import { useEffect, useState } from 'react';
import { Bell, AlertCircle, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      // Sort by date, newest first
      const sorted = data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setNotifications(sorted);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expired':
        return <AlertCircle size={24} />;
      case 'expiring_soon':
        return <AlertTriangle size={24} />;
      case 'long_storage':
        return <Clock size={24} />;
      default:
        return <Bell size={24} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Alerts & Notifications
        </h1>
        <p style={{ color: '#718096' }}>
          {unreadCount > 0 
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'All caught up!'
          }
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Bell size={80} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No notifications yet</h3>
            <p>
              We'll notify you about expiring items and low stock levels
            </p>
          </div>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification notification-${notification.notification_type}`}
              style={{
                opacity: notification.read ? 0.6 : 1,
                cursor: notification.read ? 'default' : 'pointer'
              }}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div style={{ 
                flexShrink: 0,
                opacity: notification.read ? 0.5 : 1
              }}>
                {getNotificationIcon(notification.notification_type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <p style={{ 
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#667eea',
                      flexShrink: 0
                    }} />
                  )}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  fontSize: '0.875rem',
                  color: '#718096'
                }}>
                  <span>
                    {new Date(notification.created_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {notification.read && (
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      color: '#10b981'
                    }}>
                      <CheckCircle size={14} />
                      Read
                    </span>
                  )}
                </div>
              </div>

              {!notification.read && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="card" style={{ marginTop: '2rem', background: 'rgba(102, 126, 234, 0.05)' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600 }}>
          ℹ️ About Alerts
        </h3>
        <div style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: '#dc2626' }}>Expired:</strong> Items that have passed their expiry date
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: '#fb923c' }}>Expiring Soon:</strong> Items expiring within 3 days
          </p>
          <p>
            <strong style={{ color: '#3b82f6' }}>Long Storage:</strong> Items stored for more than 14 days
          </p>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
