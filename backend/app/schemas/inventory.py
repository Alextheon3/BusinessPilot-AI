from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    current_stock: int = 0
    minimum_stock: int = 0
    maximum_stock: int = 1000
    unit_cost: float = 0.0
    selling_price: float = 0.0
    supplier: Optional[str] = None
    location: Optional[str] = None

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    current_stock: Optional[int] = None
    minimum_stock: Optional[int] = None
    maximum_stock: Optional[int] = None
    unit_cost: Optional[float] = None
    selling_price: Optional[float] = None
    supplier: Optional[str] = None
    location: Optional[str] = None

class InventoryResponse(InventoryBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InventoryAlert(BaseModel):
    item_id: int
    item_name: str
    alert_type: str
    message: str
    severity: str
    
class DemandForecast(BaseModel):
    item_id: int
    predictions: list
    suggested_reorder: int
    confidence: float