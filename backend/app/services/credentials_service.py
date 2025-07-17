from cryptography.fernet import Fernet
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from typing import Optional, Dict, Any
import logging
import os
import base64

logger = logging.getLogger(__name__)

Base = declarative_base()

class GovernmentCredentials(Base):
    __tablename__ = "government_credentials"
    
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, nullable=False, index=True)
    service_name = Column(String(50), nullable=False)  # 'ergani', 'aade', 'efka'
    username = Column(String(255), nullable=False)
    encrypted_password = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    last_verified = Column(DateTime, nullable=True)
    verification_status = Column(String(50), default='pending')  # 'pending', 'verified', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CredentialsService:
    def __init__(self):
        self.encryption_key = self._get_or_create_key()
        self.cipher = Fernet(self.encryption_key)
    
    def _get_or_create_key(self) -> bytes:
        """Get or create encryption key for credentials"""
        key_file = os.getenv('CREDENTIALS_KEY_FILE', 'credentials.key')
        
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                key = f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, 'wb') as f:
                f.write(key)
            logger.info("Created new encryption key for credentials")
        
        return key
    
    def encrypt_password(self, password: str) -> str:
        """Encrypt password for storage"""
        try:
            encrypted = self.cipher.encrypt(password.encode())
            return base64.b64encode(encrypted).decode()
        except Exception as e:
            logger.error(f"Error encrypting password: {str(e)}")
            raise
    
    def decrypt_password(self, encrypted_password: str) -> str:
        """Decrypt password for use"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_password.encode())
            decrypted = self.cipher.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Error decrypting password: {str(e)}")
            raise
    
    def store_credentials(
        self, 
        db: Session, 
        business_id: int, 
        service_name: str, 
        username: str, 
        password: str
    ) -> GovernmentCredentials:
        """Store encrypted credentials for a government service"""
        try:
            # Check if credentials already exist
            existing = db.query(GovernmentCredentials).filter(
                GovernmentCredentials.business_id == business_id,
                GovernmentCredentials.service_name == service_name
            ).first()
            
            encrypted_password = self.encrypt_password(password)
            
            if existing:
                # Update existing credentials
                existing.username = username
                existing.encrypted_password = encrypted_password
                existing.updated_at = datetime.utcnow()
                existing.verification_status = 'pending'
                db.commit()
                db.refresh(existing)
                return existing
            else:
                # Create new credentials
                new_creds = GovernmentCredentials(
                    business_id=business_id,
                    service_name=service_name,
                    username=username,
                    encrypted_password=encrypted_password
                )
                db.add(new_creds)
                db.commit()
                db.refresh(new_creds)
                return new_creds
                
        except Exception as e:
            logger.error(f"Error storing credentials: {str(e)}")
            db.rollback()
            raise
    
    def get_credentials(
        self, 
        db: Session, 
        business_id: int, 
        service_name: str
    ) -> Optional[Dict[str, str]]:
        """Get decrypted credentials for a government service"""
        try:
            credentials = db.query(GovernmentCredentials).filter(
                GovernmentCredentials.business_id == business_id,
                GovernmentCredentials.service_name == service_name,
                GovernmentCredentials.is_active == True
            ).first()
            
            if not credentials:
                return None
            
            return {
                'username': credentials.username,
                'password': self.decrypt_password(credentials.encrypted_password),
                'verification_status': credentials.verification_status,
                'last_verified': credentials.last_verified
            }
            
        except Exception as e:
            logger.error(f"Error retrieving credentials: {str(e)}")
            return None
    
    def verify_credentials(
        self, 
        db: Session, 
        business_id: int, 
        service_name: str, 
        is_valid: bool
    ) -> bool:
        """Update verification status of credentials"""
        try:
            credentials = db.query(GovernmentCredentials).filter(
                GovernmentCredentials.business_id == business_id,
                GovernmentCredentials.service_name == service_name
            ).first()
            
            if credentials:
                credentials.verification_status = 'verified' if is_valid else 'failed'
                credentials.last_verified = datetime.utcnow()
                db.commit()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error updating verification status: {str(e)}")
            return False
    
    def delete_credentials(
        self, 
        db: Session, 
        business_id: int, 
        service_name: str
    ) -> bool:
        """Delete credentials (soft delete by marking as inactive)"""
        try:
            credentials = db.query(GovernmentCredentials).filter(
                GovernmentCredentials.business_id == business_id,
                GovernmentCredentials.service_name == service_name
            ).first()
            
            if credentials:
                credentials.is_active = False
                credentials.updated_at = datetime.utcnow()
                db.commit()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting credentials: {str(e)}")
            return False
    
    def get_all_credentials(self, db: Session, business_id: int) -> Dict[str, Any]:
        """Get all credentials for a business (without passwords)"""
        try:
            credentials = db.query(GovernmentCredentials).filter(
                GovernmentCredentials.business_id == business_id,
                GovernmentCredentials.is_active == True
            ).all()
            
            result = {}
            for cred in credentials:
                result[cred.service_name] = {
                    'username': cred.username,
                    'verification_status': cred.verification_status,
                    'last_verified': cred.last_verified,
                    'created_at': cred.created_at
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving all credentials: {str(e)}")
            return {}