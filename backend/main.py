from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
import os
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.pantrypal

# Models
class Location(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location_type: str
    family_id: str = "default-family"
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class Item(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location_id: str
    quantity: int
    stock_level: str
    expiry_date: Optional[str] = None
    photo_url: Optional[str] = None
    family_id: str = "default-family"
    added_by: str = "default-user"
    added_date: str = Field(default_factory=lambda: datetime.now().isoformat())

class GroceryList(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    family_id: str = "default-family"
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    is_auto: bool = False

class GroceryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_name: str
    quantity: int
    list_id: str
    family_id: str = "default-family"
    added_by: str = "default-user"
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class MealPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    family_id: str = "default-family"
    date: str
    meal_type: str
    recipe_title: str
    ingredients: List[str]
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default-user"
    message: str
    notification_type: str
    read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

# Locations
@app.get("/api/locations")
async def get_locations():
    locations = []
    async for loc in db.locations.find({"family_id": "default-family"}):
        clean_loc = {
            "id": loc.get("id"),
            "name": loc.get("name"),
            "location_type": loc.get("location_type"),
            "family_id": loc.get("family_id"),
            "created_at": loc.get("created_at")
        }
        locations.append(clean_loc)
    return locations

@app.post("/api/locations")
async def create_location(location: Location):
    location_dict = location.dict()
    await db.locations.insert_one(location_dict)
    # Return clean dict
    return {
        "id": location_dict.get("id"),
        "name": location_dict.get("name"),
        "location_type": location_dict.get("location_type"),
        "family_id": location_dict.get("family_id"),
        "created_at": location_dict.get("created_at")
    }

@app.delete("/api/locations/{location_id}")
async def delete_location(location_id: str):
    result = await db.locations.delete_one({"id": location_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted"}

# Items
@app.get("/api/items")
async def get_items():
    items = []
    async for item in db.items.find({"family_id": "default-family"}):
        clean_item = {
            "id": item.get("id"),
            "name": item.get("name"),
            "location_id": item.get("location_id"),
            "quantity": item.get("quantity"),
            "stock_level": item.get("stock_level"),
            "expiry_date": item.get("expiry_date"),
            "photo_url": item.get("photo_url"),
            "family_id": item.get("family_id"),
            "added_by": item.get("added_by"),
            "added_date": item.get("added_date")
        }
        items.append(clean_item)
    return items

@app.post("/api/items")
async def create_item(item: Item):
    item_dict = item.dict()
    await db.items.insert_one(item_dict)
    
    if item.stock_level == "Low":
        auto_list = await db.grocery_lists.find_one({"family_id": "default-family", "is_auto": True})
        if not auto_list:
            auto_list = GroceryList(name="Low Stock Items (Auto)", is_auto=True)
            await db.grocery_lists.insert_one(auto_list.dict())
            auto_list = auto_list.dict()
        
        grocery_item = GroceryItem(
            item_name=item.name,
            quantity=1,
            list_id=auto_list['id'],
            added_by="system"
        )
        await db.grocery_items.insert_one(grocery_item.dict())
    
    # Return clean dict
    return {
        "id": item_dict.get("id"),
        "name": item_dict.get("name"),
        "location_id": item_dict.get("location_id"),
        "quantity": item_dict.get("quantity"),
        "stock_level": item_dict.get("stock_level"),
        "expiry_date": item_dict.get("expiry_date"),
        "photo_url": item_dict.get("photo_url"),
        "family_id": item_dict.get("family_id"),
        "added_by": item_dict.get("added_by"),
        "added_date": item_dict.get("added_date")
    }

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: str):
    result = await db.items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

# Grocery Lists
@app.get("/api/grocery-lists")
async def get_grocery_lists():
    try:
        lists = []
        async for glist in db.grocery_lists.find({"family_id": "default-family"}):
            # Build clean dict without ObjectId
            clean_list = {
                "id": glist.get("id"),
                "name": glist.get("name"),
                "family_id": glist.get("family_id"),
                "created_at": glist.get("created_at"),
                "is_auto": glist.get("is_auto", False)
            }
            # Count items
            try:
                item_count = await db.grocery_items.count_documents({"list_id": clean_list['id']})
                clean_list['item_count'] = item_count
            except:
                clean_list['item_count'] = 0
            lists.append(clean_list)
        return lists
    except Exception as e:
        print(f"Error in get_grocery_lists: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error loading lists: {str(e)}")

@app.post("/api/grocery-lists")
async def create_grocery_list(glist: GroceryList):
    glist_dict = glist.dict()
    await db.grocery_lists.insert_one(glist_dict)
    # Return clean dict
    return {
        "id": glist_dict.get("id"),
        "name": glist_dict.get("name"),
        "family_id": glist_dict.get("family_id"),
        "created_at": glist_dict.get("created_at"),
        "is_auto": glist_dict.get("is_auto", False),
        "item_count": 0
    }

@app.delete("/api/grocery-lists/{list_id}")
async def delete_grocery_list(list_id: str):
    glist = await db.grocery_lists.find_one({"id": list_id})
    if glist and glist.get('is_auto'):
        raise HTTPException(status_code=400, detail="Cannot delete auto-generated list")
    
    result = await db.grocery_lists.delete_one({"id": list_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="List not found")
    
    await db.grocery_items.delete_many({"list_id": list_id})
    return {"message": "List deleted"}

# Grocery Items
@app.get("/api/grocery-items")
async def get_grocery_items(list_id: Optional[str] = None):
    query = {"family_id": "default-family"}
    if list_id:
        query["list_id"] = list_id
    
    items = []
    async for item in db.grocery_items.find(query):
        clean_item = {
            "id": item.get("id"),
            "item_name": item.get("item_name"),
            "quantity": item.get("quantity"),
            "list_id": item.get("list_id"),
            "family_id": item.get("family_id"),
            "added_by": item.get("added_by"),
            "status": item.get("status"),
            "created_at": item.get("created_at")
        }
        items.append(clean_item)
    return items

@app.post("/api/grocery-items")
async def create_grocery_item(item: GroceryItem):
    item_dict = item.dict()
    await db.grocery_items.insert_one(item_dict)
    # Return clean dict
    return {
        "id": item_dict.get("id"),
        "item_name": item_dict.get("item_name"),
        "quantity": item_dict.get("quantity"),
        "list_id": item_dict.get("list_id"),
        "family_id": item_dict.get("family_id"),
        "added_by": item_dict.get("added_by"),
        "status": item_dict.get("status"),
        "created_at": item_dict.get("created_at")
    }

@app.put("/api/grocery-items/{item_id}/complete")
async def complete_grocery_item(item_id: str):
    result = await db.grocery_items.update_one(
        {"id": item_id},
        {"$set": {"status": "completed"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item marked as completed"}

@app.put("/api/grocery-items/{item_id}/move")
async def move_grocery_item(item_id: str, new_list_id: str):
    result = await db.grocery_items.update_one(
        {"id": item_id},
        {"$set": {"list_id": new_list_id}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item moved successfully"}

@app.delete("/api/grocery-items/{item_id}")
async def delete_grocery_item(item_id: str):
    result = await db.grocery_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

@app.get("/api/grocery/export/{list_id}")
async def export_grocery_list(list_id: str):
    glist = await db.grocery_lists.find_one({"id": list_id})
    if not glist:
        raise HTTPException(status_code=404, detail="List not found")
    
    items = []
    async for item in db.grocery_items.find({"list_id": list_id, "status": "pending"}):
        items.append(item)
    
    ics_content = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PantryPal//Grocery List//EN\n"
    
    for item in items:
        ics_content += "BEGIN:VTODO\n"
        ics_content += f"UID:{item['id']}\n"
        ics_content += f"SUMMARY:{item['item_name']} (Qty: {item['quantity']})\n"
        ics_content += f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}\n"
        ics_content += "STATUS:NEEDS-ACTION\n"
        ics_content += "END:VTODO\n"
    
    ics_content += "END:VCALENDAR"
    
    filename = f"pantrypal-{glist['name'].lower().replace(' ', '-')}.ics"
    return {"content": ics_content, "filename": filename}

# Meal Plans
@app.get("/api/meal-plans")
async def get_meal_plans():
    plans = []
    async for plan in db.meal_plans.find({"family_id": "default-family"}):
        plan['_id'] = str(plan['_id'])
        plans.append(plan)
    return plans

@app.post("/api/meal-plans")
async def create_meal_plan(plan: MealPlan):
    plan_dict = plan.dict()
    await db.meal_plans.insert_one(plan_dict)
    return plan_dict

@app.delete("/api/meal-plans/{plan_id}")
async def delete_meal_plan(plan_id: str):
    result = await db.meal_plans.delete_one({"id": plan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    return {"message": "Meal plan deleted"}

# Notifications
@app.get("/api/notifications")
async def get_notifications():
    notifications = []
    async for notif in db.notifications.find({"user_id": "default-user"}):
        notif['_id'] = str(notif['_id'])
        notifications.append(notif)
    return notifications

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    result = await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

# AI
@app.post("/api/ai/analyze-freshness")
async def analyze_freshness():
    try:
        notifications_created = 0
        async for item in db.items.find({"family_id": "default-family"}):
            current_date = datetime.now()
            
            if item.get('expiry_date'):
                try:
                    expiry = datetime.fromisoformat(item['expiry_date'].replace('Z', '+00:00'))
                    days_until_expiry = (expiry - current_date).days
                    
                    if days_until_expiry < 0:
                        notif = Notification(
                            message=f"{item['name']} has expired!",
                            notification_type="expired"
                        )
                        await db.notifications.insert_one(notif.dict())
                        notifications_created += 1
                    elif 0 <= days_until_expiry <= 3:
                        notif = Notification(
                            message=f"{item['name']} expires in {days_until_expiry} day(s)!",
                            notification_type="expiring_soon"
                        )
                        await db.notifications.insert_one(notif.dict())
                        notifications_created += 1
                except:
                    pass
        
        return {"message": "Freshness analysis complete", "notifications_created": notifications_created}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Stats
@app.get("/api/stats")
async def get_statistics():
    total_items = await db.items.count_documents({"family_id": "default-family"})
    total_locations = await db.locations.count_documents({"family_id": "default-family"})
    
    expiring_soon = 0
    current_date = datetime.now()
    async for item in db.items.find({"family_id": "default-family"}):
        if item.get('expiry_date'):
            try:
                expiry = datetime.fromisoformat(item['expiry_date'].replace('Z', '+00:00'))
                days_until_expiry = (expiry - current_date).days
                if 0 <= days_until_expiry <= 3:
                    expiring_soon += 1
            except:
                pass
    
    low_stock = await db.items.count_documents({"family_id": "default-family", "stock_level": "Low"})
    
    return {
        "total_items": total_items,
        "total_locations": total_locations,
        "expiring_soon": expiring_soon,
        "low_stock": low_stock
    }

@app.get("/")
async def root():
    if static_dir.exists():
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return {"message": "PantryPal API is running!", "version": "2.0"}

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")
    if static_dir.exists():
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
