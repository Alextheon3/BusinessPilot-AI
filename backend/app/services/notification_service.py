"""
Multi-channel Notification Service for BusinessPilot AI
Handles Email, SMS, and Push notifications for payment reminders
"""

import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
import json
import httpx
from jinja2 import Environment, FileSystemLoader
import os

logger = logging.getLogger(__name__)

class NotificationType(Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"

class NotificationPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

@dataclass
class NotificationTemplate:
    id: str
    name: str
    subject: str
    body: str
    type: NotificationType
    priority: NotificationPriority
    variables: List[str]

@dataclass
class NotificationRecipient:
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    push_token: Optional[str] = None
    preferences: Dict[str, bool] = None
    language: str = "el"

@dataclass
class NotificationMessage:
    id: str
    recipient: NotificationRecipient
    template: NotificationTemplate
    variables: Dict[str, Any]
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    status: str = "pending"  # pending, sent, failed, cancelled
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3

class NotificationService:
    """
    Multi-channel notification service for payment reminders
    """
    
    def __init__(self):
        self.templates: Dict[str, NotificationTemplate] = {}
        self.recipients: Dict[str, NotificationRecipient] = {}
        self.messages: List[NotificationMessage] = []
        self.client = httpx.AsyncClient(timeout=30.0)
        
        # Configuration
        self.smtp_config = {
            "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
            "port": int(os.getenv("SMTP_PORT", "587")),
            "username": os.getenv("SMTP_USERNAME"),
            "password": os.getenv("SMTP_PASSWORD"),
            "use_tls": True
        }
        
        self.sms_config = {
            "provider": "twilio",  # or "aws_sns"
            "api_key": os.getenv("SMS_API_KEY"),
            "api_secret": os.getenv("SMS_API_SECRET"),
            "sender_number": os.getenv("SMS_SENDER_NUMBER")
        }
        
        self.push_config = {
            "firebase_key": os.getenv("FIREBASE_SERVER_KEY"),
            "vapid_public_key": os.getenv("VAPID_PUBLIC_KEY"),
            "vapid_private_key": os.getenv("VAPID_PRIVATE_KEY")
        }
        
        # Initialize templates
        self._initialize_templates()
        
        # Mock recipients for demo
        self._load_mock_recipients()
    
    def _initialize_templates(self):
        """Initialize notification templates"""
        self.templates = {
            "payment_reminder_urgent": NotificationTemplate(
                id="payment_reminder_urgent",
                name="Επείγουσα Υπενθύμιση Πληρωμής",
                subject="🚨 ΕΠΕΙΓΟΝ: Πληρωμή {payment_title} - Λήγει σε {days_remaining} ημέρες",
                body="""
Αγαπητέ/ή {recipient_name},

⚠️ ΕΠΕΙΓΟΥΣΑ ΥΠΕΝΘΥΜΙΣΗ ⚠️

Η πληρωμή σας για "{payment_title}" λήγει σε {days_remaining} ημέρες.

📋 Λεπτομέρειες:
• Ποσό: €{amount}
• Προθεσμία: {due_date}
• Αναφορά: {reference}
• Πηγή: {source}

🚨 Συνέπειες καθυστέρησης:
{consequences}

💡 Ενέργειες:
• Συνδεθείτε στο BusinessPilot AI για άμεση πληρωμή
• Επικοινωνήστε μαζί μας για βοήθεια
• Προγραμματίστε αυτόματη πληρωμή

🔗 Σύνδεσμος: {action_url}

Με εκτίμηση,
Η Ομάδα BusinessPilot AI
""",
                type=NotificationType.EMAIL,
                priority=NotificationPriority.URGENT,
                variables=["recipient_name", "payment_title", "days_remaining", "amount", "due_date", "reference", "source", "consequences", "action_url"]
            ),
            
            "payment_reminder_normal": NotificationTemplate(
                id="payment_reminder_normal",
                name="Υπενθύμιση Πληρωμής",
                subject="💰 Υπενθύμιση: {payment_title} - Προθεσμία {due_date}",
                body="""
Αγαπητέ/ή {recipient_name},

Σας υπενθυμίζουμε ότι έχετε μια επερχόμενη πληρωμή.

📋 Λεπτομέρειες:
• Τίτλος: {payment_title}
• Ποσό: €{amount}
• Προθεσμία: {due_date}
• Αναφορά: {reference}
• Πηγή: {source}

📱 Εύκολη πληρωμή μέσω BusinessPilot AI:
{action_url}

Με εκτίμηση,
Η Ομάδα BusinessPilot AI
""",
                type=NotificationType.EMAIL,
                priority=NotificationPriority.MEDIUM,
                variables=["recipient_name", "payment_title", "amount", "due_date", "reference", "source", "action_url"]
            ),
            
            "sms_payment_urgent": NotificationTemplate(
                id="sms_payment_urgent",
                name="SMS Επείγουσα Πληρωμή",
                subject="",
                body="🚨 ΕΠΕΙΓΟΝ: {payment_title} - €{amount} - Λήγει σε {days_remaining} ημέρες. Πληρωμή: {short_url}",
                type=NotificationType.SMS,
                priority=NotificationPriority.URGENT,
                variables=["payment_title", "amount", "days_remaining", "short_url"]
            ),
            
            "push_payment_reminder": NotificationTemplate(
                id="push_payment_reminder",
                name="Push Υπενθύμιση",
                subject="💰 Υπενθύμιση Πληρωμής",
                body="{payment_title} - €{amount} - Προθεσμία: {due_date}",
                type=NotificationType.PUSH,
                priority=NotificationPriority.MEDIUM,
                variables=["payment_title", "amount", "due_date"]
            )
        }
    
    def _load_mock_recipients(self):
        """Load mock recipients for demonstration"""
        self.recipients = {
            "business_owner": NotificationRecipient(
                id="business_owner",
                name="Γιάννης Παπαδόπουλος",
                email="owner@example.com",
                phone="+306987654321",
                push_token="mock_push_token_123",
                preferences={
                    "email": True,
                    "sms": True,
                    "push": True,
                    "urgent_only": False
                },
                language="el"
            ),
            "accountant": NotificationRecipient(
                id="accountant",
                name="Μαρία Γεωργίου",
                email="accountant@example.com",
                phone="+306912345678",
                push_token="mock_push_token_456",
                preferences={
                    "email": True,
                    "sms": False,
                    "push": True,
                    "urgent_only": True
                },
                language="el"
            )
        }
    
    async def send_payment_reminder(
        self,
        payment_id: str,
        recipient_id: str,
        reminder_type: str = "normal",
        channels: List[NotificationType] = None
    ) -> Dict[str, Any]:
        """Send payment reminder through specified channels"""
        
        if channels is None:
            channels = [NotificationType.EMAIL, NotificationType.SMS, NotificationType.PUSH]
        
        recipient = self.recipients.get(recipient_id)
        if not recipient:
            return {"success": False, "error": "Recipient not found"}
        
        # Mock payment data - in production, fetch from database
        payment_data = {
            "id": payment_id,
            "title": "Δήλωση ΦΠΑ Q1 2024",
            "amount": 2450.75,
            "due_date": "25/04/2024",
            "reference": "VAT-2024-Q1-001",
            "source": "ΑΑΔΕ",
            "days_remaining": 3,
            "consequences": "• Πρόστιμο 25% επί του οφειλόμενου ποσού\n• Μηνιαίος τόκος 1.5%",
            "action_url": "https://businesspilot.ai/payments/vat_q1_2024",
            "short_url": "https://bp.ai/p/vat1"
        }
        
        results = {}
        
        for channel in channels:
            try:
                if channel == NotificationType.EMAIL and recipient.email:
                    result = await self._send_email_reminder(recipient, payment_data, reminder_type)
                    results["email"] = result
                
                elif channel == NotificationType.SMS and recipient.phone:
                    result = await self._send_sms_reminder(recipient, payment_data, reminder_type)
                    results["sms"] = result
                
                elif channel == NotificationType.PUSH and recipient.push_token:
                    result = await self._send_push_reminder(recipient, payment_data, reminder_type)
                    results["push"] = result
                
            except Exception as e:
                logger.error(f"Error sending {channel.value} reminder: {str(e)}")
                results[channel.value] = {"success": False, "error": str(e)}
        
        return {
            "success": True,
            "payment_id": payment_id,
            "recipient_id": recipient_id,
            "results": results
        }
    
    async def _send_email_reminder(
        self,
        recipient: NotificationRecipient,
        payment_data: Dict[str, Any],
        reminder_type: str
    ) -> Dict[str, Any]:
        """Send email reminder"""
        
        template_id = f"payment_reminder_{reminder_type}"
        template = self.templates.get(template_id)
        
        if not template:
            return {"success": False, "error": "Template not found"}
        
        try:
            # Prepare variables
            variables = {
                "recipient_name": recipient.name,
                **payment_data
            }
            
            # Render template
            subject = template.subject.format(**variables)
            body = template.body.format(**variables)
            
            # Create message
            message = MIMEMultipart()
            message["From"] = self.smtp_config["username"]
            message["To"] = recipient.email
            message["Subject"] = subject
            
            message.attach(MIMEText(body, "plain", "utf-8"))
            
            # Send email (mock for demo)
            await asyncio.sleep(0.5)  # Simulate sending delay
            
            logger.info(f"Email sent to {recipient.email} - {subject}")
            
            return {
                "success": True,
                "message_id": f"email_{datetime.now().timestamp()}",
                "sent_at": datetime.now().isoformat(),
                "subject": subject
            }
            
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _send_sms_reminder(
        self,
        recipient: NotificationRecipient,
        payment_data: Dict[str, Any],
        reminder_type: str
    ) -> Dict[str, Any]:
        """Send SMS reminder"""
        
        template_id = f"sms_payment_{reminder_type}"
        template = self.templates.get(template_id, self.templates["sms_payment_urgent"])
        
        try:
            # Prepare variables
            variables = {
                "recipient_name": recipient.name,
                **payment_data
            }
            
            # Render template
            message = template.body.format(**variables)
            
            # Send SMS (mock for demo)
            await asyncio.sleep(0.3)  # Simulate sending delay
            
            logger.info(f"SMS sent to {recipient.phone} - {message[:50]}...")
            
            return {
                "success": True,
                "message_id": f"sms_{datetime.now().timestamp()}",
                "sent_at": datetime.now().isoformat(),
                "message": message
            }
            
        except Exception as e:
            logger.error(f"SMS sending failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _send_push_reminder(
        self,
        recipient: NotificationRecipient,
        payment_data: Dict[str, Any],
        reminder_type: str
    ) -> Dict[str, Any]:
        """Send push notification reminder"""
        
        template = self.templates["push_payment_reminder"]
        
        try:
            # Prepare variables
            variables = {
                "recipient_name": recipient.name,
                **payment_data
            }
            
            # Render template
            title = template.subject.format(**variables)
            body = template.body.format(**variables)
            
            # Create push payload
            payload = {
                "to": recipient.push_token,
                "notification": {
                    "title": title,
                    "body": body,
                    "icon": "/icon-192x192.png",
                    "badge": "/badge-72x72.png",
                    "click_action": payment_data.get("action_url")
                },
                "data": {
                    "payment_id": payment_data["id"],
                    "type": "payment_reminder",
                    "priority": reminder_type
                }
            }
            
            # Send push notification (mock for demo)
            await asyncio.sleep(0.2)  # Simulate sending delay
            
            logger.info(f"Push notification sent to {recipient.name} - {title}")
            
            return {
                "success": True,
                "message_id": f"push_{datetime.now().timestamp()}",
                "sent_at": datetime.now().isoformat(),
                "title": title,
                "body": body
            }
            
        except Exception as e:
            logger.error(f"Push notification failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def schedule_reminder(
        self,
        payment_id: str,
        recipient_id: str,
        reminder_type: str,
        channels: List[NotificationType],
        scheduled_at: datetime
    ) -> Dict[str, Any]:
        """Schedule a reminder for later delivery"""
        
        recipient = self.recipients.get(recipient_id)
        if not recipient:
            return {"success": False, "error": "Recipient not found"}
        
        # Create scheduled message
        message = NotificationMessage(
            id=f"scheduled_{datetime.now().timestamp()}",
            recipient=recipient,
            template=self.templates[f"payment_reminder_{reminder_type}"],
            variables={
                "payment_id": payment_id,
                "reminder_type": reminder_type,
                "channels": [c.value for c in channels]
            },
            scheduled_at=scheduled_at
        )
        
        self.messages.append(message)
        
        logger.info(f"Reminder scheduled for {scheduled_at} - Payment: {payment_id}")
        
        return {
            "success": True,
            "message_id": message.id,
            "scheduled_at": scheduled_at.isoformat(),
            "payment_id": payment_id,
            "recipient_id": recipient_id
        }
    
    async def send_bulk_reminders(
        self,
        payment_ids: List[str],
        recipient_ids: List[str],
        reminder_type: str = "normal",
        channels: List[NotificationType] = None
    ) -> Dict[str, Any]:
        """Send bulk reminders to multiple recipients"""
        
        if channels is None:
            channels = [NotificationType.EMAIL]
        
        results = []
        
        for payment_id in payment_ids:
            for recipient_id in recipient_ids:
                try:
                    result = await self.send_payment_reminder(
                        payment_id=payment_id,
                        recipient_id=recipient_id,
                        reminder_type=reminder_type,
                        channels=channels
                    )
                    results.append(result)
                    
                    # Rate limiting
                    await asyncio.sleep(0.1)
                    
                except Exception as e:
                    logger.error(f"Bulk reminder failed: {str(e)}")
                    results.append({
                        "success": False,
                        "payment_id": payment_id,
                        "recipient_id": recipient_id,
                        "error": str(e)
                    })
        
        return {
            "success": True,
            "total_sent": len(results),
            "results": results
        }
    
    def get_notification_preferences(self, recipient_id: str) -> Dict[str, Any]:
        """Get notification preferences for a recipient"""
        recipient = self.recipients.get(recipient_id)
        if not recipient:
            return {"success": False, "error": "Recipient not found"}
        
        return {
            "success": True,
            "recipient_id": recipient_id,
            "preferences": recipient.preferences,
            "channels": {
                "email": recipient.email is not None,
                "sms": recipient.phone is not None,
                "push": recipient.push_token is not None
            }
        }
    
    def update_notification_preferences(
        self,
        recipient_id: str,
        preferences: Dict[str, bool]
    ) -> Dict[str, Any]:
        """Update notification preferences for a recipient"""
        recipient = self.recipients.get(recipient_id)
        if not recipient:
            return {"success": False, "error": "Recipient not found"}
        
        recipient.preferences.update(preferences)
        
        return {
            "success": True,
            "recipient_id": recipient_id,
            "updated_preferences": recipient.preferences
        }
    
    def get_notification_history(
        self,
        recipient_id: Optional[str] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """Get notification history"""
        messages = self.messages
        
        if recipient_id:
            messages = [m for m in messages if m.recipient.id == recipient_id]
        
        # Sort by sent_at, most recent first
        messages.sort(key=lambda x: x.sent_at or datetime.min, reverse=True)
        
        return {
            "success": True,
            "total": len(messages),
            "messages": [
                {
                    "id": msg.id,
                    "recipient": msg.recipient.name,
                    "template": msg.template.name,
                    "sent_at": msg.sent_at.isoformat() if msg.sent_at else None,
                    "status": msg.status,
                    "retry_count": msg.retry_count
                }
                for msg in messages[:limit]
            ]
        }

# Singleton instance
notification_service = NotificationService()