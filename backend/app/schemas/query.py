from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class QueryBase(BaseModel):
    query_text: str = Field(..., min_length=1)


class QueryCreate(QueryBase):
    pass


class QueryInDB(QueryBase):
    id: str
    user_id: str
    response_text: str
    created_at: datetime

    class Config:
        orm_mode = True


class Query(QueryInDB):
    pass


class QueryResponse(BaseModel):
    id: str
    query_text: str
    response_text: str
    created_at: datetime

    class Config:
        orm_mode = True


class QueryHistory(BaseModel):
    queries: List[QueryResponse]