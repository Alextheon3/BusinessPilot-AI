from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
import uuid

from app.core.database import get_db
from app.services.ai_contract_generator import (
    ai_contract_generator,
    ContractType,
    ContractStatus,
    RiskLevel
)
from app.services.auth_service import AuthService
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/contracts/generate")
async def generate_contract(
    contract_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Generate a new contract using AI
    """
    try:
        contract_type_str = contract_data.get('type', '').lower()
        variables = contract_data.get('variables', {})
        customizations = contract_data.get('customizations', {})
        
        # Validate contract type
        try:
            contract_type = ContractType(contract_type_str)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Μη έγκυρος τύπος σύμβασης: {contract_type_str}"
            )
        
        # Generate contract
        contract = await ai_contract_generator.generate_contract(
            contract_type=contract_type,
            variables=variables,
            customizations=customizations
        )
        
        logger.info(f"Contract generated for user {current_user.id}: {contract.id}")
        
        # Convert to serializable format
        return {
            "id": contract.id,
            "type": contract.contract_type.value,
            "title": contract.title,
            "content": contract.content,
            "status": contract.status.value,
            "created_at": contract.created_at.isoformat(),
            "version": contract.version,
            "legal_review_required": contract.legal_review_required,
            "estimated_value": contract.estimated_value,
            "metadata": contract.metadata,
            "clauses": [
                {
                    "id": clause.id,
                    "title": clause.title,
                    "content": clause.content,
                    "is_required": clause.is_required,
                    "risk_level": clause.risk_level.value,
                    "suggestions": clause.suggestions,
                    "legal_basis": clause.legal_basis
                } for clause in contract.clauses
            ],
            "variables": contract.variables,
            "recommendations": [
                "Ελέγξτε όλα τα στοιχεία για ακρίβεια",
                "Συμβουλευτείτε νομικό σύμβουλο πριν την υπογραφή",
                "Κρατήστε αντίγραφα όλων των εγγράφων"
            ]
        }
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating contract: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά τη δημιουργία της σύμβασης"
        )

@router.post("/contracts/analyze")
async def analyze_contract(
    file: UploadFile = File(...),
    contract_type: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Analyze uploaded contract for risks and compliance
    """
    try:
        # Read contract content
        content = await file.read()
        contract_text = content.decode('utf-8')
        
        # Parse contract type if provided
        contract_type_enum = None
        if contract_type:
            try:
                contract_type_enum = ContractType(contract_type.lower())
            except ValueError:
                logger.warning(f"Invalid contract type: {contract_type}")
        
        # Analyze contract
        analysis = await ai_contract_generator.analyze_contract(
            contract_content=contract_text,
            contract_type=contract_type_enum
        )
        
        logger.info(f"Contract analyzed for user {current_user.id}: {file.filename}")
        
        # Convert to serializable format
        return {
            "analysis_id": analysis.contract_id,
            "filename": file.filename,
            "overall_risk": analysis.overall_risk.value,
            "compliance_score": analysis.compliance_score,
            "summary": {
                "total_issues": len(analysis.legal_issues),
                "missing_clauses": len(analysis.missing_clauses),
                "risky_clauses": len(analysis.risky_clauses),
                "financial_terms_found": len(analysis.financial_terms),
                "key_dates_found": len(analysis.key_dates)
            },
            "missing_clauses": analysis.missing_clauses,
            "risky_clauses": [
                {
                    "id": clause.id,
                    "title": clause.title,
                    "content": clause.content,
                    "risk_level": clause.risk_level.value,
                    "suggestions": clause.suggestions
                } for clause in analysis.risky_clauses
            ],
            "legal_issues": analysis.legal_issues,
            "recommendations": analysis.recommendations,
            "financial_terms": analysis.financial_terms,
            "key_dates": analysis.key_dates,
            "parties": analysis.parties,
            "termination_conditions": analysis.termination_conditions,
            "dispute_resolution": analysis.dispute_resolution,
            "analyzed_at": datetime.utcnow().isoformat()
        }
        
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Δεν είναι δυνατή η ανάγνωση του αρχείου. Παρακαλώ χρησιμοποιήστε αρχείο κειμένου."
        )
    except Exception as e:
        logger.error(f"Error analyzing contract: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάλυση της σύμβασης"
        )

