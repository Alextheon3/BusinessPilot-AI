from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import os
import json

from app.services.paperwork_service import (
    paperwork_service,
    DocumentRequest,
    DocumentType,
    BusinessProfile,
    DocumentResponse
)
from app.services.greek_government_api import greek_gov_api

router = APIRouter()

class BusinessProfileSchema(BaseModel):
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

class PaperworkRequestSchema(BaseModel):
    user_query: str
    document_type: Optional[str] = None
    business_profile: BusinessProfileSchema
    additional_data: Optional[Dict[str, Any]] = None
    language: str = "el"

class PaperworkResponseSchema(BaseModel):
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

class DocumentTypeInfo(BaseModel):
    document_type: str
    title: str
    description: str
    ministry: str
    deadline: Optional[str]
    required_fields: List[str]
    url: str

@router.post("/process", response_model=PaperworkResponseSchema)
async def process_paperwork_request(request: PaperworkRequestSchema):
    """Process a paperwork request and generate the appropriate document"""
    
    try:
        # Convert schema to service models
        business_profile = BusinessProfile(
            company_name=request.business_profile.company_name,
            afm=request.business_profile.afm,
            kad=request.business_profile.kad,
            address=request.business_profile.address,
            phone=request.business_profile.phone,
            email=request.business_profile.email,
            region=request.business_profile.region,
            employees=request.business_profile.employees,
            owner_name=request.business_profile.owner_name,
            owner_age=request.business_profile.owner_age,
            owner_gender=request.business_profile.owner_gender,
            establishment_year=request.business_profile.establishment_year,
            is_startup=request.business_profile.is_startup,
            is_innovative=request.business_profile.is_innovative,
            is_green=request.business_profile.is_green,
            has_digital_transformation=request.business_profile.has_digital_transformation
        )
        
        # Determine document type
        document_type = DocumentType.OTHER
        if request.document_type:
            try:
                document_type = DocumentType(request.document_type)
            except ValueError:
                pass
        
        # Create document request
        doc_request = DocumentRequest(
            document_type=document_type,
            user_query=request.user_query,
            business_profile=business_profile,
            additional_data=request.additional_data,
            language=request.language
        )
        
        # Process the request
        response = await paperwork_service.process_paperwork_request(doc_request)
        
        return PaperworkResponseSchema(
            document_id=response.document_id,
            title=response.title,
            description=response.description,
            instructions=response.instructions,
            ministry=response.ministry,
            deadline=response.deadline,
            pdf_url=response.pdf_url,
            prefilled_data=response.prefilled_data,
            related_forms=response.related_forms,
            next_steps=response.next_steps,
            ai_explanation=response.ai_explanation
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing paperwork request: {str(e)}")

@router.get("/document-types", response_model=List[DocumentTypeInfo])
async def get_document_types():
    """Get all available document types"""
    
    document_types = []
    for doc_type in DocumentType:
        form_info = paperwork_service.forms_mapping.get(doc_type, {})
        document_types.append(DocumentTypeInfo(
            document_type=doc_type.value,
            title=form_info.get("title", doc_type.value),
            description=form_info.get("description", ""),
            ministry=form_info.get("ministry", ""),
            deadline=form_info.get("deadline"),
            required_fields=form_info.get("required_fields", []),
            url=form_info.get("url", "")
        ))
    
    return document_types

@router.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Get a specific document by ID"""
    
    # In production, this would query the database
    # For now, return a mock response
    return {
        "document_id": document_id,
        "title": "Έντυπο Ε3",
        "status": "generated",
        "created_at": datetime.now().isoformat(),
        "download_url": f"/api/v1/paperwork/download/{document_id}"
    }

@router.get("/download/{filename}")
async def download_document(filename: str):
    """Download a generated document"""
    
    file_path = os.path.join("documents", filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/pdf"
    )

@router.post("/analyze-query")
async def analyze_query(query: str, business_profile: BusinessProfileSchema):
    """Analyze a user query to determine document type and requirements"""
    
    try:
        # Convert schema to service model
        bp = BusinessProfile(
            company_name=business_profile.company_name,
            afm=business_profile.afm,
            kad=business_profile.kad,
            address=business_profile.address,
            phone=business_profile.phone,
            email=business_profile.email,
            region=business_profile.region,
            employees=business_profile.employees,
            owner_name=business_profile.owner_name,
            owner_age=business_profile.owner_age,
            owner_gender=business_profile.owner_gender,
            establishment_year=business_profile.establishment_year,
            is_startup=business_profile.is_startup,
            is_innovative=business_profile.is_innovative,
            is_green=business_profile.is_green,
            has_digital_transformation=business_profile.has_digital_transformation
        )
        
        # Create a mock document request for analysis
        doc_request = DocumentRequest(
            document_type=DocumentType.OTHER,
            user_query=query,
            business_profile=bp,
            language="el"
        )
        
        # Analyze the query
        analysis = await paperwork_service._analyze_user_intent(doc_request)
        
        return {
            "query": query,
            "analysis": analysis,
            "suggested_actions": analysis.get("required_actions", []),
            "urgency": analysis.get("urgency", "medium"),
            "confidence": analysis.get("confidence", 0.5)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing query: {str(e)}")

@router.get("/forms/{form_type}")
async def get_form_template(form_type: str):
    """Get a form template for a specific document type"""
    
    try:
        document_type = DocumentType(form_type)
        form_info = paperwork_service.forms_mapping.get(document_type, {})
        
        return {
            "form_type": form_type,
            "title": form_info.get("title", form_type),
            "ministry": form_info.get("ministry", ""),
            "deadline": form_info.get("deadline"),
            "required_fields": form_info.get("required_fields", []),
            "instructions": paperwork_service._get_instructions(document_type),
            "related_forms": paperwork_service._get_related_forms(document_type),
            "submission_url": form_info.get("url", "")
        }
        
    except ValueError:
        raise HTTPException(status_code=404, detail="Form type not found")

@router.post("/prefill")
async def prefill_form(form_type: str, business_profile: BusinessProfileSchema):
    """Get prefilled data for a form based on business profile"""
    
    try:
        document_type = DocumentType(form_type)
        
        # Convert schema to service model
        bp = BusinessProfile(
            company_name=business_profile.company_name,
            afm=business_profile.afm,
            kad=business_profile.kad,
            address=business_profile.address,
            phone=business_profile.phone,
            email=business_profile.email,
            region=business_profile.region,
            employees=business_profile.employees,
            owner_name=business_profile.owner_name,
            owner_age=business_profile.owner_age,
            owner_gender=business_profile.owner_gender,
            establishment_year=business_profile.establishment_year,
            is_startup=business_profile.is_startup,
            is_innovative=business_profile.is_innovative,
            is_green=business_profile.is_green,
            has_digital_transformation=business_profile.has_digital_transformation
        )
        
        # Generate prefilled data
        prefilled_data = paperwork_service._generate_prefilled_data(bp, document_type)
        
        return {
            "form_type": form_type,
            "prefilled_data": prefilled_data,
            "completion_percentage": len([v for v in prefilled_data.values() if v]) / len(prefilled_data) * 100
        }
        
    except ValueError:
        raise HTTPException(status_code=404, detail="Form type not found")

@router.get("/deadlines")
async def get_upcoming_deadlines(business_profile: BusinessProfileSchema):
    """Get upcoming deadlines for a business"""
    
    # Mock implementation - in production, this would check actual deadlines
    deadlines = [
        {
            "document_type": "VAT_RETURN",
            "title": "Δήλωση ΦΠΑ",
            "deadline": "2024-02-25",
            "days_remaining": 15,
            "priority": "high",
            "ministry": "ΑΑΔΕ"
        },
        {
            "document_type": "E4",
            "title": "Ετήσια Καταγραφή Προσωπικού",
            "deadline": "2024-10-31",
            "days_remaining": 180,
            "priority": "medium",
            "ministry": "ΕΡΓΑΝΗ"
        }
    ]
    
    return {
        "business_afm": business_profile.afm,
        "deadlines": deadlines,
        "total_pending": len(deadlines),
        "high_priority": len([d for d in deadlines if d["priority"] == "high"])
    }

@router.post("/submit")
async def submit_document(document_id: str, submission_data: Dict[str, Any]):
    """Submit a document to the relevant government system"""
    
    # Mock implementation - in production, this would integrate with actual government APIs
    return {
        "document_id": document_id,
        "submission_id": f"SUB_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "status": "submitted",
        "submitted_at": datetime.now().isoformat(),
        "tracking_number": f"TRK_{document_id}",
        "estimated_processing_time": "5-10 εργάσιμες ημέρες",
        "next_steps": [
            "Θα λάβετε email επιβεβαίωσης",
            "Ελέγξτε την κατάσταση στο gov.gr",
            "Κρατήστε τον αριθμό παρακολούθησης"
        ]
    }

@router.get("/submission-status/{submission_id}")
async def get_submission_status(submission_id: str):
    """Get the status of a submitted document"""
    
    # Mock implementation
    return {
        "submission_id": submission_id,
        "status": "processing",
        "submitted_at": "2024-01-15T10:30:00",
        "last_updated": datetime.now().isoformat(),
        "estimated_completion": "2024-01-25T17:00:00",
        "notes": "Το έγγραφο είναι υπό επεξεργασία από τον αρμόδιο φορέα"
    }

@router.post("/ai-query")
async def process_ai_query(query: str, business_profile: BusinessProfileSchema):
    """Process an AI query with full Greek business context"""
    
    try:
        # Convert business profile to dict
        bp_dict = {
            "name": business_profile.company_name,
            "afm": business_profile.afm,
            "kad": business_profile.kad,
            "region": business_profile.region,
            "employees": business_profile.employees,
            "owner_age": business_profile.owner_age,
            "owner_gender": business_profile.owner_gender,
            "is_startup": business_profile.is_startup,
            "address": business_profile.address,
            "phone": business_profile.phone,
            "email": business_profile.email
        }
        
        # Get AI insights
        insights = await greek_gov_api.get_business_insights(bp_dict)
        
        # Search for relevant services
        search_results = await greek_gov_api.search_government_services(query)
        
        # Get subsidies
        subsidies = await greek_gov_api.get_subsidies_for_business(bp_dict)
        
        # Get upcoming deadlines
        deadlines = await greek_gov_api.get_upcoming_deadlines(bp_dict)
        
        return {
            "query": query,
            "business_profile": bp_dict,
            "insights": insights,
            "search_results": search_results,
            "relevant_subsidies": [s.__dict__ for s in subsidies],
            "upcoming_deadlines": deadlines,
            "response_type": "ai_comprehensive"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing AI query: {str(e)}")

@router.get("/subsidies")
async def get_available_subsidies(business_profile: BusinessProfileSchema):
    """Get available subsidies for a business"""
    
    try:
        # Convert business profile to dict
        bp_dict = {
            "name": business_profile.company_name,
            "afm": business_profile.afm,
            "kad": business_profile.kad,
            "region": business_profile.region,
            "employees": business_profile.employees,
            "owner_age": business_profile.owner_age,
            "owner_gender": business_profile.owner_gender,
            "is_startup": business_profile.is_startup
        }
        
        subsidies = await greek_gov_api.get_subsidies_for_business(bp_dict)
        
        return {
            "business_afm": business_profile.afm,
            "subsidies": [s.__dict__ for s in subsidies],
            "total_available": len(subsidies),
            "total_potential_amount": sum(s.amount for s in subsidies)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting subsidies: {str(e)}")

@router.get("/government-documents")
async def get_government_documents(category: Optional[str] = None):
    """Get available government documents"""
    
    try:
        documents = await greek_gov_api.get_government_documents(category=category)
        
        return {
            "documents": [doc.__dict__ for doc in documents],
            "total_documents": len(documents),
            "category": category or "all"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting documents: {str(e)}")

@router.get("/business-insights")
async def get_business_insights(business_profile: BusinessProfileSchema):
    """Get AI-powered business insights"""
    
    try:
        # Convert business profile to dict
        bp_dict = {
            "name": business_profile.company_name,
            "afm": business_profile.afm,
            "kad": business_profile.kad,
            "region": business_profile.region,
            "employees": business_profile.employees,
            "revenue": getattr(business_profile, 'revenue', 150000),
            "owner_age": business_profile.owner_age,
            "owner_gender": business_profile.owner_gender,
            "is_startup": business_profile.is_startup
        }
        
        insights = await greek_gov_api.get_business_insights(bp_dict)
        
        return {
            "business_afm": business_profile.afm,
            "insights": insights,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting business insights: {str(e)}")

@router.get("/search-services")
async def search_government_services(query: str):
    """Search government services and documents"""
    
    try:
        results = await greek_gov_api.search_government_services(query)
        
        return {
            "query": query,
            "results": results,
            "total_results": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching services: {str(e)}")

@router.post("/generate-prefilled")
async def generate_prefilled_form(form_id: str, business_profile: BusinessProfileSchema):
    """Generate a prefilled government form"""
    
    try:
        # Convert business profile to dict
        bp_dict = {
            "name": business_profile.company_name,
            "afm": business_profile.afm,
            "kad": business_profile.kad,
            "region": business_profile.region,
            "employees": business_profile.employees,
            "address": business_profile.address,
            "phone": business_profile.phone,
            "email": business_profile.email
        }
        
        form_data = await greek_gov_api.generate_prefilled_form(form_id, bp_dict)
        
        return {
            "form_id": form_id,
            "business_afm": business_profile.afm,
            "form_data": form_data,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating prefilled form: {str(e)}")