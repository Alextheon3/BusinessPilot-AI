from typing import List, Dict, Optional, Any
import asyncio
import json
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import openai
import anthropic
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfbase import pdfutils
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import io
import os
from app.core.config import settings

class DocumentType(Enum):
    E3 = "E3"
    E4 = "E4"
    E6 = "E6"
    TAX_FORM = "TAX_FORM"
    INSURANCE = "INSURANCE"
    PERMIT = "PERMIT"
    VAT_RETURN = "VAT_RETURN"
    EMPLOYMENT_CONTRACT = "EMPLOYMENT_CONTRACT"
    BUSINESS_LICENSE = "BUSINESS_LICENSE"
    HACCP_CERTIFICATE = "HACCP_CERTIFICATE"
    OTHER = "OTHER"

@dataclass
class BusinessProfile:
    company_name: str
    afm: str
    kad: str
    address: str
    phone: str
    email: str
    region: str
    employees: int
    owner_name: str
    owner_age: int
    owner_gender: str
    establishment_year: int
    is_startup: bool = False
    is_innovative: bool = False
    is_green: bool = False
    has_digital_transformation: bool = False

@dataclass
class DocumentRequest:
    document_type: DocumentType
    user_query: str
    business_profile: BusinessProfile
    additional_data: Optional[Dict[str, Any]] = None
    language: str = "el"

@dataclass
class DocumentResponse:
    document_id: str
    title: str
    description: str
    instructions: str
    ministry: str
    deadline: Optional[str]
    pdf_url: str
    prefilled_data: Dict[str, Any]
    related_forms: List[str]
    next_steps: List[str]
    ai_explanation: str

