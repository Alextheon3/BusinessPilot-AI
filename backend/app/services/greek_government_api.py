"""
Greek Government API Integration Service
Handles integration with various Greek government services and APIs
"""

import httpx
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
from dataclasses import dataclass
from enum import Enum

class GovernmentServiceType(Enum):
    ERGANI = "ergani"
    AADE = "aade"
    DYPA = "dypa"
    EFKA = "efka"
    ESPA = "espa"
    KEP = "kep"
    EYDAP = "eydap"

@dataclass
class GovernmentDocument:
    id: str
    title: str
    type: str
    ministry: str
    description: str
    url: str
    deadline: Optional[str] = None
    required_documents: List[str] = None
    processing_time: str = "5-10 εργάσιμες ημέρες"
    fee: float = 0.0
    is_digital: bool = True

@dataclass
class SubsidyProgram:
    id: str
    title: str
    description: str
    ministry: str
    amount: float
    max_amount: float
    deadline: str
    eligibility_criteria: List[str]
    target_groups: List[str]
    business_types: List[str]
    regions: List[str]
    application_url: str
    contact_info: Dict[str, str]
    status: str = "active"

@dataclass
class TaxObligation:
    id: str
    title: str
    description: str
    deadline: str
    amount: Optional[float] = None
    penalty: Optional[float] = None
    is_recurring: bool = False
    frequency: Optional[str] = None
    related_forms: List[str] = None

