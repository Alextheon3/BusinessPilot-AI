from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[list] = None
    actions: Optional[list] = None
    data: Optional[dict] = None

class ChatHistoryResponse(BaseModel):
    id: int
    user_message: str
    assistant_response: str
    context: Optional[str] = None
    tokens_used: int
    response_time: int
    created_at: datetime

    class Config:
        from_attributes = True