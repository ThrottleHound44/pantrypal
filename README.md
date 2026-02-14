# PantryPal - Smart Kitchen Management System

A full-stack application for managing your kitchen inventory, reducing food waste, and making smart meal planning decisions.

## Features

- 📦 **Smart Inventory Tracking** - Track all your food items with photos, expiry dates, and stock levels
- 🗺️ **Storage Location Management** - Organize items by location with barcode support
- 📷 **Barcode Scanner** - Manual entry and camera scanning for quick location lookup
- 🤖 **AI Recipe Suggestions** - Get recipe ideas based on available ingredients (OpenAI integration)
- 📅 **Meal Planning** - Plan your meals for the week
- 🛒 **Smart Grocery List** - Auto-add low stock items, export to Apple Reminders
- 🔔 **Intelligent Alerts** - Get notified about expiring items and long storage
- 📊 **Dashboard Statistics** - Real-time insights into your kitchen inventory

## Technology Stack

### Backend
- Python 3.11+
- FastAPI
- MongoDB (Motor async driver)
- OpenAI API
- Pillow (image processing)

### Frontend
- React 18
- React Router v6
- Vite
- react-webcam (camera support)
- date-fns (date formatting)
- Lucide React (icons)

## Prerequisites

Before you begin, make sure you have:

1. **Python 3.11 or higher** installed
2. **Node.js 18 or higher** and npm installed
3. **MongoDB** installed and running
4. **OpenAI API key** (optional, for AI features)

## Installation & Setup

### 🏠 Local Setup (Use at Home)

See below for local installation.

### ☁️ Cloud Deployment (Use Anywhere)

**Want to access PantryPal from anywhere, on any network?**

👉 **See [DEPLOY_NOW.md](DEPLOY_NOW.md)** for 10-minute cloud setup!

Or read the full guide: [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md)

**Quick cloud deploy:**
- Railway.app (easiest) - $5/month after free trial
- Render.com (free tier available)
- Docker on any VPS

---

### 1. Clone or Download the Project

```bash
cd pantrypal
```

### 2. Set Up MongoDB

Make sure MongoDB is installed and running:

```bash
# On Ubuntu/Debian
sudo systemctl start mongodb

# On macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod --dbpath /data/db
```

The application will connect to MongoDB at `mongodb://localhost:27017` by default.

### 3. Set Up Backend

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Set OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Start the backend server
python main.py
```

The backend will run on `http://localhost:8000`

### 4. Set Up Frontend

Open a new terminal:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 5. Access the Application

Open your browser and go to: **http://localhost:3000**

## Quick Start Guide

### First Time Setup

1. **Add Storage Locations**
   - Go to "Locations" page
   - Click "Add Location"
   - Enter name (e.g., "Top Fridge Shelf")
   - Enter a barcode number (e.g., "LOC001")
   - Select location type
   - Click "Create Location"

2. **Add Food Items**
   - Go to "Items" page
   - Click "Add Item"
   - Fill in item details:
     - Name
     - Select location
     - Quantity
     - Stock level (High/Medium/Low)
     - Optional: Expiry date
     - Optional: Upload photo
   - Click "Add Item"

3. **Scan Items by Location**
   - Go to "Scanner" page
   - Enter barcode number OR
   - Click "Use Camera to Scan"
   - View all items in that location

4. **Generate AI Recipes**
   - Go to "Recipes" page
   - Click "Generate Recipes"
   - AI will suggest recipes based on your ingredients
   - (Requires OpenAI API key)

5. **Plan Your Meals**
   - Go to "Meal Planner"
   - Click "Add Meal"
   - Select date and meal type
   - Enter recipe name and ingredients
   - Optional: Add notes

6. **Manage Grocery List**
   - Low stock items are automatically added
   - Go to "Grocery" page
   - Add manual items
   - Mark items as complete when purchased
   - Export to Apple Reminders (.ics file)

