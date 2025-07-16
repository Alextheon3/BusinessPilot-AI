from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.marketing import CampaignCreate, CampaignResponse, CampaignGenerate
from app.services.marketing_service import MarketingService

router = APIRouter()

@router.post("/campaigns", response_model=CampaignResponse)
async def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    marketing_service = MarketingService(db)
    return marketing_service.create_campaign(campaign)

@router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    marketing_service = MarketingService(db)
    return marketing_service.get_campaigns(skip, limit)

@router.post("/generate-content")
async def generate_campaign_content(request: dict, db: Session = Depends(get_db)):
    marketing_service = MarketingService(db)
    return marketing_service.generate_campaign_content(
        request.get("campaign_type", "email"),
        request.get("business_context", {})
    )

@router.get("/suggestions")
async def get_marketing_suggestions(db: Session = Depends(get_db)):
    marketing_service = MarketingService(db)
    return marketing_service.get_marketing_suggestions({})

@router.post("/campaigns/{campaign_id}/send")
async def send_campaign(campaign_id: int, db: Session = Depends(get_db)):
    marketing_service = MarketingService(db)
    result = marketing_service.send_campaign(campaign_id)
    if not result:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign sent successfully"}

@router.get("/campaigns/{campaign_id}/analytics")
async def get_campaign_analytics(campaign_id: int, db: Session = Depends(get_db)):
    marketing_service = MarketingService(db)
    analytics = marketing_service.get_campaign_analytics(campaign_id)
    if not analytics:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return analytics