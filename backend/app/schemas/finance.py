from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.finance import ExpenseCategory

class ExpenseBase(BaseModel):
    description: str
    amount: float
    category: ExpenseCategory
    date: datetime
    receipt_url: Optional[str] = None
    vendor: Optional[str] = None
    is_recurring: bool = False
    recurrence_period: Optional[str] = None
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[ExpenseCategory] = None
    date: Optional[datetime] = None
    receipt_url: Optional[str] = None
    vendor: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_period: Optional[str] = None
    notes: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FinancialReport(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    profit_margin: float
    expense_breakdown: dict
    revenue_trends: list
    expense_trends: list
    
class CashflowAnalysis(BaseModel):
    current_balance: float
    projected_balance: float
    cash_flow_trends: list
    upcoming_expenses: list
    revenue_forecast: list