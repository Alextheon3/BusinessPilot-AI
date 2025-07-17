"""
TaxisNet Integration Service for BusinessPilot AI
Handles authentication and data retrieval from TaxisNet
"""

import httpx
import logging
from typing import Dict, Optional, Any
from datetime import datetime, timedelta
from urllib.parse import urlencode, parse_qs
import base64
import hashlib
import secrets
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class TaxisNetUser:
    afm: str
    full_name: str
    email: str
    phone: str
    address: str
    doy: str
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    kad_codes: Optional[list] = None
    registration_date: Optional[datetime] = None

class TaxisNetService:
    """
    Service for integrating with TaxisNet authentication and data retrieval
    """
    
    def __init__(self):
        # TaxisNet OAuth2 configuration (sandbox/production URLs)
        self.client_id = "businesspilot_ai_client"
        self.client_secret = "your_client_secret_here"  # Should be in environment variables
        self.redirect_uri = "https://businesspilot.ai/auth/taxisnet/callback"
        
        # TaxisNet endpoints
        self.base_url = "https://www1.gsis.gr/taxisnet3"  # Production
        # self.base_url = "https://www1.gsis.gr/taxisnet3-test"  # Sandbox
        
        self.auth_url = f"{self.base_url}/oauth2/authorize"
        self.token_url = f"{self.base_url}/oauth2/token"
        self.userinfo_url = f"{self.base_url}/oauth2/userinfo"
        self.business_url = f"{self.base_url}/api/v1/business"
        
        self.client = httpx.AsyncClient(timeout=30.0)
        
        # Session storage for OAuth state
        self.oauth_sessions = {}
    
    def generate_authorization_url(self, state: Optional[str] = None) -> Dict[str, str]:
        """
        Generate TaxisNet OAuth2 authorization URL
        """
        if not state:
            state = secrets.token_urlsafe(32)
        
        # Generate PKCE code verifier and challenge
        code_verifier = secrets.token_urlsafe(32)
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode()).digest()
        ).decode().rstrip('=')
        
        # Store session data
        self.oauth_sessions[state] = {
            'code_verifier': code_verifier,
            'created_at': datetime.utcnow()
        }
        
        # Build authorization URL
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'openid profile business_info tax_data',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        authorization_url = f"{self.auth_url}?{urlencode(params)}"
        
        return {
            'authorization_url': authorization_url,
            'state': state
        }
    
    async def handle_callback(self, code: str, state: str) -> Dict[str, Any]:
        """
        Handle TaxisNet OAuth2 callback and exchange code for token
        """
        try:
            # Verify state
            if state not in self.oauth_sessions:
                raise ValueError("Invalid or expired OAuth state")
            
            session = self.oauth_sessions[state]
            code_verifier = session['code_verifier']
            
            # Exchange code for token
            token_data = {
                'grant_type': 'authorization_code',
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'code': code,
                'redirect_uri': self.redirect_uri,
                'code_verifier': code_verifier
            }
            
            response = await self.client.post(
                self.token_url,
                data=token_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code != 200:
                logger.error(f"Token exchange failed: {response.text}")
                raise ValueError("Failed to exchange code for token")
            
            token_response = response.json()
            access_token = token_response.get('access_token')
            
            if not access_token:
                raise ValueError("No access token received")
            
            # Get user info
            user_info = await self.get_user_info(access_token)
            business_info = await self.get_business_info(access_token)
            
            # Clean up session
            del self.oauth_sessions[state]
            
            return {
                'access_token': access_token,
                'token_type': token_response.get('token_type', 'Bearer'),
                'expires_in': token_response.get('expires_in', 3600),
                'user_info': user_info,
                'business_info': business_info
            }
            
        except Exception as e:
            logger.error(f"Error handling TaxisNet callback: {str(e)}")
            raise
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        Get user information from TaxisNet
        """
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
            
            response = await self.client.get(self.userinfo_url, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Failed to get user info: {response.text}")
                raise ValueError("Failed to retrieve user information")
            
            user_data = response.json()
            
            # Map TaxisNet fields to our format
            return {
                'afm': user_data.get('afm'),
                'full_name': user_data.get('name'),
                'email': user_data.get('email'),
                'phone': user_data.get('phone'),
                'address': user_data.get('address'),
                'doy': user_data.get('doy'),
                'registration_date': user_data.get('registration_date')
            }
            
        except Exception as e:
            logger.error(f"Error getting user info: {str(e)}")
            raise
    
    async def get_business_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """
        Get business information from TaxisNet
        """
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
            
            response = await self.client.get(self.business_url, headers=headers)
            
            if response.status_code == 404:
                # No business registered
                return None
            
            if response.status_code != 200:
                logger.error(f"Failed to get business info: {response.text}")
                return None
            
            business_data = response.json()
            
            # Map TaxisNet business fields to our format
            return {
                'business_name': business_data.get('business_name'),
                'business_type': business_data.get('business_type'),
                'kad_codes': business_data.get('kad_codes', []),
                'business_address': business_data.get('address'),
                'legal_form': business_data.get('legal_form'),
                'establishment_date': business_data.get('establishment_date'),
                'employees': business_data.get('employees', 0),
                'annual_revenue': business_data.get('annual_revenue', 0)
            }
            
        except Exception as e:
            logger.error(f"Error getting business info: {str(e)}")
            return None
    
    async def verify_afm(self, afm: str) -> Dict[str, Any]:
        """
        Verify AFM against TaxisNet registry (public API)
        """
        try:
            # This would use TaxisNet's public AFM verification API
            verify_url = f"{self.base_url}/api/v1/verify/afm"
            
            response = await self.client.post(
                verify_url,
                json={'afm': afm},
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'valid': data.get('valid', False),
                    'business_name': data.get('business_name'),
                    'status': data.get('status'),  # 'active', 'inactive', 'suspended'
                    'doy': data.get('doy')
                }
            else:
                return {'valid': False, 'error': 'Verification failed'}
                
        except Exception as e:
            logger.error(f"Error verifying AFM: {str(e)}")
            return {'valid': False, 'error': str(e)}
    
    async def get_tax_obligations(self, access_token: str) -> List[Dict[str, Any]]:
        """
        Get tax obligations from TaxisNet
        """
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
            
            obligations_url = f"{self.base_url}/api/v1/tax/obligations"
            response = await self.client.get(obligations_url, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Failed to get tax obligations: {response.text}")
                return []
            
            obligations_data = response.json()
            obligations = []
            
            for obligation in obligations_data.get('obligations', []):
                obligations.append({
                    'id': obligation.get('id'),
                    'type': obligation.get('type'),
                    'description': obligation.get('description'),
                    'due_date': obligation.get('due_date'),
                    'amount': obligation.get('amount'),
                    'status': obligation.get('status'),
                    'period': obligation.get('period'),
                    'penalty': obligation.get('penalty', 0)
                })
            
            return obligations
            
        except Exception as e:
            logger.error(f"Error getting tax obligations: {str(e)}")
            return []
    
    async def get_certificates(self, access_token: str) -> List[Dict[str, Any]]:
        """
        Get certificates from TaxisNet
        """
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
            
            certificates_url = f"{self.base_url}/api/v1/certificates"
            response = await self.client.get(certificates_url, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Failed to get certificates: {response.text}")
                return []
            
            certificates_data = response.json()
            certificates = []
            
            for cert in certificates_data.get('certificates', []):
                certificates.append({
                    'id': cert.get('id'),
                    'type': cert.get('type'),
                    'title': cert.get('title'),
                    'issue_date': cert.get('issue_date'),
                    'expiry_date': cert.get('expiry_date'),
                    'status': cert.get('status'),
                    'download_url': cert.get('download_url')
                })
            
            return certificates
            
        except Exception as e:
            logger.error(f"Error getting certificates: {str(e)}")
            return []
    
    def create_user_from_taxisnet(self, user_info: Dict[str, Any], 
                                 business_info: Optional[Dict[str, Any]] = None) -> TaxisNetUser:
        """
        Create a TaxisNetUser object from API response
        """
        return TaxisNetUser(
            afm=user_info.get('afm'),
            full_name=user_info.get('full_name'),
            email=user_info.get('email'),
            phone=user_info.get('phone'),
            address=user_info.get('address'),
            doy=user_info.get('doy'),
            business_name=business_info.get('business_name') if business_info else None,
            business_type=business_info.get('business_type') if business_info else None,
            kad_codes=business_info.get('kad_codes') if business_info else None,
            registration_date=datetime.fromisoformat(user_info.get('registration_date')) if user_info.get('registration_date') else None
        )
    
    async def cleanup_expired_sessions(self):
        """
        Clean up expired OAuth sessions
        """
        cutoff_time = datetime.utcnow() - timedelta(minutes=30)
        expired_states = [
            state for state, session in self.oauth_sessions.items()
            if session['created_at'] < cutoff_time
        ]
        
        for state in expired_states:
            del self.oauth_sessions[state]
        
        logger.info(f"Cleaned up {len(expired_states)} expired OAuth sessions")

# Singleton instance
taxisnet_service = TaxisNetService()