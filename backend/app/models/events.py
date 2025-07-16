from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class EventType(enum.Enum):
    WEATHER = "weather"
    LOCAL_EVENT = "local_event"
    HOLIDAY = "holiday"
    COMPETITION = "competition"

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    type = Column(Enum(EventType), nullable=False)
    description = Column(Text)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    location = Column(String(200))
    impact_score = Column(Float, default=0.0)  # -1 to 1, negative = bad for business
    predicted_change = Column(Float, default=0.0)  # % change in sales
    source = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())