class PaperworkAIService:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
        
        # Greek government forms mapping
        self.forms_mapping = {
            DocumentType.E3: {
                "title": "Έντυπο Ε3 - Κίνηση Προσωπικού",
                "ministry": "Υπουργείο Εργασίας - ΕΡΓΑΝΗ",
                "url": "https://www.ergani.gov.gr",
                "deadline": "24 ώρες πριν την έναρξη εργασίας",
                "required_fields": ["employee_name", "afm", "hire_date", "position", "salary", "contract_type"]
            },
            DocumentType.E4: {
                "title": "Έντυπο Ε4 - Ετήσια Καταγραφή",
                "ministry": "Υπουργείο Εργασίας - ΕΡΓΑΝΗ",
                "url": "https://www.ergani.gov.gr",
                "deadline": "31 Οκτωβρίου",
                "required_fields": ["company_info", "employee_list", "total_employees", "payroll_data"]
            },
            DocumentType.VAT_RETURN: {
                "title": "Δήλωση ΦΠΑ",
                "ministry": "ΑΑΔΕ - Φορολογική Διοίκηση",
                "url": "https://www.aade.gr",
                "deadline": "25η κάθε μήνα",
                "required_fields": ["taxable_transactions", "vat_collected", "vat_paid", "net_vat"]
            },
            DocumentType.BUSINESS_LICENSE: {
                "title": "Άδεια Λειτουργίας",
                "ministry": "Δήμος - ΚΕΠ",
                "url": "https://www.kep.gov.gr",
                "deadline": "Πριν την έναρξη λειτουργίας",
                "required_fields": ["business_type", "location", "fire_safety", "health_permits"]
            }
        }

    async def process_paperwork_request(self, request: DocumentRequest) -> DocumentResponse:
        """Process a paperwork request using AI to understand intent and generate documents"""
        
        # Step 1: Use AI to understand the user's intent
        ai_analysis = await self._analyze_user_intent(request)
        
        # Step 2: Generate the appropriate document
        document_data = await self._generate_document_data(request, ai_analysis)
        
        # Step 3: Create PDF document
        pdf_buffer = await self._generate_pdf_document(request, document_data)
        
        # Step 4: Save PDF and return response
        pdf_url = await self._save_pdf_document(pdf_buffer, request.document_type)
        
        return DocumentResponse(
            document_id=f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            title=document_data["title"],
            description=document_data["description"],
            instructions=document_data["instructions"],
            ministry=document_data["ministry"],
            deadline=document_data.get("deadline"),
            pdf_url=pdf_url,
            prefilled_data=document_data["prefilled_data"],
            related_forms=document_data.get("related_forms", []),
            next_steps=document_data.get("next_steps", []),
            ai_explanation=ai_analysis["explanation"]
        )

    async def _analyze_user_intent(self, request: DocumentRequest) -> Dict[str, Any]:
        """Use AI to analyze user intent and determine the appropriate document type"""
        
        prompt = f"""
        Αναλύστε το ακόλουθο αίτημα χρήστη για ελληνικά γραφειοκρατικά έγγραφα:

        Αίτημα: "{request.user_query}"
        
        Στοιχεία επιχείρησης:
        - Επωνυμία: {request.business_profile.company_name}
        - ΚΑΔ: {request.business_profile.kad}
        - Εργαζόμενοι: {request.business_profile.employees}
        - Περιοχή: {request.business_profile.region}
        
        Παρακαλώ δώστε:
        1. Τον τύπο εγγράφου που χρειάζεται
        2. Εξήγηση του τι είναι το έγγραφο
        3. Γιατί χρειάζεται η επιχείρηση αυτό το έγγραφο
        4. Τι πρέπει να κάνει η επιχείρηση
        5. Προθεσμίες και προειδοποιήσεις
        
        Απαντήστε σε JSON format:
        {{
            "document_type": "E3|E4|VAT_RETURN|BUSINESS_LICENSE|OTHER",
            "confidence": 0.95,
            "explanation": "Λεπτομερής εξήγηση...",
            "required_actions": ["ενέργεια 1", "ενέργεια 2"],
            "urgency": "high|medium|low",
            "deadline": "YYYY-MM-DD or null"
        }}
        """
        
        try:
            if self.anthropic_client:
                response = await self._call_anthropic(prompt)
            elif self.openai_client:
                response = await self._call_openai(prompt)
            else:
                # Fallback to rule-based matching
                return self._fallback_intent_analysis(request)
            
            return json.loads(response)
            
        except Exception as e:
            print(f"AI analysis failed: {e}")
            return self._fallback_intent_analysis(request)

    async def _generate_document_data(self, request: DocumentRequest, ai_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate document data based on AI analysis and business profile"""
        
        document_type = DocumentType(ai_analysis.get("document_type", request.document_type.value))
        form_info = self.forms_mapping.get(document_type, {})
        
        # Generate prefilled data based on business profile
        prefilled_data = self._generate_prefilled_data(request.business_profile, document_type)
        
        return {
            "title": form_info.get("title", "Γραφειοκρατικό Έγγραφο"),
            "description": ai_analysis.get("explanation", "Περιγραφή εγγράφου"),
            "instructions": self._get_instructions(document_type),
            "ministry": form_info.get("ministry", "Αρμόδιος Φορέας"),
            "deadline": form_info.get("deadline"),
            "prefilled_data": prefilled_data,
            "related_forms": self._get_related_forms(document_type),
            "next_steps": ai_analysis.get("required_actions", [])
        }

    async def _generate_pdf_document(self, request: DocumentRequest, document_data: Dict[str, Any]) -> io.BytesIO:
        """Generate PDF document with prefilled data"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*inch)
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        content = []
        
        # Title
        title = Paragraph(document_data["title"], title_style)
        content.append(title)
        content.append(Spacer(1, 20))
        
        # Business Information Section
        business_info = [
            ["Στοιχεία Επιχείρησης", ""],
            ["Επωνυμία", request.business_profile.company_name],
            ["ΑΦΜ", request.business_profile.afm],
            ["ΚΑΔ", request.business_profile.kad],
            ["Διεύθυνση", request.business_profile.address],
            ["Τηλέφωνο", request.business_profile.phone],
            ["Email", request.business_profile.email],
        ]
        
        business_table = Table(business_info, colWidths=[2*inch, 4*inch])
        business_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        content.append(business_table)
        content.append(Spacer(1, 20))
        
        # Document-specific content
        if request.document_type == DocumentType.E3:
            content.extend(self._generate_e3_content(document_data["prefilled_data"]))
        elif request.document_type == DocumentType.VAT_RETURN:
            content.extend(self._generate_vat_content(document_data["prefilled_data"]))
        elif request.document_type == DocumentType.BUSINESS_LICENSE:
            content.extend(self._generate_license_content(document_data["prefilled_data"]))
        
        # Instructions
        instructions_title = Paragraph("Οδηγίες Συμπλήρωσης", styles['Heading2'])
        content.append(instructions_title)
        instructions_text = Paragraph(document_data["instructions"], styles['Normal'])
        content.append(instructions_text)
        
        # Build PDF
        doc.build(content)
        buffer.seek(0)
        return buffer

    def _generate_e3_content(self, prefilled_data: Dict[str, Any]) -> List:
        """Generate E3 form specific content"""
        content = []
        
        # Employee information table
        employee_info = [
            ["Στοιχεία Εργαζομένου", ""],
            ["Ονοματεπώνυμο", prefilled_data.get("employee_name", "")],
            ["ΑΦΜ Εργαζομένου", prefilled_data.get("employee_afm", "")],
            ["Θέση Εργασίας", prefilled_data.get("position", "")],
            ["Ημερομηνία Πρόσληψης", prefilled_data.get("hire_date", "")],
            ["Τύπος Σύμβασης", prefilled_data.get("contract_type", "")],
            ["Μισθός", prefilled_data.get("salary", "")],
        ]
        
        employee_table = Table(employee_info, colWidths=[2*inch, 4*inch])
        employee_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        content.append(employee_table)
        content.append(Spacer(1, 20))
        
        return content

    def _generate_vat_content(self, prefilled_data: Dict[str, Any]) -> List:
        """Generate VAT return form specific content"""
        content = []
        
        # VAT calculation table
        vat_info = [
            ["Φορολογικά Στοιχεία", "Ποσό (€)"],
            ["Φορολογητέες Συναλλαγές", prefilled_data.get("taxable_transactions", "0.00")],
            ["ΦΠΑ Εισπράξεων", prefilled_data.get("vat_collected", "0.00")],
            ["ΦΠΑ Εκροών", prefilled_data.get("vat_paid", "0.00")],
            ["Καθαρός ΦΠΑ", prefilled_data.get("net_vat", "0.00")],
        ]
        
        vat_table = Table(vat_info, colWidths=[3*inch, 2*inch])
        vat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgreen),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        content.append(vat_table)
        content.append(Spacer(1, 20))
        
        return content

    def _generate_license_content(self, prefilled_data: Dict[str, Any]) -> List:
        """Generate business license specific content"""
        content = []
        
        # License requirements checklist
        requirements = [
            ["Απαιτούμενα Δικαιολογητικά", "Κατάσταση"],
            ["Τοπογραφικό Διάγραμμα", "☐ Υποβλήθηκε"],
            ["Πιστοποιητικό Πυρασφάλειας", "☐ Υποβλήθηκε"],
            ["Άδεια Δόμησης", "☐ Υποβλήθηκε"],
            ["Πιστοποιητικό Υγιεινής", "☐ Υποβλήθηκε"],
        ]
        
        req_table = Table(requirements, colWidths=[3*inch, 2*inch])
        req_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        content.append(req_table)
        content.append(Spacer(1, 20))
        
        return content

    def _generate_prefilled_data(self, business_profile: BusinessProfile, document_type: DocumentType) -> Dict[str, Any]:
        """Generate prefilled data based on business profile and document type"""
        
        base_data = {
            "company_name": business_profile.company_name,
            "afm": business_profile.afm,
            "kad": business_profile.kad,
            "address": business_profile.address,
            "phone": business_profile.phone,
            "email": business_profile.email,
            "owner_name": business_profile.owner_name,
            "region": business_profile.region,
            "employees": business_profile.employees,
        }
        
        if document_type == DocumentType.E3:
            return {
                **base_data,
                "employee_name": "",
                "employee_afm": "",
                "position": "",
                "hire_date": "",
                "contract_type": "Αορίστου Χρόνου",
                "salary": "",
            }
        elif document_type == DocumentType.VAT_RETURN:
            return {
                **base_data,
                "taxable_transactions": "0.00",
                "vat_collected": "0.00",
                "vat_paid": "0.00",
                "net_vat": "0.00",
                "period": datetime.now().strftime("%m/%Y"),
            }
        elif document_type == DocumentType.BUSINESS_LICENSE:
            return {
                **base_data,
                "business_type": self._get_business_type_from_kad(business_profile.kad),
                "location": business_profile.address,
                "fire_safety": "Εκκρεμεί",
                "health_permits": "Εκκρεμεί",
            }
        
        return base_data

    def _get_business_type_from_kad(self, kad: str) -> str:
        """Convert KAD code to business type description"""
        kad_mapping = {
            "56.30": "Καφετέρια",
            "56.10": "Εστιατόριο",
            "56.21": "Catering",
            "47.11": "Σούπερ Μάρκετ",
            "47.19": "Λιανικό Εμπόριο",
            "62.01": "Πληροφορική",
            "68.20": "Ακίνητα",
        }
        return kad_mapping.get(kad, "Επιχείρηση")

    def _get_instructions(self, document_type: DocumentType) -> str:
        """Get instructions for specific document type"""
        instructions = {
            DocumentType.E3: """
            1. Συμπληρώστε όλα τα στοιχεία του εργαζομένου
            2. Υποβάλετε το έντυπο στην ΕΡΓΑΝΗ τουλάχιστον 24 ώρες πριν την έναρξη εργασίας
            3. Κρατήστε αποδεικτικό υποβολής
            4. Ενημερώστε τον ΕΦΚΑ για την ασφάλιση
            """,
            DocumentType.VAT_RETURN: """
            1. Συμπληρώστε τα στοιχεία εσόδων και εξόδων
            2. Υπολογίστε τον καθαρό ΦΠΑ
            3. Υποβάλετε έως την 25η του μήνα
            4. Πληρώστε τον οφειλόμενο ΦΠΑ
            """,
            DocumentType.BUSINESS_LICENSE: """
            1. Συγκεντρώστε όλα τα απαιτούμενα δικαιολογητικά
            2. Υποβάλετε αίτηση στο αρμόδιο ΚΕΠ
            3. Περιμένετε τον έλεγχο από τις αρμόδιες υπηρεσίες
            4. Παραλάβετε την άδεια λειτουργίας
            """
        }
        return instructions.get(document_type, "Παρακαλώ συμπληρώστε το έντυπο και υποβάλετε στον αρμόδιο φορέα.")

    def _get_related_forms(self, document_type: DocumentType) -> List[str]:
        """Get related forms for a document type"""
        related = {
            DocumentType.E3: ["E4", "EMPLOYMENT_CONTRACT", "INSURANCE"],
            DocumentType.VAT_RETURN: ["TAX_FORM", "INCOME_STATEMENT"],
            DocumentType.BUSINESS_LICENSE: ["FIRE_SAFETY", "HEALTH_PERMIT", "HACCP_CERTIFICATE"]
        }
        return related.get(document_type, [])

    async def _save_pdf_document(self, pdf_buffer: io.BytesIO, document_type: DocumentType) -> str:
        """Save PDF document and return URL"""
        # Create documents directory if it doesn't exist
        docs_dir = "documents"
        os.makedirs(docs_dir, exist_ok=True)
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{document_type.value}_{timestamp}.pdf"
        filepath = os.path.join(docs_dir, filename)
        
        # Save PDF
        with open(filepath, "wb") as f:
            f.write(pdf_buffer.getvalue())
        
        # Return URL (in production, this would be a proper URL)
        return f"/documents/{filename}"

    async def _call_anthropic(self, prompt: str) -> str:
        """Call Anthropic API"""
        try:
            response = await self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except Exception as e:
            raise Exception(f"Anthropic API call failed: {e}")

    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API call failed: {e}")

    def _fallback_intent_analysis(self, request: DocumentRequest) -> Dict[str, Any]:
        """Fallback intent analysis without AI"""
        query = request.user_query.lower()
        
        if any(word in query for word in ["προσλάβω", "υπάλληλο", "εργαζόμενο", "ε3"]):
            return {
                "document_type": "E3",
                "confidence": 0.8,
                "explanation": "Χρειάζεστε το έντυπο Ε3 για δήλωση κίνησης προσωπικού",
                "required_actions": ["Συμπληρώστε τα στοιχεία του εργαζομένου", "Υποβάλετε στην ΕΡΓΑΝΗ"],
                "urgency": "high",
                "deadline": None
            }
        elif any(word in query for word in ["φπα", "φόρο", "δήλωση"]):
            return {
                "document_type": "VAT_RETURN",
                "confidence": 0.8,
                "explanation": "Χρειάζεστε να υποβάλετε δήλωση ΦΠΑ",
                "required_actions": ["Συμπληρώστε τα στοιχεία εσόδων", "Υποβάλετε έως 25η"],
                "urgency": "high",
                "deadline": None
            }
        elif any(word in query for word in ["άδεια", "λειτουργίας", "κατάστημα"]):
            return {
                "document_type": "BUSINESS_LICENSE",
                "confidence": 0.8,
                "explanation": "Χρειάζεστε άδεια λειτουργίας για το κατάστημα",
                "required_actions": ["Συγκεντρώστε δικαιολογητικά", "Υποβάλετε αίτηση στο ΚΕΠ"],
                "urgency": "medium",
                "deadline": None
            }
        
        return {
            "document_type": "OTHER",
            "confidence": 0.5,
            "explanation": "Παρακαλώ διευκρινίστε τι έγγραφο χρειάζεστε",
            "required_actions": ["Επικοινωνήστε με τον αρμόδιο φορέα"],
            "urgency": "low",
            "deadline": None
        }

# Create global instance
paperwork_service = PaperworkAIService()