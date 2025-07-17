from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class DocumentTypeEnum(str, Enum):
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

class PriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class StatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    GENERATED = "generated"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class BusinessProfileBase(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=200)
    afm: str = Field(..., min_length=9, max_length=12)
    kad: str = Field(..., min_length=5, max_length=10)
    address: str = Field(..., min_length=5, max_length=300)
    phone: str = Field(..., min_length=10, max_length=20)
    email: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    region: str = Field(..., min_length=2, max_length=100)
    employees: int = Field(..., ge=0, le=10000)
    owner_name: str = Field(..., min_length=2, max_length=100)
    owner_age: int = Field(..., ge=18, le=100)
    owner_gender: str = Field(..., regex=r'^(male|female|other)$')
    establishment_year: int = Field(..., ge=1900, le=2024)
    is_startup: bool = False
    is_innovative: bool = False
    is_green: bool = False
    has_digital_transformation: bool = False

    @validator('afm')
    def validate_afm(cls, v):
        if not v.isdigit():
            raise ValueError('AFM must contain only digits')
        if len(v) != 9:
            raise ValueError('AFM must be exactly 9 digits')
        return v

    @validator('kad')
    def validate_kad(cls, v):
        if not v.replace('.', '').isdigit():
            raise ValueError('KAD must contain only digits and dots')
        return v

class BusinessProfile(BusinessProfileBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DocumentRequestBase(BaseModel):
    user_query: str = Field(..., min_length=5, max_length=1000)
    document_type: Optional[DocumentTypeEnum] = None
    additional_data: Optional[Dict[str, Any]] = None
    language: str = Field(default="el", regex=r'^(el|en)$')

class DocumentRequest(DocumentRequestBase):
    business_profile: BusinessProfile
    created_at: Optional[datetime] = None

class DocumentAnalysis(BaseModel):
    document_type: DocumentTypeEnum
    confidence: float = Field(..., ge=0.0, le=1.0)
    explanation: str
    required_actions: List[str]
    urgency: PriorityEnum
    deadline: Optional[datetime] = None

class DocumentResponseBase(BaseModel):
    document_id: str
    title: str
    description: str
    instructions: str
    ministry: str
    deadline: Optional[str] = None
    pdf_url: str
    prefilled_data: Dict[str, Any]
    related_forms: List[str]
    next_steps: List[str]
    ai_explanation: str

class DocumentResponse(DocumentResponseBase):
    id: Optional[int] = None
    user_id: Optional[int] = None
    status: StatusEnum = StatusEnum.GENERATED
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DocumentTypeInfo(BaseModel):
    document_type: DocumentTypeEnum
    title: str
    description: str
    ministry: str
    deadline: Optional[str] = None
    required_fields: List[str]
    url: str
    processing_time: Optional[str] = None
    cost: Optional[str] = None

class FormTemplate(BaseModel):
    form_type: DocumentTypeEnum
    title: str
    ministry: str
    deadline: Optional[str] = None
    required_fields: List[str]
    instructions: str
    related_forms: List[str]
    submission_url: str
    sample_data: Optional[Dict[str, Any]] = None

class PrefilledFormData(BaseModel):
    form_type: DocumentTypeEnum
    prefilled_data: Dict[str, Any]
    completion_percentage: float = Field(..., ge=0.0, le=100.0)
    missing_fields: List[str] = []
    suggestions: List[str] = []

class DeadlineInfo(BaseModel):
    document_type: DocumentTypeEnum
    title: str
    deadline: datetime
    days_remaining: int
    priority: PriorityEnum
    ministry: str
    description: Optional[str] = None
    penalty_info: Optional[str] = None

class BusinessDeadlines(BaseModel):
    business_afm: str
    deadlines: List[DeadlineInfo]
    total_pending: int
    high_priority: int
    urgent: int
    last_updated: datetime

class SubmissionRequest(BaseModel):
    document_id: str
    submission_data: Dict[str, Any]
    contact_info: Optional[Dict[str, str]] = None
    expedited: bool = False
    notes: Optional[str] = None

class SubmissionResponse(BaseModel):
    document_id: str
    submission_id: str
    status: StatusEnum
    submitted_at: datetime
    tracking_number: str
    estimated_processing_time: str
    next_steps: List[str]
    contact_info: Optional[Dict[str, str]] = None

class SubmissionStatus(BaseModel):
    submission_id: str
    status: StatusEnum
    submitted_at: datetime
    last_updated: datetime
    estimated_completion: Optional[datetime] = None
    notes: Optional[str] = None
    documents_required: List[str] = []
    approval_percentage: float = Field(default=0.0, ge=0.0, le=100.0)

class QueryAnalysis(BaseModel):
    query: str
    analysis: DocumentAnalysis
    suggested_actions: List[str]
    urgency: PriorityEnum
    confidence: float = Field(..., ge=0.0, le=1.0)
    alternative_interpretations: List[str] = []

class DocumentStatistics(BaseModel):
    total_documents: int
    documents_by_type: Dict[str, int]
    documents_by_status: Dict[str, int]
    pending_deadlines: int
    completion_rate: float = Field(..., ge=0.0, le=100.0)
    average_processing_time: Optional[str] = None

class AIProcessingMetrics(BaseModel):
    total_queries: int
    successful_analyses: int
    confidence_scores: List[float]
    average_confidence: float = Field(..., ge=0.0, le=1.0)
    document_types_identified: Dict[str, int]
    processing_time_ms: int

class NotificationSettings(BaseModel):
    email_notifications: bool = True
    sms_notifications: bool = False
    deadline_alerts: bool = True
    days_before_deadline: int = Field(default=7, ge=1, le=30)
    submission_confirmations: bool = True
    status_updates: bool = True

class DocumentHistory(BaseModel):
    document_id: str
    title: str
    document_type: DocumentTypeEnum
    status: StatusEnum
    created_at: datetime
    last_updated: datetime
    pdf_url: str
    submission_id: Optional[str] = None
    notes: Optional[str] = None

class BusinessDocumentHistory(BaseModel):
    business_afm: str
    documents: List[DocumentHistory]
    total_documents: int
    last_activity: datetime
    statistics: DocumentStatistics

class FormValidation(BaseModel):
    form_type: DocumentTypeEnum
    form_data: Dict[str, Any]
    is_valid: bool
    validation_errors: List[str] = []
    missing_required_fields: List[str] = []
    suggestions: List[str] = []
    completeness_score: float = Field(..., ge=0.0, le=100.0)

class GovernmentAPIResponse(BaseModel):
    api_endpoint: str
    response_code: int
    response_data: Dict[str, Any]
    timestamp: datetime
    success: bool
    error_message: Optional[str] = None

class IntegrationStatus(BaseModel):
    service_name: str
    is_active: bool
    last_check: datetime
    response_time_ms: int
    error_count: int
    success_rate: float = Field(..., ge=0.0, le=100.0)

class SystemHealth(BaseModel):
    overall_status: str
    integrations: List[IntegrationStatus]
    ai_service_status: str
    pdf_generation_status: str
    database_status: str
    last_health_check: datetime