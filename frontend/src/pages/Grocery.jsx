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
      
      // Auto-select first list or auto list
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
    try {
      const res = await fetch('/api/grocery-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName })
      });
      
      if (res.ok) {
        setShowListModal(false);
        setNewListName('');
        loadData();
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const deleteList = async (listId) => {
    if (!confirm('Delete this list? All items in it will also be deleted.')) return;
    
    try {
      await fetch(`/api/grocery-lists/${listId}`, { method: 'DELETE' });
      loadData();
      if (selectedListId === listId) {
        setSelectedListId(null);
        setGroceryItems([]);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Cannot delete auto-generated list');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedListId) {
      alert('Please select a list first');
      return;
    }
    
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
        setShowItemModal(false);
        setFormData({ item_name: '', quantity: 1 });
        loadItems(selectedListId);
        loadData(); // Refresh counts
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const completeItem = async (id) => {
    try {
      await fetch(`/api/grocery-items/${id}/complete`, { method: 'PUT' });
      loadItems(selectedListId);
    } catch (error) {
      console.error('Error completing item:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`/api/grocery-items/${id}`, { method: 'DELETE' });
      loadItems(selectedListId);
      loadData(); // Refresh counts
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openMoveModal = (item) => {
    setItemToMove(item);
    setShowMoveModal(true);
  };

  const moveItem = async (newListId) => {
    if (!itemToMove) return;
    
    try {
      await fetch(`/api/grocery-items/${itemToMove.id}/move?new_list_id=${newListId}`, {
        method: 'PUT'
      });
      setShowMoveModal(false);
      setItemToMove(null);
      loadItems(selectedListId);
      loadData(); // Refresh counts
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  const exportList = async () => {
    if (!selectedListId) return;
    
    try {
      const res = await fetch(`/api/grocery/export/${selectedListId}`);
      const data = await res.json();
      
      const blob = new Blob([data.content], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting list:', error);
    }
  };

  const selectedList = groceryLists.find(l => l.id === selectedListId);
  const pendingItems = groceryItems.filter(item => item.status === 'pending');
  const completedItems = groceryItems.filter(item => item.status === 'completed');

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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Grocery Lists</h1>
          <p style={{ color: '#6b7280' }}>Manage multiple shopping lists</p>
        </div>
        <button 
          className="btn btn-primary mobile-full"
          onClick={() => setShowListModal(true)}
        >
          <Plus size={20} />
          <span>New List</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Lists Sidebar */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600 }}>
            <List size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            My Lists
          </h3>
          
          {groceryLists.length === 0 ? (
            <p style={{ color: '#718096', fontSize: '0.875rem' }}>
              No lists yet. Create one to get started!
            </p>
          ) : (
            <div>
              {groceryLists.map((list) => (
                <div
                  key={list.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    background: selectedListId === list.id ? '#667eea15' : '#f7fafc',
                    border: selectedListId === list.id ? '2px solid #667eea' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedListId(list.id)}
                >
                  <div className="flex items-center justify-between">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                        {list.name}
                        {list.is_auto && (
                          <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '10px',
                            background: '#667eea20',
                            color: '#667eea'
                          }}>
                            Auto
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                        {list.item_count || 0} items
                      </div>
                    </div>
                    {!list.is_auto && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.375rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteList(list.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items Display */}
        <div>
          {!selectedListId ? (
            <div className="card">
              <div className="empty-state">
                <ShoppingCart size={80} style={{ opacity: 0.3 }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Select a list</h3>
                <p>Choose a list from the sidebar to view items</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {selectedList?.name}
                </h2>
                <div className="flex gap-2">
                  {pendingItems.length > 0 && (
                    <button className="btn btn-secondary" onClick={exportList}>
                      <Download size={18} />
                      Export
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={() => setShowItemModal(true)}>
                    <Plus size={18} />
                    Add Item
                  </button>
                </div>
              </div>

              <div className="grid grid-2">
                {/* Pending */}
                <div className="card">
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600 }}>
                    📝 To Buy ({pendingItems.length})
                  </h3>
                  
                  {pendingItems.length === 0 ? (
                    <div className="empty-state">
                      <p style={{ fontSize: '0.875rem' }}>No items to buy</p>
                    </div>
                  ) : (
                    pendingItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '0.75rem',
                          background: '#f7fafc',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {item.item_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                            Qty: {item.quantity}
                            {item.added_by === 'system' && ' • Auto-added'}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.375rem', fontSize: '0.75rem' }}
                            onClick={() => openMoveModal(item)}
                            title="Move to another list"
                          >
                            <ArrowRight size={14} />
                          </button>
                          <button
                            className="btn btn-success"
                            style={{ padding: '0.375rem' }}
                            onClick={() => completeItem(item.id)}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.375rem' }}
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Completed */}
                <div className="card">
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600 }}>
                    ✅ Completed ({completedItems.length})
                  </h3>
                  
                  {completedItems.length === 0 ? (
                    <div className="empty-state">
                      <p style={{ fontSize: '0.875rem' }}>No completed items</p>
                    </div>
                  ) : (
                    completedItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '0.75rem',
                          background: '#f0fdf4',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          opacity: 0.7
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textDecoration: 'line-through',
                            color: '#16a34a'
                          }}>
                            {item.item_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                            Qty: {item.quantity}
                          </div>
                        </div>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.375rem' }}
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New List Modal */}
      {showListModal && (
        <div className="modal-overlay" onClick={() => setShowListModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Create New List</h2>
              <button onClick={() => setShowListModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={createList}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">List Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Weekly Shopping, Party Supplies"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowListModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Add Item</h2>
              <button onClick={() => setShowItemModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Item Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Milk"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
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
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowItemModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Item Modal */}
      {showMoveModal && itemToMove && (
        <div className="modal-overlay" onClick={() => setShowMoveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Move Item</h2>
              <button onClick={() => setShowMoveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <p style={{ marginBottom: '1rem' }}>
              Move <strong>{itemToMove.item_name}</strong> to:
            </p>
            <div>
              {groceryLists.filter(l => l.id !== selectedListId).map((list) => (
                <button
                  key={list.id}
                  className="btn btn-secondary w-full"
                  style={{ marginBottom: '0.5rem', justifyContent: 'flex-start' }}
                  onClick={() => moveItem(list.id)}
                >
                  {list.name}
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
