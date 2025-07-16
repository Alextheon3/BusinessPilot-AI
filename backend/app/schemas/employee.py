from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time

class EmployeeBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    position: str
    hourly_rate: float
    hire_date: date

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    hourly_rate: Optional[float] = None
    hire_date: Optional[date] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ScheduleBase(BaseModel):
    employee_id: int
    date: date
    start_time: str
    end_time: str
    hours: float
    notes: Optional[str] = None

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleResponse(ScheduleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ScheduleGenerate(BaseModel):
    week_start: date
    predicted_sales: Optional[float] = None
    special_events: Optional[list] = None