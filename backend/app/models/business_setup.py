from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class BusinessSetup(Base):
    __tablename__ = "business_setups"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Business Information
    company_name = Column(String(255), nullable=False)
    afm = Column(String(20), nullable=False, unique=True)
    doy = Column(String(100), nullable=False)
    kad = Column(String(20), nullable=False)
    legal_form = Column(String(100), nullable=False)
    establishment_date = Column(Date, nullable=False)
    
    # Contact Information
    company_address = Column(Text, nullable=False)
    postal_code = Column(String(10), nullable=False)
    city = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    website = Column(String(255), nullable=True)
    
    # Owner Information
    owner_name = Column(String(100), nullable=False)
    owner_surname = Column(String(100), nullable=False)
    owner_afm = Column(String(20), nullable=False)
    owner_amka = Column(String(20), nullable=False)
    owner_phone = Column(String(20), nullable=False)
    owner_email = Column(String(255), nullable=False)
    owner_address = Column(Text, nullable=False)
    owner_age = Column(Integer, nullable=False)
    owner_gender = Column(String(10), nullable=False)
    owner_education = Column(String(50), nullable=False)
    owner_experience = Column(Integer, nullable=False)
    
    # Business Characteristics
    employees = Column(Integer, nullable=False, default=0)
    annual_revenue = Column(Float, nullable=False, default=0.0)
    business_type = Column(String(100), nullable=False)
    operating_months = Column(Integer, nullable=False, default=12)
    seasonal_business = Column(Boolean, nullable=False, default=False)
    export_activity = Column(Boolean, nullable=False, default=False)
    online_presence = Column(Boolean, nullable=False, default=False)
    
    # Financial Information
    bank_name = Column(String(100), nullable=False)
    iban = Column(String(34), nullable=False)
    accountant_name = Column(String(100), nullable=True)
    accountant_phone = Column(String(20), nullable=True)
    accountant_email = Column(String(255), nullable=True)
    
    # Business Profile
    is_startup = Column(Boolean, nullable=False, default=False)
    is_innovative = Column(Boolean, nullable=False, default=False)
    is_green_business = Column(Boolean, nullable=False, default=False)
    has_digital_transformation = Column(Boolean, nullable=False, default=False)
    
    # Business Goals and Challenges
    challenges = Column(JSON, nullable=True)
    goals = Column(JSON, nullable=True)
    
    # Setup Status
    setup_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<BusinessSetup(company_name='{self.company_name}', afm='{self.afm}')>"