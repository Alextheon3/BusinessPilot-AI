# 🇬🇷 ΕΡΓΑΝΗ Integration & Greek HR System - Implementation Plan

## 📋 PHASE 1: ADVANCED HR + ΕΡΓΑΝΗ INTEGRATION

### 🔹 Greek Employee Data Models

```python
# backend/app/models/greek_hr.py
from sqlalchemy import Column, Integer, String, Date, Boolean, Float, Enum, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class EmployeeStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINATED = "terminated"
    SUSPENDED = "suspended"

class ContractType(enum.Enum):
    FULL_TIME = "full_time"           # Πλήρης απασχόληση
    PART_TIME = "part_time"           # Μερική απασχόληση
    SEASONAL = "seasonal"             # Εποχιακή
    ROTATING = "rotating"             # Εναλλασσόμενη βάρδια
    SUBSTITUTE = "substitute"         # Αναπληρωτής
    TEMPORARY = "temporary"           # Προσωρινός

class WorkingTimeType(enum.Enum):
    MORNING = "morning"               # Πρωινό
    AFTERNOON = "afternoon"           # Απογευματινό
    NIGHT = "night"                   # Νυχτερινό
    ROTATING_SHIFTS = "rotating"      # Εναλλασσόμενες βάρδιες

class GreekEmployee(Base):
    __tablename__ = "greek_employees"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Personal Information
    full_name = Column(String(255), nullable=False)
    father_name = Column(String(100))                # Πατρώνυμο
    mother_name = Column(String(100))                # Μητρώνυμο
    birth_date = Column(Date)
    birth_place = Column(String(100))               # Τόπος γέννησης
    
    # Greek Tax & Social Security IDs
    afm = Column(String(9), unique=True, nullable=False)      # ΑΦΜ
    amka = Column(String(11), unique=True)                    # ΑΜΚΑ
    ika_number = Column(String(20))                           # Αριθμός Μητρώου ΙΚΑ
    doy = Column(String(100))                                 # ΔΟΥ
    
    # Address Information
    address = Column(String(255))
    postal_code = Column(String(10))
    city = Column(String(100))
    municipality = Column(String(100))               # Δήμος
    prefecture = Column(String(100))                 # Νομός
    
    # Contact Information
    phone = Column(String(20))
    mobile = Column(String(20))
    email = Column(String(255))
    
    # Employment Details
    hire_date = Column(Date, nullable=False)
    termination_date = Column(Date)
    contract_type = Column(Enum(ContractType))
    working_time_type = Column(Enum(WorkingTimeType))
    status = Column(Enum(EmployeeStatus), default=EmployeeStatus.ACTIVE)
    
    # Financial Information
    basic_salary = Column(Float)                     # Βασικός μισθός
    hourly_rate = Column(Float)                      # Ωρομίσθιο
    overtime_rate = Column(Float)                    # Υπερωρίες
    
    # ΕΡΓΑΝΗ Specific Fields
    ergani_employee_id = Column(String(50))          # ΕΡΓΑΝΗ ID
    specialty_code = Column(String(10))              # Κωδικός ειδικότητας
    education_level = Column(String(50))             # Επίπεδο εκπαίδευσης
    
    # Work Schedule
    weekly_hours = Column(Float, default=40)         # Εβδομαδιαίες ώρες
    work_days = Column(String(20), default="1,2,3,4,5")  # Ημέρες εργασίας
    
    # Vacation & Leave
    annual_leave_days = Column(Integer, default=20)  # Ετήσιες άδειες
    sick_leave_days = Column(Integer, default=0)     # Άδειες ασθενείας
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    schedules = relationship("EmployeeSchedule", back_populates="employee")
    payrolls = relationship("PayrollRecord", back_populates="employee")
    ergani_declarations = relationship("ErganiDeclaration", back_populates="employee")

class ErganiDeclaration(Base):
    __tablename__ = "ergani_declarations"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("greek_employees.id"))
    
    declaration_type = Column(String(10))  # E3, E4, E5, etc.
    declaration_date = Column(Date)
    submission_date = Column(Date)
    protocol_number = Column(String(50))   # Αριθμός πρωτοκόλλου
    
    # Form Data (JSON)
    form_data = Column(Text)               # Serialized form data
    pdf_path = Column(String(255))         # Path to generated PDF
    
    status = Column(String(20), default="pending")  # pending, submitted, approved, rejected
    
    employee = relationship("GreekEmployee", back_populates="ergani_declarations")

class PayrollRecord(Base):
    __tablename__ = "payroll_records"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("greek_employees.id"))
    
    pay_period_start = Column(Date)
    pay_period_end = Column(Date)
    
    # Earnings
    basic_salary = Column(Float)
    overtime_pay = Column(Float)
    bonus = Column(Float)
    allowances = Column(Float)              # Επιδόματα
    
    # Deductions
    ika_employee = Column(Float)            # Εισφορές ΙΚΑ εργαζομένου
    ika_employer = Column(Float)            # Εισφορές ΙΚΑ εργοδότη
    tax_deduction = Column(Float)           # Παρακράτηση φόρου
    
    # Totals
    gross_pay = Column(Float)
    net_pay = Column(Float)
    
    # Hours
    regular_hours = Column(Float)
    overtime_hours = Column(Float)
    
    employee = relationship("GreekEmployee", back_populates="payrolls")
```

