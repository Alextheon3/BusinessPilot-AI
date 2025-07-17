from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import logging
from datetime import datetime, timedelta

from app.core.database import get_db
from app.services.taxisnet_service import taxisnet_service
from app.models.user import User
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/taxisnet/login")
async def taxisnet_login(request: Request):
    """
    Initiate TaxisNet OAuth2 login flow
    """
    try:
        # Generate authorization URL
        auth_data = taxisnet_service.generate_authorization_url()
        
        # Store state in session or cache for later verification
        # In production, you'd want to use Redis or similar
        
        logger.info(f"Initiating TaxisNet login with state: {auth_data['state']}")
        
        return {
            "authorization_url": auth_data['authorization_url'],
            "state": auth_data['state'],
            "message": "Redirect to TaxisNet για πιστοποίηση"
        }
        
    except Exception as e:
        logger.error(f"Error initiating TaxisNet login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την σύνδεση με το TaxisNet"
        )

@router.get("/taxisnet/callback")
async def taxisnet_callback(
    code: str,
    state: str,
    error: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Handle TaxisNet OAuth2 callback
    """
    try:
        # Check for OAuth errors
        if error:
            logger.error(f"TaxisNet OAuth error: {error}")
            raise HTTPException(
                status_code=400,
                detail=f"Σφάλμα πιστοποίησης TaxisNet: {error}"
            )
        
        # Exchange code for token and get user info
        callback_data = await taxisnet_service.handle_callback(code, state)
        
        user_info = callback_data['user_info']
        business_info = callback_data.get('business_info')
        access_token = callback_data['access_token']
        
        # Check if user exists
        existing_user = db.query(User).filter(User.afm == user_info['afm']).first()
        
        if existing_user:
            # Update existing user with TaxisNet data
            existing_user.email = user_info['email']
            existing_user.full_name = user_info['full_name']
            existing_user.phone = user_info.get('phone')
            existing_user.address = user_info.get('address')
            existing_user.doy = user_info.get('doy')
            existing_user.taxisnet_verified = True
            existing_user.taxisnet_access_token = access_token
            existing_user.updated_at = datetime.utcnow()
            
            # Update business info if available
            if business_info:
                existing_user.business_name = business_info.get('business_name')
                existing_user.business_type = business_info.get('business_type')
                existing_user.kad_codes = business_info.get('kad_codes')
                existing_user.employees = business_info.get('employees', 0)
                existing_user.annual_revenue = business_info.get('annual_revenue', 0)
            
            db.commit()
            user = existing_user
            
        else:
            # Create new user from TaxisNet data
            new_user = User(
                afm=user_info['afm'],
                email=user_info['email'],
                full_name=user_info['full_name'],
                phone=user_info.get('phone'),
                address=user_info.get('address'),
                doy=user_info.get('doy'),
                taxisnet_verified=True,
                taxisnet_access_token=access_token,
                business_name=business_info.get('business_name') if business_info else None,
                business_type=business_info.get('business_type') if business_info else None,
                kad_codes=business_info.get('kad_codes') if business_info else None,
                employees=business_info.get('employees', 0) if business_info else 0,
                annual_revenue=business_info.get('annual_revenue', 0) if business_info else 0,
                role='user',
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user
        
        # Generate JWT token
        auth_service = AuthService()
        jwt_token = auth_service.create_access_token(data={"sub": user.id})
        
        # In a real application, you'd redirect to the frontend with the token
        # For now, return the token and user info
        return {
            "access_token": jwt_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "afm": user.afm,
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone,
                "business_name": user.business_name,
                "business_type": user.business_type,
                "taxisnet_verified": user.taxisnet_verified,
                "business_setup_completed": bool(user.business_name and user.business_type)
            },
            "message": "Επιτυχής σύνδεση μέσω TaxisNet!"
        }
        
    except Exception as e:
        logger.error(f"Error handling TaxisNet callback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την επεξεργασία της απόκρισης από το TaxisNet"
        )

@router.post("/taxisnet/verify-afm")
async def verify_afm(afm_data: Dict[str, str]):
    """
    Verify AFM against TaxisNet registry
    """
    try:
        afm = afm_data.get('afm')
        
        if not afm:
            raise HTTPException(
                status_code=400,
                detail="Απαιτείται ΑΦΜ"
            )
        
        # Verify AFM
        verification_result = await taxisnet_service.verify_afm(afm)
        
        return {
            "afm": afm,
            "valid": verification_result.get('valid', False),
            "business_name": verification_result.get('business_name'),
            "status": verification_result.get('status'),
            "doy": verification_result.get('doy'),
            "message": "Επιτυχής επαλήθευση ΑΦΜ" if verification_result.get('valid') else "Μη έγκυρος ΑΦΜ"
        }
        
    except Exception as e:
        logger.error(f"Error verifying AFM: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την επαλήθευση του ΑΦΜ"
        )

@router.get("/taxisnet/tax-obligations")
async def get_tax_obligations(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get tax obligations from TaxisNet
    """
    try:
        if not current_user.taxisnet_access_token:
            raise HTTPException(
                status_code=401,
                detail="Απαιτείται πιστοποίηση TaxisNet"
            )
        
        # Get tax obligations
        obligations = await taxisnet_service.get_tax_obligations(
            current_user.taxisnet_access_token
        )
        
        return {
            "obligations": obligations,
            "count": len(obligations),
            "message": "Επιτυχής ανάκτηση φορολογικών υποχρεώσεων"
        }
        
    except Exception as e:
        logger.error(f"Error getting tax obligations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση φορολογικών υποχρεώσεων"
        )

@router.get("/taxisnet/certificates")
async def get_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get certificates from TaxisNet
    """
    try:
        if not current_user.taxisnet_access_token:
            raise HTTPException(
                status_code=401,
                detail="Απαιτείται πιστοποίηση TaxisNet"
            )
        
        # Get certificates
        certificates = await taxisnet_service.get_certificates(
            current_user.taxisnet_access_token
        )
        
        return {
            "certificates": certificates,
            "count": len(certificates),
            "message": "Επιτυχής ανάκτηση πιστοποιητικών"
        }
        
    except Exception as e:
        logger.error(f"Error getting certificates: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση πιστοποιητικών"
        )

@router.post("/taxisnet/refresh-data")
async def refresh_taxisnet_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Refresh user and business data from TaxisNet
    """
    try:
        if not current_user.taxisnet_access_token:
            raise HTTPException(
                status_code=401,
                detail="Απαιτείται πιστοποίηση TaxisNet"
            )
        
        # Get fresh data from TaxisNet
        user_info = await taxisnet_service.get_user_info(current_user.taxisnet_access_token)
        business_info = await taxisnet_service.get_business_info(current_user.taxisnet_access_token)
        
        # Update user data
        current_user.email = user_info.get('email', current_user.email)
        current_user.full_name = user_info.get('full_name', current_user.full_name)
        current_user.phone = user_info.get('phone', current_user.phone)
        current_user.address = user_info.get('address', current_user.address)
        current_user.doy = user_info.get('doy', current_user.doy)
        
        # Update business data if available
        if business_info:
            current_user.business_name = business_info.get('business_name')
            current_user.business_type = business_info.get('business_type')
            current_user.kad_codes = business_info.get('kad_codes')
            current_user.employees = business_info.get('employees', current_user.employees)
            current_user.annual_revenue = business_info.get('annual_revenue', current_user.annual_revenue)
        
        current_user.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "message": "Επιτυχής ανανέωση δεδομένων από TaxisNet",
            "user": {
                "id": current_user.id,
                "afm": current_user.afm,
                "email": current_user.email,
                "full_name": current_user.full_name,
                "business_name": current_user.business_name,
                "business_type": current_user.business_type,
                "taxisnet_verified": current_user.taxisnet_verified
            }
        }
        
    except Exception as e:
        logger.error(f"Error refreshing TaxisNet data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανανέωση δεδομένων από TaxisNet"
        )