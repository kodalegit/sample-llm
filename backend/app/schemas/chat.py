from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    role: str = Field(..., pattern="^(user|assistant)$")


class MessageRead(BaseModel):
    id: str
    content: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    initial_query: str = Field(..., min_length=1)


class ChatRead(BaseModel):
    id: str
    name: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    messages: List[MessageRead] = []

    class Config:
        from_attributes = True
