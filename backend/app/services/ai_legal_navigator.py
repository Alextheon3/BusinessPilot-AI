"""
AI Legal & Tax Navigator for Greek Business Law
Advanced AI assistant for legal and tax questions in Greek
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta
import re
import json
from urllib.parse import quote
import aiofiles
import httpx

logger = logging.getLogger(__name__)

class LegalArea(Enum):
    CONTRACT_LAW = "contract_law"
    LABOR_LAW = "labor_law"
    TAXATION = "taxation"
    BUSINESS_LAW = "business_law"
    PENALTIES = "penalties"
    CONSUMER_PROTECTION = "consumer_protection"
    INTELLECTUAL_PROPERTY = "intellectual_property"
    REAL_ESTATE = "real_estate"
    INSURANCE = "insurance"
    COMPETITION = "competition"

class DocumentType(Enum):
    CONTRACT = "contract"
    INVOICE = "invoice"
    LEGAL_NOTICE = "legal_notice"
    EMPLOYMENT_AGREEMENT = "employment_agreement"
    SUPPLIER_AGREEMENT = "supplier_agreement"
    NDA = "nda"
    COURT_DOCUMENT = "court_document"
    TAX_DOCUMENT = "tax_document"

@dataclass
class LegalQuery:
    id: str
    question: str
    area: LegalArea
    user_id: int
    timestamp: datetime
    context: Optional[Dict[str, Any]] = None
    urgency: str = "medium"  # low, medium, high, urgent

@dataclass
class LegalResponse:
    query_id: str
    answer: str
    confidence: float
    legal_basis: List[str]
    references: List[Dict[str, str]]
    warnings: List[str]
    next_steps: List[str]
    estimated_cost: Optional[float] = None
    lawyer_recommended: bool = False

@dataclass
class DocumentAnalysis:
    document_id: str
    document_type: DocumentType
    risks: List[Dict[str, Any]]
    missing_fields: List[str]
    compliance_score: float
    suggestions: List[str]
    legal_validity: str  # valid, invalid, questionable
    expiry_dates: List[Dict[str, Any]]
    key_terms: List[str]

class AILegalNavigator:
    """
    Advanced AI Legal Navigator for Greek Business Law
    """
    
    def __init__(self):
        self.knowledge_base = self._load_greek_law_database()
        self.legal_templates = self._load_legal_templates()
        self.ai_client = httpx.AsyncClient(timeout=60.0)
        
        # Legal reference URLs
        self.reference_urls = {
            'gov': 'https://www.gov.gr',
            'nomos': 'https://www.nomos.gr',
            'dikastiko': 'https://www.dikastiko.gr',
            'efka': 'https://www.efka.gov.gr',
            'aade': 'https://www.aade.gr',
            'ergani': 'https://www.ergani.gov.gr'
        }
        
        # Initialize conversation history
        self.conversation_history = {}
    
    def _load_greek_law_database(self) -> Dict[str, Any]:
        """Load Greek law database with key regulations"""
        return {
            'labor_law': {
                'overtime': {
                    'full_time': 'Για πλήρη απασχόληση: μέχρι 120 ώρες/έτος, 50% επιπλέον αμοιβή',
                    'part_time': 'Για μερική απασχόληση: υπερωρίες μετά τις συμβατικές ώρες',
                    'legal_basis': 'Ν. 4808/2021, άρθρο 35'
                },
                'contracts': {
                    'indefinite': 'Αορίστου χρόνου - πλήρης προστασία',
                    'fixed_term': 'Ορισμένου χρόνου - μέγιστη διάρκεια 8 μήνες',
                    'probation': 'Δοκιμαστική περίοδος - έως 12 μήνες'
                },
                'termination': {
                    'notice_period': 'Προειδοποίηση: 1 μήνας έως 4 μήνες',
                    'severance': 'Αποζημίωση: 2 μήνες έως 24 μήνες μισθού',
                    'legal_basis': 'Ν. 4808/2021, άρθρα 72-85'
                }
            },
            'taxation': {
                'vat': {
                    'standard_rate': '24%',
                    'reduced_rate': '13% (τρόφιμα, ξενοδοχεία)',
                    'super_reduced': '6% (βιβλία, φάρμακα)',
                    'threshold': '10.000€ ετησίως'
                },
                'income_tax': {
                    'personal': 'Προοδευτικός φόρος 9%-44%',
                    'corporate': '22% για κέρδη άνω των 40.000€',
                    'small_business': '9% για κέρδη έως 40.000€'
                },
                'penalties': {
                    'late_filing': '150€ έως 1.500€',
                    'late_payment': '5% + 0.73% μηνιαίως',
                    'evasion': 'Πρόστιμο 50%-500% + ποινικές κυρώσεις'
                }
            },
            'contract_law': {
                'cancellation': {
                    'consumer_right': '14 ημέρες για καταναλωτές',
                    'business_terms': 'Σύμφωνα με όρους σύμβασης',
                    'force_majeure': 'Ανωτέρα βία - αναστολή υποχρεώσεων'
                },
                'compensation': {
                    'damages': 'Θετική και αποθετική ζημία',
                    'penalty_clause': 'Ποινική ρήτρα - έως 10% αξίας',
                    'interest': 'Νόμιμοι τόκοι + υπερημερίες'
                }
            },
            'business_law': {
                'licensing': {
                    'general_commercial': 'Γενική επαγγελματική άδεια',
                    'special_activities': 'Ειδικές άδειες ανά δραστηριότητα',
                    'renewal': 'Ανανέωση κάθε 5 έτη'
                },
                'compliance': {
                    'gdpr': 'Κανονισμός GDPR - προστασία δεδομένων',
                    'consumer_protection': 'Προστασία καταναλωτή',
                    'competition': 'Νόμος περί ανταγωνισμού'
                }
            }
        }
    
    def _load_legal_templates(self) -> Dict[str, str]:
        """Load legal document templates"""
        return {
            'employment_contract': '''
ΣΥΜΒΑΣΗ ΕΡΓΑΣΙΑΣ

Μεταξύ:
1. [ΕΡΓΟΔΟΤΗΣ] με έδρα [ΔΙΕΥΘΥΝΣΗ], ΑΦΜ [AFM]
2. [ΕΡΓΑΖΟΜΕΝΟΣ] με διεύθυνση [ΔΙΕΥΘΥΝΣΗ], ΑΦΜ [AFM]

Αντικείμενο: [ΠΕΡΙΓΡΑΦΗ ΕΡΓΑΣΙΑΣ]
Αμοιβή: [ΠΟΣΟ] € μηνιαίως
Ωράριο: [ΩΡΕΣ] ημερησίως
Δοκιμαστική περίοδος: [ΔΙΑΡΚΕΙΑ]

Υπογραφές:
[ΕΡΓΟΔΟΤΗΣ]     [ΕΡΓΑΖΟΜΕΝΟΣ]
            ''',
            'supplier_agreement': '''
ΣΥΜΒΑΣΗ ΠΡΟΜΗΘΕΙΑΣ

Μεταξύ:
1. [ΑΓΟΡΑΣΤΗΣ] - [ΣΤΟΙΧΕΙΑ]
2. [ΠΡΟΜΗΘΕΥΤΗΣ] - [ΣΤΟΙΧΕΙΑ]

Αντικείμενο: [ΠΕΡΙΓΡΑΦΗ ΠΡΟΪΟΝΤΩΝ/ΥΠΗΡΕΣΙΩΝ]
Τιμή: [ΠΟΣΟ] €
Όροι πληρωμής: [ΠΡΟΘΕΣΜΙΑ]
Παράδοση: [ΤΟΠΟΣ ΚΑΙ ΧΡΟΝΟΣ]

Ειδικοί όροι:
- Εγγύηση: [ΔΙΑΡΚΕΙΑ]
- Ποινική ρήτρα: [ΠΟΣΟΣΤΟ]
- Δικαιοδοσία: [ΔΙΚΑΣΤΗΡΙΟ]
            ''',
            'nda': '''
ΣΥΜΦΩΝΗΤΙΚΟ ΕΜΠΙΣΤΕΥΤΙΚΟΤΗΤΑΣ (NDA)

Μεταξύ:
1. [ΕΤΑΙΡΕΙΑ Α] - [ΣΤΟΙΧΕΙΑ]
2. [ΕΤΑΙΡΕΙΑ Β] - [ΣΤΟΙΧΕΙΑ]

Σκοπός: [ΠΕΡΙΓΡΑΦΗ ΣΥΝΕΡΓΑΣΙΑΣ]

Εμπιστευτικές πληροφορίες:
- [ΚΑΤΗΓΟΡΙΕΣ ΠΛΗΡΟΦΟΡΙΩΝ]
- Διάρκεια εμπιστευτικότητας: [ΔΙΑΡΚΕΙΑ]
- Εξαιρέσεις: [ΕΞΑΙΡΕΣΕΙΣ]

Κυρώσεις παραβίασης: [ΠΟΙΝΙΚΗ ΡΗΤΡΑ]
            '''
        }
    
    async def process_legal_query(self, query: LegalQuery) -> LegalResponse:
        """Process a legal query and provide comprehensive response"""
        try:
            # Analyze query and determine legal area
            legal_area = await self._classify_legal_area(query.question)
            
            # Generate AI response
            ai_response = await self._generate_ai_response(query, legal_area)
            
            # Find relevant legal basis
            legal_basis = self._find_legal_basis(query.question, legal_area)
            
            # Get government references
            references = await self._get_government_references(query.question, legal_area)
            
            # Assess risks and warnings
            warnings = self._assess_legal_risks(query.question, legal_area)
            
            # Generate next steps
            next_steps = self._generate_next_steps(query.question, legal_area)
            
            # Determine if lawyer is recommended
            lawyer_recommended = self._should_recommend_lawyer(query.question, legal_area)
            
            # Store in conversation history
            self.conversation_history[query.user_id] = {
                'last_query': query,
                'timestamp': datetime.now()
            }
            
            return LegalResponse(
                query_id=query.id,
                answer=ai_response,
                confidence=0.85,
                legal_basis=legal_basis,
                references=references,
                warnings=warnings,
                next_steps=next_steps,
                lawyer_recommended=lawyer_recommended
            )
            
        except Exception as e:
            logger.error(f"Error processing legal query: {str(e)}")
            return LegalResponse(
                query_id=query.id,
                answer="Συγγνώμη, αντιμετώπισα πρόβλημα κατά την επεξεργασία της ερώτησής σας. Παρακαλώ δοκιμάστε ξανά.",
                confidence=0.0,
                legal_basis=[],
                references=[],
                warnings=["Σφάλμα συστήματος"],
                next_steps=["Επικοινωνήστε με τεχνική υποστήριξη"],
                lawyer_recommended=True
            )
    
    async def _classify_legal_area(self, question: str) -> LegalArea:
        """Classify the legal area of the question"""
        question_lower = question.lower()
        
        # Labor law keywords
        labor_keywords = ['υπερωρίες', 'μισθός', 'εργαζόμενος', 'απόλυση', 'σύμβαση εργασίας', 'άδεια', 'ασφάλιση']
        if any(keyword in question_lower for keyword in labor_keywords):
            return LegalArea.LABOR_LAW
        
        # Tax keywords
        tax_keywords = ['φόρος', 'φπα', 'εφορία', 'ααδε', 'δήλωση', 'απόδειξη', 'πρόστιμο']
        if any(keyword in question_lower for keyword in tax_keywords):
            return LegalArea.TAXATION
        
        # Contract law keywords
        contract_keywords = ['σύμβαση', 'συμφωνία', 'ακύρωση', 'αποζημίωση', 'όροι', 'υπογραφή']
        if any(keyword in question_lower for keyword in contract_keywords):
            return LegalArea.CONTRACT_LAW
        
        # Business law keywords
        business_keywords = ['επιχείρηση', 'εταιρεία', 'άδεια', 'κωδικός', 'νόμος', 'κανονισμός']
        if any(keyword in question_lower for keyword in business_keywords):
            return LegalArea.BUSINESS_LAW
        
        return LegalArea.BUSINESS_LAW  # Default
    
    async def _generate_ai_response(self, query: LegalQuery, legal_area: LegalArea) -> str:
        """Generate AI-powered legal response"""
        # Get relevant knowledge from database
        knowledge = self.knowledge_base.get(legal_area.value, {})
        
        # Create context-aware prompt
        prompt = f"""
        Είσαι ειδικός σύμβουλος ελληνικού επιχειρηματικού δικαίου.
        
        Ερώτηση: {query.question}
        Περιοχή δικαίου: {legal_area.value}
        Γνωστικό υπόβαθρο: {json.dumps(knowledge, ensure_ascii=False, indent=2)}
        
        Παρέχε:
        1. Σαφή και κατανοητή απάντηση
        2. Πρακτικές οδηγίες
        3. Αναφορές σε νομοθεσία
        4. Παραδείγματα όταν χρειάζεται
        
        Απάντηση στα ελληνικά:
        """
        
        # Mock AI response (in production, use actual AI service)
        if 'υπερωρίες' in query.question.lower():
            return """
