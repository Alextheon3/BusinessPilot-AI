"""
Predictive Timeline & Event Calendar Service
AI-powered prediction of business obligations and deadlines
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta, date
import calendar
import json
from dateutil.relativedelta import relativedelta

logger = logging.getLogger(__name__)

class EventType(Enum):
    TAX_DEADLINE = "tax_deadline"
    ERGANI_DEADLINE = "ergani_deadline"
    INSURANCE_PAYMENT = "insurance_payment"
    UTILITY_PAYMENT = "utility_payment"
    CONTRACT_RENEWAL = "contract_renewal"
    GRANT_APPLICATION = "grant_application"
    BUSINESS_LICENSE = "business_license"
    PAYROLL_PROCESSING = "payroll_processing"
    VAT_SUBMISSION = "vat_submission"
    SEASONAL_PEAK = "seasonal_peak"
    COMPLIANCE_CHECK = "compliance_check"

class Priority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class EventStatus(Enum):
    UPCOMING = "upcoming"
    DUE_SOON = "due_soon"
    OVERDUE = "overdue"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

@dataclass
class PredictiveEvent:
    id: str
    title: str
    description: str
    event_type: EventType
    due_date: datetime
    priority: Priority
    status: EventStatus
    estimated_duration: int  # in minutes
    cost_estimate: Optional[float] = None
    recurrence: Optional[str] = None  # daily, weekly, monthly, quarterly, yearly
    business_impact: str = "medium"  # low, medium, high
    automation_possible: bool = False
    required_documents: List[str] = None
    responsible_person: Optional[str] = None
    government_agency: Optional[str] = None
    penalties_if_missed: Optional[str] = None
    ai_suggestions: List[str] = None

@dataclass
class TimelinePrediction:
    period: str  # "next_7_days", "next_30_days", "next_quarter"
    events: List[PredictiveEvent]
    workload_distribution: Dict[str, int]
    cost_projections: Dict[str, float]
    risk_assessment: Dict[str, Any]
    ai_recommendations: List[str]

class PredictiveTimelineService:
    """
    Service for generating AI-powered predictive timelines and event calendars
    """
    
    def __init__(self):
        self.business_patterns = self._initialize_business_patterns()
        self.government_schedules = self._initialize_government_schedules()
        self.seasonal_patterns = self._initialize_seasonal_patterns()
        
    def _initialize_business_patterns(self) -> Dict[str, Any]:
        """Initialize common Greek business patterns"""
        return {
            'tax_calendar': {
                'quarterly_vat': [
                    {'month': 1, 'day': 27},  # Q4 previous year
                    {'month': 4, 'day': 29},  # Q1
                    {'month': 7, 'day': 28},  # Q2
                    {'month': 10, 'day': 28}  # Q3
                ],
                'annual_tax_return': {'month': 6, 'day': 30},
                'property_tax': [
                    {'month': 9, 'day': 30},
                    {'month': 12, 'day': 31}
                ]
            },
            'ergani_patterns': {
                'monthly_declarations': {'day': 20},  # By 20th of each month
                'new_hires': {'immediate': True},
                'contract_changes': {'advance_notice': 5}
            },
            'insurance_patterns': {
                'efka_contributions': {'day': 15},  # Monthly by 15th
                'accident_insurance': {'quarterly': True}
            }
        }
    
    def _initialize_government_schedules(self) -> Dict[str, Any]:
        """Initialize government agency schedules"""
        return {
            'aade': {
                'office_hours': {'start': 8, 'end': 14},
                'closed_days': ['saturday', 'sunday'],
                'holiday_processing': False
            },
            'efka': {
                'office_hours': {'start': 8, 'end': 15},
                'closed_days': ['saturday', 'sunday'],
                'online_services': True
            },
            'ergani': {
                'available_24_7': True,
                'maintenance_windows': ['sunday_02:00_05:00']
            }
        }
    
    def _initialize_seasonal_patterns(self) -> Dict[str, Any]:
        """Initialize seasonal business patterns"""
        return {
            'retail': {
                'peak_seasons': [
                    {'months': [11, 12], 'factor': 1.8, 'reason': 'Χριστούγεννα'},
                    {'months': [3, 4], 'factor': 1.3, 'reason': 'Πάσχα'},
                    {'months': [7, 8], 'factor': 1.5, 'reason': 'Καλοκαιρινές διακοπές'}
                ],
                'low_seasons': [
                    {'months': [1, 2], 'factor': 0.7, 'reason': 'Μετά τις γιορτές'},
                    {'months': [9, 10], 'factor': 0.8, 'reason': 'Επιστροφή από διακοπές'}
                ]
            },
            'tourism': {
                'peak_seasons': [
                    {'months': [6, 7, 8, 9], 'factor': 2.5, 'reason': 'Τουριστική σεζόν'}
                ],
                'low_seasons': [
                    {'months': [11, 12, 1, 2, 3], 'factor': 0.3, 'reason': 'Χειμερινή περίοδος'}
                ]
            }
        }
    
    async def generate_predictive_timeline(
        self, 
        business_type: str, 
        period: str = "next_30_days",
        user_id: int = None
    ) -> TimelinePrediction:
        """Generate AI-powered predictive timeline"""
        
        try:
            # Determine time range
            start_date = datetime.now()
            if period == "next_7_days":
                end_date = start_date + timedelta(days=7)
            elif period == "next_30_days":
                end_date = start_date + timedelta(days=30)
            elif period == "next_quarter":
                end_date = start_date + relativedelta(months=3)
            else:
                end_date = start_date + timedelta(days=30)
            
            # Generate events
            events = []
            
            # Tax-related events
            events.extend(await self._generate_tax_events(start_date, end_date, business_type))
            
            # ERGANI events
            events.extend(await self._generate_ergani_events(start_date, end_date))
            
            # Insurance events
            events.extend(await self._generate_insurance_events(start_date, end_date))
            
            # Utility events
            events.extend(await self._generate_utility_events(start_date, end_date))
            
            # Contract renewals
            events.extend(await self._generate_contract_events(start_date, end_date))
            
            # Grant applications
            events.extend(await self._generate_grant_events(start_date, end_date))
            
            # Seasonal events
            events.extend(await self._generate_seasonal_events(start_date, end_date, business_type))
            
            # Sort events by date
            events.sort(key=lambda x: x.due_date)
            
            # Calculate workload distribution
            workload = self._calculate_workload_distribution(events)
            
            # Calculate cost projections
            costs = self._calculate_cost_projections(events)
            
            # Assess risks
            risks = self._assess_timeline_risks(events)
            
            # Generate AI recommendations
            recommendations = self._generate_ai_recommendations(events, business_type)
            
            return TimelinePrediction(
                period=period,
                events=events,
                workload_distribution=workload,
                cost_projections=costs,
                risk_assessment=risks,
                ai_recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Error generating predictive timeline: {str(e)}")
            return TimelinePrediction(
                period=period,
                events=[],
                workload_distribution={},
                cost_projections={},
                risk_assessment={'error': str(e)},
                ai_recommendations=["Σφάλμα στη δημιουργία χρονοδιαγράμματος"]
            )
    
    async def _generate_tax_events(self, start_date: datetime, end_date: datetime, business_type: str) -> List[PredictiveEvent]:
        """Generate tax-related events"""
        events = []
        
        # VAT deadlines
        vat_deadlines = self.business_patterns['tax_calendar']['quarterly_vat']
        for deadline in vat_deadlines:
            for year in [start_date.year, end_date.year]:
                due_date = datetime(year, deadline['month'], deadline['day'])
                if start_date <= due_date <= end_date:
                    events.append(PredictiveEvent(
                        id=f"vat_{year}_{deadline['month']}",
                        title=f"Δήλωση ΦΠΑ - Τρίμηνο {(deadline['month']-1)//3 + 1}",
                        description=f"Υποβολή δήλωσης ΦΠΑ για το τρίμηνο που έληξε",
                        event_type=EventType.VAT_SUBMISSION,
                        due_date=due_date,
                        priority=Priority.HIGH,
                        status=EventStatus.UPCOMING,
                        estimated_duration=120,
                        cost_estimate=0.0,
                        recurrence="quarterly",
                        business_impact="high",
                        automation_possible=True,
                        required_documents=["Μητρώο πωλήσεων", "Μητρώο αγορών", "Φορολογικά στοιχεία"],
                        responsible_person="Λογιστής",
                        government_agency="ΑΑΔΕ",
                        penalties_if_missed="Πρόστιμο 150€ + 5% επί του φόρου",
                        ai_suggestions=[
                            "Προετοιμάστε τα έγγραφα 5 ημέρες νωρίτερα",
                            "Ελέγξτε τους λογαριασμούς για παραλείψεις",
                            "Χρησιμοποιήστε το myDATA για εξαγωγή δεδομένων"
                        ]
                    ))
        
        # Annual tax return
        annual_deadline = self.business_patterns['tax_calendar']['annual_tax_return']
        for year in [start_date.year, end_date.year]:
            due_date = datetime(year, annual_deadline['month'], annual_deadline['day'])
            if start_date <= due_date <= end_date:
                events.append(PredictiveEvent(
                    id=f"annual_tax_{year}",
                    title=f"Ετήσια Φορολογική Δήλωση {year-1}",
                    description=f"Υποβολή φορολογικής δήλωσης για το έτος {year-1}",
                    event_type=EventType.TAX_DEADLINE,
                    due_date=due_date,
                    priority=Priority.CRITICAL,
                    status=EventStatus.UPCOMING,
                    estimated_duration=240,
                    cost_estimate=300.0,
                    recurrence="yearly",
                    business_impact="high",
                    automation_possible=False,
                    required_documents=["Ισολογισμός", "Φορολογικά στοιχεία", "Παραστατικά"],
                    responsible_person="Λογιστής",
                    government_agency="ΑΑΔΕ",
                    penalties_if_missed="Πρόστιμο 300€ + 5% επί του φόρου",
                    ai_suggestions=[
                        "Ξεκινήστε προετοιμασία 2 μήνες νωρίτερα",
                        "Συγκεντρώστε όλα τα παραστατικά",
                        "Ελέγξτε τους λογαριασμούς για ακρίβεια"
                    ]
                ))
        
        return events
    
    async def _generate_ergani_events(self, start_date: datetime, end_date: datetime) -> List[PredictiveEvent]:
        """Generate ERGANI-related events"""
        events = []
        
        # Monthly declarations
        current_date = start_date.replace(day=1)
        while current_date <= end_date:
            # Monthly declaration deadline is 20th of each month
            deadline = current_date.replace(day=20)
            if start_date <= deadline <= end_date:
                events.append(PredictiveEvent(
                    id=f"ergani_monthly_{current_date.year}_{current_date.month}",
                    title=f"Μηνιαία Δήλωση ΕΡΓΑΝΗ - {current_date.strftime('%B %Y')}",
                    description="Υποβολή μηνιαίας δήλωσης εργαζομένων στην ΕΡΓΑΝΗ",
                    event_type=EventType.ERGANI_DEADLINE,
                    due_date=deadline,
                    priority=Priority.HIGH,
                    status=EventStatus.UPCOMING,
                    estimated_duration=60,
                    cost_estimate=0.0,
                    recurrence="monthly",
                    business_impact="high",
                    automation_possible=True,
                    required_documents=["Μισθοδοσία", "Ωρολόγιο πρόγραμμα", "Στοιχεία εργαζομένων"],
                    responsible_person="HR/Λογιστής",
                    government_agency="ΕΡΓΑΝΗ",
                    penalties_if_missed="Πρόστιμο 100€ - 1.000€ ανά εργαζόμενο",
                    ai_suggestions=[
                        "Ενημερώστε τυχόν αλλαγές στο προσωπικό",
                        "Ελέγξτε τις ώρες εργασίας",
                        "Χρησιμοποιήστε τη βάση δεδομένων για αυτόματη συμπλήρωση"
                    ]
                ))
            
            current_date += relativedelta(months=1)
        
        return events
    
    async def _generate_insurance_events(self, start_date: datetime, end_date: datetime) -> List[PredictiveEvent]:
        """Generate insurance-related events"""
        events = []
        
        # Monthly EFKA contributions
        current_date = start_date.replace(day=1)
        while current_date <= end_date:
            deadline = current_date.replace(day=15)
            if start_date <= deadline <= end_date:
                events.append(PredictiveEvent(
                    id=f"efka_monthly_{current_date.year}_{current_date.month}",
                    title=f"Εισφορές ΕΦΚΑ - {current_date.strftime('%B %Y')}",
                    description="Καταβολή μηνιαίων ασφαλιστικών εισφορών",
                    event_type=EventType.INSURANCE_PAYMENT,
                    due_date=deadline,
                    priority=Priority.HIGH,
                    status=EventStatus.UPCOMING,
                    estimated_duration=30,
                    cost_estimate=500.0,  # Estimated average
                    recurrence="monthly",
                    business_impact="high",
                    automation_possible=True,
                    required_documents=["Μισθοδοσία", "Αναλυτικές Περιοδικές Δηλώσεις"],
                    responsible_person="Λογιστής",
                    government_agency="ΕΦΚΑ",
                    penalties_if_missed="Πρόστιμο 5% + τόκοι υπερημερίας",
                    ai_suggestions=[
                        "Ελέγξτε τους λογαριασμούς για υπόλοιπα",
                        "Προγραμματίστε αυτόματη πληρωμή",
                        "Ενημερώστε τυχόν αλλαγές στο προσωπικό"
                    ]
                ))
            
            current_date += relativedelta(months=1)
        
        return events
    
    async def _generate_utility_events(self, start_date: datetime, end_date: datetime) -> List[PredictiveEvent]:
        """Generate utility payment events"""
        events = []
        
        # Bimonthly electricity bills
        current_date = start_date.replace(day=1)
        while current_date <= end_date:
            if current_date.month % 2 == 0:  # Even months
                deadline = current_date.replace(day=25)
                if start_date <= deadline <= end_date:
                    events.append(PredictiveEvent(
                        id=f"electricity_{current_date.year}_{current_date.month}",
                        title=f"Λογαριασμός Ηλεκτρικού - {current_date.strftime('%B %Y')}",
                        description="Πληρωμή λογαριασμού ηλεκτρικού ρεύματος",
                        event_type=EventType.UTILITY_PAYMENT,
                        due_date=deadline,
                        priority=Priority.MEDIUM,
                        status=EventStatus.UPCOMING,
                        estimated_duration=10,
                        cost_estimate=200.0,
                        recurrence="bimonthly",
                        business_impact="medium",
                        automation_possible=True,
                        required_documents=["Λογαριασμός ΔΕΗ"],
                        responsible_person="Διαχειριστής",
                        government_agency="ΔΕΗ",
                        penalties_if_missed="Διακοπή ρεύματος μετά από 30 ημέρες",
                        ai_suggestions=[
                            "Ελέγξτε την κατανάλωση σε σχέση με τον προηγούμενο μήνα",
                            "Εξετάστε προγράμματα εξοικονόμησης ενέργειας",
                            "Προγραμματίστε αυτόματη πληρωμή"
                        ]
                    ))
            
            current_date += relativedelta(months=1)
        
        return events
    
    async def _generate_contract_events(self, start_date: datetime, end_date: datetime) -> List[PredictiveEvent]:
        """Generate contract renewal events"""
        events = []
        
        # Mock contract renewals (in production, fetch from database)
        mock_contracts = [
            {
                'id': 'insurance_001',
                'title': 'Ασφάλιση Επαγγελματικών Κινδύνων',
                'renewal_date': start_date + timedelta(days=15),
                'cost': 800.0
            },
            {
                'id': 'supplier_001',
                'title': 'Σύμβαση Προμηθευτή Α',
                'renewal_date': start_date + timedelta(days=45),
                'cost': 0.0
            }
        ]
        
        for contract in mock_contracts:
            if start_date <= contract['renewal_date'] <= end_date:
                events.append(PredictiveEvent(
                    id=f"contract_{contract['id']}",
                    title=f"Ανανέωση: {contract['title']}",
                    description=f"Ανανέωση σύμβασης {contract['title']}",
                    event_type=EventType.CONTRACT_RENEWAL,
                    due_date=contract['renewal_date'],
                    priority=Priority.MEDIUM,
                    status=EventStatus.UPCOMING,
                    estimated_duration=60,
                    cost_estimate=contract['cost'],
                    recurrence="yearly",
                    business_impact="medium",
                    automation_possible=False,
                    required_documents=["Υπάρχουσα σύμβαση", "Νέοι όροι"],
                    responsible_person="Διευθυντής",
                    government_agency=None,
                    penalties_if_missed="Διακοπή υπηρεσίας",
                    ai_suggestions=[
                        "Αξιολογήστε τους όρους της σύμβασης",
                        "Συγκρίνετε με άλλους προμηθευτές",
                        "Διαπραγματευτείτε καλύτερους όρους"
                    ]
                ))
        
        return events
    
    async def _generate_grant_events(self, start_date: datetime, end_date: datetime) -> List[PredictiveEvent]:
        """Generate grant application events"""
        events = []
        
        # Mock grant opportunities
        mock_grants = [
            {
                'id': 'digital_transformation',
                'title': 'Ψηφιακός Μετασχηματισμός ΜμΕ',
                'deadline': start_date + timedelta(days=30),
                'amount': 50000.0,
                'agency': 'ΕΣΠΑ'
            },
            {
                'id': 'green_transition',
                'title': 'Πράσινη Μετάβαση',
                'deadline': start_date + timedelta(days=60),
                'amount': 30000.0,
                'agency': 'ΥΠΕΝ'
            }
        ]
        
        for grant in mock_grants:
            if start_date <= grant['deadline'] <= end_date:
                events.append(PredictiveEvent(
                    id=f"grant_{grant['id']}",
                    title=f"Αίτηση Επιδότησης: {grant['title']}",
                    description=f"Υποβολή αίτησης για επιδότηση {grant['title']}",
                    event_type=EventType.GRANT_APPLICATION,
                    due_date=grant['deadline'],
                    priority=Priority.MEDIUM,
                    status=EventStatus.UPCOMING,
                    estimated_duration=180,
                    cost_estimate=-grant['amount'],  # Negative because it's income
                    recurrence=None,
                    business_impact="high",
                    automation_possible=False,
                    required_documents=["Επιχειρηματικό σχέδιο", "Οικονομικά στοιχεία"],
                    responsible_person="Διευθυντής",
                    government_agency=grant['agency'],
                    penalties_if_missed="Χάνεται η ευκαιρία χρηματοδότησης",
                    ai_suggestions=[
                        "Προετοιμάστε τα έγγραφα έγκαιρα",
                        "Συμβουλευτείτε εξειδικευμένο σύμβουλο",
                        "Ελέγξτε τα κριτήρια επιλεξιμότητας"
                    ]
                ))
        
        return events
    
    async def _generate_seasonal_events(self, start_date: datetime, end_date: datetime, business_type: str) -> List[PredictiveEvent]:
        """Generate seasonal business events"""
        events = []
        
        if business_type.lower() in ['retail', 'restaurant', 'cafe']:
            # Christmas preparation
            christmas_prep = datetime(start_date.year, 11, 1)
            if start_date <= christmas_prep <= end_date:
                events.append(PredictiveEvent(
                    id=f"christmas_prep_{start_date.year}",
                    title="Προετοιμασία Χριστουγέννων",
                    description="Αύξηση στοκ και προσωπικού για τις γιορτές",
                    event_type=EventType.SEASONAL_PEAK,
                    due_date=christmas_prep,
                    priority=Priority.HIGH,
                    status=EventStatus.UPCOMING,
                    estimated_duration=480,
                    cost_estimate=5000.0,
                    recurrence="yearly",
                    business_impact="high",
                    automation_possible=False,
                    required_documents=["Προϋπολογισμός", "Σχέδιο προσλήψεων"],
                    responsible_person="Διευθυντής",
                    government_agency=None,
                    penalties_if_missed="Χάνεται η ευκαιρία αυξημένων πωλήσεων",
                    ai_suggestions=[
                        "Παραγγείλετε επιπλέον στοκ",
                        "Προσλάβετε προσωρινό προσωπικό",
                        "Ετοιμάστε εορταστικές προσφορές"
                    ]
                ))
        
        return events
    
    def _calculate_workload_distribution(self, events: List[PredictiveEvent]) -> Dict[str, int]:
        """Calculate workload distribution across time periods"""
        workload = {
            'this_week': 0,
            'next_week': 0,
            'this_month': 0,
            'next_month': 0
        }
        
        now = datetime.now()
        week_end = now + timedelta(days=7)
        month_end = now + timedelta(days=30)
        
        for event in events:
            if event.due_date <= week_end:
                workload['this_week'] += event.estimated_duration
            elif event.due_date <= week_end + timedelta(days=7):
                workload['next_week'] += event.estimated_duration
            elif event.due_date <= month_end:
                workload['this_month'] += event.estimated_duration
            else:
                workload['next_month'] += event.estimated_duration
        
        return workload
    
    def _calculate_cost_projections(self, events: List[PredictiveEvent]) -> Dict[str, float]:
        """Calculate cost projections"""
        costs = {
            'this_week': 0.0,
            'next_week': 0.0,
            'this_month': 0.0,
            'next_month': 0.0,
            'total': 0.0
        }
        
        now = datetime.now()
        week_end = now + timedelta(days=7)
        month_end = now + timedelta(days=30)
        
        for event in events:
            cost = event.cost_estimate or 0.0
            costs['total'] += cost
            
            if event.due_date <= week_end:
                costs['this_week'] += cost
            elif event.due_date <= week_end + timedelta(days=7):
                costs['next_week'] += cost
            elif event.due_date <= month_end:
                costs['this_month'] += cost
            else:
                costs['next_month'] += cost
        
        return costs
    
    def _assess_timeline_risks(self, events: List[PredictiveEvent]) -> Dict[str, Any]:
        """Assess timeline risks"""
        risks = {
            'high_priority_count': 0,
            'critical_count': 0,
            'overlapping_deadlines': 0,
            'penalty_exposure': 0.0,
            'workload_peaks': [],
            'risk_level': 'low'
        }
        
        # Count priority levels
        for event in events:
            if event.priority == Priority.HIGH:
                risks['high_priority_count'] += 1
            elif event.priority == Priority.CRITICAL:
                risks['critical_count'] += 1
        
        # Check for overlapping deadlines (same day)
        dates = [event.due_date.date() for event in events]
        risks['overlapping_deadlines'] = len(dates) - len(set(dates))
        
        # Assess overall risk level
        if risks['critical_count'] > 0 or risks['overlapping_deadlines'] > 3:
            risks['risk_level'] = 'high'
        elif risks['high_priority_count'] > 5 or risks['overlapping_deadlines'] > 1:
            risks['risk_level'] = 'medium'
        
        return risks
    
    def _generate_ai_recommendations(self, events: List[PredictiveEvent], business_type: str) -> List[str]:
        """Generate AI recommendations based on timeline analysis"""
        recommendations = []
        
        # Check for busy periods
        busy_days = {}
        for event in events:
            date_key = event.due_date.date()
            if date_key not in busy_days:
                busy_days[date_key] = 0
            busy_days[date_key] += event.estimated_duration
        
        # Find peak days
        peak_days = [day for day, duration in busy_days.items() if duration > 300]
        if peak_days:
            recommendations.append(f"Προσοχή: {len(peak_days)} ημέρες με πολύ μεγάλο φόρτο εργασίας")
        
        # Check for critical deadlines
        critical_events = [e for e in events if e.priority == Priority.CRITICAL]
        if critical_events:
            recommendations.append(f"Έχετε {len(critical_events)} κρίσιμες προθεσμίες - προετοιμαστείτε έγκαιρα")
        
        # Tax preparation
        tax_events = [e for e in events if e.event_type in [EventType.TAX_DEADLINE, EventType.VAT_SUBMISSION]]
        if tax_events:
            recommendations.append("Συγκεντρώστε τα φορολογικά έγγραφα εγκαίρως")
        
        # Automation suggestions
        automatable = [e for e in events if e.automation_possible]
        if len(automatable) > 3:
            recommendations.append(f"Μπορείτε να αυτοματοποιήσετε {len(automatable)} διαδικασίες")
        
        return recommendations
    
    async def get_calendar_sync_data(self, events: List[PredictiveEvent]) -> Dict[str, Any]:
        """Prepare data for calendar sync (Google Calendar, Outlook)"""
        calendar_events = []
        
        for event in events:
            calendar_event = {
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'start': event.due_date.isoformat(),
                'end': (event.due_date + timedelta(minutes=event.estimated_duration)).isoformat(),
                'location': event.government_agency or '',
                'reminders': [
                    {'method': 'email', 'minutes': 7 * 24 * 60},  # 1 week before
                    {'method': 'popup', 'minutes': 24 * 60}  # 1 day before
                ],
                'attendees': [event.responsible_person] if event.responsible_person else []
            }
            calendar_events.append(calendar_event)
        
        return {
            'events': calendar_events,
            'calendar_name': 'BusinessPilot AI - Προθεσμίες',
            'timezone': 'Europe/Athens'
        }

# Singleton instance
predictive_timeline_service = PredictiveTimelineService()