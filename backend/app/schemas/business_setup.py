from pydantic import BaseModel, validator, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class GovernmentCredentials(BaseModel):
    username: str = ""
    password: str = ""
    isConnected: bool = False

class DocumentUpload(BaseModel):
    businessLicense: Optional[str] = None
    taxCertificate: Optional[str] = None
    insuranceCertificate: Optional[str] = None
    bankStatement: Optional[str] = None
    leaseAgreement: Optional[str] = None

class BusinessSetupCreate(BaseModel):
    # Basic Business Information
    companyName: str = Field(..., min_length=2, max_length=255)
    afm: str = Field(..., min_length=9, max_length=9)
    doy: str = Field(..., min_length=2, max_length=100)
    kad: str = Field(..., min_length=4, max_length=20)
    legalForm: str = Field(..., min_length=2, max_length=100)
    establishmentDate: str = Field(..., regex=r'^\d{4}-\d{2}-\d{2}$')
    
    # Contact Information
    companyAddress: str = Field(..., min_length=10, max_length=500)
    postalCode: str = Field(..., min_length=5, max_length=10)
    city: str = Field(..., min_length=2, max_length=100)
    region: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    email: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    website: Optional[str] = None
    
    # Owner Information
    ownerName: str = Field(..., min_length=2, max_length=100)
    ownerSurname: str = Field(..., min_length=2, max_length=100)
    ownerAfm: str = Field(..., min_length=9, max_length=9)
    ownerAmka: str = Field(..., min_length=11, max_length=11)
    ownerPhone: str = Field(..., min_length=10, max_length=20)
    ownerEmail: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    ownerAddress: str = Field(..., min_length=10, max_length=500)
    ownerAge: int = Field(..., ge=18, le=100)
    ownerGender: str = Field(..., regex=r'^(male|female|other)$')
    ownerEducation: str = Field(..., regex=r'^(primary|secondary|bachelor|master|phd)$')
    ownerExperience: int = Field(..., ge=0, le=50)
    
    # Business Characteristics
    employees: int = Field(..., ge=0, le=10000)
    annualRevenue: float = Field(..., ge=0, le=1000000000)
    businessType: str = Field(..., min_length=2, max_length=100)
    operatingMonths: int = Field(..., ge=1, le=12)
    seasonalBusiness: bool = False
    exportActivity: bool = False
    onlinePresence: bool = False
    
    # Government Credentials
    erganiCredentials: GovernmentCredentials
    aadeCredentials: GovernmentCredentials
    efkaCredentials: GovernmentCredentials
    
    # Financial Information
    bankName: str = Field(..., min_length=2, max_length=100)
    iban: str = Field(..., min_length=15, max_length=34)
    accountantName: Optional[str] = None
    accountantPhone: Optional[str] = None
    accountantEmail: Optional[str] = None
    
    # Business Profile
    isStartup: bool = False
    isInnovative: bool = False
    isGreenBusiness: bool = False
    hasDigitalTransformation: bool = False
    
    # Business Goals and Challenges
    challenges: List[str] = []
    goals: List[str] = []
    
    # Documents
    documents: DocumentUpload
    
    @validator('afm', 'ownerAfm')
    def validate_afm(cls, v):
        if not v.isdigit():
            raise ValueError('ΑΦΜ πρέπει να περιέχει μόνο αριθμούς')
        return v
    
    @validator('ownerAmka')
    def validate_amka(cls, v):
        if not v.isdigit():
            raise ValueError('ΑΜΚΑ πρέπει να περιέχει μόνο αριθμούς')
        return v
    
    @validator('postalCode')
    def validate_postal_code(cls, v):
        if not v.isdigit():
            raise ValueError('Ταχυδρομικός κώδικας πρέπει να περιέχει μόνο αριθμούς')
        return v
    
    @validator('iban')
    def validate_iban(cls, v):
        # Basic IBAN validation for Greek IBANs
        if not v.upper().startswith('GR'):
            raise ValueError('IBAN πρέπει να αρχίζει με GR')
        return v.upper()

class BusinessSetupResponse(BaseModel):
    id: int
    company_name: str
    afm: str
    setup_completed: bool
    message: Optional[str] = None
    
    class Config:
        from_attributes = True

class BusinessSetupUpdate(BaseModel):
    # Allow partial updates
    companyName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    employees: Optional[int] = None
    annualRevenue: Optional[float] = None
    
    class Config:
        from_attributes = True

class GovernmentConnectionStatus(BaseModel):
    service: str
    status: str  # 'connected', 'not_connected', 'error', 'pending'
    last_sync: Optional[datetime] = None
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True