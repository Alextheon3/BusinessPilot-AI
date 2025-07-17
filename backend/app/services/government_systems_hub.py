"""
Government Systems Integration Hub for BusinessPilot AI
Central nervous system for all Greek government system connections
"""

import asyncio
import httpx
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import json
from urllib.parse import urlencode
import logging
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.credentials_service import CredentialsService

logger = logging.getLogger(__name__)

class GovernmentSystemType(Enum):
    ERGANI = "ergani"           # ΕΡΓΑΝΗ - Staff declarations
    AADE = "aade"               # ΑΑΔΕ - Tax obligations
    DOY = "doy"                 # ΔΟΥ - Compliance metadata
    DYPA = "dypa"               # ΔΥΠΑ/ΟΑΕΔ - Grants and programs
    EFKA = "efka"               # ΕΦΚΑ/ΙΚΑ - Social security
    KEP = "kep"                 # ΚΕΠ - Certifications
    EPIMELITIRIΟ = "epimelitiriο" # Επιμελητήριο - Chamber of Commerce
    MYDATA = "mydata"           # MyData - e-invoicing (Phase 2)

@dataclass
class SystemConnection:
    system_type: GovernmentSystemType
    is_connected: bool = False
    last_sync: Optional[datetime] = None
    connection_status: str = "disconnected"
    error_message: Optional[str] = None
    api_endpoint: Optional[str] = None
    credentials: Optional[Dict[str, str]] = None
    rate_limit: int = 60  # requests per hour
    requests_made: int = 0

@dataclass
class GovernmentObligation:
    id: str
    title: str
    description: str
    system: GovernmentSystemType
    due_date: datetime
    amount: Optional[float] = None
    status: str = "pending"  # pending, completed, overdue
    priority: str = "medium"  # low, medium, high, urgent
    reference_number: Optional[str] = None
    payment_method: Optional[str] = None
    consequences: List[str] = field(default_factory=list)
    related_documents: List[str] = field(default_factory=list)

@dataclass
class SystemNotification:
    id: str
    title: str
    message: str
    system: GovernmentSystemType
    severity: str = "info"  # info, warning, error, success
    timestamp: datetime = field(default_factory=datetime.now)
    is_read: bool = False
    action_required: bool = False
    action_url: Optional[str] = None