**Υπερωρίες σε Part-time Εργαζόμενους:**

Σύμφωνα με τον Ν. 4808/2021, για part-time εργαζόμενους:

• **Όριο υπερωριών**: Μέχρι 120 ώρες ετησίως
• **Αμοιβή**: 50% επιπλέον της κανονικής ωριαίας αμοιβής
• **Υπολογισμός**: Υπερωρίες μετά τις συμβατικές ώρες

**Παράδειγμα:**
- Part-time 4 ώρες/ημέρα
- Κανονική αμοιβή: 5€/ώρα
- Υπερωρία (5η ώρα): 7,50€/ώρα

**Προσοχή:** Απαιτείται:
- Γραπτή συμφωνία
- Δήλωση στην ΕΡΓΑΝΗ
- Σωστή μισθοδοσία
            """
        
        elif 'ακύρωση' in query.question.lower():
            return """
**Ακύρωση από Πελάτη - Δικαίωμα Αποζημίωσης:**

**Για Καταναλωτές (B2C):**
• Δικαίωμα υπαναχώρησης 14 ημερών
• Χωρίς αποζημίωση εάν εντός προθεσμίας

**Για Επιχειρήσεις (B2B):**
• Ισχύουν οι όροι της σύμβασης
• Αποζημίωση εάν προβλέπεται

