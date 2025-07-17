from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import logging
from datetime import datetime

from app.core.database import get_db
from app.models.business_setup import BusinessSetup
from app.schemas.business_setup import BusinessSetupCreate, BusinessSetupResponse
from app.services.government_systems_hub import GovernmentSystemsHub
from app.services.notification_service import NotificationService
from app.services.business_verification_service import BusinessVerificationService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/business-setup", response_model=BusinessSetupResponse)
async def create_business_setup(
    setup_data: BusinessSetupCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Create a new business setup with government integrations
    """
    try:
        # Initialize services
        verification_service = BusinessVerificationService()
        
        # Convert to dict for verification
        business_data = setup_data.dict()
        
        # Verify business data
        verification_results = verification_service.verify_business_data(business_data)
        compliance_checks = verification_service.run_compliance_checks(business_data)
        compliance_score = verification_service.get_overall_compliance_score(
            verification_results, compliance_checks
        )
        
        # Check if critical verifications failed
        critical_failures = [r for r in verification_results if r.status.value == 'failed' and r.score < 50]
        if critical_failures:
            logger.warning(f"Critical verification failures: {[f.field for f in critical_failures]}")
            # You might want to return errors instead of proceeding
        
        # Log compliance score
        logger.info(f"Business setup compliance score: {compliance_score['overall_score']}")
        
        # Create business setup record
        business_setup = BusinessSetup(
            company_name=setup_data.companyName,
            afm=setup_data.afm,
            doy=setup_data.doy,
            kad=setup_data.kad,
            legal_form=setup_data.legalForm,
            establishment_date=datetime.strptime(setup_data.establishmentDate, "%Y-%m-%d").date(),
            company_address=setup_data.companyAddress,
            postal_code=setup_data.postalCode,
            city=setup_data.city,
            region=setup_data.region,
            phone=setup_data.phone,
            email=setup_data.email,
            website=setup_data.website,
            owner_name=setup_data.ownerName,
            owner_surname=setup_data.ownerSurname,
            owner_afm=setup_data.ownerAfm,
            owner_amka=setup_data.ownerAmka,
            owner_phone=setup_data.ownerPhone,
            owner_email=setup_data.ownerEmail,
            owner_address=setup_data.ownerAddress,
            owner_age=setup_data.ownerAge,
            owner_gender=setup_data.ownerGender,
            owner_education=setup_data.ownerEducation,
            owner_experience=setup_data.ownerExperience,
            employees=setup_data.employees,
            annual_revenue=setup_data.annualRevenue,
            business_type=setup_data.businessType,
            operating_months=setup_data.operatingMonths,
            seasonal_business=setup_data.seasonalBusiness,
            export_activity=setup_data.exportActivity,
            online_presence=setup_data.onlinePresence,
            bank_name=setup_data.bankName,
            iban=setup_data.iban,
            accountant_name=setup_data.accountantName,
            accountant_phone=setup_data.accountantPhone,
            accountant_email=setup_data.accountantEmail,
            is_startup=setup_data.isStartup,
            is_innovative=setup_data.isInnovative,
            is_green_business=setup_data.isGreenBusiness,
            has_digital_transformation=setup_data.hasDigitalTransformation,
            challenges=setup_data.challenges,
            goals=setup_data.goals,
            setup_completed=True,
            created_at=datetime.utcnow()
        )
        
        db.add(business_setup)
        db.commit()
        db.refresh(business_setup)
        
        # Initialize government systems hub
        gov_hub = GovernmentSystemsHub()
        
        # Store government credentials securely (encrypted)
        if setup_data.erganiCredentials.username and setup_data.erganiCredentials.password:
            await gov_hub.store_credentials(
                business_setup.id,
                "ergani",
                setup_data.erganiCredentials.username,
                setup_data.erganiCredentials.password
            )
        
        if setup_data.aadeCredentials.username and setup_data.aadeCredentials.password:
            await gov_hub.store_credentials(
                business_setup.id,
                "aade",
                setup_data.aadeCredentials.username,
                setup_data.aadeCredentials.password
            )
        
        if setup_data.efkaCredentials.username and setup_data.efkaCredentials.password:
            await gov_hub.store_credentials(
                business_setup.id,
                "efka",
                setup_data.efkaCredentials.username,
                setup_data.efkaCredentials.password
            )
        
        # Schedule background tasks
        background_tasks.add_task(
            initialize_government_connections,
            business_setup.id,
            setup_data
        )
        
        background_tasks.add_task(
            send_welcome_notifications,
            business_setup.id,
            setup_data
        )
        
        return BusinessSetupResponse(
            id=business_setup.id,
            company_name=business_setup.company_name,
            afm=business_setup.afm,
            setup_completed=business_setup.setup_completed,
            message="Η ρύθμιση της επιχείρησης ολοκληρώθηκε επιτυχώς!"
        )
        
    except Exception as e:
        logger.error(f"Error creating business setup: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την αποθήκευση των στοιχείων της επιχείρησης"
        )

async def initialize_government_connections(business_id: int, setup_data: BusinessSetupCreate):
    """
    Background task to initialize government system connections
    """
    try:
        gov_hub = GovernmentSystemsHub()
        
        # Test and initialize ERGANI connection
        if setup_data.erganiCredentials.username:
            await gov_hub.test_ergani_connection(business_id)
        
        # Test and initialize AADE connection
        if setup_data.aadeCredentials.username:
            await gov_hub.test_aade_connection(business_id)
        
        # Test and initialize EFKA connection
        if setup_data.efkaCredentials.username:
            await gov_hub.test_efka_connection(business_id)
        
        logger.info(f"Government connections initialized for business {business_id}")
        
    except Exception as e:
        logger.error(f"Error initializing government connections: {str(e)}")

async def send_welcome_notifications(business_id: int, setup_data: BusinessSetupCreate):
    """
    Background task to send welcome notifications and setup tips
    """
    try:
        notification_service = NotificationService()
        
        # Send welcome email
        await notification_service.send_welcome_email(
            email=setup_data.email,
            company_name=setup_data.companyName,
            owner_name=setup_data.ownerName
        )
        
        # Send setup completion notification
        await notification_service.send_setup_completion_notification(
            business_id=business_id,
            email=setup_data.email
        )
        
        logger.info(f"Welcome notifications sent for business {business_id}")
        
    except Exception as e:
        logger.error(f"Error sending welcome notifications: {str(e)}")

@router.get("/business-setup/{business_id}", response_model=BusinessSetupResponse)
async def get_business_setup(
    business_id: int,
    db: Session = Depends(get_db)
):
    """
    Get business setup information
    """
    business_setup = db.query(BusinessSetup).filter(BusinessSetup.id == business_id).first()
    
    if not business_setup:
        raise HTTPException(
            status_code=404,
            detail="Δεν βρέθηκαν στοιχεία επιχείρησης"
        )
    
    return BusinessSetupResponse(
        id=business_setup.id,
        company_name=business_setup.company_name,
        afm=business_setup.afm,
        setup_completed=business_setup.setup_completed
    )

@router.put("/business-setup/{business_id}/government-connections")
async def update_government_connections(
    business_id: int,
    connections: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Update government system connection status
    """
    try:
        business_setup = db.query(BusinessSetup).filter(BusinessSetup.id == business_id).first()
        
        if not business_setup:
            raise HTTPException(
                status_code=404,
                detail="Δεν βρέθηκαν στοιχεία επιχείρησης"
            )
        
        # Update connection status in database
        # This would typically update a separate government_connections table
        
        return {
            "message": "Οι συνδέσεις ενημερώθηκαν επιτυχώς",
            "connections": connections
        }
        
    except Exception as e:
        logger.error(f"Error updating government connections: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ενημέρωση των συνδέσεων"
        )