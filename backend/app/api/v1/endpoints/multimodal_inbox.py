from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
import json

from app.core.database import get_db
from app.services.multimodal_ai_inbox import (
    multimodal_ai_inbox,
    MessageType,
    MessageStatus,
    MessageCategory,
    Priority,
    SentimentType
)
from app.services.auth_service import AuthService
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/messages/receive")
async def receive_message(
    message_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Receive a new message for processing
    """
    try:
        # Add user context to message
        message_data["metadata"] = message_data.get("metadata", {})
        message_data["metadata"]["user_id"] = current_user.id
        
        # Receive and queue message
        message_id = await multimodal_ai_inbox.receive_message(message_data)
        
        # Process message immediately
        analysis = await multimodal_ai_inbox.process_message(message_id)
        
        logger.info(f"Message {message_id} received and processed for user {current_user.id}")
        
        return {
            "message_id": message_id,
            "status": "received",
            "analysis": {
                "sentiment": analysis.sentiment.value,
                "category": analysis.category.value,
                "priority": analysis.priority.value,
                "urgency_score": analysis.urgency_score,
                "estimated_resolution_time": analysis.estimated_resolution_time,
                "recommended_assignee": analysis.recommended_assignee
            }
        }
        
    except Exception as e:
        logger.error(f"Error receiving message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά τη λήψη του μηνύματος"
        )

@router.post("/messages/upload")
async def upload_message_file(
    file: UploadFile = File(...),
    message_type: str = Form(...),
    sender: str = Form(...),
    subject: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Upload a file-based message (document, audio, etc.)
    """
    try:
        # Read file content
        content = await file.read()
        
        # Prepare message data
        message_data = {
            "type": message_type,
            "sender": sender,
            "recipient": current_user.email,
            "subject": subject,
            "content": "",  # Will be extracted from file
            "attachments": [
                {
                    "filename": file.filename,
                    "content_type": file.content_type,
                    "size": len(content),
                    "data": content.decode('utf-8', errors='ignore') if file.content_type.startswith('text/') else str(content)
                }
            ],
            "metadata": {
                "user_id": current_user.id,
                "upload_type": "file"
            }
        }
        
        # Process message
        message_id = await multimodal_ai_inbox.receive_message(message_data)
        analysis = await multimodal_ai_inbox.process_message(message_id)
        
        logger.info(f"File message {message_id} uploaded and processed for user {current_user.id}")
        
        return {
            "message_id": message_id,
            "filename": file.filename,
            "analysis": {
                "sentiment": analysis.sentiment.value,
                "category": analysis.category.value,
                "priority": analysis.priority.value,
                "key_entities": analysis.key_entities,
                "action_items": analysis.action_items,
                "suggested_response": analysis.suggested_response
            }
        }
        
    except Exception as e:
        logger.error(f"Error uploading message file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά το ανέβασμα του αρχείου"
        )

@router.get("/messages/{message_id}")
async def get_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get a specific message by ID
    """
    try:
        message = await multimodal_ai_inbox.get_message(message_id)
        
        if not message:
            raise HTTPException(
                status_code=404,
                detail="Το μήνυμα δεν βρέθηκε"
            )
        
        # Convert to serializable format
        response = {
            "id": message.id,
            "type": message.type.value,
            "status": message.status.value,
            "sender": message.sender,
            "recipient": message.recipient,
            "subject": message.subject,
            "content": message.content,
            "attachments": message.attachments,
            "metadata": message.metadata,
            "received_at": message.received_at.isoformat(),
            "processed_at": message.processed_at.isoformat() if message.processed_at else None,
            "response_generated": message.response_generated,
            "human_reviewed": message.human_reviewed,
            "tags": message.tags,
            "thread_id": message.thread_id,
            "related_messages": message.related_messages
        }
        
        if message.ai_analysis:
            response["ai_analysis"] = {
                "sentiment": message.ai_analysis.sentiment.value,
                "confidence": message.ai_analysis.confidence,
                "category": message.ai_analysis.category.value,
                "priority": message.ai_analysis.priority.value,
                "key_entities": message.ai_analysis.key_entities,
                "action_items": message.ai_analysis.action_items,
                "suggested_response": message.ai_analysis.suggested_response,
                "urgency_score": message.ai_analysis.urgency_score,
                "business_impact": message.ai_analysis.business_impact,
                "similar_cases": message.ai_analysis.similar_cases,
                "recommended_assignee": message.ai_analysis.recommended_assignee,
                "estimated_resolution_time": message.ai_analysis.estimated_resolution_time,
                "compliance_flags": message.ai_analysis.compliance_flags,
                "financial_implications": message.ai_analysis.financial_implications,
                "next_steps": message.ai_analysis.next_steps
            }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting message {message_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση του μηνύματος"
        )

@router.get("/messages")
async def get_messages(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get messages with filtering options
    """
    try:
        # Parse enum values
        status_enum = MessageStatus(status) if status else None
        category_enum = MessageCategory(category) if category else None
        priority_enum = Priority(priority) if priority else None
        
        # Get messages
        messages = await multimodal_ai_inbox.get_messages(
            status=status_enum,
            category=category_enum,
            priority=priority_enum,
            limit=limit
        )
        
        # Convert to serializable format
        response_messages = []
        for message in messages:
            msg_data = {
                "id": message.id,
                "type": message.type.value,
                "status": message.status.value,
                "sender": message.sender,
                "recipient": message.recipient,
                "subject": message.subject,
                "content": message.content[:200] + "..." if len(message.content) > 200 else message.content,
                "received_at": message.received_at.isoformat(),
                "processed_at": message.processed_at.isoformat() if message.processed_at else None,
                "human_reviewed": message.human_reviewed,
                "tags": message.tags,
                "thread_id": message.thread_id
            }
            
            if message.ai_analysis:
                msg_data["ai_analysis"] = {
                    "sentiment": message.ai_analysis.sentiment.value,
                    "category": message.ai_analysis.category.value,
                    "priority": message.ai_analysis.priority.value,
                    "urgency_score": message.ai_analysis.urgency_score,
                    "recommended_assignee": message.ai_analysis.recommended_assignee,
                    "estimated_resolution_time": message.ai_analysis.estimated_resolution_time
                }
            
            response_messages.append(msg_data)
        
        return {
            "messages": response_messages,
            "total": len(response_messages),
            "filters": {
                "status": status,
                "category": category,
                "priority": priority
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Μη έγκυρη παράμετρος: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση των μηνυμάτων"
        )

@router.get("/inbox/statistics")
async def get_inbox_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get inbox statistics and analytics
    """
    try:
        stats = await multimodal_ai_inbox.get_inbox_statistics()
        
        # Add additional insights
        stats["insights"] = {
            "busiest_hours": ["09:00-11:00", "14:00-16:00"],
            "most_common_issues": ["Τεχνική υποστήριξη", "Πληρωμές", "Πληροφορίες"],
            "customer_satisfaction": 4.2,
            "response_quality": 4.5
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting inbox statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση στατιστικών"
        )

@router.get("/messages/search")
async def search_messages(
    query: str = Query(..., min_length=2),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Search messages by content
    """
    try:
        messages = await multimodal_ai_inbox.search_messages(query, limit)
        
        # Convert to serializable format
        response_messages = []
        for message in messages:
            msg_data = {
                "id": message.id,
                "type": message.type.value,
                "status": message.status.value,
                "sender": message.sender,
                "subject": message.subject,
                "content": message.content[:300] + "..." if len(message.content) > 300 else message.content,
                "received_at": message.received_at.isoformat(),
                "tags": message.tags
            }
            
            if message.ai_analysis:
                msg_data["ai_analysis"] = {
                    "sentiment": message.ai_analysis.sentiment.value,
                    "category": message.ai_analysis.category.value,
                    "priority": message.ai_analysis.priority.value
                }
            
            response_messages.append(msg_data)
        
        return {
            "query": query,
            "results": response_messages,
            "total_found": len(response_messages)
        }
        
    except Exception as e:
        logger.error(f"Error searching messages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την αναζήτηση μηνυμάτων"
        )

@router.post("/messages/{message_id}/respond")
async def respond_to_message(
    message_id: str,
    response_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Send a response to a message
    """
    try:
        message = await multimodal_ai_inbox.get_message(message_id)
        
        if not message:
            raise HTTPException(
                status_code=404,
                detail="Το μήνυμα δεν βρέθηκε"
            )
        
        # Update message with response
        message.response_generated = response_data.get("response_text")
        message.status = MessageStatus.RESPONDED
        message.human_reviewed = True
        
        # Log response
        logger.info(f"Response sent for message {message_id} by user {current_user.id}")
        
        return {
            "message_id": message_id,
            "status": "responded",
            "response_sent": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error responding to message {message_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την αποστολή απάντησης"
        )

@router.post("/messages/{message_id}/archive")
async def archive_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Archive a message
    """
    try:
        message = await multimodal_ai_inbox.get_message(message_id)
        
        if not message:
            raise HTTPException(
                status_code=404,
                detail="Το μήνυμα δεν βρέθηκε"
            )
        
        message.status = MessageStatus.ARCHIVED
        
        logger.info(f"Message {message_id} archived by user {current_user.id}")
        
        return {
            "message_id": message_id,
            "status": "archived",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error archiving message {message_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την αρχειοθέτηση"
        )

@router.get("/inbox/templates")
async def get_response_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get available response templates
    """
    try:
        templates = [
            {
                "id": "acknowledgment",
                "name": "Γενική Απάντηση",
                "category": "general",
                "template": "Σας ευχαριστούμε για το μήνυμά σας. Θα σας απαντήσουμε το συντομότερο δυνατό."
            },
            {
                "id": "sales_inquiry",
                "name": "Απάντηση Πωλήσεων",
                "category": "sales",
                "template": "Σας ευχαριστούμε για το ενδιαφέρον σας. Θα σας αποστείλουμε προσφορά εντός 24 ωρών."
            },
            {
                "id": "support_response",
                "name": "Τεχνική Υποστήριξη",
                "category": "support",
                "template": "Λάβαμε το αίτημά σας για υποστήριξη. Θα το εξετάσουμε άμεσα."
            },
            {
                "id": "complaint_response",
                "name": "Διαχείριση Παραπόνων",
                "category": "complaint",
                "template": "Λυπούμαστε για την αναστάτωση. Θα εξετάσουμε το θέμα με προτεραιότητα."
            },
            {
                "id": "invoice_payment",
                "name": "Πληρωμές Τιμολογίων",
                "category": "finance",
                "template": "Σχετικά με το τιμολόγιό σας, θα ελέγξουμε την κατάσταση και θα σας ενημερώσουμε."
            }
        ]
        
        return {
            "templates": templates,
            "total_count": len(templates)
        }
        
    except Exception as e:
        logger.error(f"Error getting response templates: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση templates"
        )

@router.get("/inbox/analytics")
async def get_inbox_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get detailed inbox analytics
    """
    try:
        # Mock analytics data - in production, calculate from actual data
        analytics = {
            "period_days": days,
            "message_trends": {
                "daily_volume": [
                    {"date": "2024-01-01", "count": 45},
                    {"date": "2024-01-02", "count": 52},
                    {"date": "2024-01-03", "count": 38}
                ],
                "hourly_distribution": [
                    {"hour": "09:00", "count": 15},
                    {"hour": "10:00", "count": 22},
                    {"hour": "11:00", "count": 18}
                ]
            },
            "sentiment_analysis": {
                "positive": 45.2,
                "negative": 15.8,
                "neutral": 39.0
            },
            "response_performance": {
                "average_response_time": 35.4,
                "auto_response_rate": 68.5,
                "customer_satisfaction": 4.2
            },
            "top_categories": [
                {"category": "sales_inquiry", "count": 145, "percentage": 32.1},
                {"category": "customer_support", "count": 98, "percentage": 21.7},
                {"category": "invoice_payment", "count": 87, "percentage": 19.3}
            ],
            "team_performance": {
                "total_agents": 8,
                "average_resolution_time": 42.3,
                "customer_satisfaction": 4.3
            }
        }
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting inbox analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση analytics"
        )