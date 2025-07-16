from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.events_service import EventsService

router = APIRouter()

@router.get("/weather")
async def get_weather_forecast(days: int = 7, db: Session = Depends(get_db)):
    events_service = EventsService(db)
    return events_service.get_weather_forecast(days)

@router.get("/local")
async def get_local_events(days: int = 7, db: Session = Depends(get_db)):
    events_service = EventsService(db)
    return events_service.get_local_events(days)

@router.get("/impact")
async def get_business_impact(db: Session = Depends(get_db)):
    events_service = EventsService(db)
    return events_service.get_business_impact()

@router.get("/alerts")
async def get_event_alerts(db: Session = Depends(get_db)):
    events_service = EventsService(db)
    return events_service.get_alerts()

@router.post("/webhook/weather")
async def weather_webhook(data: dict, db: Session = Depends(get_db)):
    events_service = EventsService(db)
    return events_service.process_weather_webhook(data)