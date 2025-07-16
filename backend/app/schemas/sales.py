from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SaleItemBase(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    total_price: float

class SaleItemCreate(SaleItemBase):
    pass

class SaleItemResponse(SaleItemBase):
    id: int

    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    total_amount: float
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    payment_method: str
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class SaleUpdate(BaseModel):
    total_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    payment_method: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    notes: Optional[str] = None

class SaleResponse(SaleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[SaleItemResponse]

    class Config:
        from_attributes = True

class SalesAnalytics(BaseModel):
    total_sales: float
    total_transactions: int
    average_transaction: float
    growth_rate: float
    top_products: List[dict]
    daily_trends: List[dict]
    
class SalesForecast(BaseModel):
    predictions: List[dict]
    confidence: float
    model_accuracy: float