### 🔹 ΕΡΓΑΝΗ API Integration Service

```python
# backend/app/services/ergani_service.py
from datetime import datetime, date
from typing import Dict, Any, List
import json
import requests
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from app.models.greek_hr import GreekEmployee, ErganiDeclaration
from app.core.config import settings

class ErganiService:
    def __init__(self):
        self.base_url = settings.ERGANI_API_URL  # If available
        self.api_key = settings.ERGANI_API_KEY
        
    async def create_hiring_declaration(self, employee: GreekEmployee) -> Dict[str, Any]:
        \"\"\"
        Δημιουργία δήλωσης πρόσληψης (Ε3 Form)
        \"\"\"
        form_data = {
            "declaration_type": "E3",
            "employee_data": {
                "afm": employee.afm,
                "amka": employee.amka,
                "full_name": employee.full_name,
                "father_name": employee.father_name,
                "mother_name": employee.mother_name,
                "birth_date": employee.birth_date.isoformat(),
                "hire_date": employee.hire_date.isoformat(),
                "contract_type": employee.contract_type.value,
                "working_time_type": employee.working_time_type.value,
                "specialty_code": employee.specialty_code,
                "basic_salary": employee.basic_salary,
                "weekly_hours": employee.weekly_hours
            },
            "employer_data": {
                "afm": settings.COMPANY_AFM,
                "business_name": settings.COMPANY_NAME,
                "kad_code": settings.COMPANY_KAD
            }
        }
        
        # Try API submission first
        try:
            response = await self._submit_to_ergani_api(form_data)
            if response.get("success"):
                return {
                    "status": "submitted",
                    "protocol_number": response.get("protocol_number"),
                    "form_data": form_data
                }
        except Exception as e:
            print(f"API submission failed: {e}")
            
        # Fallback: Generate PDF for manual submission
        pdf_path = await self._generate_e3_pdf(form_data)
        
        return {
            "status": "pdf_generated",
            "pdf_path": pdf_path,
            "form_data": form_data,
            "instructions": "Κατεβάστε το PDF και υποβάλετε το μέσω της πλατφόρμας ΕΡΓΑΝΗ"
        }
    
    async def create_termination_declaration(self, employee: GreekEmployee, termination_date: date, reason: str) -> Dict[str, Any]:
        \"\"\"
        Δημιουργία δήλωσης καταγγελίας (Ε4 Form)
        \"\"\"
        form_data = {
            "declaration_type": "E4",
            "employee_data": {
                "afm": employee.afm,
                "amka": employee.amka,
                "full_name": employee.full_name,
                "termination_date": termination_date.isoformat(),
                "termination_reason": reason
            },
            "employer_data": {
                "afm": settings.COMPANY_AFM,
                "business_name": settings.COMPANY_NAME
            }
        }
        
        pdf_path = await self._generate_e4_pdf(form_data)
        
        return {
            "status": "pdf_generated",
            "pdf_path": pdf_path,
            "form_data": form_data
        }
    
    async def create_schedule_declaration(self, employee: GreekEmployee, schedule_data: Dict) -> Dict[str, Any]:
        \"\"\"
        Δημιουργία δήλωσης προγράμματος εργασίας (Ε5 Form)
        \"\"\"
        form_data = {
            "declaration_type": "E5",
            "employee_data": {
                "afm": employee.afm,
                "amka": employee.amka,
                "full_name": employee.full_name
            },
            "schedule_data": schedule_data,
            "employer_data": {
                "afm": settings.COMPANY_AFM,
                "business_name": settings.COMPANY_NAME
            }
        }
        
        pdf_path = await self._generate_e5_pdf(form_data)
        
        return {
            "status": "pdf_generated",
            "pdf_path": pdf_path,
            "form_data": form_data
        }
    
    async def _submit_to_ergani_api(self, form_data: Dict) -> Dict[str, Any]:
        \"\"\"
        Υποβολή στο API της ΕΡΓΑΝΗ (εάν διαθέσιμο)
        \"\"\"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/declarations",
                json=form_data,
                headers=headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"API Error: {response.status_code}")
    
    async def _generate_e3_pdf(self, form_data: Dict) -> str:
        \"\"\"
        Δημιουργία PDF για δήλωση πρόσληψης Ε3
        \"\"\"
        filename = f"E3_hiring_{form_data['employee_data']['afm']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = f"static/ergani_forms/{filename}"
        
        # Create PDF with Greek font support
        c = canvas.Canvas(filepath, pagesize=A4)
        
        # Register Greek font
        pdfmetrics.registerFont(TTFont('DejaVuSans', 'fonts/DejaVuSans.ttf'))
        c.setFont('DejaVuSans', 12)
        
        # Header
        c.drawString(100, 750, "ΔΗΛΩΣΗ ΠΡΟΣΛΗΨΗΣ ΕΡΓΑΖΟΜΕΝΟΥ (Ε3)")
        c.drawString(100, 730, f"Ημερομηνία: {datetime.now().strftime('%d/%m/%Y')}")
        
        # Employee Data
        y = 680
        employee_data = form_data['employee_data']
        
        c.drawString(100, y, f"Επωνυμία: {employee_data['full_name']}")
        c.drawString(100, y-20, f"Πατρώνυμο: {employee_data['father_name']}")
        c.drawString(100, y-40, f"Μητρώνυμο: {employee_data['mother_name']}")
        c.drawString(100, y-60, f"ΑΦΜ: {employee_data['afm']}")
        c.drawString(100, y-80, f"ΑΜΚΑ: {employee_data['amka']}")
        c.drawString(100, y-100, f"Ημερομηνία γέννησης: {employee_data['birth_date']}")
        c.drawString(100, y-120, f"Ημερομηνία πρόσληψης: {employee_data['hire_date']}")
        c.drawString(100, y-140, f"Είδος απασχόλησης: {employee_data['contract_type']}")
        c.drawString(100, y-160, f"Βασικός μισθός: {employee_data['basic_salary']} €")
        c.drawString(100, y-180, f"Εβδομαδιαίες ώρες: {employee_data['weekly_hours']}")
        
        # Employer Data
        y = 450
        employer_data = form_data['employer_data']
        
        c.drawString(100, y, "ΣΤΟΙΧΕΙΑ ΕΡΓΟΔΟΤΗ")
        c.drawString(100, y-20, f"Επωνυμία: {employer_data['business_name']}")
        c.drawString(100, y-40, f"ΑΦΜ: {employer_data['afm']}")
        c.drawString(100, y-60, f"ΚΑΔ: {employer_data['kad_code']}")
        
        # Signature area
        c.drawString(100, 200, "Υπογραφή Εργοδότη: _________________________")
        c.drawString(100, 180, "Σφραγίδα: _________________________")
        
        c.save()
        
        return filepath
    
    async def _generate_e4_pdf(self, form_data: Dict) -> str:
        \"\"\"
        Δημιουργία PDF για δήλωση καταγγελίας Ε4
        \"\"\"
        # Similar implementation for E4 form
        pass
    
    async def _generate_e5_pdf(self, form_data: Dict) -> str:
        \"\"\"
        Δημιουργία PDF για δήλωση προγράμματος εργασίας Ε5
        \"\"\"
        # Similar implementation for E5 form
        pass
```

