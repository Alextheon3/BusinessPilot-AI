"""
Advanced AI Contract Generator & Analyzer for Greek Business
Comprehensive contract creation, analysis, and management system
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta
import re
import json
import asyncio
from pathlib import Path

logger = logging.getLogger(__name__)

class ContractType(Enum):
    EMPLOYMENT = "employment"
    SUPPLIER = "supplier"
    NDA = "nda"
    SERVICE = "service"
    RENTAL = "rental"
    PARTNERSHIP = "partnership"
    FRANCHISE = "franchise"
    CONSULTING = "consulting"
    DISTRIBUTION = "distribution"
    LICENSING = "licensing"

class ContractStatus(Enum):
    DRAFT = "draft"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    SIGNED = "signed"
    ACTIVE = "active"
    EXPIRED = "expired"
    TERMINATED = "terminated"

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class ContractClause:
    id: str
    title: str
    content: str
    is_required: bool
    risk_level: RiskLevel
    suggestions: List[str]
    legal_basis: Optional[str] = None
    alternatives: List[str] = None

@dataclass
class ContractAnalysis:
    contract_id: str
    overall_risk: RiskLevel
    compliance_score: float
    missing_clauses: List[str]
    risky_clauses: List[ContractClause]
    recommendations: List[str]
    legal_issues: List[str]
    financial_terms: Dict[str, Any]
    key_dates: List[Dict[str, Any]]
    parties: List[Dict[str, str]]
    termination_conditions: List[str]
    dispute_resolution: Optional[str]

@dataclass
class GeneratedContract:
    id: str
    contract_type: ContractType
    title: str
    content: str
    metadata: Dict[str, Any]
    clauses: List[ContractClause]
    variables: Dict[str, Any]
    status: ContractStatus
    created_at: datetime
    version: int
    legal_review_required: bool
    estimated_value: Optional[float] = None

class AIContractGenerator:
    """
    Advanced AI Contract Generator for Greek Business Contracts
    """
    
    def __init__(self):
        self.contract_templates = self._load_contract_templates()
        self.legal_clauses = self._load_legal_clauses()
        self.compliance_rules = self._load_compliance_rules()
        self.risk_patterns = self._load_risk_patterns()
        
    def _load_contract_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load comprehensive contract templates"""
        return {
            ContractType.EMPLOYMENT.value: {
                "template": """
ΣΥΜΒΑΣΗ ΕΡΓΑΣΙΑΣ ΑΟΡΙΣΤΟΥ ΧΡΟΝΟΥ

Στην {city}, σήμερα {date}, μεταξύ:

1. Της εταιρείας "{company_name}" με έδρα στην {company_address}, 
   ΑΦΜ: {company_afm}, ΔΟΥ: {company_doy}, 
   νομίμως εκπροσωπούμενης από τον/την {company_representative}
   (εφεξής "Εργοδότης")

2. Του/της {employee_name} {employee_surname}, 
   κάτοικος {employee_address}, 
   ΑΦΜ: {employee_afm}, ΑΜΚΑ: {employee_amka}
   (εφεξής "Εργαζόμενος")

ΣΥΜΦΩΝΗΘΗΚΑΝ ΚΑΙ ΕΓΙΝΑΝ ΑΜΟΙΒΑΙΩΣ ΑΠΟΔΕΚΤΑ ΤΑ ΑΚΟΛΟΥΘΑ:

ΑΡΘΡΟ 1 - ΑΝΤΙΚΕΙΜΕΝΟ ΕΡΓΑΣΙΑΣ
Ο Εργαζόμενος θα απασχολείται στη θέση: {job_position}
Αναλυτική περιγραφή καθηκόντων: {job_description}

ΑΡΘΡΟ 2 - ΑΜΟΙΒΗ
Ο μηνιαίος μισθός ορίζεται σε {salary}€ (μικτά).
Πληρωμή: {payment_schedule}

ΑΡΘΡΟ 3 - ΩΡΑΡΙΟ ΕΡΓΑΣΙΑΣ
Ωράριο: {work_hours} ώρες εβδομαδιαίως
Ημέρες εργασίας: {work_days}
Ωρες εργασίας: {work_schedule}

ΑΡΘΡΟ 4 - ΔΟΚΙΜΑΣΤΙΚΗ ΠΕΡΙΟΔΟΣ
Δοκιμαστική περίοδος: {probation_period} μήνες

ΑΡΘΡΟ 5 - ΑΔΕΙΕΣ
Ετήσια άδεια: {annual_leave} ημέρες
Ειδικές άδειες: Σύμφωνα με την κείμενη νομοθεσία

ΑΡΘΡΟ 6 - ΥΠΕΡΩΡΙΕΣ
Υπερωριακή απασχόληση: {overtime_policy}
Αμοιβή υπερωριών: 50% επιπλέον της κανονικής ωριαίας αμοιβής

ΑΡΘΡΟ 7 - ΕΜΠΙΣΤΕΥΤΙΚΟΤΗΤΑ
Ο Εργαζόμενος οφείλει να τηρεί απόλυτη εχεμύθεια.

ΑΡΘΡΟ 8 - ΚΑΤΑΓΓΕΛΙΑ
Καταγγελία από εργοδότη: {termination_notice_employer}
Καταγγελία από εργαζόμενο: {termination_notice_employee}

ΑΡΘΡΟ 9 - ΕΦΑΡΜΟΣΤΕΟ ΔΙΚΑΙΟ
Η σύμβαση διέπεται από την ελληνική νομοθεσία.

ΑΡΘΡΟ 10 - ΕΠΙΛΥΣΗ ΔΙΑΦΟΡΩΝ
Αρμόδια δικαστήρια: {jurisdiction}

Υπογραφές:
ΕΡΓΟΔΟΤΗΣ: ________________    ΕΡΓΑΖΟΜΕΝΟΣ: ________________
                """,
                "required_fields": [
                    "city", "date", "company_name", "company_address", "company_afm", 
                    "company_doy", "company_representative", "employee_name", 
                    "employee_surname", "employee_address", "employee_afm", 
                    "employee_amka", "job_position", "job_description", "salary",
                    "payment_schedule", "work_hours", "work_days", "work_schedule",
                    "probation_period", "annual_leave", "overtime_policy",
                    "termination_notice_employer", "termination_notice_employee",
                    "jurisdiction"
                ],
                "legal_requirements": [
                    "Ν. 4808/2021 - Εργατικό Δίκαιο",
                    "Ν. 2874/2000 - Ωρεργασία",
                    "Ν. 4093/2012 - Εργασιακές Σχέσεις"
                ]
            },
            
            ContractType.SUPPLIER.value: {
                "template": """
ΣΥΜΒΑΣΗ ΠΡΟΜΗΘΕΙΑΣ

Στην {city}, σήμερα {date}, μεταξύ:

1. Της εταιρείας "{buyer_company}" με έδρα στην {buyer_address},
   ΑΦΜ: {buyer_afm}, ΔΟΥ: {buyer_doy}
   (εφεξής "Αγοραστής")

2. Της εταιρείας "{supplier_company}" με έδρα στην {supplier_address},
   ΑΦΜ: {supplier_afm}, ΔΟΥ: {supplier_doy}
   (εφεξής "Προμηθευτής")

ΣΥΜΦΩΝΗΘΗΚΑΝ ΚΑΙ ΕΓΙΝΑΝ ΑΜΟΙΒΑΙΩΣ ΑΠΟΔΕΚΤΑ ΤΑ ΑΚΟΛΟΥΘΑ:

ΑΡΘΡΟ 1 - ΑΝΤΙΚΕΙΜΕΝΟ
Προμήθεια: {products_services}
Ποσότητα: {quantity}
Προδιαγραφές: {specifications}

ΑΡΘΡΟ 2 - ΤΙΜΗ
Συνολική αξία: {total_value}€
Μονάδα μέτρησης: {unit_measure}
Τιμή μονάδας: {unit_price}€

ΑΡΘΡΟ 3 - ΟΡΟΙ ΠΛΗΡΩΜΗΣ
Τρόπος πληρωμής: {payment_method}
Προθεσμία πληρωμής: {payment_terms}
Προκαταβολή: {advance_payment}

ΑΡΘΡΟ 4 - ΠΑΡΑΔΟΣΗ
Τόπος παράδοσης: {delivery_location}
Χρόνος παράδοσης: {delivery_time}
Μεταφορικά: {shipping_terms}

ΑΡΘΡΟ 5 - ΕΓΓΥΗΣΗ
Περίοδος εγγύησης: {warranty_period}
Όροι εγγύησης: {warranty_terms}

ΑΡΘΡΟ 6 - ΠΟΙΝΙΚΕΣ ΡΗΤΡΕΣ
Καθυστέρηση παράδοσης: {delay_penalty}
Ελαττωματικά προϊόντα: {defect_penalty}

ΑΡΘΡΟ 7 - ΑΝΩΤΕΡΑ ΒΙΑ
Αναστολή υποχρεώσεων σε περίπτωση ανωτέρας βίας.

ΑΡΘΡΟ 8 - ΚΑΤΑΓΓΕΛΙΑ
Δικαίωμα καταγγελίας: {termination_clause}

ΑΡΘΡΟ 9 - ΕΦΑΡΜΟΣΤΕΟ ΔΙΚΑΙΟ
Ελληνικό δίκαιο και αρμόδια δικαστήρια {jurisdiction}.

Υπογραφές:
ΑΓΟΡΑΣΤΗΣ: ________________    ΠΡΟΜΗΘΕΥΤΗΣ: ________________
                """,
                "required_fields": [
                    "city", "date", "buyer_company", "buyer_address", "buyer_afm",
                    "buyer_doy", "supplier_company", "supplier_address", 
                    "supplier_afm", "supplier_doy", "products_services",
                    "quantity", "specifications", "total_value", "unit_measure",
                    "unit_price", "payment_method", "payment_terms", 
                    "advance_payment", "delivery_location", "delivery_time",
                    "shipping_terms", "warranty_period", "warranty_terms",
                    "delay_penalty", "defect_penalty", "termination_clause",
                    "jurisdiction"
                ],
                "legal_requirements": [
                    "Αστικός Κώδικας - Συμβάσεις",
                    "Ν. 2251/1994 - Προστασία Καταναλωτή",
                    "Ν. 4072/2012 - Επιχειρηματικές Πρακτικές"
                ]
            },
            
            ContractType.NDA.value: {
                "template": """
ΣΥΜΦΩΝΗΤΙΚΟ ΕΜΠΙΣΤΕΥΤΙΚΟΤΗΤΑΣ (NDA)

Στην {city}, σήμερα {date}, μεταξύ:

1. Της εταιρείας "{party_a}" με έδρα στην {party_a_address},
   ΑΦΜ: {party_a_afm}
   (εφεξής "Αποκαλύπτων")

2. Της εταιρείας "{party_b}" με έδρα στην {party_b_address},
   ΑΦΜ: {party_b_afm}
   (εφεξής "Παραλήπτης")

ΣΥΜΦΩΝΗΘΗΚΑΝ ΚΑΙ ΕΓΙΝΑΝ ΑΜΟΙΒΑΙΩΣ ΑΠΟΔΕΚΤΑ ΤΑ ΑΚΟΛΟΥΘΑ:

ΑΡΘΡΟ 1 - ΣΚΟΠΟΣ
Σκοπός συνεργασίας: {purpose}
Διάρκεια συνεργασίας: {collaboration_period}

ΑΡΘΡΟ 2 - ΕΜΠΙΣΤΕΥΤΙΚΕΣ ΠΛΗΡΟΦΟΡΙΕΣ
Περιλαμβάνουν: {confidential_info_types}
Εξαιρέσεις: {exclusions}

ΑΡΘΡΟ 3 - ΥΠΟΧΡΕΩΣΕΙΣ ΠΑΡΑΛΗΠΤΗ
- Τήρηση απόλυτης εχεμύθειας
- Μη αποκάλυψη σε τρίτους
- Χρήση μόνο για τον προβλεπόμενο σκοπό
- Προστασία από μη εξουσιοδοτημένη πρόσβαση

ΑΡΘΡΟ 4 - ΔΙΑΡΚΕΙΑ ΕΜΠΙΣΤΕΥΤΙΚΟΤΗΤΑΣ
Διάρκεια: {confidentiality_period}
Επιστροφή πληροφοριών: {return_period}

ΑΡΘΡΟ 5 - ΚΥΡΩΣΕΙΣ
Ποινική ρήτρα: {penalty_amount}€
Δικαίωμα αποζημίωσης: {damages_clause}

ΑΡΘΡΟ 6 - ΕΦΑΡΜΟΣΤΕΟ ΔΙΚΑΙΟ
Ελληνικό δίκαιο και αρμόδια δικαστήρια {jurisdiction}.

Υπογραφές:
ΑΠΟΚΑΛΥΠΤΩΝ: ________________    ΠΑΡΑΛΗΠΤΗΣ: ________________
                """,
                "required_fields": [
                    "city", "date", "party_a", "party_a_address", "party_a_afm",
                    "party_b", "party_b_address", "party_b_afm", "purpose",
                    "collaboration_period", "confidential_info_types", "exclusions",
                    "confidentiality_period", "return_period", "penalty_amount",
                    "damages_clause", "jurisdiction"
                ],
                "legal_requirements": [
                    "Αστικός Κώδικας - Αδικοπραξία",
                    "Ν. 2472/1997 - Προστασία Δεδομένων",
                    "GDPR - Κανονισμός Προστασίας Δεδομένων"
                ]
            }
        }
    
    def _load_legal_clauses(self) -> Dict[str, List[ContractClause]]:
        """Load standard legal clauses"""
        return {
            "employment": [
                ContractClause(
                    id="probation_period",
                    title="Δοκιμαστική Περίοδος",
                    content="Ορίζεται δοκιμαστική περίοδος {duration} μηνών",
                    is_required=True,
                    risk_level=RiskLevel.LOW,
                    suggestions=["Μέγιστη διάρκεια 12 μήνες", "Δυνατότητα παράτασης"],
                    legal_basis="Ν. 4808/2021, άρθρο 67"
                ),
                ContractClause(
                    id="overtime_compensation",
                    title="Αμοιβή Υπερωριών",
                    content="Αμοιβή υπερωριών 50% επιπλέον της κανονικής ωριαίας αμοιβής",
                    is_required=True,
                    risk_level=RiskLevel.MEDIUM,
                    suggestions=["Καθορίστε ανώτατο όριο υπερωριών", "Προβλέψτε έγκριση προϊσταμένου"],
                    legal_basis="Ν. 2874/2000, άρθρο 1"
                ),
                ContractClause(
                    id="confidentiality",
                    title="Εμπιστευτικότητα",
                    content="Υποχρέωση τήρησης απόλυτης εχεμύθειας",
                    is_required=True,
                    risk_level=RiskLevel.HIGH,
                    suggestions=["Καθορίστε διάρκεια εμπιστευτικότητας", "Προβλέψτε κυρώσεις"],
                    legal_basis="Αστικός Κώδικας, άρθρο 914"
                )
            ],
            "supplier": [
                ContractClause(
                    id="delivery_terms",
                    title="Όροι Παράδοσης",
                    content="Παράδοση εντός {timeframe} από την παραγγελία",
                    is_required=True,
                    risk_level=RiskLevel.MEDIUM,
                    suggestions=["Προβλέψτε ποινικές ρήτρες", "Καθορίστε τόπο παράδοσης"],
                    legal_basis="Αστικός Κώδικας, άρθρο 361"
                ),
                ContractClause(
                    id="quality_guarantee",
                    title="Εγγύηση Ποιότητας",
                    content="Εγγύηση ποιότητας για {period} από την παράδοση",
                    is_required=True,
                    risk_level=RiskLevel.HIGH,
                    suggestions=["Καθορίστε διαδικασία επιστροφής", "Προβλέψτε αντικατάσταση"],
                    legal_basis="Αστικός Κώδικας, άρθρο 534"
                )
            ]
        }
    
    def _load_compliance_rules(self) -> Dict[str, List[str]]:
        """Load compliance rules for different contract types"""
        return {
            "employment": [
                "Δήλωση στην ΕΡΓΑΝΗ πριν την έναρξη",
                "Ασφαλιστική κάλυψη στον ΕΦΚΑ",
                "Τήρηση ωραρίου εργασίας",
                "Καταβολή εισφορών εργοδότη"
            ],
            "supplier": [
                "Έκδοση τιμολογίου σύμφωνα με το myDATA",
                "Πληρωμή ΦΠΑ",
                "Τήρηση βιβλίων αγορών-πωλήσεων",
                "Φορολογική ενημερότητα"
            ],
            "nda": [
                "Συμμόρφωση με GDPR",
                "Καταχώρηση επεξεργασίας δεδομένων",
                "Τήρηση μητρώου δραστηριοτήτων",
                "Αξιολόγηση επιπτώσεων"
            ]
        }
    
    def _load_risk_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Load risk detection patterns"""
        return {
            "unlimited_liability": {
                "pattern": r"(απεριόριστη|ανεξάρτητη|πλήρη)\s+(ευθύνη|αστική ευθύνη)",
                "risk_level": RiskLevel.CRITICAL,
                "warning": "Απεριόριστη ευθύνη - υψηλός κίνδυνος"
            },
            "vague_termination": {
                "pattern": r"(οποιαδήποτε στιγμή|χωρίς προειδοποίηση|άμεσα)",
                "risk_level": RiskLevel.HIGH,
                "warning": "Ασαφείς όροι καταγγελίας"
            },
            "no_payment_terms": {
                "pattern": r"πληρωμή.*μεταγενέστερα",
                "risk_level": RiskLevel.HIGH,
                "warning": "Ασαφείς όροι πληρωμής"
            },
            "excessive_penalty": {
                "pattern": r"ποινική ρήτρα.*([5-9][0-9]|100)%",
                "risk_level": RiskLevel.MEDIUM,
                "warning": "Υψηλή ποινική ρήτρα"
            }
        }
    
    async def generate_contract(
        self, 
        contract_type: ContractType,
        variables: Dict[str, Any],
        customizations: Optional[Dict[str, Any]] = None
    ) -> GeneratedContract:
        """Generate a complete contract with AI assistance"""
        
        try:
            # Get template
            template_data = self.contract_templates[contract_type.value]
            template = template_data["template"]
            
            # Validate required fields
            required_fields = template_data["required_fields"]
            missing_fields = [field for field in required_fields if field not in variables]
            
            if missing_fields:
                raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
            
            # Generate content
            content = template.format(**variables)
            
            # Add AI-generated clauses
            ai_clauses = await self._generate_ai_clauses(contract_type, variables)
            content += "\n\n" + ai_clauses
            
            # Get legal clauses
            legal_clauses = self.legal_clauses.get(contract_type.value, [])
            
            # Create contract
            contract = GeneratedContract(
                id=f"contract_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                contract_type=contract_type,
                title=f"{contract_type.value.title()} Contract - {variables.get('company_name', 'Unknown')}",
                content=content,
                metadata={
                    "template_version": "1.0",
                    "generated_at": datetime.now().isoformat(),
                    "legal_requirements": template_data["legal_requirements"],
                    "compliance_rules": self.compliance_rules.get(contract_type.value, [])
                },
                clauses=legal_clauses,
                variables=variables,
                status=ContractStatus.DRAFT,
                created_at=datetime.now(),
                version=1,
                legal_review_required=self._requires_legal_review(contract_type, variables),
                estimated_value=variables.get("total_value") or variables.get("salary")
            )
            
            return contract
            
        except Exception as e:
            logger.error(f"Error generating contract: {str(e)}")
            raise
    
    async def _generate_ai_clauses(self, contract_type: ContractType, variables: Dict[str, Any]) -> str:
        """Generate AI-powered additional clauses"""
        
        ai_clauses = []
        
        # Add dispute resolution clause
        ai_clauses.append("""
