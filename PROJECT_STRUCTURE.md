# PantryPal - Project Structure

```
pantrypal/
├── README.md                    # Full documentation
├── QUICKSTART.md               # Quick start guide
├── start.sh                    # Start entire app (backend + frontend)
├── stop.sh                     # Stop entire app
│
├── backend/                    # Python FastAPI Backend
│   ├── requirements.txt        # Python dependencies
│   ├── start.sh               # Start backend only
│   └── main.py                # Main API application (all endpoints)
│
└── frontend/                   # React Frontend
    ├── package.json           # Node dependencies
    ├── vite.config.js         # Vite configuration
    ├── index.html             # HTML entry point
    │
    └── src/
        ├── main.jsx           # React entry point
        ├── App.jsx            # Main app with routing
        ├── App.css            # Global styles
        │
        └── pages/             # All page components
            ├── Dashboard.jsx      # Dashboard with stats & quick actions
            ├── Locations.jsx      # Storage location management
            ├── Items.jsx          # Food item inventory with photos
            ├── Scanner.jsx        # Barcode scanner (manual + camera)
            ├── Recipes.jsx        # AI recipe generation
            ├── MealPlanner.jsx    # Weekly meal planning
            ├── Grocery.jsx        # Grocery list with .ics export
            └── Notifications.jsx  # Alerts & notifications
```

## File Descriptions

### Root Files

- **README.md**: Complete documentation with setup instructions, API endpoints, features
- **QUICKSTART.md**: Simple 3-step guide to get started quickly
- **start.sh**: One command to start both backend and frontend
- **stop.sh**: Stop all services

### Backend (`backend/`)

- **main.py**: 
  - FastAPI application
  - All API endpoints (items, locations, grocery, recipes, etc.)
  - MongoDB connection
  - OpenAI integration
  - Image compression
  - .ics file generation

- **requirements.txt**: Python packages needed
- **start.sh**: Script to start just the backend

### Frontend (`frontend/`)

- **package.json**: Node.js dependencies (React, Vite, etc.)
- **vite.config.js**: Development server configuration
- **index.html**: HTML template with font imports

#### Source (`src/`)

- **main.jsx**: React initialization
- **App.jsx**: 
  - React Router setup
  - Navigation sidebar
  - Mobile menu
  - All routes

- **App.css**: 
  - Glassmorphism styles
  - Responsive design
  - Component styles
  - Utility classes

#### Pages (`src/pages/`)

Each page is a complete React component:

1. **Dashboard.jsx**
   - Statistics cards (total items, locations, expiring, low stock)
   - Recent alerts preview
   - Quick action buttons
   - Runs freshness analysis on load

2. **Locations.jsx**
   - List all storage locations
   - Add new locations (with barcode)
   - Delete locations
   - Color-coded by type

3. **Items.jsx**
   - Grid view of all food items
   - Photo upload and display
   - Add/delete items
   - Stock level badges
   - Expiry date display
   - Auto-adds low stock to grocery list

4. **Scanner.jsx**
   - Manual barcode entry
   - Camera scanning with webcam
   - Displays location info
   - Shows all items in scanned location

5. **Recipes.jsx**
   - Generate AI recipes button
   - Displays 3 recipe suggestions
   - Shows ingredients and instructions
   - Mock recipes when no API key

6. **MealPlanner.jsx**
   - Calendar view of meals
   - Add meals with date/type/ingredients
   - Group by date
   - Color-coded by meal type
   - Delete meal plans

7. **Grocery.jsx**
   - Two columns: To Buy / Completed
   - Mark items as complete
   - Delete items
   - Export to Apple Reminders (.ics)
   - Shows auto-added items from low stock

8. **Notifications.jsx**
   - List all alerts
   - Mark as read
   - Shows:
     - Expired items (red)
     - Expiring soon (orange)
     - Long storage (blue)
   - Sort by date

## Technology Stack Summary

### Backend
- **FastAPI**: Modern Python web framework
- **Motor**: Async MongoDB driver
- **OpenAI**: AI recipe generation
- **Pillow**: Image compression
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: UI library
- **React Router**: Navigation
- **Vite**: Build tool & dev server
- **react-webcam**: Camera access
- **date-fns**: Date formatting
- **Lucide React**: Beautiful icons

### Database
- **MongoDB**: NoSQL database
  - Collections: locations, items, grocery_items, meal_plans, notifications, recipes

## Key Features Implementation

### Photo Upload (Items.jsx)
- FileReader API for image preview
- Base64 encoding
- Backend compression (800x800, 85% quality)
- Display in cards

### Barcode Scanning (Scanner.jsx)
- Manual input field
- Camera with react-webcam
- Target frame overlay
- Lookup by barcode via API

### AI Recipes (Recipes.jsx + Backend)
- Fetches all items from inventory
- Sends to OpenAI GPT
- Parses response
- Displays with ingredients & instructions

### Grocery Export (Grocery.jsx + Backend)
- Generates VCALENDAR format
- Creates VTODO for each item
- Downloads as .ics file
- Works with Apple Reminders

### Meal Planning (MealPlanner.jsx)
- Date picker for scheduling
- Meal type selection
- Ingredient suggestions from inventory
- Groups by date, sorts chronologically

### Smart Alerts (Backend)
- Analyzes expiry dates
- Checks storage duration
- Creates notifications automatically
- Dashboard triggers analysis

## Database Schema

```javascript
// locations
{
  id, name, barcode, location_type,
  family_id, created_at
}

// items  
{
  id, name, location_id, quantity, stock_level,
  expiry_date, photo_url, family_id, added_by, added_date
}

// grocery_items
{
  id, item_name, quantity, family_id,
  added_by, status, created_at
}

// meal_plans
{
  id, family_id, date, meal_type,
  recipe_title, ingredients[], notes, created_at
}

// notifications
{
  id, user_id, message, notification_type,
  read, created_at
}

// recipes
{
  id, title, ingredients[], instructions,
  family_id, generated_at
}
```

## API Endpoints Summary

- **Items**: GET, POST, DELETE `/api/items`
- **Locations**: GET, POST, DELETE, GET by barcode `/api/locations`
- **Grocery**: GET, POST, PUT complete, DELETE, GET export `/api/grocery`
- **Meal Plans**: GET, POST, DELETE `/api/meal-plans`
- **Notifications**: GET, PUT read `/api/notifications`
- **AI**: POST recipes, POST analyze-freshness `/api/ai/*`
- **Stats**: GET `/api/stats`

## Running the App

### Option 1: Use start.sh (Easiest)
```bash
./start.sh
```

### Option 2: Manual Start
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend
pip install -r requirements.txt
export OPENAI_API_KEY="your-key"
python main.py

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
```

Then open: http://localhost:3000

## Default Configuration

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- MongoDB: mongodb://localhost:27017
- Database: pantrypal
- Family ID: "default-family" (hardcoded, no auth)
- User ID: "default-user" (hardcoded, no auth)

## Notes

- Authentication is skipped for this version
- All users share "default-family" 
- OpenAI API key is optional (mock recipes without it)
- Camera requires HTTPS or localhost
- Photos are base64-encoded in database
- .ics export works with any calendar app supporting VTODO

---

This structure provides a complete, working full-stack application ready to deploy!