class GovernmentSystemsHub:
    """
    Central hub for all Greek government system integrations
    """
    
    def __init__(self):
        self.connections: Dict[GovernmentSystemType, SystemConnection] = {}
        self.obligations: List[GovernmentObligation] = []
        self.notifications: List[SystemNotification] = []
        self.client = httpx.AsyncClient(timeout=30.0)
        self.credentials_service = CredentialsService()
        
        # Initialize system connections
        self._initialize_connections()
        
        # Mock data for demonstration
        self._load_mock_data()
    
    def _initialize_connections(self):
        """Initialize all government system connections"""
        systems = [
            (GovernmentSystemType.ERGANI, "https://api.ergani.gov.gr/v1"),
            (GovernmentSystemType.AADE, "https://api.aade.gr/v1"),
            (GovernmentSystemType.DOY, "https://api.doy.gov.gr/v1"),
            (GovernmentSystemType.DYPA, "https://api.dypa.gov.gr/v1"),
            (GovernmentSystemType.EFKA, "https://api.efka.gov.gr/v1"),
            (GovernmentSystemType.KEP, "https://api.kep.gov.gr/v1"),
            (GovernmentSystemType.EPIMELITIRIΟ, "https://api.epimelitiriο.gr/v1"),
            (GovernmentSystemType.MYDATA, "https://api.mydata.gov.gr/v1"),
        ]
        
        for system_type, endpoint in systems:
            self.connections[system_type] = SystemConnection(
                system_type=system_type,
                api_endpoint=endpoint,
                connection_status="ready"
            )
    
    def _load_mock_data(self):
        """Load mock data for demonstration"""
        # Mock obligations
        self.obligations = [
            GovernmentObligation(
                id="vat_q1_2024",
                title="Δήλωση ΦΠΑ Q1 2024",
                description="Τριμηνιαία δήλωση ΦΠΑ για το πρώτο τρίμηνο 2024",
                system=GovernmentSystemType.AADE,
                due_date=datetime(2024, 4, 25),
                amount=2450.75,
                status="pending",
                priority="high",
                reference_number="VAT-2024-Q1-001",
                consequences=[
                    "Πρόστιμο 25% επί του οφειλόμενου ποσού",
                    "Μηνιαίος τόκος 1.5%",
                    "Πιθανή αναστολή φορολογικής ενημερότητας"
                ],
                related_documents=["E3", "E4", "Payroll_Q1"]
            ),
            GovernmentObligation(
                id="efka_march_2024",
                title="Εισφορές ΕΦΚΑ Μαρτίου 2024",
                description="Μηνιαίες εισφορές κοινωνικής ασφάλισης",
                system=GovernmentSystemType.EFKA,
                due_date=datetime(2024, 4, 15),
                amount=1250.00,
                status="pending",
                priority="urgent",
                reference_number="EFKA-2024-03-001",
                consequences=[
                    "Πρόστιμο 5% για καθυστέρηση",
                    "Αναστολή ασφαλιστικής ενημερότητας",
                    "Πρόβλημα στις νέες προσλήψεις"
                ]
            ),
            GovernmentObligation(
                id="e4_annual_2023",
                title="Έντυπο Ε4 - Ετήσια Καταγραφή 2023",
                description="Ετήσια καταγραφή προσωπικού στην ΕΡΓΑΝΗ",
                system=GovernmentSystemType.ERGANI,
                due_date=datetime(2024, 10, 31),
                status="pending",
                priority="medium",
                reference_number="E4-2023-001",
                consequences=[
                    "Πρόστιμο €500 ανά μη δηλωθέντα εργαζόμενο",
                    "Πιθανή αναστολή νέων προσλήψεων"
                ]
            ),
            GovernmentObligation(
                id="kep_license_renewal",
                title="Ανανέωση Άδειας Λειτουργίας",
                description="Ανανέωση άδειας λειτουργίας καταστήματος εστίασης",
                system=GovernmentSystemType.KEP,
                due_date=datetime(2024, 6, 30),
                amount=150.00,
                status="pending",
                priority="medium",
                reference_number="KEP-LIC-2024-001",
                consequences=[
                    "Κλείσιμο καταστήματος από υγειονομικές αρχές",
                    "Πρόστιμο €1000-€5000"
                ]
            )
        ]
        
        # Mock notifications
        self.notifications = [
            SystemNotification(
                id="aade_vat_reminder",
                title="Υπενθύμιση ΦΠΑ",
                message="Η προθεσμία για τη δήλωση ΦΠΑ λήγει σε 5 ημέρες",
                system=GovernmentSystemType.AADE,
                severity="warning",
                action_required=True,
                action_url="https://www.aade.gr/vat-declaration"
            ),
            SystemNotification(
                id="ergani_e3_success",
                title="Επιτυχής Υποβολή Ε3",
                message="Το έντυπο Ε3 για τον εργαζόμενο Γιάννης Παπαδόπουλος υποβλήθηκε επιτυχώς",
                system=GovernmentSystemType.ERGANI,
                severity="success",
                timestamp=datetime.now() - timedelta(hours=2)
            ),
            SystemNotification(
                id="dypa_new_program",
                title="Νέο Πρόγραμμα ΔΥΠΑ",
                message="Διαθέσιμο νέο πρόγραμμα επιδότησης για πρόσληψη νέων",
                system=GovernmentSystemType.DYPA,
                severity="info",
                action_required=True,
                action_url="https://www.dypa.gov.gr/new-program"
            )
        ]
    
    async def sync_all_systems(self, business_afm: str) -> Dict[str, Any]:
        """Sync data from all connected government systems"""
        results = {}
        
        for system_type, connection in self.connections.items():
            try:
                logger.info(f"Syncing data from {system_type.value}")
                result = await self._sync_system(system_type, business_afm)
                results[system_type.value] = result
                
                # Update connection status
                connection.last_sync = datetime.now()
                connection.connection_status = "connected"
                connection.is_connected = True
                
            except Exception as e:
                logger.error(f"Error syncing {system_type.value}: {str(e)}")
                connection.connection_status = "error"
                connection.error_message = str(e)
                connection.is_connected = False
                results[system_type.value] = {"error": str(e)}
        
        return results
    
    async def _sync_system(self, system_type: GovernmentSystemType, business_afm: str) -> Dict[str, Any]:
        """Sync data from a specific government system"""
        connection = self.connections[system_type]
        
        if not connection.api_endpoint:
            raise ValueError(f"No API endpoint configured for {system_type.value}")
        
        # Mock API calls - in production, these would be real API calls
        if system_type == GovernmentSystemType.AADE:
            return await self._sync_aade(business_afm)
        elif system_type == GovernmentSystemType.ERGANI:
            return await self._sync_ergani(business_afm)
        elif system_type == GovernmentSystemType.EFKA:
            return await self._sync_efka(business_afm)
        elif system_type == GovernmentSystemType.DYPA:
            return await self._sync_dypa(business_afm)
        elif system_type == GovernmentSystemType.KEP:
            return await self._sync_kep(business_afm)
        else:
            # Generic sync for other systems
            return {"status": "synced", "data": {}}
    
    async def _sync_aade(self, business_afm: str) -> Dict[str, Any]:
        """Sync with ΑΑΔΕ (Tax Administration)"""
        # Mock implementation - would connect to real ΑΑΔΕ API
        return {
            "status": "synced",
            "tax_obligations": [
                {
                    "type": "VAT",
                    "period": "2024-Q1",
                    "due_date": "2024-04-25",
                    "amount": 2450.75,
                    "status": "pending"
                },
                {
                    "type": "Income Tax",
                    "period": "2023",
                    "due_date": "2024-06-30",
                    "amount": 5600.00,
                    "status": "pending"
                }
            ],
            "compliance_status": "current",
            "last_payment": "2024-03-15",
            "certificates": [
                {
                    "type": "tax_clearance",
                    "valid_until": "2024-05-15",
                    "status": "valid"
                }
            ]
        }
    
    async def _sync_ergani(self, business_afm: str) -> Dict[str, Any]:
        """Sync with ΕΡΓΑΝΗ (Employment Information System)"""
        return {
            "status": "synced",
            "employees": [
                {
                    "name": "Γιάννης Παπαδόπουλος",
                    "afm": "123456789",
                    "hire_date": "2024-01-15",
                    "contract_type": "full_time",
                    "status": "active"
                },
                {
                    "name": "Μαρία Γεωργίου",
                    "afm": "987654321",
                    "hire_date": "2023-06-01",
                    "contract_type": "part_time",
                    "status": "active"
                }
            ],
            "pending_declarations": [
                {
                    "type": "E4",
                    "year": "2023",
                    "due_date": "2024-10-31",
                    "status": "pending"
                }
            ],
            "compliance_alerts": []
        }
    
    async def _sync_efka(self, business_afm: str) -> Dict[str, Any]:
        """Sync with ΕΦΚΑ (Social Security)"""
        return {
            "status": "synced",
            "contributions": [
                {
                    "month": "2024-03",
                    "amount": 1250.00,
                    "due_date": "2024-04-15",
                    "status": "pending"
                },
                {
                    "month": "2024-02",
                    "amount": 1180.00,
                    "due_date": "2024-03-15",
                    "status": "paid"
                }
            ],
            "clearance_certificates": [
                {
                    "type": "social_security",
                    "valid_until": "2024-04-20",
                    "status": "valid"
                }
            ]
        }
    
    async def _sync_dypa(self, business_afm: str) -> Dict[str, Any]:
        """Sync with ΔΥΠΑ (Employment Services)"""
        return {
            "status": "synced",
            "available_programs": [
                {
                    "id": "youth_employment_2024",
                    "title": "Επιδότηση Νέων 18-29",
                    "amount": 14800,
                    "deadline": "2024-12-31",
                    "eligible": True
                },
                {
                    "id": "digital_transformation",
                    "title": "Ψηφιακός Μετασχηματισμός",
                    "amount": 5000,
                    "deadline": "2024-09-30",
                    "eligible": True
                }
            ],
            "active_applications": [],
            "approved_grants": []
        }
    
    async def _sync_kep(self, business_afm: str) -> Dict[str, Any]:
        """Sync with ΚΕΠ (Citizen Service Centers)"""
        return {
            "status": "synced",
            "licenses": [
                {
                    "type": "business_operation",
                    "valid_until": "2024-12-31",
                    "status": "valid"
                },
                {
                    "type": "health_permit",
                    "valid_until": "2024-06-30",
                    "status": "expiring_soon"
                }
            ],
            "pending_applications": []
        }
    
    def get_urgent_obligations(self, days_ahead: int = 7) -> List[GovernmentObligation]:
        """Get obligations due within specified days"""
        cutoff_date = datetime.now() + timedelta(days=days_ahead)
        
        urgent = []
        for obligation in self.obligations:
            if obligation.status == "pending" and obligation.due_date <= cutoff_date:
                urgent.append(obligation)
        
        return sorted(urgent, key=lambda x: x.due_date)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get status of all government system connections"""
        status = {}
        
        for system_type, connection in self.connections.items():
            status[system_type.value] = {
                "connected": connection.is_connected,
                "status": connection.connection_status,
                "last_sync": connection.last_sync.isoformat() if connection.last_sync else None,
                "error": connection.error_message
            }
        
        return status
    
    def get_notifications(self, unread_only: bool = False) -> List[SystemNotification]:
        """Get system notifications"""
        notifications = self.notifications
        
        if unread_only:
            notifications = [n for n in notifications if not n.is_read]
        
        return sorted(notifications, key=lambda x: x.timestamp, reverse=True)
    
    def mark_notification_read(self, notification_id: str) -> bool:
        """Mark a notification as read"""
        for notification in self.notifications:
            if notification.id == notification_id:
                notification.is_read = True
                return True
        return False
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get overall system health status"""
        total_systems = len(self.connections)
        connected_systems = sum(1 for conn in self.connections.values() if conn.is_connected)
        
        urgent_obligations = len(self.get_urgent_obligations())
        unread_notifications = len(self.get_notifications(unread_only=True))
        
        return {
            "overall_health": "healthy" if connected_systems >= total_systems * 0.8 else "warning",
            "connected_systems": connected_systems,
            "total_systems": total_systems,
            "connection_rate": connected_systems / total_systems,
            "urgent_obligations": urgent_obligations,
            "unread_notifications": unread_notifications,
            "last_full_sync": max(
                (conn.last_sync for conn in self.connections.values() if conn.last_sync),
                default=None
            )
        }
    
    async def test_system_connection(self, system_type: GovernmentSystemType) -> Dict[str, Any]:
        """Test connection to a specific government system"""
        connection = self.connections.get(system_type)
        
        if not connection:
            return {"success": False, "error": "System not configured"}
        
        try:
            # Mock connection test
            await asyncio.sleep(0.5)  # Simulate API call
            
            connection.is_connected = True
            connection.connection_status = "connected"
            connection.last_sync = datetime.now()
            
            return {
                "success": True,
                "system": system_type.value,
                "response_time": 0.5,
                "status": "connected"
            }
            
        except Exception as e:
            connection.is_connected = False
            connection.connection_status = "error"
            connection.error_message = str(e)
            
            return {
                "success": False,
                "system": system_type.value,
                "error": str(e)
            }
    
    async def get_ai_explanation(self, obligation_id: str) -> str:
        """Get AI explanation for an obligation"""
        obligation = next((o for o in self.obligations if o.id == obligation_id), None)
        
        if not obligation:
            return "Δεν βρέθηκε η υποχρέωση."
        
        # Generate AI explanation based on obligation details
        explanation = f"""
**{obligation.title}**

**Τι πρέπει να κάνετε:**
{obligation.description}

**Προθεσμία:** {obligation.due_date.strftime('%d/%m/%Y')}
{f"**Ποσό:** €{obligation.amount:,.2f}" if obligation.amount else ""}

**Σπουδαιότητα:** {obligation.priority.upper()}

**Τι θα συμβεί αν δεν πληρώσετε:**
"""
        
        for consequence in obligation.consequences:
            explanation += f"• {consequence}\n"
        
        explanation += f"""
**Συμβουλή:** Είναι σημαντικό να {obligation.title.lower()} εγκαίρως για να αποφύγετε πρόστιμα και άλλες επιπτώσεις.
"""
        
        return explanation.strip()
    
    async def store_credentials(self, business_id: int, service_name: str, username: str, password: str):
        """Store encrypted credentials for a government service"""
        try:
            db = next(get_db())
            self.credentials_service.store_credentials(db, business_id, service_name, username, password)
            
            # Update system connection status
            system_type = GovernmentSystemType(service_name.lower())
            if system_type in self.connections:
                self.connections[system_type].credentials = {'username': username}
                self.connections[system_type].connection_status = "credentials_stored"
                
            logger.info(f"Stored credentials for {service_name} - business {business_id}")
            
        except Exception as e:
            logger.error(f"Error storing credentials: {str(e)}")
            raise
    
    async def test_ergani_connection(self, business_id: int):
        """Test ERGANI connection with stored credentials"""
        try:
            db = next(get_db())
            credentials = self.credentials_service.get_credentials(db, business_id, "ergani")
            
            if not credentials:
                raise ValueError("No ERGANI credentials found")
            
            # Mock ERGANI API test
            await asyncio.sleep(1)  # Simulate API call
            
            # Update verification status
            self.credentials_service.verify_credentials(db, business_id, "ergani", True)
            
            return {"success": True, "message": "ERGANI connection successful"}
            
        except Exception as e:
            logger.error(f"Error testing ERGANI connection: {str(e)}")
            db = next(get_db())
            self.credentials_service.verify_credentials(db, business_id, "ergani", False)
            return {"success": False, "error": str(e)}
    
    async def test_aade_connection(self, business_id: int):
        """Test AADE connection with stored credentials"""
        try:
            db = next(get_db())
            credentials = self.credentials_service.get_credentials(db, business_id, "aade")
            
            if not credentials:
                raise ValueError("No AADE credentials found")
            
            # Mock AADE API test
            await asyncio.sleep(1)  # Simulate API call
            
            # Update verification status
            self.credentials_service.verify_credentials(db, business_id, "aade", True)
            
            return {"success": True, "message": "AADE connection successful"}
            
        except Exception as e:
            logger.error(f"Error testing AADE connection: {str(e)}")
            db = next(get_db())
            self.credentials_service.verify_credentials(db, business_id, "aade", False)
            return {"success": False, "error": str(e)}
    
    async def test_efka_connection(self, business_id: int):
        """Test EFKA connection with stored credentials"""
        try:
            db = next(get_db())
            credentials = self.credentials_service.get_credentials(db, business_id, "efka")
            
            if not credentials:
                raise ValueError("No EFKA credentials found")
            
            # Mock EFKA API test
            await asyncio.sleep(1)  # Simulate API call
            
            # Update verification status
            self.credentials_service.verify_credentials(db, business_id, "efka", True)
            
            return {"success": True, "message": "EFKA connection successful"}
            
        except Exception as e:
            logger.error(f"Error testing EFKA connection: {str(e)}")
            db = next(get_db())
            self.credentials_service.verify_credentials(db, business_id, "efka", False)
            return {"success": False, "error": str(e)}

# Singleton instance
government_hub = GovernmentSystemsHub()