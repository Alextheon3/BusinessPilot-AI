from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ExpenseCategory(enum.Enum):
    RENT = "rent"
    UTILITIES = "utilities"
    INVENTORY = "inventory"
    MARKETING = "marketing"
    PAYROLL = "payroll"
    EQUIPMENT = "equipment"
    MAINTENANCE = "maintenance"
    INSURANCE = "insurance"
    TAXES = "taxes"
    OTHER = "other"

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(Enum(ExpenseCategory), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    receipt_url = Column(String(500))
    vendor = Column(String(100))
    is_recurring = Column(Boolean, default=False)
    recurrence_period = Column(String(50))  # monthly, weekly, etc.
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())