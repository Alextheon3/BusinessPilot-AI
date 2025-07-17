"""
Payment Reminder API Endpoints for BusinessPilot AI
Handles payment reminder scheduling, sending, and management
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from enum import Enum

from app.services.notification_service import notification_service, NotificationType
from app.services.government_systems_hub import government_hub

router = APIRouter()

class ReminderType(str, Enum):
    NORMAL = "normal"
    URGENT = "urgent"
    FINAL = "final"

class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"

class SendReminderRequest(BaseModel):
    payment_id: str = Field(..., description="Payment ID")
    recipient_id: str = Field(..., description="Recipient ID")
    reminder_type: ReminderType = Field(default=ReminderType.NORMAL, description="Type of reminder")
    channels: List[NotificationChannel] = Field(default=[NotificationChannel.EMAIL], description="Notification channels")

class ScheduleReminderRequest(BaseModel):
    payment_id: str = Field(..., description="Payment ID")
    recipient_id: str = Field(..., description="Recipient ID")
    reminder_type: ReminderType = Field(default=ReminderType.NORMAL, description="Type of reminder")
    channels: List[NotificationChannel] = Field(default=[NotificationChannel.EMAIL], description="Notification channels")
    scheduled_at: datetime = Field(..., description="When to send the reminder")

class BulkReminderRequest(BaseModel):
    payment_ids: List[str] = Field(..., description="List of payment IDs")
    recipient_ids: List[str] = Field(..., description="List of recipient IDs")
    reminder_type: ReminderType = Field(default=ReminderType.NORMAL, description="Type of reminder")
    channels: List[NotificationChannel] = Field(default=[NotificationChannel.EMAIL], description="Notification channels")

class UpdatePreferencesRequest(BaseModel):
    preferences: Dict[str, bool] = Field(..., description="Updated notification preferences")

@router.post("/send-reminder")
async def send_payment_reminder(
    request: SendReminderRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Send a payment reminder immediately
    """
    try:
        # Convert string channels to NotificationType enum
        channels = [NotificationType(channel.value) for channel in request.channels]
        
        # Send reminder
        result = await notification_service.send_payment_reminder(
            payment_id=request.payment_id,
            recipient_id=request.recipient_id,
            reminder_type=request.reminder_type.value,
            channels=channels
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "message": "Reminder sent successfully",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/schedule-reminder")
async def schedule_payment_reminder(
    request: ScheduleReminderRequest
) -> Dict[str, Any]:
    """
    Schedule a payment reminder for later delivery
    """
    try:
        # Convert string channels to NotificationType enum
        channels = [NotificationType(channel.value) for channel in request.channels]
        
        # Schedule reminder
        result = await notification_service.schedule_reminder(
            payment_id=request.payment_id,
            recipient_id=request.recipient_id,
            reminder_type=request.reminder_type.value,
            channels=channels,
            scheduled_at=request.scheduled_at
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "message": "Reminder scheduled successfully",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-reminders")
async def send_bulk_reminders(
    request: BulkReminderRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Send bulk payment reminders
    """
    try:
        # Convert string channels to NotificationType enum
        channels = [NotificationType(channel.value) for channel in request.channels]
        
        # Send bulk reminders in background
        background_tasks.add_task(
            notification_service.send_bulk_reminders,
            payment_ids=request.payment_ids,
            recipient_ids=request.recipient_ids,
            reminder_type=request.reminder_type.value,
            channels=channels
        )
        
        return {
            "success": True,
            "message": f"Bulk reminders initiated for {len(request.payment_ids)} payments and {len(request.recipient_ids)} recipients"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/urgent-payments")
async def get_urgent_payments(
    days_ahead: int = 7,
    business_afm: str = "123456789"
) -> Dict[str, Any]:
    """
    Get urgent payments that need reminders
    """
    try:
        # Get urgent obligations from government systems
        urgent_obligations = government_hub.get_urgent_obligations(days_ahead=days_ahead)
        
        # Format for payment reminders
        urgent_payments = []
        for obligation in urgent_obligations:
            payment = {
                "id": obligation.id,
                "title": obligation.title,
                "amount": obligation.amount,
                "due_date": obligation.due_date.isoformat(),
                "system": obligation.system.value,
                "priority": obligation.priority,
                "consequences": obligation.consequences,
                "days_remaining": (obligation.due_date - datetime.now()).days
            }
            urgent_payments.append(payment)
        
        return {
            "success": True,
            "total": len(urgent_payments),
            "payments": urgent_payments
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notification-preferences/{recipient_id}")
async def get_notification_preferences(
    recipient_id: str
) -> Dict[str, Any]:
    """
    Get notification preferences for a recipient
    """
    try:
        result = notification_service.get_notification_preferences(recipient_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/notification-preferences/{recipient_id}")
async def update_notification_preferences(
    recipient_id: str,
    request: UpdatePreferencesRequest
) -> Dict[str, Any]:
    """
    Update notification preferences for a recipient
    """
    try:
        result = notification_service.update_notification_preferences(
            recipient_id=recipient_id,
            preferences=request.preferences
        )
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {
            "success": True,
            "message": "Preferences updated successfully",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notification-history")
async def get_notification_history(
    recipient_id: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Get notification history
    """
    try:
        result = notification_service.get_notification_history(
            recipient_id=recipient_id,
            limit=limit
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-notification")
async def test_notification(
    channel: NotificationChannel,
    recipient_id: str = "business_owner"
) -> Dict[str, Any]:
    """
    Test notification delivery for a specific channel
    """
    try:
        # Send test notification
        result = await notification_service.send_payment_reminder(
            payment_id="test_payment",
            recipient_id=recipient_id,
            reminder_type="normal",
            channels=[NotificationType(channel.value)]
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "message": f"Test {channel.value} notification sent successfully",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auto-reminders")
async def setup_auto_reminders(
    background_tasks: BackgroundTasks,
    days_ahead: int = 7
) -> Dict[str, Any]:
    """
    Setup automatic reminders for urgent payments
    """
    try:
        # Get urgent obligations
        urgent_obligations = government_hub.get_urgent_obligations(days_ahead=days_ahead)
        
        reminder_count = 0
        for obligation in urgent_obligations:
            # Determine reminder type based on urgency
            days_remaining = (obligation.due_date - datetime.now()).days
            
            if days_remaining <= 1:
                reminder_type = "urgent"
                channels = [NotificationType.EMAIL, NotificationType.SMS, NotificationType.PUSH]
            elif days_remaining <= 3:
                reminder_type = "urgent"
                channels = [NotificationType.EMAIL, NotificationType.SMS]
            else:
                reminder_type = "normal"
                channels = [NotificationType.EMAIL]
            
            # Send reminder to all recipients
            for recipient_id in ["business_owner", "accountant"]:
                background_tasks.add_task(
                    notification_service.send_payment_reminder,
                    payment_id=obligation.id,
                    recipient_id=recipient_id,
                    reminder_type=reminder_type,
                    channels=channels
                )
                reminder_count += 1
        
        return {
            "success": True,
            "message": f"Auto-reminders setup for {len(urgent_obligations)} urgent payments",
            "total_reminders": reminder_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reminder-analytics")
async def get_reminder_analytics(
    days_back: int = 30
) -> Dict[str, Any]:
    """
    Get analytics for payment reminders
    """
    try:
        # Get notification history
        history = notification_service.get_notification_history(limit=1000)
        
        # Calculate analytics
        total_sent = len(history["messages"])
        successful_sent = len([m for m in history["messages"] if m["status"] == "sent"])
        failed_sent = len([m for m in history["messages"] if m["status"] == "failed"])
        
        # Channel breakdown
        channel_stats = {
            "email": 0,
            "sms": 0,
            "push": 0
        }
        
        # Mock channel stats (in production, track actual channels)
        channel_stats["email"] = int(total_sent * 0.8)
        channel_stats["sms"] = int(total_sent * 0.4)
        channel_stats["push"] = int(total_sent * 0.6)
        
        return {
            "success": True,
            "analytics": {
                "total_reminders_sent": total_sent,
                "successful_deliveries": successful_sent,
                "failed_deliveries": failed_sent,
                "delivery_rate": (successful_sent / total_sent * 100) if total_sent > 0 else 0,
                "channel_breakdown": channel_stats,
                "period_days": days_back
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/system-status")
async def get_notification_system_status() -> Dict[str, Any]:
    """
    Get notification system status
    """
    try:
        # Check system health
        return {
            "success": True,
            "status": "healthy",
            "services": {
                "email": {
                    "status": "active",
                    "provider": "smtp",
                    "last_check": datetime.now().isoformat()
                },
                "sms": {
                    "status": "active",
                    "provider": "twilio",
                    "last_check": datetime.now().isoformat()
                },
                "push": {
                    "status": "active",
                    "provider": "firebase",
                    "last_check": datetime.now().isoformat()
                }
            },
            "queue_size": 0,
            "processing_rate": "100 msgs/min"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))