ΑΡΘΡΟ - ΕΠΙΛΥΣΗ ΔΙΑΦΟΡΩΝ
Τυχόν διαφορές θα επιλύονται πρώτα με διαπραγμάτευση. 
Σε περίπτωση αποτυχίας, θα προσφεύγουμε σε διαμεσολάβηση.
Έσχατη λύση είναι η προσφυγή στα αρμόδια δικαστήρια.
        """)
        
        # Add force majeure clause
        ai_clauses.append("""
ΑΡΘΡΟ - ΑΝΩΤΕΡΑ ΒΙΑ
Οι συμβαλλόμενοι απαλλάσσονται από την εκπλήρωση των υποχρεώσεών τους
σε περίπτωση ανωτέρας βίας (φυσικές καταστροφές, πόλεμος, κυβερνητικές αποφάσεις).
        """)
        
        # Add modification clause
        ai_clauses.append("""
ΑΡΘΡΟ - ΤΡΟΠΟΠΟΙΗΣΕΙΣ
Τυχόν τροποποιήσεις της παρούσας σύμβασης θα γίνονται εγγράφως
και θα υπογράφονται από όλα τα συμβαλλόμενα μέρη.
        """)
        
        return "\n".join(ai_clauses)
    
    def _requires_legal_review(self, contract_type: ContractType, variables: Dict[str, Any]) -> bool:
        """Determine if contract requires legal review"""
        
        # High-value contracts need review
        if variables.get("total_value", 0) > 50000:
            return True
        
        # Employment contracts with high salaries need review
        if contract_type == ContractType.EMPLOYMENT and variables.get("salary", 0) > 3000:
            return True
        
        # Complex contract types need review
        if contract_type in [ContractType.PARTNERSHIP, ContractType.FRANCHISE, ContractType.LICENSING]:
            return True
        
        return False
    
    async def analyze_contract(self, contract_content: str, contract_type: Optional[ContractType] = None) -> ContractAnalysis:
        """Analyze existing contract for risks and compliance"""
        
        try:
            # Initialize analysis
            analysis = ContractAnalysis(
                contract_id=f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                overall_risk=RiskLevel.LOW,
                compliance_score=85.0,
                missing_clauses=[],
                risky_clauses=[],
                recommendations=[],
                legal_issues=[],
                financial_terms={},
                key_dates=[],
                parties=[],
                termination_conditions=[],
                dispute_resolution=None
            )
            
            # Extract parties
            parties = self._extract_parties(contract_content)
            analysis.parties = parties
            
            # Extract financial terms
            financial_terms = self._extract_financial_terms(contract_content)
            analysis.financial_terms = financial_terms
            
            # Extract key dates
            key_dates = self._extract_key_dates(contract_content)
            analysis.key_dates = key_dates
            
            # Risk analysis
            risks = self._analyze_risks(contract_content)
            analysis.risky_clauses = risks
            
            # Missing clauses check
            missing_clauses = self._check_missing_clauses(contract_content, contract_type)
            analysis.missing_clauses = missing_clauses
            
            # Legal issues
            legal_issues = self._identify_legal_issues(contract_content)
            analysis.legal_issues = legal_issues
            
            # Generate recommendations
            recommendations = self._generate_recommendations(analysis)
            analysis.recommendations = recommendations
            
            # Calculate overall risk
            analysis.overall_risk = self._calculate_overall_risk(analysis)
            
            # Calculate compliance score
            analysis.compliance_score = self._calculate_compliance_score(analysis)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing contract: {str(e)}")
            raise
    
    def _extract_parties(self, content: str) -> List[Dict[str, str]]:
        """Extract contract parties"""
        parties = []
        
        # Pattern for Greek company format
        party_pattern = r'(\d+\.\s+)([^,]+),?\s+με έδρα\s+([^,]+),?\s+ΑΦΜ:\s*([^\s,]+)'
        matches = re.findall(party_pattern, content)
        
        for match in matches:
            parties.append({
                "name": match[1].strip(),
                "address": match[2].strip(),
                "afm": match[3].strip(),
                "type": "company"
            })
        
        return parties
    
    def _extract_financial_terms(self, content: str) -> Dict[str, Any]:
        """Extract financial terms from contract"""
        terms = {}
        
        # Extract amounts
        amount_patterns = [
            (r'μισθός.*?(\d+(?:\.\d+)?)\s*€', 'salary'),
            (r'αμοιβή.*?(\d+(?:\.\d+)?)\s*€', 'fee'),
            (r'τιμή.*?(\d+(?:\.\d+)?)\s*€', 'price'),
            (r'αξία.*?(\d+(?:\.\d+)?)\s*€', 'value'),
            (r'ποινική ρήτρα.*?(\d+(?:\.\d+)?)\s*€', 'penalty')
        ]
        
        for pattern, key in amount_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                terms[key] = float(matches[0])
        
        # Extract payment terms
        payment_pattern = r'πληρωμή.*?(\d+)\s*(ημέρες|μήνες|εβδομάδες)'
        payment_match = re.search(payment_pattern, content, re.IGNORECASE)
        if payment_match:
            terms['payment_terms'] = f"{payment_match.group(1)} {payment_match.group(2)}"
        
        return terms
    
    def _extract_key_dates(self, content: str) -> List[Dict[str, Any]]:
        """Extract important dates from contract"""
        dates = []
        
        # Date patterns
        date_patterns = [
            (r'έναρξη.*?(\d{1,2}[/.]\d{1,2}[/.]\d{4})', 'start_date'),
            (r'λήξη.*?(\d{1,2}[/.]\d{1,2}[/.]\d{4})', 'end_date'),
            (r'παράδοση.*?(\d{1,2}[/.]\d{1,2}[/.]\d{4})', 'delivery_date'),
            (r'δοκιμαστική.*?(\d+)\s*(μήνες|εβδομάδες)', 'probation_period')
        ]
        
        for pattern, date_type in date_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                dates.append({
                    "type": date_type,
                    "value": matches[0] if isinstance(matches[0], str) else matches[0][0],
                    "description": f"Ημερομηνία {date_type}"
                })
        
        return dates
    
    def _analyze_risks(self, content: str) -> List[ContractClause]:
        """Analyze content for risk patterns"""
        risky_clauses = []
        
        for risk_id, risk_data in self.risk_patterns.items():
            pattern = risk_data["pattern"]
            matches = re.findall(pattern, content, re.IGNORECASE)
            
            if matches:
                risky_clauses.append(ContractClause(
                    id=risk_id,
                    title=risk_data["warning"],
                    content=matches[0] if isinstance(matches[0], str) else ' '.join(matches[0]),
                    is_required=False,
                    risk_level=risk_data["risk_level"],
                    suggestions=[
                        "Επανεξετάστε τον όρο",
                        "Συμβουλευτείτε νομικό σύμβουλο",
                        "Διαπραγματευτείτε καλύτερους όρους"
                    ]
                ))
        
        return risky_clauses
    
    def _check_missing_clauses(self, content: str, contract_type: Optional[ContractType]) -> List[str]:
        """Check for missing essential clauses"""
        missing = []
        
        # Essential clauses for all contracts
        essential_clauses = [
            ("εφαρμοστέο δίκαιο", "Εφαρμοστέο δίκαιο"),
            ("αρμόδια δικαστήρια", "Αρμόδια δικαστήρια"),
            ("τροποποιήσεις", "Τροποποίηση σύμβασης"),
            ("ανωτέρα βία", "Ανωτέρα βία")
        ]
        
        for pattern, clause_name in essential_clauses:
            if not re.search(pattern, content, re.IGNORECASE):
                missing.append(clause_name)
        
        # Contract-specific clauses
        if contract_type == ContractType.EMPLOYMENT:
            employment_clauses = [
                ("δοκιμαστική περίοδος", "Δοκιμαστική περίοδος"),
                ("υπερωρίες", "Ρύθμιση υπερωριών"),
                ("αποζημίωση", "Αποζημίωση απόλυσης")
            ]
            
            for pattern, clause_name in employment_clauses:
                if not re.search(pattern, content, re.IGNORECASE):
                    missing.append(clause_name)
        
        return missing
    
    def _identify_legal_issues(self, content: str) -> List[str]:
        """Identify potential legal issues"""
        issues = []
        
        # Check for discriminatory language
        discriminatory_patterns = [
            r'(άνδρας|γυναίκα)\s+μόνο',
            r'ηλικία.*?(κάτω|πάνω)\s+από',
            r'(έγγαμος|άγαμος)\s+προτιμάται'
        ]
        
        for pattern in discriminatory_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                issues.append("Πιθανή διακριτική γλώσσα")
                break
        
        # Check for illegal clauses
        if re.search(r'παραίτηση.*?δικαιωμάτων', content, re.IGNORECASE):
            issues.append("Παραίτηση από θεμελιώδη δικαιώματα")
        
        # Check for GDPR compliance
        if re.search(r'προσωπικά δεδομένα', content, re.IGNORECASE):
            if not re.search(r'GDPR|προστασία δεδομένων', content, re.IGNORECASE):
                issues.append("Απουσιάζει αναφορά σε GDPR")
        
        return issues
    
    def _generate_recommendations(self, analysis: ContractAnalysis) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        # Based on missing clauses
        if analysis.missing_clauses:
            recommendations.append(f"Προσθέστε {len(analysis.missing_clauses)} απαραίτητες ρήτρες")
        
        # Based on risky clauses
        if analysis.risky_clauses:
            high_risk_clauses = [c for c in analysis.risky_clauses if c.risk_level == RiskLevel.HIGH]
            if high_risk_clauses:
                recommendations.append(f"Επανεξετάστε {len(high_risk_clauses)} υψηλού κινδύνου ρήτρες")
        
        # Based on legal issues
        if analysis.legal_issues:
            recommendations.append("Συμβουλευτείτε νομικό για τα εντοπισμένα θέματα")
        
        # Financial recommendations
        if analysis.financial_terms:
            if 'payment_terms' not in analysis.financial_terms:
                recommendations.append("Καθορίστε σαφείς όρους πληρωμής")
            
            if 'penalty' not in analysis.financial_terms:
                recommendations.append("Προσθέστε ποινικές ρήτρες")
        
        # General recommendations
        recommendations.extend([
            "Ελέγξτε τη συμμόρφωση με την ισχύουσα νομοθεσία",
            "Εξετάστε τη δυνατότητα διαμεσολάβησης",
            "Καθορίστε διαδικασίες επίλυσης διαφορών"
        ])
        
        return recommendations
    
    def _calculate_overall_risk(self, analysis: ContractAnalysis) -> RiskLevel:
        """Calculate overall risk level"""
        risk_score = 0
        
        # Critical issues
        if analysis.legal_issues:
            risk_score += len(analysis.legal_issues) * 30
        
        # High-risk clauses
        high_risk_clauses = [c for c in analysis.risky_clauses if c.risk_level == RiskLevel.HIGH]
        risk_score += len(high_risk_clauses) * 20
        
        # Missing clauses
        risk_score += len(analysis.missing_clauses) * 10
        
        # Determine risk level
        if risk_score >= 80:
            return RiskLevel.CRITICAL
        elif risk_score >= 50:
            return RiskLevel.HIGH
        elif risk_score >= 20:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def _calculate_compliance_score(self, analysis: ContractAnalysis) -> float:
        """Calculate compliance score (0-100)"""
        base_score = 100.0
        
        # Deduct for missing clauses
        base_score -= len(analysis.missing_clauses) * 5
        
        # Deduct for legal issues
        base_score -= len(analysis.legal_issues) * 10
        
        # Deduct for risky clauses
        for clause in analysis.risky_clauses:
            if clause.risk_level == RiskLevel.CRITICAL:
                base_score -= 20
            elif clause.risk_level == RiskLevel.HIGH:
                base_score -= 15
            elif clause.risk_level == RiskLevel.MEDIUM:
                base_score -= 10
        
        return max(0.0, min(100.0, base_score))
    
    async def compare_contracts(self, contract_a: str, contract_b: str) -> Dict[str, Any]:
        """Compare two contracts and highlight differences"""
        
        try:
            # Analyze both contracts
            analysis_a = await self.analyze_contract(contract_a)
            analysis_b = await self.analyze_contract(contract_b)
            
            comparison = {
                "contract_a": {
                    "compliance_score": analysis_a.compliance_score,
                    "risk_level": analysis_a.overall_risk.value,
                    "missing_clauses": analysis_a.missing_clauses,
                    "financial_terms": analysis_a.financial_terms
                },
                "contract_b": {
                    "compliance_score": analysis_b.compliance_score,
                    "risk_level": analysis_b.overall_risk.value,
                    "missing_clauses": analysis_b.missing_clauses,
                    "financial_terms": analysis_b.financial_terms
                },
                "differences": {
                    "compliance_diff": analysis_b.compliance_score - analysis_a.compliance_score,
                    "risk_comparison": f"{analysis_a.overall_risk.value} vs {analysis_b.overall_risk.value}",
                    "unique_clauses_a": list(set(analysis_a.missing_clauses) - set(analysis_b.missing_clauses)),
                    "unique_clauses_b": list(set(analysis_b.missing_clauses) - set(analysis_a.missing_clauses)),
                    "financial_differences": self._compare_financial_terms(
                        analysis_a.financial_terms, 
                        analysis_b.financial_terms
                    )
                },
                "recommendation": self._get_comparison_recommendation(analysis_a, analysis_b)
            }
            
            return comparison
            
        except Exception as e:
            logger.error(f"Error comparing contracts: {str(e)}")
            raise
    
    def _compare_financial_terms(self, terms_a: Dict[str, Any], terms_b: Dict[str, Any]) -> Dict[str, Any]:
        """Compare financial terms between contracts"""
        differences = {}
        
        all_keys = set(terms_a.keys()) | set(terms_b.keys())
        
        for key in all_keys:
            value_a = terms_a.get(key)
            value_b = terms_b.get(key)
            
            if value_a != value_b:
                differences[key] = {
                    "contract_a": value_a,
                    "contract_b": value_b,
                    "difference": (value_b - value_a) if (value_a and value_b and isinstance(value_a, (int, float))) else None
                }
        
        return differences
    
    def _get_comparison_recommendation(self, analysis_a: ContractAnalysis, analysis_b: ContractAnalysis) -> str:
        """Get recommendation for contract comparison"""
        
        if analysis_a.compliance_score > analysis_b.compliance_score:
            return "Το πρώτο συμβόλαιο έχει υψηλότερη συμμόρφωση"
        elif analysis_b.compliance_score > analysis_a.compliance_score:
            return "Το δεύτερο συμβόλαιο έχει υψηλότερη συμμόρφωση"
        else:
            return "Τα συμβόλαια έχουν παρόμοια επίπεδα συμμόρφωσης"

# Singleton instance
ai_contract_generator = AIContractGenerator()