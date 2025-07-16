from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import requests
from app.models.events import Event, EventType
from app.core.config import settings

class EventsService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_weather_forecast(self, days: int = 7) -> Dict[str, Any]:
        """Get weather forecast for the next N days"""
        try:
            # Mock weather data for now
            forecast = []
            for i in range(days):
                date = datetime.now() + timedelta(days=i)
                forecast.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "temperature": 22 + (i % 10),
                    "condition": "partly_cloudy",
                    "precipitation": 0.1 * (i % 3),
                    "wind_speed": 10 + (i % 5),
                    "business_impact": self._calculate_weather_impact("partly_cloudy", 0.1 * (i % 3))
                })
            
            return {
                "forecast": forecast,
                "summary": "Mostly pleasant weather expected with minimal business impact"
            }
        except Exception as e:
            return {
                "forecast": [],
                "summary": "Weather data unavailable",
                "error": str(e)
            }
    
    def get_local_events(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get local events that might impact business"""
        try:
            end_date = datetime.now() + timedelta(days=days)
            events = self.db.query(Event).filter(
                Event.start_date <= end_date,
                Event.start_date >= datetime.now(),
                Event.is_active == True
            ).all()
            
            result = []
            for event in events:
                result.append({
                    "id": event.id,
                    "name": event.name,
                    "type": event.type.value,
                    "description": event.description,
                    "start_date": event.start_date.isoformat(),
                    "end_date": event.end_date.isoformat() if event.end_date else None,
                    "location": event.location,
                    "impact_score": event.impact_score,
                    "predicted_change": event.predicted_change
                })
            
            return result
        except Exception as e:
            return []
    
    def get_business_impact(self) -> Dict[str, Any]:
        """Analyze overall business impact from events"""
        try:
            # Get events for the next 30 days
            end_date = datetime.now() + timedelta(days=30)
            events = self.db.query(Event).filter(
                Event.start_date <= end_date,
                Event.start_date >= datetime.now(),
                Event.is_active == True
            ).all()
            
            total_impact = 0
            positive_events = 0
            negative_events = 0
            
            event_impacts = []
            for event in events:
                total_impact += event.impact_score
                if event.impact_score > 0:
                    positive_events += 1
                elif event.impact_score < 0:
                    negative_events += 1
                
                event_impacts.append({
                    "name": event.name,
                    "date": event.start_date.strftime("%Y-%m-%d"),
                    "impact": event.impact_score,
                    "predicted_change": event.predicted_change
                })
            
            return {
                "overall_impact": total_impact,
                "positive_events": positive_events,
                "negative_events": negative_events,
                "neutral_events": len(events) - positive_events - negative_events,
                "event_impacts": event_impacts,
                "recommendation": self._generate_recommendation(total_impact)
            }
        except Exception as e:
            return {
                "overall_impact": 0,
                "positive_events": 0,
                "negative_events": 0,
                "neutral_events": 0,
                "event_impacts": [],
                "recommendation": "Unable to analyze business impact",
                "error": str(e)
            }
    
    def get_alerts(self) -> List[Dict[str, Any]]:
        """Get important event alerts"""
        try:
            # Get high-impact events in the next 7 days
            end_date = datetime.now() + timedelta(days=7)
            high_impact_events = self.db.query(Event).filter(
                Event.start_date <= end_date,
                Event.start_date >= datetime.now(),
                Event.is_active == True
            ).filter(
                (Event.impact_score > 0.5) | (Event.impact_score < -0.5)
            ).all()
            
            alerts = []
            for event in high_impact_events:
                alert_type = "opportunity" if event.impact_score > 0 else "warning"
                alerts.append({
                    "type": alert_type,
                    "title": f"{event.name} - {alert_type.title()}",
                    "message": self._generate_alert_message(event),
                    "date": event.start_date.strftime("%Y-%m-%d"),
                    "impact_score": event.impact_score,
                    "predicted_change": event.predicted_change
                })
            
            return alerts
        except Exception as e:
            return []
    
    def process_weather_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process weather webhook data"""
        try:
            # This would process real weather webhook data
            # For now, just return a success response
            return {
                "status": "processed",
                "message": "Weather webhook processed successfully"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _calculate_weather_impact(self, condition: str, precipitation: float) -> float:
        """Calculate business impact based on weather conditions"""
        impact_map = {
            "sunny": 0.1,
            "partly_cloudy": 0.05,
            "cloudy": 0.0,
            "rainy": -0.2,
            "stormy": -0.5,
            "snowy": -0.3
        }
        
        base_impact = impact_map.get(condition, 0.0)
        
        # Adjust for precipitation
        if precipitation > 0.5:
            base_impact -= 0.1
        elif precipitation > 0.2:
            base_impact -= 0.05
        
        return base_impact
    
    def _generate_recommendation(self, total_impact: float) -> str:
        """Generate business recommendation based on impact score"""
        if total_impact > 0.5:
            return "High positive impact expected. Consider increasing inventory and staff."
        elif total_impact > 0.2:
            return "Moderate positive impact expected. Good time for promotions."
        elif total_impact < -0.5:
            return "High negative impact expected. Consider reducing inventory and costs."
        elif total_impact < -0.2:
            return "Moderate negative impact expected. Focus on customer retention."
        else:
            return "Neutral impact expected. Continue normal operations."
    
    def _generate_alert_message(self, event: Event) -> str:
        """Generate alert message for an event"""
        if event.impact_score > 0:
            return f"Opportunity: {event.name} is expected to increase sales by {event.predicted_change:.1%}. Prepare accordingly."
        else:
            return f"Warning: {event.name} may decrease sales by {abs(event.predicted_change):.1%}. Consider protective measures."