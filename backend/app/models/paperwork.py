from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

from app.core.database import Base

class DocumentTypeEnum(enum.Enum):
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

class StatusEnum(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    GENERATED = "generated"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class PriorityEnum(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    afm = Column(String(12), unique=True, nullable=False, index=True)
    kad = Column(String(10), nullable=False)
    address = Column(String(300), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    employees = Column(Integer, nullable=False, default=0)
    owner_name = Column(String(100), nullable=False)
    owner_age = Column(Integer, nullable=False)
    owner_gender = Column(String(10), nullable=False)
    establishment_year = Column(Integer, nullable=False)
    is_startup = Column(Boolean, default=False)
    is_innovative = Column(Boolean, default=False)
    is_green = Column(Boolean, default=False)
    has_digital_transformation = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    documents = relationship("Document", back_populates="business_profile")
    deadlines = relationship("Deadline", back_populates="business_profile")
    submissions = relationship("Submission", back_populates="business_profile")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    document_type = Column(SQLEnum(DocumentTypeEnum), nullable=False)
    status = Column(SQLEnum(StatusEnum), default=StatusEnum.PENDING)
    user_query = Column(Text, nullable=False)
    ai_explanation = Column(Text)
    instructions = Column(Text)
    ministry = Column(String(100))
    deadline = Column(DateTime)
    pdf_url = Column(String(500))
    prefilled_data = Column(JSON)
    related_forms = Column(JSON)
    next_steps = Column(JSON)
    additional_data = Column(JSON)
    language = Column(String(5), default="el")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    business_profile = relationship("BusinessProfile", back_populates="documents")
    submissions = relationship("Submission", back_populates="document")
    processing_logs = relationship("ProcessingLog", back_populates="document")

class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(SQLEnum(DocumentTypeEnum), nullable=False)
    title = Column(String(200), nullable=False)
    deadline = Column(DateTime, nullable=False)
    priority = Column(SQLEnum(PriorityEnum), default=PriorityEnum.MEDIUM)
    ministry = Column(String(100))
    description = Column(Text)
    penalty_info = Column(Text)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String(50))  # monthly, yearly, etc.
    notification_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"))

    # Relationships
    business_profile = relationship("BusinessProfile", back_populates="deadlines")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(String(100), unique=True, nullable=False, index=True)
    tracking_number = Column(String(100), unique=True, nullable=False)
    status = Column(SQLEnum(StatusEnum), default=StatusEnum.SUBMITTED)
    submission_data = Column(JSON)
    contact_info = Column(JSON)
    expedited = Column(Boolean, default=False)
    notes = Column(Text)
    estimated_processing_time = Column(String(100))
    actual_processing_time = Column(Integer)  # in hours
    next_steps = Column(JSON)
    government_response = Column(JSON)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)

    # Foreign Keys
    document_id = Column(Integer, ForeignKey("documents.id"))
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"))

    # Relationships
    document = relationship("Document", back_populates="submissions")
    business_profile = relationship("BusinessProfile", back_populates="submissions")
    status_updates = relationship("SubmissionStatusUpdate", back_populates="submission")

class SubmissionStatusUpdate(Base):
    __tablename__ = "submission_status_updates"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(SQLEnum(StatusEnum), nullable=False)
    message = Column(Text)
    updated_by = Column(String(100))  # system or user
    government_reference = Column(String(100))
    documents_required = Column(JSON)
    approval_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign Keys
    submission_id = Column(Integer, ForeignKey("submissions.id"))

    # Relationships
    submission = relationship("Submission", back_populates="status_updates")

class ProcessingLog(Base):
    __tablename__ = "processing_logs"

    id = Column(Integer, primary_key=True, index=True)
    process_type = Column(String(50), nullable=False)  # ai_analysis, pdf_generation, etc.
    status = Column(String(20), nullable=False)  # success, error, warning
    message = Column(Text)
    processing_time_ms = Column(Integer)
    ai_model_used = Column(String(50))
    confidence_score = Column(Float)
    error_details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign Keys
    document_id = Column(Integer, ForeignKey("documents.id"))

    # Relationships
    document = relationship("Document", back_populates="processing_logs")

class FormTemplate(Base):
    __tablename__ = "form_templates"

    id = Column(Integer, primary_key=True, index=True)
    form_type = Column(SQLEnum(DocumentTypeEnum), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    ministry = Column(String(100))
    deadline_info = Column(String(200))
    required_fields = Column(JSON)
    optional_fields = Column(JSON)
    instructions = Column(Text)
    related_forms = Column(JSON)
    submission_url = Column(String(500))
    sample_data = Column(JSON)
    processing_time = Column(String(100))
    cost = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    deadline_alerts = Column(Boolean, default=True)
    days_before_deadline = Column(Integer, default=7)
    submission_confirmations = Column(Boolean, default=True)
    status_updates = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"))

class GovernmentAPILog(Base):
    __tablename__ = "government_api_logs"

    id = Column(Integer, primary_key=True, index=True)
    api_endpoint = Column(String(200), nullable=False)
    request_method = Column(String(10), nullable=False)
    request_data = Column(JSON)
    response_code = Column(Integer)
    response_data = Column(JSON)
    response_time_ms = Column(Integer)
    success = Column(Boolean, default=False)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign Keys
    document_id = Column(Integer, ForeignKey("documents.id"))

class AIMetrics(Base):
    __tablename__ = "ai_metrics"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(Text, nullable=False)
    detected_document_type = Column(SQLEnum(DocumentTypeEnum))
    confidence_score = Column(Float)
    processing_time_ms = Column(Integer)
    ai_model_used = Column(String(50))
    success = Column(Boolean, default=False)
    error_message = Column(Text)
    user_feedback = Column(String(20))  # correct, incorrect, partially_correct
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign Keys
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"))

class IntegrationStatus(Base):
    __tablename__ = "integration_statuses"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    last_check = Column(DateTime, default=datetime.utcnow)
    response_time_ms = Column(Integer)
    error_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    last_error = Column(Text)
    configuration = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DocumentValidation(Base):
    __tablename__ = "document_validations"

    id = Column(Integer, primary_key=True, index=True)
    form_type = Column(SQLEnum(DocumentTypeEnum), nullable=False)
    form_data = Column(JSON, nullable=False)
    is_valid = Column(Boolean, default=False)
    validation_errors = Column(JSON)
    missing_required_fields = Column(JSON)
    suggestions = Column(JSON)
    completeness_score = Column(Float, default=0.0)
    validated_at = Column(DateTime, default=datetime.utcnow)

    # Foreign Keys
    document_id = Column(Integer, ForeignKey("documents.id"))
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"))

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    user_id = Column(Integer)
    changes = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

# Create indexes for performance
from sqlalchemy import Index

Index('idx_documents_business_profile_type', Document.business_profile_id, Document.document_type)
Index('idx_documents_status_created', Document.status, Document.created_at)
Index('idx_deadlines_profile_deadline', Deadline.business_profile_id, Deadline.deadline)
Index('idx_submissions_status_updated', Submission.status, Submission.last_updated)
Index('idx_processing_logs_document_type', ProcessingLog.document_id, ProcessingLog.process_type)
Index('idx_ai_metrics_profile_created', AIMetrics.business_profile_id, AIMetrics.created_at)