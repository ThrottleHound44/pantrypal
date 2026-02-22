import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, X, Edit, Eye, Package } from 'lucide-react';

function Locations() {
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationItems, setLocationItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location_type: 'shelf'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading locations:', error);
      setLoading(false);
    }
  };

  const loadLocationItems = async (locationId) => {
    try {
      const res = await fetch(`/api/items/location/${locationId}`);
      const data = await res.json();
      setLocationItems(data);
    } catch (error) {
      console.error('Error loading location items:', error);
      setLocationItems([]);
    }
  };

  const openAddModal = () => {
    setEditingLocation(null);
    setFormData({ name: '', location_type: 'shelf' });
    setShowModal(true);
  };

  const openEditModal = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      location_type: location.location_type
    });
    setShowModal(true);
  };

  const openItemsModal = async (location) => {
    setSelectedLocation(location);
    await loadLocationItems(location.id);
    setShowItemsModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingLocation) {
        // Update existing location
        const res = await fetch(`/api/locations/${editingLocation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          const updatedLocation = await res.json();
          setLocations(locations.map(loc => 
            loc.id === editingLocation.id ? updatedLocation : loc
          ));
          setShowModal(false);
          setEditingLocation(null);
        } else {
          alert('Failed to update location. Please try again.');
        }
      } else {
        // Create new location
        const res = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          const newLocation = await res.json();
          setLocations([...locations, newLocation]);
          setShowModal(false);
        } else {
          alert('Failed to create location. Please try again.');
        }
      }
      
      setFormData({ name: '', location_type: 'shelf' });
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to save location. Please try again.');
    }
  };

  const deleteLocation = async (id) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLocations(locations.filter(loc => loc.id !== id));
      } else {
        alert('Failed to delete location. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location. Please try again.');
    }
  };

  const locationTypeColors = {
    shelf: '#3b82f6',
    drawer: '#f59e0b',
    fridge: '#10b981',
    freezer: '#06b6d4',
    pantry: '#8b5cf6'
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
      <div className="flex items-center justify-between mobile-stack" style={{ marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Storage Locations</h1>
          <p style={{ color: '#6b7280' }}>Manage your kitchen storage areas</p>
        </div>
        <button 
          className="btn btn-primary mobile-full"
          onClick={openAddModal}
        >
          <Plus size={20} />
          <span>Add Location</span>
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <MapPin size={80} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No locations yet</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Create storage locations to organize your kitchen inventory
            </p>
            <button 
              className="btn btn-primary"
              onClick={openAddModal}
            >
              <Plus size={20} />
              Add Your First Location
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {locations.map((location) => (
            <div key={location.id} className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '10px',
                  background: `${locationTypeColors[location.location_type]}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: locationTypeColors[location.location_type]
                }}>
                  <MapPin size={24} />
                </div>
                <div className="flex gap-1">
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem' }}
                    onClick={() => openItemsModal(location)}
                    title="View items"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem' }}
                    onClick={() => openEditModal(location)}
                    title="Edit location"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.5rem' }}
                    onClick={() => deleteLocation(location.id)}
                    title="Delete location"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                {location.name}
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-medium" style={{
                  background: `${locationTypeColors[location.location_type]}20`,
                  color: locationTypeColors[location.location_type]
                }}>
                  {location.location_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Location Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Location Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Top Fridge Shelf"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Location Type</label>
                <select
                  className="select"
                  value={formData.location_type}
                  onChange={(e) => setFormData({...formData, location_type: e.target.value})}
                >
                  <option value="shelf">Shelf</option>
                  <option value="drawer">Drawer</option>
                  <option value="fridge">Fridge</option>
                  <option value="freezer">Freezer</option>
                  <option value="pantry">Pantry</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingLocation ? 'Update Location' : 'Create Location'}
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

      {/* View Items Modal */}
      {showItemsModal && selectedLocation && (
        <div className="modal-overlay" onClick={() => setShowItemsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>
                📦 Items in {selectedLocation.name}
              </h2>
              <button
                onClick={() => setShowItemsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {locationItems.length === 0 ? (
              <div className="empty-state">
                <Package size={60} style={{ opacity: 0.3 }} />
                <p style={{ marginTop: '1rem' }}>No items in this location yet</p>
              </div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                  Total: {locationItems.length} item(s)
                </p>
                <div className="grid grid-2">
                  {locationItems.map((item) => (
                    <div key={item.id} className="card" style={{ marginBottom: '0.75rem' }}>
                      {item.photo_url && (
                        <img 
                          src={item.photo_url} 
                          alt={item.name}
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            marginBottom: '0.75rem'
                          }}
                        />
                      )}
                      <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{item.name}</h4>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        <div>Quantity: {item.quantity}</div>
                        <div>Stock: {item.stock_level}</div>
                        {item.expiry_date && (
                          <div>Expires: {new Date(item.expiry_date).toLocaleDateString()}</div>
                        )}
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

export default Locations;
