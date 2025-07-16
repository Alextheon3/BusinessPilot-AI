from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from datetime import datetime, timedelta, time
from app.models.employee import Employee, Schedule
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, ScheduleCreate


class EmployeeService:
    def __init__(self, db: Session):
        self.db = db

    def create_employee(self, employee_create: EmployeeCreate) -> Employee:
        db_employee = Employee(
            full_name=employee_create.full_name,
            email=employee_create.email,
            phone=employee_create.phone,
            position=employee_create.position,
            hourly_rate=employee_create.hourly_rate,
            hire_date=employee_create.hire_date,
            is_active=True
        )
        self.db.add(db_employee)
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee

    def get_employee(self, employee_id: int) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.id == employee_id).first()

    def get_employee_by_email(self, email: str) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.email == email).first()

    def get_employees(self, skip: int = 0, limit: int = 100, 
                     active_only: bool = True) -> List[Employee]:
        query = self.db.query(Employee)
        
        if active_only:
            query = query.filter(Employee.is_active == True)
        
        return query.order_by(Employee.full_name).offset(skip).limit(limit).all()

    def update_employee(self, employee_id: int, employee_update: EmployeeUpdate) -> Optional[Employee]:
        db_employee = self.get_employee(employee_id)
        if not db_employee:
            return None
        
        update_data = employee_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_employee, field, value)
        
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee

    def deactivate_employee(self, employee_id: int) -> bool:
        db_employee = self.get_employee(employee_id)
        if not db_employee:
            return False
        
        db_employee.is_active = False
        self.db.commit()
        return True

    def create_schedule(self, schedule_create: ScheduleCreate) -> Schedule:
        # Calculate hours
        start_time = datetime.strptime(schedule_create.start_time, "%H:%M").time()
        end_time = datetime.strptime(schedule_create.end_time, "%H:%M").time()
        
        start_datetime = datetime.combine(schedule_create.date, start_time)
        end_datetime = datetime.combine(schedule_create.date, end_time)
        
        # Handle overnight shifts
        if end_time <= start_time:
            end_datetime += timedelta(days=1)
        
        hours = (end_datetime - start_datetime).total_seconds() / 3600
        
        db_schedule = Schedule(
            employee_id=schedule_create.employee_id,
            date=schedule_create.date,
            start_time=schedule_create.start_time,
            end_time=schedule_create.end_time,
            hours=hours,
            notes=schedule_create.notes
        )
        self.db.add(db_schedule)
        self.db.commit()
        self.db.refresh(db_schedule)
        return db_schedule

    def get_schedule(self, schedule_id: int) -> Optional[Schedule]:
        return self.db.query(Schedule).filter(Schedule.id == schedule_id).first()

    def get_schedules(self, start_date: datetime, end_date: datetime,
                     employee_id: Optional[int] = None) -> List[Schedule]:
        query = self.db.query(Schedule).filter(
            Schedule.date >= start_date.date(),
            Schedule.date <= end_date.date()
        )
        
        if employee_id:
            query = query.filter(Schedule.employee_id == employee_id)
        
        return query.order_by(Schedule.date, Schedule.start_time).all()

    def get_weekly_schedule(self, start_date: datetime) -> Dict[str, List[Schedule]]:
        end_date = start_date + timedelta(days=6)
        schedules = self.get_schedules(start_date, end_date)
        
        weekly_schedule = {}
        for i in range(7):
            day = start_date + timedelta(days=i)
            day_key = day.strftime('%Y-%m-%d')
            weekly_schedule[day_key] = [
                schedule for schedule in schedules
                if schedule.date == day.date()
            ]
        
        return weekly_schedule

    def generate_smart_schedule(self, start_date: datetime, 
                              predicted_sales: Optional[List[Dict]] = None) -> List[Dict[str, Any]]:
        """Generate intelligent schedule based on predicted sales and historical data"""
        end_date = start_date + timedelta(days=6)
        employees = self.get_employees()
        
        if not employees:
            return []
        
        # Get historical schedule patterns
        historical_schedules = self.get_schedules(
            start_date - timedelta(days=30),
            start_date - timedelta(days=1)
        )
        
        # Calculate average hours per day for each employee
        avg_hours = {}
        for employee in employees:
            emp_schedules = [s for s in historical_schedules if s.employee_id == employee.id]
            if emp_schedules:
                avg_hours[employee.id] = sum(s.hours for s in emp_schedules) / len(emp_schedules)
            else:
                avg_hours[employee.id] = 8  # Default 8 hours
        
        suggestions = []
        
        for i in range(7):
            day = start_date + timedelta(days=i)
            day_name = day.strftime('%A')
            
            # Determine staffing needs based on day and predicted sales
            if day_name in ['Saturday', 'Sunday']:
                base_staff_needed = max(2, len(employees) // 2)
            else:
                base_staff_needed = max(1, len(employees) // 3)
            
            # Adjust based on predicted sales if available
            if predicted_sales:
                day_sales = next((s for s in predicted_sales if s.get('date') == day.strftime('%Y-%m-%d')), None)
                if day_sales and day_sales.get('predicted_revenue', 0) > 1000:
                    base_staff_needed += 1
            
            # Select employees for this day
            available_employees = [e for e in employees if e.is_active]
            
            for j, employee in enumerate(available_employees[:base_staff_needed]):
                # Assign different shift times
                if j == 0:  # Manager/opener
                    start_time = "09:00"
                    end_time = "17:00"
                elif j == 1:  # Mid-shift
                    start_time = "12:00"
                    end_time = "20:00"
                else:  # Closer
                    start_time = "14:00"
                    end_time = "22:00"
                
                suggestions.append({
                    "employee_id": employee.id,
                    "employee_name": employee.full_name,
                    "date": day.strftime('%Y-%m-%d'),
                    "start_time": start_time,
                    "end_time": end_time,
                    "estimated_hours": self._calculate_hours(start_time, end_time),
                    "position": employee.position,
                    "estimated_cost": self._calculate_hours(start_time, end_time) * employee.hourly_rate
                })
        
        return suggestions

    def _calculate_hours(self, start_time: str, end_time: str) -> float:
        start = datetime.strptime(start_time, "%H:%M").time()
        end = datetime.strptime(end_time, "%H:%M").time()
        
        start_datetime = datetime.combine(datetime.today(), start)
        end_datetime = datetime.combine(datetime.today(), end)
        
        if end <= start:
            end_datetime += timedelta(days=1)
        
        return (end_datetime - start_datetime).total_seconds() / 3600

    def get_payroll_summary(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        schedules = self.get_schedules(start_date, end_date)
        
        payroll_data = {}
        total_hours = 0
        total_cost = 0
        
        for schedule in schedules:
            employee = schedule.employee
            if employee.id not in payroll_data:
                payroll_data[employee.id] = {
                    "employee_name": employee.full_name,
                    "position": employee.position,
                    "hourly_rate": employee.hourly_rate,
                    "total_hours": 0,
                    "total_cost": 0,
                    "shifts": []
                }
            
            shift_cost = schedule.hours * employee.hourly_rate
            payroll_data[employee.id]["total_hours"] += schedule.hours
            payroll_data[employee.id]["total_cost"] += shift_cost
            payroll_data[employee.id]["shifts"].append({
                "date": schedule.date.isoformat(),
                "start_time": schedule.start_time,
                "end_time": schedule.end_time,
                "hours": schedule.hours,
                "cost": shift_cost
            })
            
            total_hours += schedule.hours
            total_cost += shift_cost
        
        return {
            "period": {
                "start_date": start_date.strftime('%Y-%m-%d'),
                "end_date": end_date.strftime('%Y-%m-%d')
            },
            "summary": {
                "total_hours": total_hours,
                "total_cost": total_cost,
                "average_hourly_rate": total_cost / total_hours if total_hours > 0 else 0,
                "employees_scheduled": len(payroll_data)
            },
            "employees": list(payroll_data.values())
        }

    def get_employee_performance(self, employee_id: int, days: int = 30) -> Dict[str, Any]:
        employee = self.get_employee(employee_id)
        if not employee:
            return {}
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        schedules = self.get_schedules(start_date, end_date, employee_id)
        
        total_hours = sum(s.hours for s in schedules)
        total_shifts = len(schedules)
        total_cost = total_hours * employee.hourly_rate
        
        # Calculate attendance rate (assuming they were scheduled for every day)
        expected_days = days
        actual_days = len(set(s.date for s in schedules))
        attendance_rate = (actual_days / expected_days) * 100 if expected_days > 0 else 0
        
        return {
            "employee": {
                "id": employee.id,
                "name": employee.full_name,
                "position": employee.position,
                "hourly_rate": employee.hourly_rate
            },
            "period": {
                "start_date": start_date.strftime('%Y-%m-%d'),
                "end_date": end_date.strftime('%Y-%m-%d'),
                "days": days
            },
            "performance": {
                "total_hours": total_hours,
                "total_shifts": total_shifts,
                "total_cost": total_cost,
                "average_hours_per_shift": total_hours / total_shifts if total_shifts > 0 else 0,
                "attendance_rate": attendance_rate,
                "days_worked": actual_days
            }
        }

    def delete_schedule(self, schedule_id: int) -> bool:
        db_schedule = self.get_schedule(schedule_id)
        if not db_schedule:
            return False
        
        self.db.delete(db_schedule)
        self.db.commit()
        return True

    def update_schedule(self, schedule_id: int, start_time: str, end_time: str, 
                       notes: Optional[str] = None) -> Optional[Schedule]:
        db_schedule = self.get_schedule(schedule_id)
        if not db_schedule:
            return None
        
        # Recalculate hours
        start = datetime.strptime(start_time, "%H:%M").time()
        end = datetime.strptime(end_time, "%H:%M").time()
        
        start_datetime = datetime.combine(db_schedule.date, start)
        end_datetime = datetime.combine(db_schedule.date, end)
        
        if end <= start:
            end_datetime += timedelta(days=1)
        
        hours = (end_datetime - start_datetime).total_seconds() / 3600
        
        db_schedule.start_time = start_time
        db_schedule.end_time = end_time
        db_schedule.hours = hours
        if notes is not None:
            db_schedule.notes = notes
        
        self.db.commit()
        self.db.refresh(db_schedule)
        return db_schedule