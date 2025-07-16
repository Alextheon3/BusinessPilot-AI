from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.marketing import CampaignType, CampaignStatus

class CampaignBase(BaseModel):
    name: str
    type: CampaignType
    subject: Optional[str] = None
    content: str
    target_audience: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    budget: float = 0.0

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[CampaignType] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    target_audience: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    budget: Optional[float] = None

class CampaignResponse(CampaignBase):
    id: int
    status: CampaignStatus
    sent_at: Optional[datetime] = None
    recipients_count: int
    opened_count: int
    clicked_count: int
    conversion_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CampaignGenerate(BaseModel):
    campaign_type: CampaignType
    target_audience: str
    promotion_type: str
    product_focus: Optional[str] = None
    tone: str = "friendly"
    
class CampaignAnalytics(BaseModel):
    open_rate: float
    click_rate: float
    conversion_rate: float
    roi: float
    engagement_score: float