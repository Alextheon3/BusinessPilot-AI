"""
Email Integration + Invoice Extraction Service for BusinessPilot AI
Advanced OCR + LLM system for automatic invoice processing
"""

import asyncio
import imaplib
import email
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import logging
import json
import base64
import re
import httpx
from PIL import Image
import pytesseract
import io
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class InvoiceStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"
    APPROVED = "approved"
    REJECTED = "rejected"

class InvoiceType(Enum):
    PURCHASE = "purchase"
    SALES = "sales"
    UTILITY = "utility"
    TAX = "tax"
    SERVICE = "service"
    OTHER = "other"

@dataclass
class ExtractedInvoiceData:
    """Extracted invoice data from OCR + LLM processing"""
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_vat: Optional[str] = None
    supplier_address: Optional[str] = None
    customer_name: Optional[str] = None
    customer_vat: Optional[str] = None
    
    # Financial data
    subtotal: Optional[float] = None
    vat_rate: Optional[float] = None
    vat_amount: Optional[float] = None
    total_amount: Optional[float] = None
    currency: str = "EUR"
    
    # Categories
    invoice_type: InvoiceType = InvoiceType.OTHER
    expense_category: Optional[str] = None
    
    # Line items
    line_items: List[Dict[str, Any]] = field(default_factory=list)
    
    # Processing metadata
    confidence_score: float = 0.0
    extracted_text: Optional[str] = None
    processing_notes: List[str] = field(default_factory=list)

@dataclass
class EmailInvoice:
    """Email invoice container"""
    id: str
    email_id: str
    subject: str
    sender: str
    received_date: datetime
    attachment_filename: str
    attachment_data: bytes
    attachment_type: str
    
    # Processing status
    status: InvoiceStatus = InvoiceStatus.PENDING
    extracted_data: Optional[ExtractedInvoiceData] = None
    processing_error: Optional[str] = None
    processing_started: Optional[datetime] = None
    processing_completed: Optional[datetime] = None
    
    # User validation
    is_validated: bool = False
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None
    corrections: Dict[str, Any] = field(default_factory=dict)