### 🔹 AI-Powered Shift Scheduling

```python
# backend/app/services/ai_scheduler.py
from datetime import datetime, timedelta, date
from typing import List, Dict, Any
import pandas as pd
from app.models.greek_hr import GreekEmployee
from app.services.openai_service import OpenAIService
from app.services.weather_service import WeatherService
from app.services.sales_forecast_service import SalesForecastService

class AISchedulerService:
    def __init__(self):
        self.openai_service = OpenAIService()
        self.weather_service = WeatherService()
        self.sales_forecast = SalesForecastService()
    
    async def generate_optimal_schedule(
        self, 
        employees: List[GreekEmployee], 
        start_date: date, 
        end_date: date,
        constraints: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        \"\"\"
        Δημιουργία βέλτιστου προγράμματος εργασίας με AI
        \"\"\"
        
        # Gather contextual data
        weather_forecast = await self.weather_service.get_forecast(start_date, end_date)
        sales_forecast = await self.sales_forecast.predict_sales(start_date, end_date)
        
        # Greek holiday calendar
        greek_holidays = self._get_greek_holidays(start_date, end_date)
        
        # Employee availability and preferences
        employee_data = []
        for emp in employees:
            fatigue_score = await self._calculate_fatigue_score(emp)
            preferred_shifts = await self._get_preferred_shifts(emp)
            
            employee_data.append({
                "id": emp.id,
                "name": emp.full_name,
                "contract_type": emp.contract_type.value,
                "weekly_hours": emp.weekly_hours,
                "fatigue_score": fatigue_score,
                "preferred_shifts": preferred_shifts,
                "hourly_rate": emp.hourly_rate
            })
        
        # AI Prompt for schedule optimization
        prompt = f\"\"\"
        Δημιούργησε βέλτιστο πρόγραμμα εργασίας για ελληνική επιχείρηση:
        
        ΕΡΓΑΖΟΜΕΝΟΙ:
        {json.dumps(employee_data, ensure_ascii=False, indent=2)}
        
        ΠΡΟΒΛΕΨΗ ΠΩΛΗΣΕΩΝ:
        {json.dumps(sales_forecast, ensure_ascii=False, indent=2)}
        
        ΚΑΙΡΙΚΕΣ ΣΥΝΘΗΚΕΣ:
        {json.dumps(weather_forecast, ensure_ascii=False, indent=2)}
        
        ΑΡΓΙΕΣ/ΕΚΔΗΛΩΣΕΙΣ:
        {json.dumps(greek_holidays, ensure_ascii=False, indent=2)}
        
        ΠΕΡΙΟΡΙΣΜΟΙ:
        - Μέγιστες εβδομαδιαίες ώρες: 40
        - Ελάχιστη ανάπαυση μεταξύ βαρδιών: 11 ώρες
        - Μέγιστες συνεχόμενες ημέρες: 6
        - Κόστος υπερωριών: 25% επιπλέον
        
        Δώσε πρόγραμμα σε JSON format με:
        - Ημερομηνία και ώρες για κάθε εργαζόμενο
        - Αιτιολόγηση για τις αποφάσεις
        - Εκτίμηση κόστους
        - Συμβουλές για βελτιστοποίηση
        \"\"\"
        
        response = await self.openai_service.generate_completion(
            prompt=prompt,
            model="gpt-4",
            temperature=0.3
        )
        
        schedule_data = json.loads(response.choices[0].message.content)
        
        # Validate and format schedule
        validated_schedule = await self._validate_schedule(schedule_data, employees)
        
        return {
            "schedule": validated_schedule,
            "optimization_notes": schedule_data.get("optimization_notes", ""),
            "total_cost": schedule_data.get("total_cost", 0),
            "ergani_export": await self._prepare_ergani_export(validated_schedule)
        }
    
    async def _calculate_fatigue_score(self, employee: GreekEmployee) -> float:
        \"\"\"
        Υπολογισμός βαθμού κόπωσης εργαζομένου
        \"\"\"
        # Get recent work hours
        recent_hours = await self._get_recent_work_hours(employee, days=7)
        
        # Calculate fatigue based on:
        # - Total hours worked
        # - Consecutive days worked
        # - Night shifts
        # - Overtime hours
        
        base_score = min(recent_hours / employee.weekly_hours, 1.0)
        
        # Add penalties for night shifts, overtime, etc.
        return min(base_score * 1.2, 1.0)
    
    def _get_greek_holidays(self, start_date: date, end_date: date) -> List[Dict]:
        \"\"\"
        Ελληνικές αργίες και εκδηλώσεις
        \"\"\"
        holidays = [
            {"date": "2024-01-01", "name": "Πρωτοχρονιά", "type": "national"},
            {"date": "2024-01-06", "name": "Θεοφάνεια", "type": "national"},
            {"date": "2024-03-25", "name": "25η Μαρτίου", "type": "national"},
            {"date": "2024-05-01", "name": "Πρωτομαγιά", "type": "national"},
            {"date": "2024-08-15", "name": "Δεκαπενταύγουστος", "type": "national"},
            {"date": "2024-10-28", "name": "28η Οκτωβρίου", "type": "national"},
            {"date": "2024-12-25", "name": "Χριστούγεννα", "type": "national"},
            {"date": "2024-12-26", "name": "Δεύτερη μέρα Χριστουγέννων", "type": "national"}
        ]
        
        # Add Easter dates (calculated dynamically)
        easter_dates = self._calculate_orthodox_easter(start_date.year)
        holidays.extend(easter_dates)
        
        return [h for h in holidays if start_date <= datetime.strptime(h["date"], "%Y-%m-%d").date() <= end_date]
```

