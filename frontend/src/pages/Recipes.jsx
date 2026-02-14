import { useState } from 'react';
import { ChefHat, Sparkles } from 'lucide-react';

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const generateRecipes = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/ai/recipes', {
        method: 'POST'
      });
      
      const data = await res.json();
      
      if (data.recipes && data.recipes.length > 0) {
        setRecipes(data.recipes);
      } else {
        setMessage(data.message || 'No recipes generated');
      }
      
      if (data.message) {
        setMessage(data.message);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error generating recipes:', error);
      setMessage('Error generating recipes');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Recipe Suggestions</h1>
          <p style={{ color: '#718096' }}>Get recipe ideas based on your ingredients</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={generateRecipes}
          disabled={loading}
        >
          <Sparkles size={20} />
          {loading ? 'Generating...' : 'Generate Recipes'}
        </button>
      </div>

      {/* Info Message */}
      {message && (
        <div className="card" style={{ 
          background: 'rgba(102, 126, 234, 0.1)',
          border: '1px solid #667eea',
          marginBottom: '1.5rem'
        }}>
          <p style={{ color: '#667eea', fontWeight: 500 }}>
            ℹ️ {message}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#718096' }}>
            AI is analyzing your ingredients and creating recipes...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && recipes.length === 0 && !message && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <ChefHat size={80} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No recipes yet</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Click "Generate Recipes" to get AI-powered recipe suggestions based on your available ingredients
            </p>
            <button 
              className="btn btn-primary"
              onClick={generateRecipes}
            >
              <Sparkles size={20} />
              Generate Recipes
            </button>
          </div>
        </div>
      )}

      {/* Recipes Display */}
      {recipes.length > 0 && !loading && (
        <div className="grid grid-3">
          {recipes.map((recipe, index) => (
            <div key={index} className="card">
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <ChefHat size={28} color="white" />
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>
                {recipe.title}
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  marginBottom: '0.5rem',
                  color: '#4a5568'
                }}>
                  Ingredients:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {recipe.ingredients && recipe.ingredients.map((ingredient, i) => (
                    <span 
                      key={i}
                      style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  marginBottom: '0.5rem',
                  color: '#4a5568'
                }}>
                  Instructions:
                </h4>
                <p style={{ 
                  fontSize: '0.875rem', 
                  lineHeight: '1.6',
                  color: '#718096'
                }}>
                  {recipe.instructions}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recipes;
