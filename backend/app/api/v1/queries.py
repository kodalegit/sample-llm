from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.llm_service import llm_service
from app.models.user import User
from app.models.query import Query
from app.schemas.query import QueryCreate, QueryResponse, QueryHistory

router = APIRouter()


@router.post("/", response_model=QueryResponse, status_code=status.HTTP_201_CREATED)
async def create_query(query_in: QueryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    """Create a new query and get response from LLM"""
    # Generate response from LLM
    response_text = await llm_service.generate_response(query_in.query_text)
    
    # Create query record in database
    query = Query(
        user_id=current_user.id,
        query_text=query_in.query_text,
        response_text=response_text
    )
    
    db.add(query)
    db.commit()
    db.refresh(query)
    
    return query


@router.get("/history", response_model=QueryHistory)
async def read_query_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    """Get query history for current user"""
    queries = db.query(Query).filter(Query.user_id == current_user.id).order_by(Query.created_at.desc()).all()
    
    return {"queries": queries}


@router.get("/{query_id}", response_model=QueryResponse)
async def read_query(query_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    """Get a specific query by id"""
    query = db.query(Query).filter(Query.id == query_id).first()
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )
    
    # Only allow users to access their own queries
    if query.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return query