### 🔹 Greek HR AI Assistant

```python
# backend/app/services/hr_assistant.py
from typing import Dict, Any
from app.services.openai_service import OpenAIService
from app.models.greek_hr import GreekEmployee, ErganiDeclaration, PayrollRecord

class GreekHRAssistant:
    def __init__(self):
        self.openai_service = OpenAIService()
        
    async def process_hr_query(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        \"\"\"
        Επεξεργασία ερωτήσεων HR με ελληνικό context
        \"\"\"
        
        system_prompt = \"\"\"
        Είσαι ο έμπειρος σύμβουλος HR για ελληνικές επιχειρήσεις. 
        Γνωρίζεις άριστα την ελληνική νομοθεσία, τις διαδικασίες ΕΡΓΑΝΗ, 
        και τις υποχρεώσεις εργοδότη.
        
        Απαντάς στα ελληνικά με:
        - Σαφήνεια και επαγγελματισμό
        - Αναφορές στους νόμους όπου χρειάζεται
        - Πρακτικές συμβουλές
        - Φιλικό τόνο αλλά σοβαρό περιεχόμενο
        
        Πάντα δίνεις παραδείγματα και βήματα δράσης.
        \"\"\"
        
        # Common HR queries and responses
        hr_knowledge = {
            "εργανη_προσληψη": {
                "answer": "Για την πρόσληψη εργαζομένου στην ΕΡΓΑΝΗ πρέπει να υποβάλεις δήλωση Ε3 πριν την έναρξη εργασίας. Τα βήματα είναι:\\n1. Συμπλήρωση φόρμας Ε3\\n2. Υποβολή στην πλατφόρμα ΕΡΓΑΝΗ\\n3. Λήψη αριθμού πρωτοκόλλου\\n4. Αρχειοθέτηση για 5 χρόνια",
                "next_steps": ["Δημιουργία φόρμας Ε3", "Έλεγχος στοιχείων εργαζομένου", "Υποβολή στην ΕΡΓΑΝΗ"]
            },
            "υπερωριες": {
                "answer": "Οι υπερωρίες αμείβονται με 20% επιπλέον το πρώτο 2ωρο και 40% για τις επόμενες. Μέγιστες υπερωρίες: 150 ετησίως.",
                "calculation": "Βασικός μισθός ÷ 8 ώρες × 1.20 (πρώτες 2 ώρες) × 1.40 (επόμενες ώρες)"
            },
            "αδειες": {
                "answer": "Ετήσιες άδειες: 20 εργάσιμες ημέρες (πλήρης απασχόληση), 24 ημέρες (άνω των 35 ετών ή 2 χρόνια προϋπηρεσίας).",
                "calculation": "Μερική απασχόληση: αναλογικά με τις ώρες εργασίας"
            }
        }
        
        user_prompt = f\"\"\"
        Ερώτηση χρήστη: {query}
        
        Διαθέσιμα δεδομένα επιχείρησης:
        {json.dumps(context, ensure_ascii=False, indent=2)}
        
        Βοήθησέ με με πρακτικές συμβουλές και συγκεκριμένα βήματα.
        \"\"\"
        
        response = await self.openai_service.generate_completion(
            system_prompt=system_prompt,
            prompt=user_prompt,
            model="gpt-4",
            temperature=0.3
        )
        
        return {
            "answer": response.choices[0].message.content,
            "suggested_actions": await self._extract_suggested_actions(query, response),
            "related_forms": await self._suggest_related_forms(query)
        }
    
    async def _extract_suggested_actions(self, query: str, response: Any) -> List[str]:
        \"\"\"
        Εξαγωγή προτεινόμενων ενεργειών
        \"\"\"
        # Extract actionable items from the response
        actions = []
        
        if "πρόσληψη" in query.lower():
            actions.extend([
                "Δημιουργία φόρμας Ε3",
                "Συλλογή δικαιολογητικών εργαζομένου",
                "Υποβολή στην ΕΡΓΑΝΗ"
            ])
        
        if "άδεια" in query.lower():
            actions.extend([
                "Έλεγχος διαθέσιμων ημερών άδειας",
                "Προγραμματισμός αντικατάστασης",
                "Ενημέρωση προγράμματος εργασίας"
            ])
        
        return actions
    
    async def _suggest_related_forms(self, query: str) -> List[Dict[str, str]]:
        \"\"\"
        Πρόταση σχετικών φορμών ΕΡΓΑΝΗ
        \"\"\"
        form_suggestions = []
        
        if "πρόσληψη" in query.lower():
            form_suggestions.append({
                "form": "Ε3",
                "description": "Δήλωση πρόσληψης εργαζομένου",
                "urgency": "Πριν την έναρξη εργασίας"
            })
        
        if "απόλυση" in query.lower() or "καταγγελία" in query.lower():
            form_suggestions.append({
                "form": "Ε4",
                "description": "Δήλωση καταγγελίας σύμβασης",
                "urgency": "Εντός 15 ημερών"
            })
        
        return form_suggestions

# Sample HR Assistant Prompts for Common Greek Business Scenarios
HR_ASSISTANT_PROMPTS = {
    "payroll_inquiry": \"\"\"
    Ερώτηση: {query}
    
    Είσαι ο ειδικός μισθοδοσίας για ελληνικές επιχειρήσεις. 
    Δώσε πλήρη απάντηση που περιλαμβάνει:
    1. Υπολογισμό μισθοδοσίας
    2. Εισφορές ΙΚΑ/ΕΦΚΑ
    3. Φορολογικές υποχρεώσεις
    4. Σχετικές προθεσμίες
    
    Χρησιμοποίησε τα τρέχοντα δεδομένα: {employee_data}
    \"\"\",
    
    "legal_compliance": \"\"\"
    Νομική ερώτηση: {query}
    
    Ως νομικός σύμβουλος HR, δώσε:
    1. Τι λέει ο νόμος
    2. Τι πρέπει να κάνει η επιχείρηση
    3. Τι κινδύνους αποφεύγει
    4. Συγκεκριμένα βήματα συμμόρφωσης
    
    Αναφέρου στους σχετικούς νόμους και προθεσμίες.
    \"\"\",
    
    "schedule_optimization": \"\"\"
    Πρόγραμμα εργασίας: {query}
    
    Ως ειδικός προγραμματισμού, προτείνεις:
    1. Βέλτιστη κατανομή βαρδιών
    2. Συμμόρφωση με νομοθεσία
    3. Εξοικονόμηση κόστους
    4. Ικανοποίηση εργαζομένων
    
    Λάβε υπόψη: {schedule_constraints}
    \"\"\"
}
```

