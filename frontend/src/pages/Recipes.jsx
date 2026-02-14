import { useEffect, useState } from 'react';
import { ChefHat, RefreshCw, Clock, Users } from 'lucide-react';

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const generateRecipes = () => {
    if (items.length === 0) {
      alert('Add some items to your inventory first!');
      return;
    }

    setLoading(true);

    // Simulate loading for better UX
    setTimeout(() => {
      const generated = createRecipesFromItems(items);
      setRecipes(generated);
      setLoading(false);
    }, 1500);
  };

  const createRecipesFromItems = (availableItems) => {
    const ingredients = availableItems.map(item => item.name.toLowerCase());
    const recipes = [];

    // Recipe templates based on common ingredients
    const recipeTemplates = [
      {
        keywords: ['chicken', 'rice'],
        recipe: {
          title: 'Simple Chicken & Rice',
          cookTime: '35 minutes',
          servings: 4,
          ingredients: ['Chicken', 'Rice', 'Onion', 'Garlic', 'Chicken broth', 'Salt', 'Pepper'],
          instructions: [
            'Season chicken with salt and pepper',
            'Sauté diced onion and garlic until fragrant',
            'Add chicken and brown on both sides',
            'Add rice and chicken broth',
            'Cover and simmer for 20-25 minutes',
            'Let rest 5 minutes before serving'
          ]
        }
      },
      {
        keywords: ['pasta', 'tomato'],
        recipe: {
          title: 'Classic Pasta Marinara',
          cookTime: '25 minutes',
          servings: 4,
          ingredients: ['Pasta', 'Tomatoes', 'Garlic', 'Olive oil', 'Basil', 'Salt', 'Pepper'],
          instructions: [
            'Boil pasta according to package directions',
            'Sauté minced garlic in olive oil',
            'Add diced tomatoes and simmer 15 minutes',
            'Season with salt, pepper, and fresh basil',
            'Toss with cooked pasta',
            'Serve with grated cheese if available'
          ]
        }
      },
      {
        keywords: ['eggs', 'bread'],
        recipe: {
          title: 'French Toast',
          cookTime: '15 minutes',
          servings: 2,
          ingredients: ['Eggs', 'Bread', 'Milk', 'Cinnamon', 'Butter', 'Maple syrup'],
          instructions: [
            'Whisk eggs with milk and cinnamon',
            'Dip bread slices in egg mixture',
            'Heat butter in pan over medium heat',
            'Cook bread 2-3 minutes per side until golden',
            'Serve warm with maple syrup'
          ]
        }
      },
      {
        keywords: ['potato', 'cheese'],
        recipe: {
          title: 'Cheesy Baked Potatoes',
          cookTime: '60 minutes',
          servings: 4,
          ingredients: ['Potatoes', 'Cheese', 'Butter', 'Sour cream', 'Chives', 'Salt'],
          instructions: [
            'Wash and poke holes in potatoes',
            'Bake at 400°F for 45-50 minutes',
            'Cut open and fluff insides',
            'Top with butter, cheese, sour cream',
            'Garnish with chives',
            'Season with salt to taste'
          ]
        }
      },
      {
        keywords: ['ground beef', 'onion'],
        recipe: {
          title: 'Savory Beef Skillet',
          cookTime: '30 minutes',
          servings: 4,
          ingredients: ['Ground beef', 'Onion', 'Garlic', 'Tomato sauce', 'Seasonings'],
          instructions: [
            'Brown ground beef in large skillet',
            'Add diced onion and garlic, cook until soft',
            'Drain excess fat',
            'Stir in tomato sauce and seasonings',
            'Simmer 15 minutes',
            'Serve over rice or pasta'
          ]
        }
      },
      {
        keywords: ['chicken', 'vegetables'],
        recipe: {
          title: 'Chicken Veggie Stir Fry',
          cookTime: '20 minutes',
          servings: 4,
          ingredients: ['Chicken', 'Mixed vegetables', 'Soy sauce', 'Garlic', 'Ginger', 'Oil'],
          instructions: [
            'Cut chicken into bite-sized pieces',
            'Heat oil in wok or large pan',
            'Stir-fry chicken until cooked through',
            'Add vegetables and cook 5 minutes',
            'Add soy sauce, garlic, and ginger',
            'Serve over rice or noodles'
          ]
        }
      },
      {
        keywords: ['fish', 'lemon'],
        recipe: {
          title: 'Lemon Herb Fish',
          cookTime: '20 minutes',
          servings: 2,
          ingredients: ['Fish fillets', 'Lemon', 'Butter', 'Herbs', 'Garlic', 'Salt', 'Pepper'],
          instructions: [
            'Season fish with salt and pepper',
            'Heat butter in pan over medium heat',
            'Add minced garlic and herbs',
            'Cook fish 4-5 minutes per side',
            'Squeeze fresh lemon juice over top',
            'Serve immediately'
          ]
        }
      }
    ];

    // Match available ingredients to recipes
    recipeTemplates.forEach(template => {
      const hasKeyIngredients = template.keywords.some(keyword => 
        ingredients.some(ing => ing.includes(keyword))
      );
      
      if (hasKeyIngredients) {
        recipes.push(template.recipe);
      }
    });

    // If we found specific recipes, return them
    if (recipes.length > 0) {
      return recipes.slice(0, 3);
    }

    // Otherwise, generate generic recipes with available ingredients
    return generateGenericRecipes(availableItems);
  };

  const generateGenericRecipes = (availableItems) => {
    const ingredientNames = availableItems.map(item => item.name);
    
    return [
      {
        title: 'Quick Pantry Meal',
        cookTime: '30 minutes',
        servings: 4,
        ingredients: ingredientNames.slice(0, 5),
        instructions: [
          'Prepare and chop all ingredients',
          'Heat oil or butter in a large pan',
          'Cook ingredients in order from longest to shortest cooking time',
          'Season to taste with available spices',
          'Combine everything and heat through',
          'Serve warm and enjoy!'
        ]
      },
      {
        title: 'Simple Mixed Dish',
        cookTime: '25 minutes',
        servings: 3,
        ingredients: ingredientNames.slice(0, 4),
        instructions: [
          'Start by preparing your main ingredient',
          'Add complementary ingredients one by one',
          'Cook until everything is tender',
          'Adjust seasoning to your preference',
          'Let rest for a few minutes',
          'Serve and enjoy your creation'
        ]
      },
      {
        title: 'Creative Kitchen Bowl',
        cookTime: '20 minutes',
        servings: 2,
        ingredients: ingredientNames.slice(0, 6),
        instructions: [
          'Cook your base ingredient (rice, pasta, or grains)',
          'Prepare your protein and vegetables',
          'Combine in a bowl',
          'Add your favorite sauce or dressing',
          'Mix well or layer for presentation',
          'Top with any fresh herbs or garnishes available'
        ]
      }
    ];
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: '#6b7280' }}>Generating delicious recipes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mobile-stack" style={{ marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Recipe Ideas</h1>
          <p style={{ color: '#6b7280' }}>
            {items.length === 0 
              ? 'Add items to your inventory to get recipe suggestions'
              : `Based on your ${items.length} available ingredients`
            }
          </p>
        </div>
        <button 
          className="btn btn-primary mobile-full"
          onClick={generateRecipes}
          disabled={items.length === 0}
        >
          <RefreshCw size={20} />
          <span>Generate Recipes</span>
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <ChefHat size={80} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No recipes yet</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Click "Generate Recipes" to get cooking ideas based on your available ingredients
            </p>
            {items.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                💡 Tip: Add some items to your inventory first!
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {recipes.map((recipe, index) => (
            <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <ChefHat size={30} color="white" />
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600, color: '#111827' }}>
                {recipe.title}
              </h3>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <Clock size={16} />
                  <span>{recipe.cookTime}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <Users size={16} />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>
                  Ingredients:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {recipe.ingredients.map((ingredient, i) => (
                    <span 
                      key={i}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#f3f4f6',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#374151'
                      }}
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>
                  Instructions:
                </h4>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>
                  {recipe.instructions.map((step, i) => (
                    <li key={i} style={{ marginBottom: '0.375rem' }}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}

      {recipes.length > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            className="btn btn-secondary"
            onClick={generateRecipes}
          >
            <RefreshCw size={18} />
            <span>Generate More Recipes</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Recipes;
