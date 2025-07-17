from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
import uuid

from app.core.database import get_db
from app.services.ai_legal_navigator import (
    ai_legal_navigator, 
    LegalQuery, 
    LegalArea, 
    DocumentType,
    LegalResponse,
    DocumentAnalysis
)
from app.services.auth_service import AuthService
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/legal/ask", response_model=dict)
async def ask_legal_question(
    question_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Ask a legal question to the AI Legal Navigator
    """
    try:
        question = question_data.get('question', '').strip()
        context = question_data.get('context', {})
        urgency = question_data.get('urgency', 'medium')
        
        if not question:
            raise HTTPException(
                status_code=400,
                detail="Η ερώτηση είναι υποχρεωτική"
            )
        
        # Create legal query
        legal_query = LegalQuery(
            id=str(uuid.uuid4()),
            question=question,
            area=LegalArea.BUSINESS_LAW,  # Will be determined by AI
            user_id=current_user.id,
            timestamp=datetime.utcnow(),
            context=context,
            urgency=urgency
        )
        
        # Process the query
        response = await ai_legal_navigator.process_legal_query(legal_query)
        
        # Log the interaction
        logger.info(f"Legal query processed for user {current_user.id}: {question[:50]}...")
        
        return {
            "query_id": response.query_id,
            "question": question,
            "answer": response.answer,
            "confidence": response.confidence,
            "legal_basis": response.legal_basis,
            "references": response.references,
            "warnings": response.warnings,
            "next_steps": response.next_steps,
            "lawyer_recommended": response.lawyer_recommended,
            "estimated_cost": response.estimated_cost,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error processing legal question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την επεξεργασία της νομικής ερώτησης"
        )

@router.post("/legal/analyze-document")
async def analyze_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Analyze uploaded legal document
    """
    try:
        # Validate document type
        try:
            doc_type = DocumentType(document_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Μη έγκυρος τύπος εγγράφου"
            )
        
        # Save uploaded file temporarily
        file_path = f"/tmp/{uuid.uuid4()}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analyze document
        analysis = await ai_legal_navigator.analyze_document(file_path, doc_type)
        
        # Clean up temporary file
        import os
        os.remove(file_path)
        
        logger.info(f"Document analyzed for user {current_user.id}: {file.filename}")
        
        return {
            "document_id": analysis.document_id,
            "document_type": analysis.document_type.value,
            "filename": file.filename,
            "analysis": {
                "risks": analysis.risks,
                "missing_fields": analysis.missing_fields,
                "compliance_score": analysis.compliance_score,
                "suggestions": analysis.suggestions,
                "legal_validity": analysis.legal_validity,
                "expiry_dates": analysis.expiry_dates,
                "key_terms": analysis.key_terms
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάλυση του εγγράφου"
        )

@router.post("/legal/generate-contract")
async def generate_contract(
    contract_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Generate contract from template
    """
    try:
        contract_type = contract_data.get('type', '')
        parameters = contract_data.get('parameters', {})
        
        if not contract_type:
            raise HTTPException(
                status_code=400,
                detail="Ο τύπος σύμβασης είναι υποχρεωτικός"
            )
        
        # Validate contract type
        valid_types = ['employment_contract', 'supplier_agreement', 'nda']
        if contract_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Μη έγκυρος τύπος σύμβασης. Διαθέσιμοι τύποι: {', '.join(valid_types)}"
            )
        
        # Generate contract
        contract_text = ai_legal_navigator.generate_contract_template(contract_type, parameters)
        
        logger.info(f"Contract generated for user {current_user.id}: {contract_type}")
        
        return {
            "contract_id": str(uuid.uuid4()),
            "contract_type": contract_type,
            "content": contract_text,
            "parameters": parameters,
            "warnings": [
                "Αυτή είναι μια προσχεδιασμένη σύμβαση",
                "Συνιστάται έλεγχος από νομικό σύμβουλο",
                "Προσαρμόστε τους όρους στις ανάγκες σας"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating contract: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά τη δημιουργία της σύμβασης"
        )

@router.get("/legal/templates")
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
                "type": "employment_contract",
                "title": "Σύμβαση Εργασίας",
                "description": "Σύμβαση για πρόσληψη εργαζόμενου",
                "required_fields": [
                    "ΕΡΓΟΔΟΤΗΣ", "ΔΙΕΥΘΥΝΣΗ", "AFM", "ΕΡΓΑΖΟΜΕΝΟΣ", 
                    "ΠΕΡΙΓΡΑΦΗ_ΕΡΓΑΣΙΑΣ", "ΠΟΣΟ", "ΩΡΕΣ", "ΔΙΑΡΚΕΙΑ"
                ]
            },
            {
                "type": "supplier_agreement",
                "title": "Σύμβαση Προμηθευτή",
                "description": "Σύμβαση για προμήθεια προϊόντων/υπηρεσιών",
                "required_fields": [
                    "ΑΓΟΡΑΣΤΗΣ", "ΠΡΟΜΗΘΕΥΤΗΣ", "ΣΤΟΙΧΕΙΑ", 
                    "ΠΕΡΙΓΡΑΦΗ_ΠΡΟΪΟΝΤΩΝ", "ΠΟΣΟ", "ΠΡΟΘΕΣΜΙΑ", "ΤΟΠΟΣ"
                ]
            },
            {
                "type": "nda",
                "title": "Συμφωνητικό Εμπιστευτικότητας",
                "description": "NDA για προστασία εμπιστευτικών πληροφοριών",
                "required_fields": [
                    "ΕΤΑΙΡΕΙΑ_Α", "ΕΤΑΙΡΕΙΑ_Β", "ΣΤΟΙΧΕΙΑ", 
                    "ΠΕΡΙΓΡΑΦΗ_ΣΥΝΕΡΓΑΣΙΑΣ", "ΚΑΤΗΓΟΡΙΕΣ_ΠΛΗΡΟΦΟΡΙΩΝ", "ΔΙΑΡΚΕΙΑ"
                ]
            }
        ]
        
        return {
            "templates": templates,
            "total_count": len(templates)
        }
        
    except Exception as e:
        logger.error(f"Error fetching templates: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση των templates"
        )

@router.get("/legal/knowledge-base")
async def get_legal_knowledge_base(
    area: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get legal knowledge base information
    """
    try:
        knowledge_base = ai_legal_navigator.knowledge_base
        
        if area:
            # Filter by specific area
            if area in knowledge_base:
                filtered_knowledge = {area: knowledge_base[area]}
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"Δεν βρέθηκε περιοχή δικαίου: {area}"
                )
        else:
            filtered_knowledge = knowledge_base
        
        return {
            "knowledge_base": filtered_knowledge,
            "available_areas": list(knowledge_base.keys()),
            "description": "Βάση γνώσεων ελληνικού επιχειρηματικού δικαίου"
        }
        
    except Exception as e:
        logger.error(f"Error fetching knowledge base: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση της βάσης γνώσεων"
        )

@router.get("/legal/recent-queries")
async def get_recent_legal_queries(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get recent legal queries for the user
    """
    try:
        # Mock recent queries (in production, fetch from database)
        recent_queries = [
            {
                "id": "query_001",
                "question": "Τι ισχύει για τις υπερωρίες σε part-time προσωπικό;",
                "area": "labor_law",
                "timestamp": "2024-01-15T10:30:00",
                "status": "answered"
            },
            {
                "id": "query_002", 
                "question": "Αν ακυρώσει ο πελάτης, δικαιούμαι αποζημίωση;",
                "area": "contract_law",
                "timestamp": "2024-01-14T15:45:00",
                "status": "answered"
            }
        ]
        
        return {
            "queries": recent_queries[:limit],
            "total_count": len(recent_queries)
        }
        
    except Exception as e:
        logger.error(f"Error fetching recent queries: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση των πρόσφατων ερωτήσεων"
        )

@router.get("/legal/statistics")
async def get_legal_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get legal service usage statistics
    """
    try:
        # Mock statistics (in production, calculate from database)
        statistics = {
            "total_queries": 45,
            "queries_this_month": 12,
            "documents_analyzed": 8,
            "contracts_generated": 3,
            "most_common_areas": [
                {"area": "labor_law", "count": 18, "percentage": 40},
                {"area": "taxation", "count": 14, "percentage": 31},
                {"area": "contract_law", "count": 10, "percentage": 22},
                {"area": "business_law", "count": 3, "percentage": 7}
            ],
            "lawyer_recommendations": 5,
            "high_risk_queries": 3,
            "average_response_time": "2.3 seconds",
            "user_satisfaction": 4.6
        }
        
        return statistics
        
    except Exception as e:
        logger.error(f"Error fetching statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση των στατιστικών"
        )