### 🔹 API Endpoints for Greek HR System

```python
# backend/app/api/v1/greek_hr.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from typing import List, Dict, Any
from datetime import date
from app.services.ergani_service import ErganiService
from app.services.ai_scheduler import AISchedulerService
from app.services.hr_assistant import GreekHRAssistant
from app.models.greek_hr import GreekEmployee, ErganiDeclaration
from app.schemas.greek_hr import GreekEmployeeCreate, ScheduleRequest, HRQueryRequest

router = APIRouter()

@router.post("/employees", response_model=GreekEmployeeResponse)
async def create_greek_employee(
    employee: GreekEmployeeCreate,
    ergani_service: ErganiService = Depends()
):
    \"\"\"
    Δημιουργία νέου εργαζομένου με αυτόματη δήλωση στην ΕΡΓΑΝΗ
    \"\"\"
    # Create employee record
    db_employee = GreekEmployee(**employee.dict())
    db.add(db_employee)
    db.commit()
    
    # Auto-generate ΕΡΓΑΝΗ declaration
    ergani_result = await ergani_service.create_hiring_declaration(db_employee)
    
    return {
        "employee": db_employee,
        "ergani_declaration": ergani_result,
        "next_steps": [
            "Ελέγξτε τα στοιχεία της δήλωσης",
            "Κατεβάστε το PDF εάν χρειάζεται",
            "Αρχειοθετήστε τα δικαιολογητικά"
        ]
    }

@router.post("/schedule/optimize")
async def optimize_schedule(
    request: ScheduleRequest,
    scheduler: AISchedulerService = Depends()
):
    \"\"\"
    Βελτιστοποίηση προγράμματος εργασίας με AI
    \"\"\"
    employees = await get_employees_by_ids(request.employee_ids)
    
    schedule = await scheduler.generate_optimal_schedule(
        employees=employees,
        start_date=request.start_date,
        end_date=request.end_date,
        constraints=request.constraints
    )
    
    return {
        "schedule": schedule,
        "ergani_export": schedule["ergani_export"],
        "cost_analysis": schedule["cost_analysis"]
    }

@router.post("/assistant/query")
async def hr_assistant_query(
    query: HRQueryRequest,
    hr_assistant: GreekHRAssistant = Depends()
):
    \"\"\"
    Ερωτήσεις στον AI HR Assistant
    \"\"\"
    context = await get_hr_context(query.employee_ids)
    
    response = await hr_assistant.process_hr_query(
        query=query.question,
        context=context
    )
    
    return {
        "answer": response["answer"],
        "suggested_actions": response["suggested_actions"],
        "related_forms": response["related_forms"],
        "confidence": response.get("confidence", 0.9)
    }

@router.get("/ergani/forms/{declaration_type}")
async def get_ergani_form_template(
    declaration_type: str,
    employee_id: int = None
):
    \"\"\"
    Λήψη φόρμας ΕΡΓΑΝΗ (κενή ή προσυμπληρωμένη)
    \"\"\"
    if employee_id:
        employee = await get_employee_by_id(employee_id)
        form_data = await generate_prefilled_form(declaration_type, employee)
    else:
        form_data = await generate_blank_form(declaration_type)
    
    return {
        "form_type": declaration_type,
        "form_data": form_data,
        "instructions": ERGANI_INSTRUCTIONS[declaration_type]
    }

@router.post("/ergani/submit")
async def submit_ergani_declaration(
    form_data: Dict[str, Any],
    files: List[UploadFile] = File(None)
):
    \"\"\"
    Υποβολή δήλωσης στην ΕΡΓΑΝΗ
    \"\"\"
    ergani_service = ErganiService()
    
    result = await ergani_service.submit_declaration(
        form_data=form_data,
        attachments=files
    )
    
    return {
        "status": result["status"],
        "protocol_number": result.get("protocol_number"),
        "pdf_path": result.get("pdf_path"),
        "message": "Η δήλωση υποβλήθηκε επιτυχώς!" if result["status"] == "success" else "Δημιουργήθηκε PDF για χειροκίνητη υποβολή"
    }

# Greek HR Constants
ERGANI_INSTRUCTIONS = {
    "E3": "Η δήλωση πρόσληψης πρέπει να υποβληθεί πριν την έναρξη εργασίας",
    "E4": "Η δήλωση καταγγελίας πρέπει να υποβληθεί εντός 15 ημερών",
    "E5": "Η δήλωση προγράμματος εργασίας πρέπει να υποβληθεί πριν την εφαρμογή του"
}

GREEK_BUSINESS_TYPES = {
    "retail": "Λιανικό εμπόριο",
    "restaurant": "Εστιατόριο",
    "cafe": "Καφετέρια",
    "service": "Υπηρεσίες",
    "healthcare": "Υγεία",
    "beauty": "Κομμωτήριο/Κέντρο αισθητικής"
}
```

