import { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, X, ChefHat } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function MealPlanner() {
  const [mealPlans, setMealPlans] = useState([]);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    meal_type: 'dinner',
    recipe_title: '',
    ingredients: [],
    notes: ''
  });
  const [ingredientInput, setIngredientInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, itemsRes] = await Promise.all([
        fetch('/api/meal-plans'),
        fetch('/api/items')
      ]);
      
      const plansData = await plansRes.json();
      const itemsData = await itemsRes.json();
      
      setMealPlans(plansData);
      setItems(itemsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert comma-separated ingredients to array
    const ingredientsArray = ingredientInput
      .split(',')
      .map(i => i.trim())
      .filter(i => i);
    
    try {
      const res = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ingredients: ingredientsArray
        })
      });
      
      if (res.ok) {
        setShowModal(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          meal_type: 'dinner',
          recipe_title: '',
          ingredients: [],
          notes: ''
        });
        setIngredientInput('');
        loadData();
      }
    } catch (error) {
      console.error('Error creating meal plan:', error);
    }
  };

  const deleteMealPlan = async (id) => {
    if (!confirm('Delete this meal plan?')) return;
    
    try {
      await fetch(`/api/meal-plans/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  // Group meal plans by date
  const groupedPlans = mealPlans.reduce((acc, plan) => {
    const date = plan.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(plan);
    return acc;
  }, {});

  const mealTypeColors = {
    breakfast: { bg: 'rgba(251, 146, 60, 0.1)', border: '#fb923c', text: '#ea580c' },
    lunch: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#16a34a' },
    dinner: { bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7', text: '#9333ea' },
    snack: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#2563eb' }
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Meal Planner</h1>
          <p style={{ color: '#718096' }}>Plan your meals for the week</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          Add Meal
        </button>
      </div>

      {Object.keys(groupedPlans).length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Calendar size={80} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No meal plans yet</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Start planning your meals for the week
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
              Add Your First Meal
            </button>
          </div>
        </div>
      ) : (
        <div>
          {Object.keys(groupedPlans).sort().map((date) => (
            <div key={date} className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>
                📅 {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              
              <div className="grid grid-2">
                {groupedPlans[date].map((plan) => {
                  const colors = mealTypeColors[plan.meal_type];
                  return (
                    <div
                      key={plan.id}
                      style={{
                        background: colors.bg,
                        borderLeft: `4px solid ${colors.border}`,
                        padding: '1rem',
                        borderRadius: '10px'
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          background: colors.border,
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {plan.meal_type}
                        </div>
                        <button
                          onClick={() => deleteMealPlan(plan.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444'
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        <ChefHat size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        {plan.recipe_title}
                      </h4>

                      <div style={{ marginBottom: plan.notes ? '0.75rem' : '0' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {plan.ingredients && plan.ingredients.map((ingredient, i) => (
                            <span
                              key={i}
                              style={{
                                background: 'white',
                                padding: '0.25rem 0.625rem',
                                borderRadius: '15px',
                                fontSize: '0.75rem',
                                color: colors.text
                              }}
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>

                      {plan.notes && (
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4a5568',
                          fontStyle: 'italic'
                        }}>
                          📝 {plan.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Meal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Add Meal Plan</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Meal Type</label>
                <select
                  className="select"
                  value={formData.meal_type}
                  onChange={(e) => setFormData({...formData, meal_type: e.target.value})}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Recipe/Meal Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Spaghetti Carbonara"
                  value={formData.recipe_title}
                  onChange={(e) => setFormData({...formData, recipe_title: e.target.value})}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Ingredients (comma-separated)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., pasta, eggs, bacon, cheese"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                />
                {items.length > 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.5rem' }}>
                    💡 Available: {items.slice(0, 5).map(i => i.name).join(', ')}
                    {items.length > 5 && '...'}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Notes (Optional)</label>
                <textarea
                  className="input"
                  placeholder="e.g., Prep time: 30 mins, Serves 4"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Meal Plan
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

export default MealPlanner;
