from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.employee import EmployeeCreate, EmployeeResponse, ScheduleCreate, ScheduleResponse
from app.services.employee_service import EmployeeService

router = APIRouter()

@router.post("/", response_model=EmployeeResponse)
async def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    return employee_service.create_employee(employee)

@router.get("/", response_model=List[EmployeeResponse])
async def get_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    return employee_service.get_employees(skip, limit)

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    employee = employee_service.get_employee(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/schedule", response_model=ScheduleResponse)
async def create_schedule(schedule: ScheduleCreate, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    return employee_service.create_schedule(schedule)

@router.get("/schedule/generate")
async def generate_schedule(week_start: str, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    return employee_service.generate_smart_schedule(week_start)

@router.get("/schedule/{week_start}")
async def get_schedule(week_start: str, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    return employee_service.get_schedule(week_start)