@router.post("/contracts/compare")
async def compare_contracts(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Compare two contracts and highlight differences
    """
    try:
        # Read both contracts
        content_a = await file_a.read()
        content_b = await file_b.read()
        
        contract_a_text = content_a.decode('utf-8')
        contract_b_text = content_b.decode('utf-8')
        
        # Compare contracts
        comparison = await ai_contract_generator.compare_contracts(
            contract_a=contract_a_text,
            contract_b=contract_b_text
        )
        
        logger.info(f"Contracts compared for user {current_user.id}: {file_a.filename} vs {file_b.filename}")
        
        # Add metadata
        comparison.update({
            "contract_a_filename": file_a.filename,
            "contract_b_filename": file_b.filename,
            "compared_at": datetime.utcnow().isoformat()
        })
        
        return comparison
        
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Δεν είναι δυνατή η ανάγνωση ενός από τα αρχεία"
        )
    except Exception as e:
        logger.error(f"Error comparing contracts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά τη σύγκριση των συμβάσεων"
        )

@router.get("/contracts/templates")
async def get_contract_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get available contract templates
    """
    try:
        templates = [
            {
                "type": "employment",
                "title": "Σύμβαση Εργασίας",
                "description": "Σύμβαση εργασίας αορίστου ή ορισμένου χρόνου",
                "icon": "👥",
                "required_fields": [
                    {"name": "company_name", "label": "Επωνυμία Εταιρείας", "type": "text"},
                    {"name": "employee_name", "label": "Όνομα Εργαζομένου", "type": "text"},
                    {"name": "employee_surname", "label": "Επώνυμο Εργαζομένου", "type": "text"},
                    {"name": "job_position", "label": "Θέση Εργασίας", "type": "text"},
                    {"name": "salary", "label": "Μισθός (€)", "type": "number"},
                    {"name": "work_hours", "label": "Ώρες Εργασίας", "type": "number"},
                    {"name": "probation_period", "label": "Δοκιμαστική Περίοδος (μήνες)", "type": "number"}
                ],
                "estimated_time": "15 λεπτά"
            },
            {
                "type": "supplier",
                "title": "Σύμβαση Προμηθευτή",
                "description": "Σύμβαση προμήθειας προϊόντων ή υπηρεσιών",
                "icon": "🚛",
                "required_fields": [
                    {"name": "buyer_company", "label": "Επωνυμία Αγοραστή", "type": "text"},
                    {"name": "supplier_company", "label": "Επωνυμία Προμηθευτή", "type": "text"},
                    {"name": "products_services", "label": "Προϊόντα/Υπηρεσίες", "type": "textarea"},
                    {"name": "total_value", "label": "Συνολική Αξία (€)", "type": "number"},
                    {"name": "delivery_time", "label": "Χρόνος Παράδοσης", "type": "text"},
                    {"name": "payment_terms", "label": "Όροι Πληρωμής", "type": "text"}
                ],
                "estimated_time": "20 λεπτά"
            },
            {
                "type": "nda",
                "title": "Συμφωνητικό Εμπιστευτικότητας",
                "description": "NDA για προστασία εμπιστευτικών πληροφοριών",
                "icon": "🔒",
                "required_fields": [
                    {"name": "party_a", "label": "Πρώτο Μέρος", "type": "text"},
                    {"name": "party_b", "label": "Δεύτερο Μέρος", "type": "text"},
                    {"name": "purpose", "label": "Σκοπός Συνεργασίας", "type": "textarea"},
                    {"name": "confidentiality_period", "label": "Διάρκεια Εμπιστευτικότητας", "type": "text"},
                    {"name": "penalty_amount", "label": "Ποινική Ρήτρα (€)", "type": "number"}
                ],
                "estimated_time": "10 λεπτά"
            },
            {
                "type": "service",
                "title": "Σύμβαση Υπηρεσιών",
                "description": "Σύμβαση παροχής υπηρεσιών",
                "icon": "🔧",
                "required_fields": [
                    {"name": "service_provider", "label": "Πάροχος Υπηρεσιών", "type": "text"},
                    {"name": "client", "label": "Πελάτης", "type": "text"},
                    {"name": "service_description", "label": "Περιγραφή Υπηρεσιών", "type": "textarea"},
                    {"name": "service_fee", "label": "Αμοιβή (€)", "type": "number"},
                    {"name": "duration", "label": "Διάρκεια", "type": "text"}
                ],
                "estimated_time": "15 λεπτά"
            }
        ]
        
        return {
            "templates": templates,
            "total_count": len(templates),
            "categories": [
                {"name": "Εργασιακά", "count": 1},
                {"name": "Εμπορικά", "count": 2},
                {"name": "Νομικά", "count": 1}
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching contract templates: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση των templates"
        )

@router.get("/contracts/risk-patterns")
async def get_risk_patterns(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get contract risk patterns for educational purposes
    """
    try:
        risk_patterns = [
            {
                "id": "unlimited_liability",
                "title": "Απεριόριστη Ευθύνη",
                "description": "Ρήτρες που επιβάλλουν απεριόριστη ευθύνη",
                "risk_level": "critical",
                "example": "Ο προμηθευτής φέρει απεριόριστη ευθύνη...",
                "warning": "Αποφύγετε ρήτρες απεριόριστης ευθύνης",
                "alternatives": [
                    "Περιορισμένη ευθύνη στο ύψος της σύμβασης",
                    "Εξαιρέσεις για δόλο και βαρεία αμέλεια",
                    "Ασφαλιστική κάλυψη"
                ]
            },
            {
                "id": "vague_termination",
                "title": "Ασαφείς Όροι Καταγγελίας",
                "description": "Ρήτρες που επιτρέπουν άμεση καταγγελία",
                "risk_level": "high",
                "example": "Καταγγελία οποιαδήποτε στιγμή χωρίς προειδοποίηση",
                "warning": "Απαιτείται προειδοποίηση και αιτιολόγηση",
                "alternatives": [
                    "Προειδοποίηση 30 ημερών",
                    "Αιτιολόγηση καταγγελίας",
                    "Διαδικασία επίλυσης διαφορών"
                ]
            },
            {
                "id": "excessive_penalty",
                "title": "Υπερβολική Ποινική Ρήτρα",
                "description": "Ποινικές ρήτρες άνω του 10% της αξίας",
                "risk_level": "medium",
                "example": "Ποινική ρήτρα 50% επί της αξίας",
                "warning": "Οι ποινικές ρήτρες πρέπει να είναι λογικές",
                "alternatives": [
                    "Ποινική ρήτρα 5-10% της αξίας",
                    "Κλιμακωτές ποινές",
                    "Δυνατότητα αποκατάστασης"
                ]
            }
        ]
        
        return {
            "risk_patterns": risk_patterns,
            "total_count": len(risk_patterns),
            "risk_levels": [
                {"level": "critical", "color": "red", "count": 1},
                {"level": "high", "color": "orange", "count": 1},
                {"level": "medium", "color": "yellow", "count": 1}
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching risk patterns: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση των προτύπων κινδύνου"
        )

@router.get("/contracts/compliance-checklist")
async def get_compliance_checklist(
    contract_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get compliance checklist for specific contract type
    """
    try:
        checklists = {
            "employment": {
                "title": "Checklist Σύμβασης Εργασίας",
                "items": [
                    {
                        "category": "Νομικές Απαιτήσεις",
                        "items": [
                            {"text": "Δήλωση στην ΕΡΓΑΝΗ πριν την έναρξη", "required": True},
                            {"text": "Ασφαλιστική κάλυψη στον ΕΦΚΑ", "required": True},
                            {"text": "Σύμφωνα με τη συλλογική σύμβαση", "required": True},
                            {"text": "Τήρηση νόμου 4808/2021", "required": True}
                        ]
                    },
                    {
                        "category": "Υποχρεωτικές Ρήτρες",
                        "items": [
                            {"text": "Δοκιμαστική περίοδος (μέχρι 12 μήνες)", "required": True},
                            {"text": "Ωράριο εργασίας και υπερωρίες", "required": True},
                            {"text": "Όροι καταγγελίας", "required": True},
                            {"text": "Αμοιβή και τρόπος πληρωμής", "required": True}
                        ]
                    },
                    {
                        "category": "Προαιρετικές Ρήτρες",
                        "items": [
                            {"text": "Μη ανταγωνισμός", "required": False},
                            {"text": "Εμπιστευτικότητα", "required": False},
                            {"text": "Επιπλέον παροχές", "required": False},
                            {"text": "Εκπαίδευση και ανάπτυξη", "required": False}
                        ]
                    }
                ]
            },
            "supplier": {
                "title": "Checklist Σύμβασης Προμηθευτή",
                "items": [
                    {
                        "category": "Τεχνικές Προδιαγραφές",
                        "items": [
                            {"text": "Αναλυτική περιγραφή προϊόντων", "required": True},
                            {"text": "Ποιοτικά χαρακτηριστικά", "required": True},
                            {"text": "Συσκευασία και σήμανση", "required": True},
                            {"text": "Πιστοποιητικά ποιότητας", "required": False}
                        ]
                    },
                    {
                        "category": "Οικονομικοί Όροι",
                        "items": [
                            {"text": "Τιμές και τρόπος υπολογισμού", "required": True},
                            {"text": "Όροι πληρωμής", "required": True},
                            {"text": "Φορολογικές υποχρεώσεις", "required": True},
                            {"text": "Εκπτώσεις και μπόνους", "required": False}
                        ]
                    }
                ]
            }
        }
        
        if contract_type not in checklists:
            raise HTTPException(
                status_code=400,
                detail=f"Δεν υπάρχει checklist για τον τύπο: {contract_type}"
            )
        
        return checklists[contract_type]
        
    except Exception as e:
        logger.error(f"Error fetching compliance checklist: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση του checklist"
        )

@router.get("/contracts/statistics")
async def get_contract_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get contract generation and analysis statistics
    """
    try:
        # Mock statistics (in production, calculate from database)
        statistics = {
            "total_contracts_generated": 145,
            "total_contracts_analyzed": 89,
            "average_compliance_score": 82.5,
            "most_common_type": "employment",
            "risk_distribution": {
                "low": 45,
                "medium": 32,
                "high": 18,
                "critical": 4
            },
            "monthly_trends": [
                {"month": "Ιανουάριος", "generated": 12, "analyzed": 8},
                {"month": "Φεβρουάριος", "generated": 15, "analyzed": 12},
                {"month": "Μάρτιος", "generated": 18, "analyzed": 15},
                {"month": "Απρίλιος", "generated": 22, "analyzed": 18}
            ],
            "contract_types": [
                {"type": "employment", "count": 58, "percentage": 40.0},
                {"type": "supplier", "count": 43, "percentage": 29.7},
                {"type": "nda", "count": 25, "percentage": 17.2},
                {"type": "service", "count": 19, "percentage": 13.1}
            ],
            "common_issues": [
                {"issue": "Απουσία ρήτρας εμπιστευτικότητας", "frequency": 35},
                {"issue": "Ασαφείς όροι πληρωμής", "frequency": 28},
                {"issue": "Έλλειψη ποινικής ρήτρας", "frequency": 22},
                {"issue": "Μη αναφορά σε εφαρμοστέο δίκαιο", "frequency": 18}
            ],
            "time_saved": "2.5 ώρες ανά σύμβαση",
            "cost_savings": "€450 ανά μήνα",
            "user_satisfaction": 4.7
        }
        
        return statistics
        
    except Exception as e:
        logger.error(f"Error fetching contract statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση στατιστικών"
        )