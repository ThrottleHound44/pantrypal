import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  Home, MapPin, Package, ChefHat, 
  Calendar, ShoppingCart, Bell, Menu, X 
} from 'lucide-react';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import Items from './pages/Items';
import Recipes from './pages/Recipes';
import MealPlanner from './pages/MealPlanner';
import Grocery from './pages/Grocery';
import Notifications from './pages/Notifications';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
    { path: '/items', icon: Package, label: 'Items' },
    { path: '/recipes', icon: ChefHat, label: 'Recipes' },
    { path: '/meal-planner', icon: Calendar, label: 'Meal Planner' },
    { path: '/grocery', icon: ShoppingCart, label: 'Grocery' },
    { path: '/notifications', icon: Bell, label: 'Alerts' },
  ];

  return (
    <Router>
      <div className="app-container">
        {/* Desktop Sidebar */}
        <nav className="sidebar">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '1.75rem', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              🥘 PantryPal
            </h1>
            <p style={{ color: '#718096', fontSize: '0.9rem' }}>
              Smart Kitchen Management
            </p>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="modal-overlay"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '400px' }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem'
                }}>
                  🥘 PantryPal
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>
                  Smart Kitchen Management
                </p>
              </div>

              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/items" element={<Items />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/meal-planner" element={<MealPlanner />} />
            <Route path="/grocery" element={<Grocery />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