class GreekGovernmentAPI:
    """
    Service for integrating with Greek government APIs and services
    """
    
    def __init__(self):
        self.base_urls = {
            GovernmentServiceType.ERGANI: "https://www.ergani.gov.gr/api/v1",
            GovernmentServiceType.AADE: "https://www.aade.gr/api/v1",
            GovernmentServiceType.DYPA: "https://www.dypa.gov.gr/api/v1",
            GovernmentServiceType.EFKA: "https://www.efka.gov.gr/api/v1",
            GovernmentServiceType.ESPA: "https://www.espa.gr/api/v1",
        }
        
        # Mock data for demonstration - in production, this would come from real APIs
        self.mock_subsidies = self._initialize_mock_subsidies()
        self.mock_documents = self._initialize_mock_documents()
        self.mock_tax_obligations = self._initialize_mock_tax_obligations()
    
    def _initialize_mock_subsidies(self) -> List[SubsidyProgram]:
        """Initialize mock subsidy programs"""
        return [
            SubsidyProgram(
                id="dypa_youth_2024",
                title="Επιδότηση Πρόσληψης Νέων 18-29 ετών",
                description="Επιδότηση για πρόσληψη νέων ανέργων ηλικίας 18-29 ετών με κάλυψη μισθού έως 12 μήνες",
                ministry="ΔΥΠΑ - Υπουργείο Εργασίας",
                amount=14800.0,
                max_amount=14800.0,
                deadline="2024-12-31",
                eligibility_criteria=[
                    "Επιχειρήσεις με έως 250 εργαζόμενους",
                    "Ενήμερη φορολογικά και ασφαλιστικά",
                    "Δεν έχει προχωρήσει σε μαζικές απολύσεις",
                    "Διατήρηση θέσης εργασίας για 6 μήνες μετά"
                ],
                target_groups=["Νέοι 18-29 ετών", "Άνεργοι"],
                business_types=["ALL"],
                regions=["Όλη η Ελλάδα"],
                application_url="https://www.dypa.gov.gr/employment-programs/youth",
                contact_info={
                    "phone": "1555",
                    "email": "info@dypa.gov.gr",
                    "website": "https://www.dypa.gov.gr"
                }
            ),
            SubsidyProgram(
                id="espa_digital_2024",
                title="Ψηφιακός Μετασχηματισμός ΜμΕ",
                description="Επιδότηση για ψηφιακό εκσυγχρονισμό μικρομεσαίων επιχειρήσεων",
                ministry="Υπουργείο Ανάπτυξης - ΕΣΠΑ",
                amount=5000.0,
                max_amount=5000.0,
                deadline="2024-09-30",
                eligibility_criteria=[
                    "Μικρομεσαίες επιχειρήσεις",
                    "Λειτουργία τουλάχιστον 1 έτους",
                    "Δεν έχει λάβει παρόμοια επιδότηση"
                ],
                target_groups=["ΜμΕ"],
                business_types=["ALL"],
                regions=["Όλη η Ελλάδα"],
                application_url="https://www.espa.gr/digital-transformation",
                contact_info={
                    "phone": "1572",
                    "email": "info@espa.gr",
                    "website": "https://www.espa.gr"
                }
            ),
            SubsidyProgram(
                id="startup_greece_2024",
                title="Startup Greece - Επιχειρηματικότητα Νέων",
                description="Επιδότηση για νέες επιχειρήσεις και καινοτόμες δραστηριότητες",
                ministry="Υπουργείο Ανάπτυξης",
                amount=25000.0,
                max_amount=25000.0,
                deadline="2024-08-31",
                eligibility_criteria=[
                    "Νέες επιχειρήσεις (έως 5 έτη)",
                    "Καινοτόμες δραστηριότητες",
                    "Ιδρυτής έως 45 ετών"
                ],
                target_groups=["Νέες επιχειρήσεις", "Καινοτόμες δραστηριότητες"],
                business_types=["Τεχνολογία", "Υπηρεσίες"],
                regions=["Όλη η Ελλάδα"],
                application_url="https://www.startupgreece.gov.gr",
                contact_info={
                    "phone": "1572",
                    "email": "info@startupgreece.gov.gr",
                    "website": "https://www.startupgreece.gov.gr"
                }
            )
        ]
    
    def _initialize_mock_documents(self) -> List[GovernmentDocument]:
        """Initialize mock government documents"""
        return [
            GovernmentDocument(
                id="e3_form",
                title="Έντυπο Ε3 - Κίνηση Προσωπικού",
                type="employment",
                ministry="Υπουργείο Εργασίας - ΕΡΓΑΝΗ",
                description="Δήλωση κίνησης προσωπικού για πρόσληψη, απόλυση, μετακίνηση",
                url="https://www.ergani.gov.gr/forms/e3",
                deadline="24 ώρες πριν την έναρξη",
                required_documents=[
                    "Αντίγραφο ταυτότητας",
                    "Αντίγραφο Α.Φ.Μ.",
                    "Σύμβαση εργασίας"
                ],
                processing_time="Άμεσα",
                is_digital=True
            ),
            GovernmentDocument(
                id="e4_form",
                title="Έντυπο Ε4 - Ετήσια Καταγραφή",
                type="employment",
                ministry="Υπουργείο Εργασίας - ΕΡΓΑΝΗ",
                description="Ετήσια καταγραφή προσωπικού επιχείρησης",
                url="https://www.ergani.gov.gr/forms/e4",
                deadline="31 Οκτωβρίου",
                required_documents=[
                    "Στοιχεία όλων των εργαζομένων",
                    "Μισθολογικές καταστάσεις"
                ],
                processing_time="5-10 εργάσιμες ημέρες",
                is_digital=True
            ),
            GovernmentDocument(
                id="vat_return",
                title="Δήλωση Φ.Π.Α.",
                type="tax",
                ministry="ΑΑΔΕ - Φορολογική Διοίκηση",
                description="Μηνιαία δήλωση φόρου προστιθέμενης αξίας",
                url="https://www.aade.gr/forms/vat-return",
                deadline="25η κάθε μήνα",
                required_documents=[
                    "Βιβλία εσόδων-εξόδων",
                    "Τιμολόγια πωλήσεων",
                    "Τιμολόγια αγορών"
                ],
                processing_time="Άμεσα",
                is_digital=True
            ),
            GovernmentDocument(
                id="business_license",
                title="Άδεια Λειτουργίας Επιχείρησης",
                type="license",
                ministry="Δήμος - ΚΕΠ",
                description="Άδεια λειτουργίας για επιχειρήσεις εστίασης και εμπορίου",
                url="https://www.kep.gov.gr/licenses/business",
                deadline="Πριν την έναρξη λειτουργίας",
                required_documents=[
                    "Τοπογραφικό διάγραμμα",
                    "Πιστοποιητικό πυρασφάλειας",
                    "Άδεια δόμησης",
                    "Υγειονομική άδεια"
                ],
                processing_time="15-45 εργάσιμες ημέρες",
                fee=150.0,
                is_digital=False
            )
        ]
    
    def _initialize_mock_tax_obligations(self) -> List[TaxObligation]:
        """Initialize mock tax obligations"""
        return [
            TaxObligation(
                id="vat_monthly",
                title="Μηνιαία Δήλωση Φ.Π.Α.",
                description="Υποβολή μηνιαίας δήλωσης φόρου προστιθέμενης αξίας",
                deadline="25η κάθε μήνα",
                is_recurring=True,
                frequency="monthly",
                related_forms=["vat_return"]
            ),
            TaxObligation(
                id="income_tax_annual",
                title="Ετήσια Δήλωση Εισοδήματος",
                description="Υποβολή ετήσιας δήλωσης εισοδήματος επιχείρησης",
                deadline="30 Ιουνίου",
                is_recurring=True,
                frequency="yearly",
                related_forms=["income_declaration"]
            ),
            TaxObligation(
                id="property_tax",
                title="Τέλη Κυκλοφορίας",
                description="Πληρωμή τελών κυκλοφορίας επαγγελματικών οχημάτων",
                deadline="31 Μαρτίου",
                is_recurring=True,
                frequency="yearly"
            )
        ]
    
    async def get_subsidies_for_business(self, business_profile: Dict[str, Any]) -> List[SubsidyProgram]:
        """
        Get relevant subsidies for a business based on its profile
        """
        # In production, this would make API calls to government services
        # For now, we'll filter mock data based on business profile
        
        eligible_subsidies = []
        
        for subsidy in self.mock_subsidies:
            if self._check_subsidy_eligibility(subsidy, business_profile):
                eligible_subsidies.append(subsidy)
        
        return eligible_subsidies
    
    def _check_subsidy_eligibility(self, subsidy: SubsidyProgram, business_profile: Dict[str, Any]) -> bool:
        """Check if a business is eligible for a subsidy"""
        # Check business type
        if subsidy.business_types != ["ALL"]:
            kad = business_profile.get("kad", "")
            if not any(kad.startswith(bt) for bt in subsidy.business_types):
                return False
        
        # Check region
        if subsidy.regions != ["Όλη η Ελλάδα"]:
            business_region = business_profile.get("region", "")
            if business_region not in subsidy.regions:
                return False
        
        # Check specific criteria
        if subsidy.id == "dypa_youth_2024":
            return business_profile.get("employees", 0) <= 250
        elif subsidy.id == "startup_greece_2024":
            return (business_profile.get("is_startup", False) and 
                   business_profile.get("owner_age", 0) <= 45)
        
        return True
    
    async def get_government_documents(self, category: Optional[str] = None) -> List[GovernmentDocument]:
        """Get available government documents, optionally filtered by category"""
        if category:
            return [doc for doc in self.mock_documents if doc.type == category]
        return self.mock_documents
    
    async def get_tax_obligations(self, business_profile: Dict[str, Any]) -> List[TaxObligation]:
        """Get tax obligations for a business"""
        # In production, this would consider business type, size, etc.
        return self.mock_tax_obligations
    
    async def get_upcoming_deadlines(self, business_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get upcoming deadlines for a business"""
        deadlines = []
        
        # Add tax deadlines
        tax_obligations = await self.get_tax_obligations(business_profile)
        for obligation in tax_obligations:
            if obligation.is_recurring:
                next_deadline = self._calculate_next_deadline(obligation)
                deadlines.append({
                    "type": "tax",
                    "title": obligation.title,
                    "deadline": next_deadline,
                    "category": "urgent" if next_deadline <= datetime.now() + timedelta(days=7) else "normal"
                })
        
        # Add subsidy deadlines
        subsidies = await self.get_subsidies_for_business(business_profile)
        for subsidy in subsidies:
            deadline_date = datetime.strptime(subsidy.deadline, "%Y-%m-%d")
            if deadline_date > datetime.now():
                deadlines.append({
                    "type": "subsidy",
                    "title": subsidy.title,
                    "deadline": deadline_date,
                    "category": "opportunity"
                })
        
        # Sort by deadline
        deadlines.sort(key=lambda x: x["deadline"])
        
        return deadlines
    
    def _calculate_next_deadline(self, obligation: TaxObligation) -> datetime:
        """Calculate next deadline for recurring obligation"""
        today = datetime.now()
        
        if obligation.frequency == "monthly":
            # For monthly obligations like VAT (25th of each month)
            if "25η" in obligation.deadline:
                if today.day <= 25:
                    return datetime(today.year, today.month, 25)
                else:
                    next_month = today.replace(day=28) + timedelta(days=4)
                    return datetime(next_month.year, next_month.month, 25)
        
        elif obligation.frequency == "yearly":
            # For yearly obligations
            if "30 Ιουνίου" in obligation.deadline:
                year = today.year if today.month <= 6 else today.year + 1
                return datetime(year, 6, 30)
            elif "31 Μαρτίου" in obligation.deadline:
                year = today.year if today.month <= 3 else today.year + 1
                return datetime(year, 3, 31)
        
        return today + timedelta(days=30)  # Default fallback
    
    async def search_government_services(self, query: str) -> List[Dict[str, Any]]:
        """Search for government services and documents"""
        results = []
        
        # Search documents
        for doc in self.mock_documents:
            if query.lower() in doc.title.lower() or query.lower() in doc.description.lower():
                results.append({
                    "type": "document",
                    "title": doc.title,
                    "description": doc.description,
                    "ministry": doc.ministry,
                    "url": doc.url
                })
        
        # Search subsidies
        for subsidy in self.mock_subsidies:
            if query.lower() in subsidy.title.lower() or query.lower() in subsidy.description.lower():
                results.append({
                    "type": "subsidy",
                    "title": subsidy.title,
                    "description": subsidy.description,
                    "ministry": subsidy.ministry,
                    "amount": subsidy.amount,
                    "deadline": subsidy.deadline
                })
        
        return results
    
    async def get_business_insights(self, business_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Get AI-powered insights for a business"""
        insights = {
            "recommendations": [],
            "alerts": [],
            "opportunities": []
        }
        
        # Check for subsidy opportunities
        subsidies = await self.get_subsidies_for_business(business_profile)
        for subsidy in subsidies:
            deadline_date = datetime.strptime(subsidy.deadline, "%Y-%m-%d")
            if deadline_date > datetime.now():
                insights["opportunities"].append({
                    "type": "subsidy",
                    "title": f"Επιδότηση διαθέσιμη: {subsidy.title}",
                    "description": f"Μπορείτε να λάβετε έως €{subsidy.amount:,}",
                    "deadline": subsidy.deadline,
                    "priority": "high"
                })
        
        # Check for upcoming deadlines
        deadlines = await self.get_upcoming_deadlines(business_profile)
        for deadline in deadlines:
            days_until = (deadline["deadline"] - datetime.now()).days
            if days_until <= 7:
                insights["alerts"].append({
                    "type": "deadline",
                    "title": f"Επείγουσα προθεσμία: {deadline['title']}",
                    "description": f"Λήγει σε {days_until} ημέρες",
                    "deadline": deadline["deadline"].strftime("%d/%m/%Y"),
                    "priority": "urgent"
                })
        
        # Business-specific recommendations
        if business_profile.get("employees", 0) < 5:
            insights["recommendations"].append({
                "type": "growth",
                "title": "Επέκταση Προσωπικού",
                "description": "Εξετάστε επιδοτήσεις για πρόσληψη νέου προσωπικού",
                "action": "Δείτε διαθέσιμα προγράμματα ΔΥΠΑ"
            })
        
        if business_profile.get("is_startup", False):
            insights["recommendations"].append({
                "type": "startup",
                "title": "Startup Επιδοτήσεις",
                "description": "Ως νέα επιχείρηση, δικαιούστε ειδικές επιδοτήσεις",
                "action": "Εξετάστε το Startup Greece"
            })
        
        return insights
    
    async def generate_prefilled_form(self, form_id: str, business_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a prefilled government form"""
        form_data = {
            "form_id": form_id,
            "prefilled_data": {},
            "instructions": "",
            "submission_url": "",
            "deadline": ""
        }
        
        # Get document template
        document = next((doc for doc in self.mock_documents if doc.id == form_id), None)
        if not document:
            raise ValueError(f"Form {form_id} not found")
        
        # Prefill common business data
        common_data = {
            "business_name": business_data.get("name", ""),
            "afm": business_data.get("afm", ""),
            "address": business_data.get("address", ""),
            "phone": business_data.get("phone", ""),
            "email": business_data.get("email", ""),
            "kad": business_data.get("kad", ""),
            "region": business_data.get("region", "")
        }
        
        # Form-specific prefilling
        if form_id == "e3_form":
            form_data["prefilled_data"] = {
                **common_data,
                "employment_type": "Πλήρης Απασχόληση",
                "start_date": "",
                "employee_name": "",
                "employee_afm": ""
            }
            form_data["instructions"] = "Συμπληρώστε τα στοιχεία του νέου υπαλλήλου και υποβάλετε ηλεκτρονικά μέσω ΕΡΓΑΝΗ"
        
        elif form_id == "vat_return":
            form_data["prefilled_data"] = {
                **common_data,
                "tax_period": datetime.now().strftime("%m/%Y"),
                "total_sales": 0,
                "total_purchases": 0,
                "vat_output": 0,
                "vat_input": 0
            }
            form_data["instructions"] = "Συμπληρώστε τα στοιχεία εσόδων και εξόδων του μήνα"
        
        form_data["submission_url"] = document.url
        form_data["deadline"] = document.deadline
        
        return form_data

# Singleton instance
greek_gov_api = GreekGovernmentAPI()