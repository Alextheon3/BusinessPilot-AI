"""
Email Invoice API Endpoints for BusinessPilot AI
Handles email invoice scanning, OCR processing, and validation
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, UploadFile, File, Form
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

from app.services.email_invoice_service import email_invoice_service, InvoiceStatus

router = APIRouter()

class InvoiceStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"
    APPROVED = "approved"
    REJECTED = "rejected"

class ValidateInvoiceRequest(BaseModel):
    corrections: Dict[str, Any] = Field(..., description="Field corrections to apply")
    validator_id: str = Field(..., description="ID of the validator")

class ProcessInvoiceRequest(BaseModel):
    invoice_id: str = Field(..., description="Invoice ID to process")
    force_reprocess: bool = Field(default=False, description="Force reprocessing even if already processed")

@router.post("/scan-email")
async def scan_email_for_invoices(
    background_tasks: BackgroundTasks,
    hours_back: int = 24
) -> Dict[str, Any]:
    """
    Scan email inbox for new invoices
    """
    try:
        # Start email scanning in background
        background_tasks.add_task(
            email_invoice_service.scan_email_for_invoices,
            hours_back=hours_back
        )
        
        return {
            "success": True,
            "message": f"Email scanning initiated for last {hours_back} hours"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scan-email/status")
async def get_scan_status(
    hours_back: int = 24
) -> Dict[str, Any]:
    """
    Get current email scan status and results
    """
    try:
        result = await email_invoice_service.scan_email_for_invoices(hours_back=hours_back)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-invoice")
async def process_invoice(
    request: ProcessInvoiceRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Process an invoice using OCR + LLM extraction
    """
    try:
        # Start processing in background
        background_tasks.add_task(
            email_invoice_service.process_invoice_ocr,
            invoice_id=request.invoice_id
        )
        
        return {
            "success": True,
            "message": f"Invoice {request.invoice_id} processing started",
            "invoice_id": request.invoice_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/process-invoice/{invoice_id}/status")
async def get_processing_status(
    invoice_id: str
) -> Dict[str, Any]:
    """
    Get processing status for a specific invoice
    """
    try:
        result = email_invoice_service.get_invoice_details(invoice_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {
            "success": True,
            "invoice_id": invoice_id,
            "status": result["invoice"]["status"],
            "processing_error": result["invoice"]["processing_error"],
            "confidence_score": result.get("extracted_data", {}).get("confidence_score")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate-invoice/{invoice_id}")
async def validate_invoice(
    invoice_id: str,
    request: ValidateInvoiceRequest
) -> Dict[str, Any]:
    """
    Validate and correct extracted invoice data
    """
    try:
        result = await email_invoice_service.validate_invoice(
            invoice_id=invoice_id,
            corrections=request.corrections,
            validator_id=request.validator_id
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "message": "Invoice validated successfully",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/invoices")
async def get_invoice_list(
    status: Optional[InvoiceStatusEnum] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Get list of processed invoices
    """
    try:
        # Convert enum to service enum if provided
        service_status = None
        if status:
            service_status = InvoiceStatus(status.value)
        
        result = email_invoice_service.get_invoice_list(
            status=service_status,
            limit=limit
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/invoices/{invoice_id}")
async def get_invoice_details(
    invoice_id: str
) -> Dict[str, Any]:
    """
    Get detailed information about a specific invoice
    """
    try:
        result = email_invoice_service.get_invoice_details(invoice_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-invoice")
async def upload_invoice_file(
    file: UploadFile = File(...),
    sender_email: str = Form(...),
    subject: str = Form(...)
) -> Dict[str, Any]:
    """
    Upload invoice file manually for processing
    """
    try:
        # Read file data
        file_data = await file.read()
        
        # Create manual invoice entry
        invoice_id = f"manual_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Mock manual invoice creation
        # In production, create EmailInvoice object and store
        
        return {
            "success": True,
            "message": "Invoice uploaded successfully",
            "invoice_id": invoice_id,
            "filename": file.filename,
            "size": len(file_data),
            "content_type": file.content_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-process")
async def bulk_process_invoices(
    background_tasks: BackgroundTasks,
    status: InvoiceStatusEnum = InvoiceStatusEnum.PENDING,
    limit: int = 10
) -> Dict[str, Any]:
    """
    Bulk process multiple invoices
    """
    try:
        # Get invoices to process
        invoice_list = email_invoice_service.get_invoice_list(
            status=InvoiceStatus(status.value),
            limit=limit
        )
        
        if not invoice_list["success"]:
            raise HTTPException(status_code=400, detail=invoice_list["error"])
        
        # Start bulk processing
        processed_count = 0
        for invoice in invoice_list["invoices"]:
            if invoice["status"] == "pending":
                background_tasks.add_task(
                    email_invoice_service.process_invoice_ocr,
                    invoice_id=invoice["id"]
                )
                processed_count += 1
        
        return {
            "success": True,
            "message": f"Bulk processing started for {processed_count} invoices",
            "processed_count": processed_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_processing_analytics() -> Dict[str, Any]:
    """
    Get analytics for invoice processing
    """
    try:
        result = email_invoice_service.get_processing_analytics()
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/unprocessed-count")
async def get_unprocessed_count() -> Dict[str, Any]:
    """
    Get count of unprocessed invoices
    """
    try:
        result = email_invoice_service.get_invoice_list(
            status=InvoiceStatus.PENDING,
            limit=1000
        )
        
        return {
            "success": True,
            "unprocessed_count": result["total"] if result["success"] else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/configure-email")
async def configure_email_settings(
    email_config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Configure email settings for invoice scanning
    """
    try:
        # Mock email configuration
        # In production, update email_invoice_service.email_config
        
        return {
            "success": True,
            "message": "Email configuration updated successfully",
            "configured_settings": list(email_config.keys())
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-email-connection")
async def test_email_connection() -> Dict[str, Any]:
    """
    Test email connection settings
    """
    try:
        # Mock email connection test
        # In production, test IMAP connection
        
        return {
            "success": True,
            "message": "Email connection successful",
            "connection_details": {
                "imap_server": "imap.gmail.com",
                "imap_port": 993,
                "connection_time": 0.5,
                "last_check": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/extraction-confidence/{invoice_id}")
async def get_extraction_confidence(
    invoice_id: str
) -> Dict[str, Any]:
    """
    Get confidence score details for extraction
    """
    try:
        result = email_invoice_service.get_invoice_details(invoice_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        extracted_data = result.get("extracted_data", {})
        
        return {
            "success": True,
            "invoice_id": invoice_id,
            "confidence_score": extracted_data.get("confidence_score", 0),
            "processing_notes": extracted_data.get("processing_notes", []),
            "validation_status": result["invoice"]["is_validated"],
            "requires_review": extracted_data.get("confidence_score", 0) < 0.8
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/approve-invoice/{invoice_id}")
async def approve_invoice(
    invoice_id: str,
    approver_id: str = "system"
) -> Dict[str, Any]:
    """
    Approve a processed invoice
    """
    try:
        # Mock approval process
        # In production, update invoice status to approved
        
        return {
            "success": True,
            "message": f"Invoice {invoice_id} approved successfully",
            "approved_by": approver_id,
            "approved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reject-invoice/{invoice_id}")
async def reject_invoice(
    invoice_id: str,
    rejection_reason: str,
    rejected_by: str = "system"
) -> Dict[str, Any]:
    """
    Reject a processed invoice
    """
    try:
        # Mock rejection process
        # In production, update invoice status to rejected
        
        return {
            "success": True,
            "message": f"Invoice {invoice_id} rejected successfully",
            "rejection_reason": rejection_reason,
            "rejected_by": rejected_by,
            "rejected_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))