from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import re
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class VerificationStatus(Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    FAILED = "failed"
    NEEDS_REVIEW = "needs_review"

class ComplianceLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class VerificationResult:
    field: str
    status: VerificationStatus
    message: str
    score: float  # 0-100
    suggestions: List[str]
    required_documents: List[str]

@dataclass
class ComplianceCheck:
    check_id: str
    title: str
    description: str
    level: ComplianceLevel
    status: VerificationStatus
    last_checked: datetime
    next_check_due: datetime
    remediation_actions: List[str]

class BusinessVerificationService:
    """
    Service for verifying business information and ensuring compliance
    """
    
    def __init__(self):
        self.verification_rules = self._load_verification_rules()
        self.compliance_checks = self._load_compliance_checks()
    
    def _load_verification_rules(self) -> Dict[str, Any]:
        """Load verification rules for different business fields"""
        return {
            'afm': {
                'pattern': r'^\d{9}$',
                'checksum': True,
                'required': True,
                'description': 'Αριθμός Φορολογικού Μητρώου (ΑΦΜ) - 9 ψηφία'
            },
            'amka': {
                'pattern': r'^\d{11}$',
                'checksum': True,
                'required': True,
                'description': 'Αριθμός Μητρώου Κοινωνικής Ασφάλισης (ΑΜΚΑ) - 11 ψηφία'
            },
            'kad': {
                'pattern': r'^\d{4,5}$',
                'required': True,
                'description': 'Κωδικός Αριθμός Δραστηριότητας (ΚΑΔ)'
            },
            'postal_code': {
                'pattern': r'^\d{5}$',
                'required': True,
                'description': 'Ταχυδρομικός κώδικας - 5 ψηφία'
            },
            'iban': {
                'pattern': r'^GR\d{2}[A-Z0-9]{23}$',
                'checksum': True,
                'required': True,
                'description': 'Διεθνής Αριθμός Τραπεζικού Λογαριασμού (IBAN)'
            },
            'email': {
                'pattern': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                'required': True,
                'description': 'Έγκυρη διεύθυνση email'
            },
            'phone': {
                'pattern': r'^(\+30|0030|30)?(69|21|22|23|24|25|26|27|28)\d{8}$',
                'required': True,
                'description': 'Έγκυρος αριθμός τηλεφώνου'
            }
        }
    
    def _load_compliance_checks(self) -> List[ComplianceCheck]:
        """Load compliance checks for Greek businesses"""
        now = datetime.now()
        return [
            ComplianceCheck(
                check_id="tax_registration",
                title="Φορολογική Εγγραφή",
                description="Επιχείρηση εγγεγραμμένη στο φορολογικό μητρώο",
                level=ComplianceLevel.CRITICAL,
                status=VerificationStatus.PENDING,
                last_checked=now,
                next_check_due=now + timedelta(days=30),
                remediation_actions=["Επικοινωνήστε με τη ΔΟΥ", "Υποβάλετε αίτηση εγγραφής"]
            ),
            ComplianceCheck(
                check_id="insurance_registration",
                title="Ασφαλιστική Εγγραφή",
                description="Επιχείρηση εγγεγραμμένη στον ΕΦΚΑ",
                level=ComplianceLevel.CRITICAL,
                status=VerificationStatus.PENDING,
                last_checked=now,
                next_check_due=now + timedelta(days=30),
                remediation_actions=["Επικοινωνήστε με τον ΕΦΚΑ", "Υποβάλετε αίτηση εγγραφής"]
            ),
            ComplianceCheck(
                check_id="business_license",
                title="Άδεια Λειτουργίας",
                description="Έγκυρη άδεια λειτουργίας επιχείρησης",
                level=ComplianceLevel.HIGH,
                status=VerificationStatus.PENDING,
                last_checked=now,
                next_check_due=now + timedelta(days=365),
                remediation_actions=["Ελέγξτε την ισχύ της άδειας", "Ανανεώστε την άδεια"]
            ),
            ComplianceCheck(
                check_id="employee_declarations",
                title="Δηλώσεις Εργαζομένων",
                description="Ενημερωμένες δηλώσεις εργαζομένων στην ΕΡΓΑΝΗ",
                level=ComplianceLevel.HIGH,
                status=VerificationStatus.PENDING,
                last_checked=now,
                next_check_due=now + timedelta(days=1),
                remediation_actions=["Ελέγξτε τις δηλώσεις", "Υποβάλετε τροποποιήσεις"]
            ),
            ComplianceCheck(
                check_id="tax_obligations",
                title="Φορολογικές Υποχρεώσεις",
                description="Τρέχουσες φορολογικές υποχρεώσεις",
                level=ComplianceLevel.MEDIUM,
                status=VerificationStatus.PENDING,
                last_checked=now,
                next_check_due=now + timedelta(days=30),
                remediation_actions=["Ελέγξτε τις υποχρεώσεις", "Εξοφλήστε τα οφειλόμενα"]
            )
        ]
    
    def verify_business_data(self, business_data: Dict[str, Any]) -> List[VerificationResult]:
        """Verify all business data fields"""
        results = []
        
        for field, value in business_data.items():
            if field in self.verification_rules:
                result = self._verify_field(field, value)
                results.append(result)
        
        return results
    
    def _verify_field(self, field: str, value: Any) -> VerificationResult:
        """Verify a single field"""
        rule = self.verification_rules[field]
        
        # Check if required field is present
        if rule.get('required', False) and not value:
            return VerificationResult(
                field=field,
                status=VerificationStatus.FAILED,
                message=f"Το πεδίο '{field}' είναι υποχρεωτικό",
                score=0,
                suggestions=[f"Συμπληρώστε το πεδίο '{field}'"],
                required_documents=[]
            )
        
        # Check pattern if value exists
        if value and 'pattern' in rule:
            pattern = rule['pattern']
            if not re.match(pattern, str(value)):
                return VerificationResult(
                    field=field,
                    status=VerificationStatus.FAILED,
                    message=f"Μη έγκυρος τύπος δεδομένων για '{field}': {rule['description']}",
                    score=25,
                    suggestions=[f"Ελέγξτε τη μορφή του '{field}'", rule['description']],
                    required_documents=[]
                )
        
        # Additional validation for specific fields
        if field == 'afm' and value:
            is_valid_afm = self._validate_afm(value)
            if not is_valid_afm:
                return VerificationResult(
                    field=field,
                    status=VerificationStatus.FAILED,
                    message="Μη έγκυρος ΑΦΜ - αποτυχία checksum",
                    score=25,
                    suggestions=["Ελέγξτε τον ΑΦΜ", "Επιβεβαιώστε τα ψηφία"],
                    required_documents=["Φορολογική ενημερότητα"]
                )
        
        if field == 'amka' and value:
            is_valid_amka = self._validate_amka(value)
            if not is_valid_amka:
                return VerificationResult(
                    field=field,
                    status=VerificationStatus.FAILED,
                    message="Μη έγκυρος ΑΜΚΑ - αποτυχία checksum",
                    score=25,
                    suggestions=["Ελέγξτε τον ΑΜΚΑ", "Επιβεβαιώστε τα ψηφία"],
                    required_documents=["Ασφαλιστική ενημερότητα"]
                )
        
        if field == 'iban' and value:
            is_valid_iban = self._validate_iban(value)
            if not is_valid_iban:
                return VerificationResult(
                    field=field,
                    status=VerificationStatus.FAILED,
                    message="Μη έγκυρος IBAN",
                    score=25,
                    suggestions=["Ελέγξτε τον IBAN", "Επιβεβαιώστε με την τράπεζα"],
                    required_documents=["Τραπεζικό εκκαθαριστικό"]
                )
        
        # If all checks pass
        return VerificationResult(
            field=field,
            status=VerificationStatus.VERIFIED,
            message=f"Το πεδίο '{field}' είναι έγκυρο",
            score=100,
            suggestions=[],
            required_documents=[]
        )
    
    def _validate_afm(self, afm: str) -> bool:
        """Validate Greek AFM using checksum algorithm"""
        if not afm or len(afm) != 9 or not afm.isdigit():
            return False
        
        # AFM checksum algorithm
        weights = [256, 128, 64, 32, 16, 8, 4, 2]
        total = sum(int(afm[i]) * weights[i] for i in range(8))
        
        checksum = total % 11
        if checksum == 10:
            checksum = 0
        
        return checksum == int(afm[8])
    
    def _validate_amka(self, amka: str) -> bool:
        """Validate Greek AMKA using checksum algorithm"""
        if not amka or len(amka) != 11 or not amka.isdigit():
            return False
        
        # AMKA checksum algorithm (simplified)
        weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        total = sum(int(amka[i]) * weights[i] for i in range(10))
        
        checksum = total % 11
        if checksum == 10:
            checksum = 0
        
        return checksum == int(amka[10])
    
    def _validate_iban(self, iban: str) -> bool:
        """Validate Greek IBAN using MOD-97 algorithm"""
        if not iban or len(iban) != 27 or not iban.upper().startswith('GR'):
            return False
        
        # Basic IBAN validation (simplified)
        iban = iban.upper().replace(' ', '')
        
        # Move first 4 characters to end
        rearranged = iban[4:] + iban[:4]
        
        # Replace letters with numbers (A=10, B=11, etc.)
        numeric = ''
        for char in rearranged:
            if char.isdigit():
                numeric += char
            else:
                numeric += str(ord(char) - ord('A') + 10)
        
        # MOD-97 check
        try:
            return int(numeric) % 97 == 1
        except:
            return False
    
    def run_compliance_checks(self, business_data: Dict[str, Any]) -> List[ComplianceCheck]:
        """Run all compliance checks for a business"""
        checks = self.compliance_checks.copy()
        
        for check in checks:
            # Mock compliance check results
            if check.check_id == "tax_registration":
                if business_data.get('afm'):
                    check.status = VerificationStatus.VERIFIED
                else:
                    check.status = VerificationStatus.FAILED
            
            elif check.check_id == "insurance_registration":
                if business_data.get('ownerAmka'):
                    check.status = VerificationStatus.VERIFIED
                else:
                    check.status = VerificationStatus.FAILED
            
            elif check.check_id == "business_license":
                if business_data.get('kad'):
                    check.status = VerificationStatus.NEEDS_REVIEW
                else:
                    check.status = VerificationStatus.FAILED
            
            elif check.check_id == "employee_declarations":
                employees = business_data.get('employees', 0)
                if employees > 0:
                    check.status = VerificationStatus.NEEDS_REVIEW
                else:
                    check.status = VerificationStatus.VERIFIED
            
            elif check.check_id == "tax_obligations":
                check.status = VerificationStatus.PENDING
        
        return checks
    
    def get_overall_compliance_score(self, verification_results: List[VerificationResult], 
                                   compliance_checks: List[ComplianceCheck]) -> Dict[str, Any]:
        """Calculate overall compliance score"""
        
        # Calculate verification score
        if verification_results:
            verification_score = sum(r.score for r in verification_results) / len(verification_results)
        else:
            verification_score = 0
        
        # Calculate compliance score
        compliance_weights = {
            ComplianceLevel.CRITICAL: 40,
            ComplianceLevel.HIGH: 30,
            ComplianceLevel.MEDIUM: 20,
            ComplianceLevel.LOW: 10
        }
        
        status_scores = {
            VerificationStatus.VERIFIED: 100,
            VerificationStatus.NEEDS_REVIEW: 75,
            VerificationStatus.PENDING: 50,
            VerificationStatus.FAILED: 0
        }
        
        total_weight = 0
        weighted_score = 0
        
        for check in compliance_checks:
            weight = compliance_weights[check.level]
            score = status_scores[check.status]
            total_weight += weight
            weighted_score += weight * score
        
        compliance_score = weighted_score / total_weight if total_weight > 0 else 0
        
        # Overall score
        overall_score = (verification_score * 0.6) + (compliance_score * 0.4)
        
        # Determine risk level
        if overall_score >= 90:
            risk_level = "Χαμηλός"
            risk_color = "green"
        elif overall_score >= 70:
            risk_level = "Μέτριος"
            risk_color = "yellow"
        elif overall_score >= 50:
            risk_level = "Υψηλός"
            risk_color = "orange"
        else:
            risk_level = "Κρίσιμος"
            risk_color = "red"
        
        return {
            'overall_score': round(overall_score, 1),
            'verification_score': round(verification_score, 1),
            'compliance_score': round(compliance_score, 1),
            'risk_level': risk_level,
            'risk_color': risk_color,
            'total_checks': len(compliance_checks),
            'passed_checks': len([c for c in compliance_checks if c.status == VerificationStatus.VERIFIED]),
            'failed_checks': len([c for c in compliance_checks if c.status == VerificationStatus.FAILED]),
            'pending_checks': len([c for c in compliance_checks if c.status == VerificationStatus.PENDING])
        }