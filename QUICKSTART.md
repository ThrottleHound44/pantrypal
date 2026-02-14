# PantryPal - Quick Start Guide

## What You Need

1. **Python 3.11+** - For the backend
2. **Node.js 18+** - For the frontend
3. **MongoDB** - For database storage
4. **OpenAI API Key** (optional) - For AI recipe generation

## Simple Setup (3 Steps)

### Step 1: Start MongoDB

```bash
# Ubuntu/Debian
sudo systemctl start mongodb

# macOS
brew services start mongodb-community

# Or manually
mongod --dbpath /data/db
```

### Step 2: Add Your OpenAI API Key (Optional)

```bash
export OPENAI_API_KEY="your-key-here"
```

Get your key from: https://platform.openai.com/api-keys

### Step 3: Start PantryPal

```bash
./start.sh
```

That's it! Open http://localhost:3000 in your browser.

## To Stop

```bash
./stop.sh
```

## First Time Using PantryPal?

### 1. Add a Storage Location
- Click "Locations" in the sidebar
- Click "+ Add Location"
- Enter: Name (e.g., "Fridge Top Shelf"), Barcode (e.g., "LOC001"), Type
- Click "Create Location"

### 2. Add a Food Item
- Click "Items" in the sidebar
- Click "+ Add Item"
- Fill in: Name, Location, Quantity, Stock Level
- Optional: Add expiry date and photo
- Click "Add Item"

### 3. Try the Scanner
- Click "Scanner" in the sidebar
- Type "LOC001" (or your barcode)
- Click "Scan"
- See all items in that location!

### 4. Generate AI Recipes
- Click "Recipes" in the sidebar
- Click "Generate Recipes"
- AI creates recipes from your ingredients!

### 5. Plan Your Meals
- Click "Meal Planner"
- Click "+ Add Meal"
- Select date, meal type, add recipe and ingredients

### 6. Check Your Grocery List
- Click "Grocery"
- Low stock items are automatically added!
- Add more items manually
- Export to Apple Reminders

### 7. View Alerts
- Click "Alerts"
- See expiring items
- Get notified about items stored too long

## Common Questions

**Q: Camera scanning doesn't work?**
A: Make sure you're on localhost or HTTPS and allow camera permissions

**Q: No AI recipes?**
A: Add your OpenAI API key (see Step 2 above). Without it, you'll see mock recipes.

**Q: MongoDB won't start?**
A: Install it first:
- Ubuntu: `sudo apt-get install mongodb`
- macOS: `brew install mongodb-community`

**Q: Port already in use?**
A: Stop other services on ports 3000 and 8000, or change ports in the config files

## Need Help?

1. Check the full README.md for detailed instructions
2. Look at backend.log and frontend.log for errors
3. Make sure MongoDB is running: `sudo systemctl status mongodb`

## Tips

- 📸 Take photos of items to easily identify them
- 📅 Always add expiry dates to get helpful alerts
- 🛒 Low stock items automatically go to grocery list
- 🔄 Check Dashboard daily for real-time statistics
- 📲 Export grocery list to your phone's Reminders app

Enjoy using PantryPal! 🥘