### 🔹 Frontend Integration

```typescript
// frontend/src/types/greek-hr.ts
export interface GreekEmployee {
  id: number;
  full_name: string;
  father_name?: string;
  mother_name?: string;
  afm: string;
  amka?: string;
  ika_number?: string;
  doy?: string;
  birth_date?: string;
  hire_date: string;
  contract_type: ContractType;
  working_time_type: WorkingTimeType;
  basic_salary?: number;
  hourly_rate?: number;
  weekly_hours: number;
  status: EmployeeStatus;
}

export interface ErganiDeclaration {
  id: number;
  employee_id: number;
  declaration_type: string;
  form_data: any;
  pdf_path?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  protocol_number?: string;
}

export interface ScheduleOptimization {
  schedule: any;
  cost_analysis: any;
  ergani_export: any;
  optimization_notes: string;
}

// frontend/src/components/hr/ErganiIntegration.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '../../contexts/LanguageContext';
import { erganiApi } from '../../services/ergani-api';

const ErganiIntegration: React.FC = () => {
  const { t } = useLanguage();
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  
  const createHiringDeclaration = useMutation({
    mutationFn: (employeeId: number) => erganiApi.createHiringDeclaration(employeeId),
    onSuccess: (data) => {
      toast.success('Η δήλωση δημιουργήθηκε επιτυχώς!');
      if (data.pdf_path) {
        window.open(data.pdf_path, '_blank');
      }
    }
  });
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Ενσωμάτωση ΕΡΓΑΝΗ
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Επιλέξτε εργαζόμενο
          </label>
          <select 
            value={selectedEmployee || ''}
            onChange={(e) => setSelectedEmployee(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Επιλέξτε εργαζόμενο...</option>
            {employees?.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} - {emp.afm}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => selectedEmployee && createHiringDeclaration.mutate(selectedEmployee)}
            disabled={!selectedEmployee || createHiringDeclaration.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createHiringDeclaration.isPending ? 'Δημιουργία...' : 'Δήλωση Πρόσληψης (Ε3)'}
          </button>
          
          <button
            onClick={() => selectedEmployee && createTerminationDeclaration(selectedEmployee)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Δήλωση Καταγγελίας (Ε4)
          </button>
          
          <button
            onClick={() => selectedEmployee && createScheduleDeclaration(selectedEmployee)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Πρόγραμμα Εργασίας (Ε5)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErganiIntegration;
```

This completes the ΕΡΓΑΝΗ integration plan. The system provides:

1. **Complete Greek employee data models** with all required fields
2. **Automated ΕΡΓΑΝΗ form generation** (PDF fallback if API unavailable)
3. **AI-powered shift scheduling** considering weather, sales, and Greek holidays
4. **Greek HR Assistant** with local legal knowledge
5. **Full API integration** for seamless frontend experience

The system is designed to be compliant with Greek labor laws and provides both automated and manual workflows for ΕΡΓΑΝΗ integration.