class EmailInvoiceService:
    """
    Email Integration + Invoice Extraction Service
    Automatically processes invoices from email attachments
    """
    
    def __init__(self):
        self.invoices: Dict[str, EmailInvoice] = {}
        self.client = httpx.AsyncClient(timeout=60.0)
        
        # Email configuration
        self.email_config = {
            "imap_server": os.getenv("IMAP_SERVER", "imap.gmail.com"),
            "imap_port": int(os.getenv("IMAP_PORT", "993")),
            "smtp_server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
            "smtp_port": int(os.getenv("SMTP_PORT", "587")),
            "email": os.getenv("EMAIL_ADDRESS"),
            "password": os.getenv("EMAIL_PASSWORD"),
            "inbox_folder": "INBOX"
        }
        
        # OCR configuration
        self.ocr_config = {
            "language": "ell+eng",  # Greek + English
            "tesseract_config": "--psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω€.,-/:%()"
        }
        
        # LLM configuration for invoice processing
        self.llm_config = {
            "model": "gpt-4",
            "temperature": 0.1,
            "max_tokens": 2000
        }
        
        # Initialize mock data
        self._load_mock_invoices()
    
    def _load_mock_invoices(self):
        """Load mock invoice data for demonstration"""
        mock_invoices = [
            EmailInvoice(
                id="inv_001",
                email_id="email_001",
                subject="Τιμολόγιο #2024-001 - Καφενείο Αθήνα",
                sender="supplier@coffee-beans.gr",
                received_date=datetime.now() - timedelta(hours=2),
                attachment_filename="invoice_2024_001.pdf",
                attachment_data=b"mock_pdf_data",
                attachment_type="application/pdf",
                status=InvoiceStatus.PROCESSED,
                extracted_data=ExtractedInvoiceData(
                    invoice_number="2024-001",
                    invoice_date="2024-04-15",
                    due_date="2024-04-30",
                    supplier_name="Καφενείο Αθήνα ΑΕ",
                    supplier_vat="123456789",
                    customer_name="BusinessPilot Demo",
                    customer_vat="987654321",
                    subtotal=125.50,
                    vat_rate=24.0,
                    vat_amount=30.12,
                    total_amount=155.62,
                    invoice_type=InvoiceType.PURCHASE,
                    expense_category="Αναλώσιμα",
                    confidence_score=0.92,
                    line_items=[
                        {
                            "description": "Καφές Espresso - 5kg",
                            "quantity": 2,
                            "unit_price": 45.00,
                            "total": 90.00
                        },
                        {
                            "description": "Φίλτρα καφέ",
                            "quantity": 1,
                            "unit_price": 35.50,
                            "total": 35.50
                        }
                    ]
                ),
                processing_completed=datetime.now() - timedelta(hours=1, minutes=30)
            ),
            EmailInvoice(
                id="inv_002",
                email_id="email_002",
                subject="Λογαριασμός ΔΕΗ - Απρίλιος 2024",
                sender="noreply@dei.gr",
                received_date=datetime.now() - timedelta(days=1),
                attachment_filename="dei_april_2024.pdf",
                attachment_data=b"mock_pdf_data",
                attachment_type="application/pdf",
                status=InvoiceStatus.PROCESSED,
                extracted_data=ExtractedInvoiceData(
                    invoice_number="DEI-2024-04-123456",
                    invoice_date="2024-04-10",
                    due_date="2024-04-25",
                    supplier_name="ΔΕΗ ΑΕ",
                    supplier_vat="094019245",
                    customer_name="BusinessPilot Demo",
                    customer_vat="987654321",
                    subtotal=156.45,
                    vat_rate=24.0,
                    vat_amount=37.55,
                    total_amount=194.00,
                    invoice_type=InvoiceType.UTILITY,
                    expense_category="Λειτουργικά έξοδα",
                    confidence_score=0.95,
                    line_items=[
                        {
                            "description": "Κατανάλωση ηλεκτρικού ρεύματος",
                            "quantity": 1,
                            "unit_price": 156.45,
                            "total": 156.45
                        }
                    ]
                ),
                processing_completed=datetime.now() - timedelta(hours=20)
            )
        ]
        
        for invoice in mock_invoices:
            self.invoices[invoice.id] = invoice
    
    async def scan_email_for_invoices(self, hours_back: int = 24) -> Dict[str, Any]:
        """
        Scan email inbox for new invoices
        """
        try:
            logger.info(f"Scanning email for invoices from last {hours_back} hours")
            
            # Mock email scanning - in production, use IMAP
            new_invoices = []
            
            # Simulate finding new invoices
            if len(self.invoices) < 5:  # Add mock invoices periodically
                new_invoice = EmailInvoice(
                    id=f"inv_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    email_id=f"email_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    subject="Νέο Τιμολόγιο - Προμηθευτής",
                    sender="supplier@example.gr",
                    received_date=datetime.now(),
                    attachment_filename="new_invoice.pdf",
                    attachment_data=b"mock_pdf_data",
                    attachment_type="application/pdf",
                    status=InvoiceStatus.PENDING
                )
                
                self.invoices[new_invoice.id] = new_invoice
                new_invoices.append(new_invoice)
            
            logger.info(f"Found {len(new_invoices)} new invoices")
            
            return {
                "success": True,
                "new_invoices": len(new_invoices),
                "total_invoices": len(self.invoices),
                "invoices": [
                    {
                        "id": inv.id,
                        "subject": inv.subject,
                        "sender": inv.sender,
                        "received_date": inv.received_date.isoformat(),
                        "status": inv.status.value
                    }
                    for inv in new_invoices
                ]
            }
            
        except Exception as e:
            logger.error(f"Error scanning email: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def process_invoice_ocr(self, invoice_id: str) -> Dict[str, Any]:
        """
        Process invoice using OCR + LLM extraction
        """
        try:
            invoice = self.invoices.get(invoice_id)
            if not invoice:
                return {"success": False, "error": "Invoice not found"}
            
            logger.info(f"Processing invoice {invoice_id} with OCR + LLM")
            
            # Update status
            invoice.status = InvoiceStatus.PROCESSING
            invoice.processing_started = datetime.now()
            
            # Step 1: OCR Text Extraction
            extracted_text = await self._extract_text_from_image(invoice.attachment_data)
            
            # Step 2: LLM Processing
            extracted_data = await self._process_text_with_llm(extracted_text)
            
            # Step 3: Validation and confidence scoring
            confidence_score = self._calculate_confidence_score(extracted_data)
            extracted_data.confidence_score = confidence_score
            extracted_data.extracted_text = extracted_text
            
            # Update invoice
            invoice.extracted_data = extracted_data
            invoice.status = InvoiceStatus.PROCESSED
            invoice.processing_completed = datetime.now()
            
            logger.info(f"Invoice {invoice_id} processed successfully with confidence {confidence_score:.2f}")
            
            return {
                "success": True,
                "invoice_id": invoice_id,
                "extracted_data": {
                    "invoice_number": extracted_data.invoice_number,
                    "invoice_date": extracted_data.invoice_date,
                    "due_date": extracted_data.due_date,
                    "supplier_name": extracted_data.supplier_name,
                    "total_amount": extracted_data.total_amount,
                    "vat_amount": extracted_data.vat_amount,
                    "confidence_score": extracted_data.confidence_score
                },
                "processing_time": (invoice.processing_completed - invoice.processing_started).total_seconds()
            }
            
        except Exception as e:
            logger.error(f"Error processing invoice {invoice_id}: {str(e)}")
            
            # Update invoice with error
            if invoice_id in self.invoices:
                self.invoices[invoice_id].status = InvoiceStatus.FAILED
                self.invoices[invoice_id].processing_error = str(e)
            
            return {"success": False, "error": str(e)}
    
    async def _extract_text_from_image(self, image_data: bytes) -> str:
        """
        Extract text from image using OCR
        """
        try:
            # Mock OCR extraction - in production, use Tesseract
            mock_text = """
            ΤΙΜΟΛΟΓΙΟ
            
            Αριθμός: 2024-001
            Ημερομηνία: 15/04/2024
            Προθεσμία: 30/04/2024
            
            Προμηθευτής: Καφενείο Αθήνα ΑΕ
            ΑΦΜ: 123456789
            
            Πελάτης: BusinessPilot Demo
            ΑΦΜ: 987654321
            
            Περιγραφή                    Ποσότητα    Τιμή    Σύνολο
            Καφές Espresso - 5kg         2          45.00   90.00
            Φίλτρα καφέ                  1          35.50   35.50
            
            Υποσύνολο:                              125.50
            ΦΠΑ 24%:                                30.12
            Σύνολο:                                 155.62 €
            """
            
            # Simulate processing delay
            await asyncio.sleep(1.0)
            
            return mock_text.strip()
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {str(e)}")
            raise
    
    async def _process_text_with_llm(self, text: str) -> ExtractedInvoiceData:
        """
        Process extracted text using LLM for structured data extraction
        """
        try:
            # Mock LLM processing - in production, use OpenAI API
            extracted_data = ExtractedInvoiceData(
                invoice_number="2024-001",
                invoice_date="2024-04-15",
                due_date="2024-04-30",
                supplier_name="Καφενείο Αθήνα ΑΕ",
                supplier_vat="123456789",
                customer_name="BusinessPilot Demo",
                customer_vat="987654321",
                subtotal=125.50,
                vat_rate=24.0,
                vat_amount=30.12,
                total_amount=155.62,
                invoice_type=InvoiceType.PURCHASE,
                expense_category="Αναλώσιμα",
                line_items=[
                    {
                        "description": "Καφές Espresso - 5kg",
                        "quantity": 2,
                        "unit_price": 45.00,
                        "total": 90.00
                    },
                    {
                        "description": "Φίλτρα καφέ",
                        "quantity": 1,
                        "unit_price": 35.50,
                        "total": 35.50
                    }
                ],
                processing_notes=[
                    "Invoice extracted successfully",
                    "All required fields found",
                    "VAT calculation verified"
                ]
            )
            
            # Simulate LLM processing delay
            await asyncio.sleep(2.0)
            
            return extracted_data
            
        except Exception as e:
            logger.error(f"LLM processing failed: {str(e)}")
            raise
    
    def _calculate_confidence_score(self, data: ExtractedInvoiceData) -> float:
        """
        Calculate confidence score for extracted data
        """
        score = 0.0
        total_factors = 0
        
        # Check required fields
        required_fields = [
            'invoice_number', 'invoice_date', 'supplier_name', 'total_amount'
        ]
        
        for field in required_fields:
            total_factors += 1
            if getattr(data, field) is not None:
                score += 1.0
        
        # Check VAT calculation
        if data.subtotal and data.vat_amount and data.total_amount:
            total_factors += 1
            expected_total = data.subtotal + data.vat_amount
            if abs(expected_total - data.total_amount) < 0.01:
                score += 1.0
        
        # Check line items
        if data.line_items:
            total_factors += 1
            score += 1.0
        
        return score / total_factors if total_factors > 0 else 0.0
    
    async def validate_invoice(
        self,
        invoice_id: str,
        corrections: Dict[str, Any],
        validator_id: str
    ) -> Dict[str, Any]:
        """
        Validate and correct extracted invoice data
        """
        try:
            invoice = self.invoices.get(invoice_id)
            if not invoice:
                return {"success": False, "error": "Invoice not found"}
            
            # Apply corrections
            if invoice.extracted_data:
                for field, value in corrections.items():
                    if hasattr(invoice.extracted_data, field):
                        setattr(invoice.extracted_data, field, value)
            
            # Update validation status
            invoice.is_validated = True
            invoice.validated_by = validator_id
            invoice.validated_at = datetime.now()
            invoice.corrections = corrections
            invoice.status = InvoiceStatus.APPROVED
            
            logger.info(f"Invoice {invoice_id} validated by {validator_id}")
            
            return {
                "success": True,
                "invoice_id": invoice_id,
                "validated_at": invoice.validated_at.isoformat(),
                "corrections_applied": len(corrections)
            }
            
        except Exception as e:
            logger.error(f"Error validating invoice {invoice_id}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_invoice_list(
        self,
        status: Optional[InvoiceStatus] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Get list of processed invoices
        """
        try:
            invoices = list(self.invoices.values())
            
            # Filter by status
            if status:
                invoices = [inv for inv in invoices if inv.status == status]
            
            # Sort by received date
            invoices.sort(key=lambda x: x.received_date, reverse=True)
            
            # Limit results
            invoices = invoices[:limit]
            
            return {
                "success": True,
                "total": len(invoices),
                "invoices": [
                    {
                        "id": inv.id,
                        "subject": inv.subject,
                        "sender": inv.sender,
                        "received_date": inv.received_date.isoformat(),
                        "status": inv.status.value,
                        "attachment_filename": inv.attachment_filename,
                        "total_amount": inv.extracted_data.total_amount if inv.extracted_data else None,
                        "supplier_name": inv.extracted_data.supplier_name if inv.extracted_data else None,
                        "confidence_score": inv.extracted_data.confidence_score if inv.extracted_data else None,
                        "is_validated": inv.is_validated
                    }
                    for inv in invoices
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting invoice list: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_invoice_details(self, invoice_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific invoice
        """
        try:
            invoice = self.invoices.get(invoice_id)
            if not invoice:
                return {"success": False, "error": "Invoice not found"}
            
            result = {
                "success": True,
                "invoice": {
                    "id": invoice.id,
                    "email_id": invoice.email_id,
                    "subject": invoice.subject,
                    "sender": invoice.sender,
                    "received_date": invoice.received_date.isoformat(),
                    "attachment_filename": invoice.attachment_filename,
                    "attachment_type": invoice.attachment_type,
                    "status": invoice.status.value,
                    "is_validated": invoice.is_validated,
                    "validated_by": invoice.validated_by,
                    "validated_at": invoice.validated_at.isoformat() if invoice.validated_at else None,
                    "processing_error": invoice.processing_error
                }
            }
            
            # Add extracted data if available
            if invoice.extracted_data:
                result["extracted_data"] = {
                    "invoice_number": invoice.extracted_data.invoice_number,
                    "invoice_date": invoice.extracted_data.invoice_date,
                    "due_date": invoice.extracted_data.due_date,
                    "supplier_name": invoice.extracted_data.supplier_name,
                    "supplier_vat": invoice.extracted_data.supplier_vat,
                    "customer_name": invoice.extracted_data.customer_name,
                    "customer_vat": invoice.extracted_data.customer_vat,
                    "subtotal": invoice.extracted_data.subtotal,
                    "vat_rate": invoice.extracted_data.vat_rate,
                    "vat_amount": invoice.extracted_data.vat_amount,
                    "total_amount": invoice.extracted_data.total_amount,
                    "currency": invoice.extracted_data.currency,
                    "invoice_type": invoice.extracted_data.invoice_type.value,
                    "expense_category": invoice.extracted_data.expense_category,
                    "line_items": invoice.extracted_data.line_items,
                    "confidence_score": invoice.extracted_data.confidence_score,
                    "processing_notes": invoice.extracted_data.processing_notes
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting invoice details: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_processing_analytics(self) -> Dict[str, Any]:
        """
        Get analytics for invoice processing
        """
        try:
            invoices = list(self.invoices.values())
            
            total_invoices = len(invoices)
            processed_invoices = len([inv for inv in invoices if inv.status == InvoiceStatus.PROCESSED])
            failed_invoices = len([inv for inv in invoices if inv.status == InvoiceStatus.FAILED])
            pending_invoices = len([inv for inv in invoices if inv.status == InvoiceStatus.PENDING])
            
            # Calculate average confidence score
            processed_with_data = [inv for inv in invoices if inv.extracted_data]
            avg_confidence = sum(inv.extracted_data.confidence_score for inv in processed_with_data) / len(processed_with_data) if processed_with_data else 0
            
            # Calculate processing times
            completed_invoices = [inv for inv in invoices if inv.processing_completed and inv.processing_started]
            avg_processing_time = sum(
                (inv.processing_completed - inv.processing_started).total_seconds() 
                for inv in completed_invoices
            ) / len(completed_invoices) if completed_invoices else 0
            
            return {
                "success": True,
                "analytics": {
                    "total_invoices": total_invoices,
                    "processed_invoices": processed_invoices,
                    "failed_invoices": failed_invoices,
                    "pending_invoices": pending_invoices,
                    "success_rate": (processed_invoices / total_invoices * 100) if total_invoices > 0 else 0,
                    "average_confidence_score": avg_confidence,
                    "average_processing_time_seconds": avg_processing_time,
                    "validated_invoices": len([inv for inv in invoices if inv.is_validated])
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting analytics: {str(e)}")
            return {"success": False, "error": str(e)}

# Singleton instance
email_invoice_service = EmailInvoiceService()