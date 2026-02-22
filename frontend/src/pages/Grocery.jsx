import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Check, Trash2, X, Download, List, ArrowRight } from 'lucide-react';

function Grocery() {
  const [groceryLists, setGroceryLists] = useState([]);
  const [groceryItems, setGroceryItems] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: 1
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedListId) {
      loadItems(selectedListId);
    }
  }, [selectedListId]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/grocery-lists');
      const data = await res.json();
      setGroceryLists(data);
      
      if (data.length > 0) {
        const autoList = data.find(l => l.is_auto);
        setSelectedListId(autoList ? autoList.id : data[0].id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading lists:', error);
      setLoading(false);
    }
  };

  const loadItems = async (listId) => {
    try {
      const res = await fetch(`/api/grocery-items?list_id=${listId}`);
      const data = await res.json();
      setGroceryItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/grocery-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName })
      });
      
      if (res.ok) {
        const newList = await res.json();
        setGroceryLists([...groceryLists, { ...newList, item_count: 0 }]);
        setShowListModal(false);
        setNewListName('');
      } else {
        alert('Failed to create list. Please try again.');
      }
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteList = async (listId) => {
    if (!confirm('Delete this list? All items in it will also be deleted.')) return;
    
    try {
      const res = await fetch(`/api/grocery-lists/${listId}`, { method: 'DELETE' });
      if (res.ok) {
        setGroceryLists(groceryLists.filter(list => list.id !== listId));
        if (selectedListId === listId) {
          setSelectedListId(null);
          setGroceryItems([]);
        }
      } else {
        const data = await res.json();
        alert(data.detail || 'Failed to delete list');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete list. Cannot delete auto-generated list.');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedListId) {
      alert('Please select a list first');
      return;
    }
    
    setSaving(true);
    
    try {
      const res = await fetch('/api/grocery-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          list_id: selectedListId
        })
      });
      
      if (res.ok) {
        const newItem = await res.json();
        setGroceryItems([...groceryItems, newItem]);
        setGroceryLists(groceryLists.map(list => 
          list.id === selectedListId 
            ? { ...list, item_count: (list.item_count || 0) + 1 }
            : list
        ));
        setShowItemModal(false);
        setFormData({ item_name: '', quantity: 1 });
      } else {
        alert('Failed to add item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const completeItem = async (id) => {
    try {
      const res = await fetch(`/api/grocery-items/${id}/complete`, { method: 'PUT' });
      if (res.ok) {
        setGroceryItems(groceryItems.map(item =>
          item.id === id ? { ...item, status: 'completed' } : item
        ));
      } else {
        alert('Failed to mark item as complete.');
      }
    } catch (error) {
      console.error('Error completing item:', error);
      alert('Failed to mark item as complete.');
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await fetch(`/api/grocery-items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGroceryItems(groceryItems.filter(item => item.id !== id));
        setGroceryLists(groceryLists.map(list => 
          list.id === selectedListId 
            ? { ...list, item_count: Math.max(0, (list.item_count || 0) - 1) }
            : list
        ));
      } else {
        alert('Failed to delete item.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item.');
    }
  };

  const openMoveModal = (item) => {
    setItemToMove(item);
    setShowMoveModal(true);
  };

  const moveItem = async (newListId) => {
    if (!itemToMove) return;
    
    setSaving(true);
    
    try {
      const res = await fetch(`/api/grocery-items/${itemToMove.id}/move?new_list_id=${newListId}`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        setGroceryItems(groceryItems.filter(item => item.id !== itemToMove.id));
        setGroceryLists(groceryLists.map(list => {
          if (list.id === selectedListId) {
            return { ...list, item_count: Math.max(0, (list.item_count || 0) - 1) };
          } else if (list.id === newListId) {
            return { ...list, item_count: (list.item_count || 0) + 1 };
          }
          return list;
        }));
        setShowMoveModal(false);
        setItemToMove(null);
      } else {
        alert('Failed to move item.');
      }
    } catch (error) {
      console.error('Error moving item:', error);
      alert('Failed to move item.');
    } finally {
      setSaving(false);
    }
  };

  const exportList = async () => {
    if (!selectedListId) return;
    
    try {
      const res = await fetch(`/api/grocery/export/${selectedListId}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'grocery-list.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting list:', error);
      alert('Failed to export list.');
    }
  };

  const pendingItems = groceryItems.filter(item => item.status === 'pending');
  const completedItems = groceryItems.filter(item => item.status === 'completed');
  const selectedList = groceryLists.find(l => l.id === selectedListId);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: '#6b7280' }}>Loading grocery lists...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mobile-stack" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.5rem' }}>Grocery Lists</h1>
          <p style={{ color: '#6b7280', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>Manage multiple shopping lists</p>
        </div>
        <button 
          className="btn btn-primary mobile-full"
          onClick={() => setShowListModal(true)}
        >
          <Plus size={20} />
          <span>New List</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Lists - Mobile Optimized */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600 }}>
            📋 Your Lists
          </h3>
          {groceryLists.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No lists yet. Create one to get started!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groceryLists.map(list => (
                <div
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  style={{
                    padding: '0.875rem',
                    background: selectedListId === list.id ? '#10b98110' : '#f9fafb',
                    border: selectedListId === list.id ? '2px solid #10b981' : '1px solid #e5e7eb',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '56px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      {list.name} {list.is_auto && '⭐'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {list.item_count || 0} item(s)
                    </div>
                  </div>
                  {!list.is_auto && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteList(list.id);
                      }}
                      className="btn btn-danger"
                      style={{ padding: '0.5rem', minWidth: '36px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items Section - Mobile Optimized */}
        {selectedListId && (
          <div className="card">
            <div className="flex items-center justify-between mobile-stack" style={{ marginBottom: '1rem', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                🛒 {selectedList?.name}
              </h3>
              <div className="flex gap-2 mobile-full">
                <button 
                  className="btn btn-primary mobile-full"
                  onClick={() => setShowItemModal(true)}
                  style={{ flex: 1 }}
                >
                  <Plus size={18} />
                  <span>Add Item</span>
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={exportList}
                  style={{ padding: '0.625rem 1rem', minWidth: '44px' }}
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* Pending Items */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>
                To Buy ({pendingItems.length})
              </h4>
              {pendingItems.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontStyle: 'italic' }}>No items to buy</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {pendingItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.875rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        minHeight: '56px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.item_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Qty: {item.quantity}</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => completeItem(item.id)}
                          className="btn btn-success"
                          style={{ padding: '0.5rem', minWidth: '40px' }}
                          title="Mark as complete"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => openMoveModal(item)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem', minWidth: '40px' }}
                          title="Move to another list"
                        >
                          <ArrowRight size={18} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.5rem', minWidth: '40px' }}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Items */}
            {completedItems.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>
                  Completed ({completedItems.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {completedItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.875rem',
                        background: '#f3f4f6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        opacity: 0.6,
                        minHeight: '56px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: 'line-through' }}>
                          {item.item_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Qty: {item.quantity}</div>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem', minWidth: '40px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create List Modal */}
      {showListModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowListModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ margin: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>Create New List</h2>
              <button
                onClick={() => !saving && setShowListModal(false)}
                disabled={saving}
                style={{ background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={createList}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">List Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Weekly Groceries"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <div className="flex gap-2 mobile-stack">
                <button type="submit" className="btn btn-primary mobile-full" style={{ flex: 1 }} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create List</span>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary mobile-full"
                  onClick={() => setShowListModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowItemModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ margin: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>Add Item</h2>
              <button
                onClick={() => !saving && setShowItemModal(false)}
                disabled={saving}
                style={{ background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddItem}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Item Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Milk"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  required
                  disabled={saving}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Quantity *</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  required
                  disabled={saving}
                />
              </div>

              <div className="flex gap-2 mobile-stack">
                <button type="submit" className="btn btn-primary mobile-full" style={{ flex: 1 }} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Item</span>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary mobile-full"
                  onClick={() => setShowItemModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Item Modal */}
      {showMoveModal && itemToMove && (
        <div className="modal-overlay" onClick={() => !saving && setShowMoveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ margin: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>Move Item</h2>
              <button
                onClick={() => !saving && setShowMoveModal(false)}
                disabled={saving}
                style={{ background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Move "{itemToMove.item_name}" to:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groceryLists
                .filter(list => list.id !== selectedListId)
                .map(list => (
                  <button
                    key={list.id}
                    onClick={() => moveItem(list.id)}
                    className="btn btn-secondary w-full"
                    style={{ justifyContent: 'flex-start', minHeight: '48px' }}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                        <span>Moving...</span>
                      </>
                    ) : (
                      <>
                        <List size={18} />
                        <span>{list.name}</span>
                      </>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Grocery;
