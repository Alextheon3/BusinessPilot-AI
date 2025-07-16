from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.schemas.sales import SaleCreate, SaleResponse, SalesAnalytics
from app.services.sales_service import SalesService

router = APIRouter()

@router.post("/", response_model=SaleResponse)
async def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    sales_service = SalesService(db)
    return sales_service.create_sale(sale)

@router.get("/", response_model=List[SaleResponse])
async def get_sales(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    sales_service = SalesService(db)
    return sales_service.get_sales(skip, limit, start_date, end_date)

@router.get("/analytics")
async def get_sales_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    sales_service = SalesService(db)
    return sales_service.get_sales_analytics(start_date, end_date)

@router.get("/forecast")
async def get_sales_forecast(
    days: int = 7,
    db: Session = Depends(get_db)
):
    sales_service = SalesService(db)
    return sales_service.forecast_sales(days)

@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sales_service = SalesService(db)
    sale = sales_service.get_sale(sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale