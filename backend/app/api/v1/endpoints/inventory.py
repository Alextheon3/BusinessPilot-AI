from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.inventory import InventoryCreate, InventoryResponse, InventoryUpdate
from app.services.inventory_service import InventoryService

router = APIRouter()

@router.post("/", response_model=InventoryResponse)
async def create_inventory_item(item: InventoryCreate, db: Session = Depends(get_db)):
    inventory_service = InventoryService(db)
    return inventory_service.create_item(item)

@router.get("/", response_model=List[InventoryResponse])
async def get_inventory(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    inventory_service = InventoryService(db)
    return inventory_service.get_items(skip, limit, category, search)

@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    inventory_service = InventoryService(db)
    return inventory_service.get_categories()

@router.get("/low-stock")
async def get_low_stock_items(db: Session = Depends(get_db)):
    inventory_service = InventoryService(db)
    return inventory_service.get_low_stock_items()

@router.get("/value")
async def get_inventory_value(db: Session = Depends(get_db)):
    inventory_service = InventoryService(db)
    return inventory_service.get_inventory_value()

@router.get("/reorder-suggestions")
async def get_reorder_suggestions(db: Session = Depends(get_db)):
    inventory_service = InventoryService(db)
    return inventory_service.get_reorder_suggestions()

@router.get("/forecast/{item_id}")
async def get_demand_forecast(item_id: int, days: int = 30, db: Session = Depends(get_db)):
    inventory_service = InventoryService(db)
    return inventory_service.forecast_demand(item_id, days)

@router.post("/{item_id}/stock")
async def update_stock(
    item_id: int,
    quantity_change: int,
    operation: str = "add",
    db: Session = Depends(get_db)
):
    inventory_service = InventoryService(db)
    updated_item = inventory_service.update_stock(item_id, quantity_change, operation)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item

@router.put("/{item_id}", response_model=InventoryResponse)
async def update_inventory_item(
    item_id: int,
    item: InventoryUpdate,
    db: Session = Depends(get_db)
):
    inventory_service = InventoryService(db)
    updated_item = inventory_service.update_item(item_id, item)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item

@router.delete("/{item_id}")
async def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    inventory_service = InventoryService(db)
    deleted = inventory_service.delete_item(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}