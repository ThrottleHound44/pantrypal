import { useEffect, useState, useRef } from 'react';
import { Package, Plus, Trash2, X, Camera, Calendar } from 'lucide-react';

function Items() {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location_id: '',
    quantity: 1,
    stock_level: 'High',
    expiry_date: '',
    photo_url: ''
  });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, locationsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/locations')
      ]);
      
      const itemsData = await itemsRes.json();
      const locationsData = await locationsRes.json();
      
      setItems(itemsData);
      setLocations(locationsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, photo_url: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const newItem = await res.json();
        // Add to state immediately
        setItems([...items, newItem]);
        // Reset form and close modal
        setShowModal(false);
        setFormData({
          name: '',
          location_id: '',
          quantity: 1,
          stock_level: 'High',
          expiry_date: '',
          photo_url: ''
        });
      } else {
        alert('Failed to add item. Please try again.');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Remove from state immediately
        setItems(items.filter(item => item.id !== id));
      } else {
        alert('Failed to delete item. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const getLocationName = (locationId) => {
    const location = locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown';
  };

  const stockLevelClass = {
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Food Items</h1>
          <p style={{ color: '#718096' }}>Manage your kitchen inventory</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package size={80} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No items yet</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Start adding food items to track your inventory
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
              Add Your First Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-4">
          {items.map((item) => (
            <div key={item.id} className="card">
              {item.photo_url && (
                <img 
                  src={item.photo_url} 
                  alt={item.name}
                  className="item-image"
                />
              )}
              
              <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                  {item.name}
                </h3>
                <button
                  className="btn btn-danger"
                  style={{ padding: '0.5rem' }}
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <span className={`badge ${stockLevelClass[item.stock_level]}`}>
                  {item.stock_level} Stock
                </span>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  📍 {getLocationName(item.location_id)}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  📦 Quantity: {item.quantity}
                </div>
                {item.expiry_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} />
                    Expires: {new Date(item.expiry_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Add New Item</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Item Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Organic Milk"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Storage Location</label>
                <select
                  className="select"
                  value={formData.location_id}
                  onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.location_type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Stock Level</label>
                <select
                  className="select"
                  value={formData.stock_level}
                  onChange={(e) => setFormData({...formData, stock_level: e.target.value})}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Expiry Date (Optional)</label>
                <input
                  type="date"
                  className="input"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Photo (Optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Camera size={20} />
                  {formData.photo_url ? 'Change Photo' : 'Add Photo'}
                </button>
                {formData.photo_url && (
                  <img 
                    src={formData.photo_url} 
                    alt="Preview"
                    style={{ 
                      width: '100%', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '10px',
                      marginTop: '0.75rem'
                    }}
                  />
                )}
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Item
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Items;
