import { useEffect, useState, useRef } from 'react';
import { Package, Plus, Trash2, X, Camera, Calendar, Edit } from 'lucide-react';

function Items() {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location_id: '',
    quantity: 1,
    stock_level: 'High',
    expiry_date: '',
    photo_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSaving(true);
      const compressed = await compressImage(file);
      setFormData({...formData, photo_url: compressed});
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      location_id: '',
      quantity: 1,
      stock_level: 'High',
      expiry_date: '',
      photo_url: ''
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      location_id: item.location_id,
      quantity: item.quantity,
      stock_level: item.stock_level,
      expiry_date: item.expiry_date || '',
      photo_url: item.photo_url || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingItem) {
        const res = await fetch(`/api/items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          const updatedItem = await res.json();
          setItems(items.map(item => 
            item.id === editingItem.id ? updatedItem : item
          ));
          setShowModal(false);
          setEditingItem(null);
        } else {
          alert('Failed to update item. Please try again.');
        }
      } else {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          const newItem = await res.json();
          setItems([...items, newItem]);
          setShowModal(false);
        } else {
          alert('Failed to add item. Please try again.');
        }
      }
      
      setFormData({
        name: '',
        location_id: '',
        quantity: 1,
        stock_level: 'High',
        expiry_date: '',
        photo_url: ''
      });
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
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
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown Location';
  };

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
        <p style={{ color: '#6b7280' }}>Loading items...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mobile-stack" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.5rem' }}>Food Items</h1>
          <p style={{ color: '#6b7280', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>Manage your pantry and fridge inventory</p>
        </div>
        <button 
          className="btn btn-primary mobile-full"
          onClick={openAddModal}
        >
          <Plus size={20} />
          <span>Add Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package size={80} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No items yet</h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Start adding food items to track your inventory
            </p>
            <button 
              className="btn btn-primary"
              onClick={openAddModal}
            >
              <Plus size={20} />
              Add Your First Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1rem' }}>
              {item.photo_url && (
                <img 
                  src={item.photo_url} 
                  alt={item.name}
                  style={{ 
                    width: '100%', 
                    height: '180px', 
                    objectFit: 'cover', 
                    borderRadius: '10px',
                    marginBottom: '1rem'
                  }}
                />
              )}
              
              <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, flex: 1, wordBreak: 'break-word' }}>
                  {item.name}
                </h3>
                <div className="flex gap-1">
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', minWidth: '36px' }}
                    onClick={() => openEditModal(item)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.5rem', minWidth: '36px' }}
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Location:</strong> {getLocationName(item.location_id)}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Quantity:</strong> {item.quantity}
                </div>
                {item.expiry_date && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Expires:</strong> {new Date(item.expiry_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <span 
                className="badge"
                style={{
                  background: stockLevelColors[item.stock_level].bg,
                  color: stockLevelColors[item.stock_level].text,
                  display: 'inline-block',
                  fontSize: '0.75rem'
                }}
              >
                {item.stock_level}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal - Mobile Optimized */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={() => !saving && setShowModal(false)}
                disabled={saving}
                style={{ background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Item Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Organic Milk"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  disabled={saving}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Location *</label>
                <select
                  className="select"
                  value={formData.location_id}
                  onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                  required
                  disabled={saving}
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="label">Quantity *</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                    required
                    disabled={saving}
                    placeholder="e.g., 1.5"
                  />
                </div>

                <div>
                  <label className="label">Stock Level *</label>
                  <select
                    className="select"
                    value={formData.stock_level}
                    onChange={(e) => setFormData({...formData, stock_level: e.target.value})}
                    disabled={saving}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">
                  <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  className="input"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  disabled={saving}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">
                  <Camera size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Photo (Optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="input"
                  disabled={saving}
                />
                {formData.photo_url && (
                  <div style={{ marginTop: '1rem' }}>
                    <img 
                      src={formData.photo_url} 
                      alt="Preview" 
                      style={{ 
                        width: '100%', 
                        maxHeight: '200px', 
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }} 
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ marginTop: '0.5rem', width: '100%' }}
                      onClick={() => setFormData({...formData, photo_url: ''})}
                      disabled={saving}
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mobile-stack">
                <button type="submit" className="btn btn-primary mobile-full" style={{ flex: 1 }} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                      <span>{editingItem ? 'Updating...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary mobile-full"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
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