**Δικαίωμα Αποζημίωσης:**
• Θετική ζημία (έξοδα που προκλήθηκαν)
• Αποθετική ζημία (χαμένα κέρδη)
• Ποινική ρήτρα (εάν υπάρχει)

**Απαιτούμενα στοιχεία:**
- Γραπτή σύμβαση
- Απόδειξη ζημίας
- Καταλογισμός υπαιτιότητας
            """
        
        return "Παρακαλώ επικοινωνήστε με νομικό σύμβουλο για περαιτέρω διευκρινίσεις."
    
    def _find_legal_basis(self, question: str, legal_area: LegalArea) -> List[str]:
        """Find relevant legal basis for the question"""
        basis = []
        
        if legal_area == LegalArea.LABOR_LAW:
            basis.extend([
                "Ν. 4808/2021 - Εργατικό Δίκαιο",
                "Ν. 4093/2012 - Εργασιακές Σχέσεις",
                "Ν. 2874/2000 - Ωρεργασία"
            ])
        elif legal_area == LegalArea.TAXATION:
            basis.extend([
                "Ν. 4172/2013 - Κώδικας Φορολογίας Εισοδήματος",
                "Ν. 2859/2000 - Κώδικας ΦΠΑ",
                "Ν. 4174/2013 - Κώδικας Φορολογικής Διαδικασίας"
            ])
        elif legal_area == LegalArea.CONTRACT_LAW:
            basis.extend([
                "Αστικός Κώδικας - Άρθρα 361-946",
                "Ν. 2251/1994 - Προστασία Καταναλωτή",
                "Ν. 4030/2011 - Ηλεκτρονικό Εμπόριο"
            ])
        
        return basis
    
    async def _get_government_references(self, question: str, legal_area: LegalArea) -> List[Dict[str, str]]:
        """Get government references for the legal area"""
        references = []
        
        if legal_area == LegalArea.LABOR_LAW:
            references.extend([
                {
                    "title": "ΕΡΓΑΝΗ - Δηλώσεις Εργαζομένων",
                    "url": "https://www.ergani.gov.gr",
                    "description": "Επίσημη πλατφόρμα δηλώσεων εργασίας"
                },
                {
                    "title": "ΕΦΚΑ - Ασφαλιστικές Εισφορές",
                    "url": "https://www.efka.gov.gr",
                    "description": "Πληροφορίες για ασφαλιστικές εισφορές"
                }
            ])
        elif legal_area == LegalArea.TAXATION:
            references.extend([
                {
                    "title": "ΑΑΔΕ - Φορολογικές Υποχρεώσεις",
                    "url": "https://www.aade.gr",
                    "description": "Επίσημη πλατφόρμα φορολογικών υποχρεώσεων"
                },
                {
                    "title": "TaxisNet - Ηλεκτρονικές Υπηρεσίες",
                    "url": "https://www.taxisnet.gr",
                    "description": "Ηλεκτρονικές φορολογικές υπηρεσίες"
                }
            ])
        
        return references
    
    def _assess_legal_risks(self, question: str, legal_area: LegalArea) -> List[str]:
        """Assess potential legal risks"""
        risks = []
        
        if legal_area == LegalArea.LABOR_LAW:
            risks.extend([
                "Παραβίαση εργατικής νομοθεσίας μπορεί να επιφέρει πρόστιμα",
                "Απαιτείται σωστή τήρηση μισθοδοσίας",
                "Ελλιπής ασφάλιση εργαζομένων"
            ])
        elif legal_area == LegalArea.TAXATION:
            risks.extend([
                "Εκπρόθεσμη υποβολή δηλώσεων",
                "Λανθασμένος υπολογισμός φόρων",
                "Παραβίαση φορολογικής νομοθεσίας"
            ])
        
        return risks
    
    def _generate_next_steps(self, question: str, legal_area: LegalArea) -> List[str]:
        """Generate actionable next steps"""
        steps = []
        
        if legal_area == LegalArea.LABOR_LAW:
            steps.extend([
                "Ελέγξτε την ισχύουσα σύμβαση εργασίας",
                "Επικοινωνήστε με τον λογιστή σας",
                "Ενημερώστε την ΕΡΓΑΝΗ για αλλαγές"
            ])
        elif legal_area == LegalArea.TAXATION:
            steps.extend([
                "Συμβουλευτείτε τον λογιστή σας",
                "Ελέγξτε τις φορολογικές υποχρεώσεις",
                "Προγραμματίστε τις πληρωμές"
            ])
        
        return steps
    
    def _should_recommend_lawyer(self, question: str, legal_area: LegalArea) -> bool:
        """Determine if lawyer consultation is recommended"""
        high_risk_keywords = ['δικαστήριο', 'αγωγή', 'πρόστιμο', 'κατάσχεση', 'χρεοκοπία']
        return any(keyword in question.lower() for keyword in high_risk_keywords)
    
    async def analyze_document(self, document_path: str, document_type: DocumentType) -> DocumentAnalysis:
        """Analyze uploaded legal document"""
        try:
            # Read document content
            content = await self._extract_document_content(document_path)
            
            # Analyze based on document type
            if document_type == DocumentType.CONTRACT:
                return await self._analyze_contract(content)
            elif document_type == DocumentType.EMPLOYMENT_AGREEMENT:
                return await self._analyze_employment_agreement(content)
            elif document_type == DocumentType.INVOICE:
                return await self._analyze_invoice(content)
            else:
                return await self._analyze_generic_document(content, document_type)
                
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            return DocumentAnalysis(
                document_id="error",
                document_type=document_type,
                risks=[{"type": "analysis_error", "severity": "high", "message": "Σφάλμα κατά την ανάλυση"}],
                missing_fields=[],
                compliance_score=0.0,
                suggestions=["Επικοινωνήστε με τεχνική υποστήριξη"],
                legal_validity="questionable",
                expiry_dates=[],
                key_terms=[]
            )
    
    async def _extract_document_content(self, document_path: str) -> str:
        """Extract text content from document"""
        # Mock document extraction (in production, use OCR/PDF parsing)
        async with aiofiles.open(document_path, 'r', encoding='utf-8') as f:
            content = await f.read()
        return content
    
    async def _analyze_contract(self, content: str) -> DocumentAnalysis:
        """Analyze contract document"""
        risks = []
        missing_fields = []
        suggestions = []
        
        # Check for essential contract elements
        if 'αμοιβή' not in content.lower():
            missing_fields.append("Αμοιβή/Τίμημα")
            risks.append({
                "type": "missing_price",
                "severity": "high",
                "message": "Δεν αναφέρεται σαφώς η αμοιβή"
            })
        
        if 'υπογραφή' not in content.lower():
            missing_fields.append("Υπογραφές")
            risks.append({
                "type": "missing_signatures",
                "severity": "critical",
                "message": "Απουσιάζουν υπογραφές"
            })
        
        if 'δικαιοδοσία' not in content.lower():
            missing_fields.append("Δικαιοδοσία")
            suggestions.append("Προσθέστε ρήτρα δικαιοδοσίας")
        
        # Calculate compliance score
        compliance_score = max(0, 100 - (len(risks) * 20) - (len(missing_fields) * 10))
        
        return DocumentAnalysis(
            document_id="contract_001",
            document_type=DocumentType.CONTRACT,
            risks=risks,
            missing_fields=missing_fields,
            compliance_score=compliance_score,
            suggestions=suggestions,
            legal_validity="valid" if compliance_score > 70 else "questionable",
            expiry_dates=[],
            key_terms=["αμοιβή", "υποχρεώσεις", "δικαιοδοσία"]
        )
    
    async def _analyze_employment_agreement(self, content: str) -> DocumentAnalysis:
        """Analyze employment agreement"""
        risks = []
        missing_fields = []
        suggestions = []
        
        # Check for labor law compliance
        required_fields = ['μισθός', 'ωράριο', 'καθήκοντα', 'δοκιμαστική περίοδος']
        
        for field in required_fields:
            if field not in content.lower():
                missing_fields.append(field.title())
                risks.append({
                    "type": "missing_labor_term",
                    "severity": "medium",
                    "message": f"Δεν αναφέρεται {field}"
                })
        
        # Check for overtime clauses
        if 'υπερωρίες' not in content.lower():
            suggestions.append("Προσθέστε ρήτρα για υπερωρίες")
        
        compliance_score = max(0, 100 - (len(risks) * 15) - (len(missing_fields) * 10))
        
        return DocumentAnalysis(
            document_id="employment_001",
            document_type=DocumentType.EMPLOYMENT_AGREEMENT,
            risks=risks,
            missing_fields=missing_fields,
            compliance_score=compliance_score,
            suggestions=suggestions,
            legal_validity="valid" if compliance_score > 80 else "questionable",
            expiry_dates=[],
            key_terms=["μισθός", "ωράριο", "καθήκοντα"]
        )
    
    async def _analyze_generic_document(self, content: str, doc_type: DocumentType) -> DocumentAnalysis:
        """Analyze generic document"""
        return DocumentAnalysis(
            document_id="generic_001",
            document_type=doc_type,
            risks=[],
            missing_fields=[],
            compliance_score=75.0,
            suggestions=["Επικοινωνήστε με νομικό σύμβουλο για λεπτομερή ανάλυση"],
            legal_validity="valid",
            expiry_dates=[],
            key_terms=[]
        )
    
    def generate_contract_template(self, contract_type: str, params: Dict[str, Any]) -> str:
        """Generate contract from template"""
        template = self.legal_templates.get(contract_type, "")
        
        if not template:
            return "Μη διαθέσιμο template"
        
        # Replace placeholders with actual values
        for key, value in params.items():
            placeholder = f"[{key.upper()}]"
            template = template.replace(placeholder, str(value))
        
        return template

# Singleton instance
ai_legal_navigator = AILegalNavigator()