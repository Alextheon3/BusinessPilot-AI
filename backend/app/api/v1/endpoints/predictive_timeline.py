from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime

from app.core.database import get_db
from app.services.predictive_timeline import predictive_timeline_service
from app.services.auth_service import AuthService
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/timeline/predict")
async def get_predictive_timeline(
    period: str = Query("next_30_days", description="Time period: next_7_days, next_30_days, next_quarter"),
    business_type: str = Query("retail", description="Business type for better predictions"),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get AI-powered predictive timeline for business obligations
    """
    try:
        # Validate period
        valid_periods = ["next_7_days", "next_30_days", "next_quarter"]
        if period not in valid_periods:
            raise HTTPException(
                status_code=400,
                detail=f"Μη έγκυρη περίοδος. Επιλέξτε από: {', '.join(valid_periods)}"
            )
        
        # Generate predictive timeline
        timeline = await predictive_timeline_service.generate_predictive_timeline(
            business_type=business_type,
            period=period,
            user_id=current_user.id
        )
        
        # Convert events to serializable format
        events_data = []
        for event in timeline.events:
            events_data.append({
                "id": event.id,
                "title": event.title,
                "description": event.description,
                "event_type": event.event_type.value,
                "due_date": event.due_date.isoformat(),
                "priority": event.priority.value,
                "status": event.status.value,
                "estimated_duration": event.estimated_duration,
                "cost_estimate": event.cost_estimate,
                "recurrence": event.recurrence,
                "business_impact": event.business_impact,
                "automation_possible": event.automation_possible,
                "required_documents": event.required_documents or [],
                "responsible_person": event.responsible_person,
                "government_agency": event.government_agency,
                "penalties_if_missed": event.penalties_if_missed,
                "ai_suggestions": event.ai_suggestions or []
            })
        
        logger.info(f"Generated predictive timeline for user {current_user.id}: {len(events_data)} events")
        
        return {
            "period": timeline.period,
            "events": events_data,
            "workload_distribution": timeline.workload_distribution,
            "cost_projections": timeline.cost_projections,
            "risk_assessment": timeline.risk_assessment,
            "ai_recommendations": timeline.ai_recommendations,
            "summary": {
                "total_events": len(events_data),
                "high_priority": len([e for e in timeline.events if e.priority.value == "high"]),
                "critical": len([e for e in timeline.events if e.priority.value == "critical"]),
                "estimated_total_time": sum(e.estimated_duration for e in timeline.events),
                "estimated_total_cost": sum(e.cost_estimate or 0 for e in timeline.events)
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating predictive timeline: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά τη δημιουργία του προβλεπτικού χρονοδιαγράμματος"
        )

@router.get("/timeline/calendar-sync")
async def get_calendar_sync_data(
    period: str = Query("next_30_days"),
    business_type: str = Query("retail"),
    format: str = Query("icalendar", description="Format: icalendar, google, outlook"),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get calendar sync data for external calendar applications
    """
    try:
        # Generate timeline
        timeline = await predictive_timeline_service.generate_predictive_timeline(
            business_type=business_type,
            period=period,
            user_id=current_user.id
        )
        
        # Get calendar sync data
        calendar_data = await predictive_timeline_service.get_calendar_sync_data(timeline.events)
        
        if format == "icalendar":
            # Generate iCalendar format
            ical_content = _generate_icalendar(calendar_data)
            return {
                "format": "icalendar",
                "content": ical_content,
                "filename": f"businesspilot_timeline_{period}.ics"
            }
        elif format == "google":
            # Google Calendar format
            return {
                "format": "google_calendar",
                "events": calendar_data["events"],
                "calendar_name": calendar_data["calendar_name"],
                "timezone": calendar_data["timezone"]
            }
        elif format == "outlook":
            # Outlook format
            return {
                "format": "outlook",
                "events": calendar_data["events"],
                "calendar_name": calendar_data["calendar_name"],
                "timezone": calendar_data["timezone"]
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Μη έγκυρη μορφή. Επιλέξτε: icalendar, google, outlook"
            )
        
    except Exception as e:
        logger.error(f"Error generating calendar sync data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά τη δημιουργία δεδομένων συγχρονισμού ημερολογίου"
        )

@router.get("/timeline/events/{event_id}")
async def get_event_details(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get detailed information about a specific event
    """
    try:
        # This would typically fetch from database
        # For now, we'll return mock detailed data
        
        event_details = {
            "id": event_id,
            "title": "Δήλωση ΦΠΑ - Τρίμηνο 1",
            "description": "Υποβολή δήλωσης ΦΠΑ για το τρίμηνο που έληξε",
            "due_date": "2024-04-29T23:59:59",
            "priority": "high",
            "status": "upcoming",
            "detailed_steps": [
                "Συγκέντρωση παραστατικών πωλήσεων",
                "Συγκέντρωση παραστατικών αγορών",
                "Υπολογισμός ΦΠΑ εισροών/εκροών",
                "Συμπλήρωση δήλωσης στο TAXISnet",
                "Υποβολή δήλωσης"
            ],
            "required_documents": [
                "Μητρώο πωλήσεων",
                "Μητρώο αγορών",
                "Φορολογικά στοιχεία",
                "Αποδείξεις εξόδων"
            ],
            "estimated_time_breakdown": {
                "preparation": 90,
                "filling_forms": 30,
                "submission": 10
            },
            "cost_breakdown": {
                "government_fees": 0,
                "accountant_fees": 50,
                "processing_fees": 0
            },
            "automation_options": [
                "Αυτόματη εξαγωγή από myDATA",
                "Προσυμπληρωμένη δήλωση",
                "Αυτόματη υποβολή"
            ],
            "related_events": [
                {
                    "id": "vat_2024_7",
                    "title": "Δήλωση ΦΠΑ - Τρίμηνο 2",
                    "due_date": "2024-07-28T23:59:59"
                }
            ],
            "help_resources": [
                {
                    "title": "Οδηγίες ΑΑΔΕ για ΦΠΑ",
                    "url": "https://www.aade.gr/polites/forologikes-ypiresies/foros-prostithemenis-aksias-fpa",
                    "type": "official_guide"
                },
                {
                    "title": "Βίντεο οδηγίες",
                    "url": "https://businesspilot.ai/help/vat-submission",
                    "type": "video_tutorial"
                }
            ]
        }
        
        return event_details
        
    except Exception as e:
        logger.error(f"Error fetching event details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση λεπτομερειών γεγονότος"
        )

@router.post("/timeline/events/{event_id}/complete")
async def mark_event_complete(
    event_id: str,
    completion_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Mark an event as completed
    """
    try:
        completion_time = completion_data.get('completion_time', datetime.utcnow().isoformat())
        notes = completion_data.get('notes', '')
        actual_duration = completion_data.get('actual_duration', 0)
        
        # Update event status (in production, update database)
        result = {
            "event_id": event_id,
            "status": "completed",
            "completed_at": completion_time,
            "notes": notes,
            "actual_duration": actual_duration,
            "message": "Το γεγονός σημειώθηκε ως ολοκληρωμένο"
        }
        
        logger.info(f"Event {event_id} marked as completed by user {current_user.id}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error marking event as complete: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά τη σήμανση του γεγονότος ως ολοκληρωμένου"
        )

@router.post("/timeline/events/{event_id}/reminder")
async def set_event_reminder(
    event_id: str,
    reminder_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Set reminder for an event
    """
    try:
        reminder_time = reminder_data.get('reminder_time')
        reminder_type = reminder_data.get('type', 'email')  # email, sms, push
        custom_message = reminder_data.get('message', '')
        
        # Set reminder (in production, store in database and schedule)
        result = {
            "event_id": event_id,
            "reminder_time": reminder_time,
            "reminder_type": reminder_type,
            "custom_message": custom_message,
            "message": "Η υπενθύμιση ρυθμίστηκε επιτυχώς"
        }
        
        logger.info(f"Reminder set for event {event_id} by user {current_user.id}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error setting reminder: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά τη ρύθμιση της υπενθύμισης"
        )

@router.get("/timeline/statistics")
async def get_timeline_statistics(
    period: str = Query("last_30_days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get timeline and compliance statistics
    """
    try:
        # Mock statistics (in production, calculate from database)
        statistics = {
            "period": period,
            "events_completed": 28,
            "events_missed": 2,
            "events_upcoming": 15,
            "average_completion_time": 45,  # minutes
            "on_time_rate": 93.3,  # percentage
            "automation_usage": 67.5,  # percentage
            "cost_saved_by_automation": 450.0,  # euros
            "compliance_score": 89.2,  # percentage
            "penalty_avoided": 300.0,  # euros
            "most_time_consuming_category": "tax_obligations",
            "most_frequent_category": "ergani_declarations",
            "productivity_trend": "improving",
            "ai_suggestions_followed": 12,
            "time_saved_by_ai": 180,  # minutes
            "category_breakdown": {
                "tax_obligations": {"count": 8, "completion_rate": 95.0},
                "ergani_declarations": {"count": 12, "completion_rate": 100.0},
                "insurance_payments": {"count": 6, "completion_rate": 85.0},
                "contract_renewals": {"count": 4, "completion_rate": 90.0}
            }
        }
        
        return statistics
        
    except Exception as e:
        logger.error(f"Error fetching timeline statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Σφάλμα κατά την ανάκτηση στατιστικών χρονοδιαγράμματος"
        )

def _generate_icalendar(calendar_data: Dict[str, Any]) -> str:
    """Generate iCalendar format content"""
    ical_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BusinessPilot AI//Timeline Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:{calendar_data['calendar_name']}
X-WR-TIMEZONE:{calendar_data['timezone']}
"""
    
    for event in calendar_data['events']:
        ical_content += f"""BEGIN:VEVENT
UID:{event['id']}@businesspilot.ai
DTSTART:{event['start'].replace('-', '').replace(':', '')}
DTEND:{event['end'].replace('-', '').replace(':', '')}
SUMMARY:{event['title']}
DESCRIPTION:{event['description']}
LOCATION:{event['location']}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
"""
    
    ical_content += "END:VCALENDAR"
    return ical_content