7. **Check Alerts**
   - Dashboard shows recent alerts
   - Go to "Alerts" page for full list
   - Notifications for:
     - Expired items
     - Items expiring within 3 days
     - Items stored for 14+ days

## API Endpoints

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create item
- `GET /api/items/location/{location_id}` - Get items by location
- `DELETE /api/items/{item_id}` - Delete item

### Locations
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Create location
- `GET /api/locations/barcode/{barcode}` - Find location by barcode
- `DELETE /api/locations/{location_id}` - Delete location

### Grocery
- `GET /api/grocery` - Get grocery list
- `POST /api/grocery` - Add item
- `PUT /api/grocery/{item_id}/complete` - Mark as complete
- `DELETE /api/grocery/{item_id}` - Delete item
- `GET /api/grocery/export` - Export as .ics file

### Meal Plans
- `GET /api/meal-plans` - Get all meal plans
- `POST /api/meal-plans` - Create meal plan
- `DELETE /api/meal-plans/{plan_id}` - Delete plan

### AI Features
- `POST /api/ai/recipes` - Generate recipes (requires OpenAI API key)
- `POST /api/ai/analyze-freshness` - Analyze items and create alerts

### Statistics
- `GET /api/stats` - Get dashboard statistics

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/{id}/read` - Mark as read

## Configuration

### Environment Variables

Backend (`backend/.env` - create this file):

```
MONGO_URL=mongodb://localhost:27017
OPENAI_API_KEY=your-openai-api-key-here
```

### OpenAI API Key Setup

1. Get your API key from: https://platform.openai.com/api-keys
2. Set it as environment variable:
   ```bash
   export OPENAI_API_KEY="sk-your-key-here"
   ```
3. Or add to `.env` file in backend directory

**Note:** Without an OpenAI API key, the recipe generation will return mock recipes.

## Camera Permissions

For barcode scanning with camera:
- Browser will request camera permission
- Allow access when prompted
- Works best in good lighting
- Position barcode within the target frame

## Apple Reminders Export

The grocery list can be exported to Apple Reminders:

1. Click "Export to Reminders" on Grocery page
2. Download the `.ics` file
3. Open the file on iPhone/iPad/Mac
4. Items will be imported to Reminders app

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb
```

**Port Already in Use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module Not Found:**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Camera Not Working

- Make sure you're using HTTPS or localhost
- Check browser permissions in settings
- Try a different browser (Chrome/Safari work best)

## Production Deployment

### Backend Deployment

```bash
cd backend

# Install production WSGI server
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment

```bash
cd frontend

# Build for production
npm run build

# Serve the dist folder with any static file server
# Example: using serve
npm install -g serve
serve -s dist -p 3000
```

## Data Persistence

All data is stored in MongoDB:
- Database name: `pantrypal`
- Collections:
  - `locations` - Storage locations
  - `items` - Food items
  - `grocery_items` - Grocery list items
  - `meal_plans` - Meal plans
  - `notifications` - System alerts
  - `recipes` - Generated recipes

## Security Notes

- Currently configured for development (no authentication)
- For production:
  - Add user authentication
  - Secure API endpoints
  - Use HTTPS
  - Set CORS to specific origins
  - Secure MongoDB connection

## Future Enhancements

- [ ] User authentication system
- [ ] Family collaboration with invite codes
- [ ] Real-time barcode scanning with html5-qrcode
- [ ] Nutritional information tracking
- [ ] Shopping list optimization by store
- [ ] Smart expiry date predictions
- [ ] Integration with smart fridges
- [ ] Mobile app (React Native)

## License

This project is created for educational and personal use.

## Support

For issues or questions:
1. Check the documentation
2. Review the error logs
3. Ensure all dependencies are installed
4. Verify MongoDB is running

## Credits

Built with:
- FastAPI - Modern Python web framework
- React - UI library
- MongoDB - Database
- OpenAI - AI recipe generation
- Lucide - Icon library

---

**Version:** 1.0  
**Last Updated:** January 28, 2026
