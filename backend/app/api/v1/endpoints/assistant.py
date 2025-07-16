from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.assistant_service import AssistantService

router = APIRouter()

@router.post("/chat")
async def chat_with_assistant(request: ChatRequest, db: Session = Depends(get_db)):
    assistant_service = AssistantService(db)
    return assistant_service.create_chat_message(request)

@router.get("/suggestions")
async def get_suggestions(db: Session = Depends(get_db)):
    assistant_service = AssistantService(db)
    return assistant_service.get_suggested_questions()

@router.get("/business-summary")
async def get_business_summary(db: Session = Depends(get_db)):
    assistant_service = AssistantService(db)
    return assistant_service.get_business_summary()

@router.get("/chat/history")
async def get_chat_history(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    assistant_service = AssistantService(db)
    return assistant_service.get_chat_history(skip, limit)

@router.delete("/chat/history")
async def clear_chat_history(db: Session = Depends(get_db)):
    assistant_service = AssistantService(db)
    # Clear all chat messages
    messages = assistant_service.get_chat_history(0, 1000)
    for message in messages:
        assistant_service.delete_chat_message(message.id)
    return {"message": "Chat history cleared"}