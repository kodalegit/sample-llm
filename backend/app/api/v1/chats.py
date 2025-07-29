from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from app.api.deps import get_db, get_current_user
from app.core.llm_service import llm_service
from app.models.chat import Chat, Message
from app.schemas.chat import ChatCreate, ChatRead, MessageCreate, MessageRead
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=ChatRead, status_code=status.HTTP_201_CREATED)
async def create_chat(
    chat_in: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Generate title from initial query using LLM
    title = await llm_service.generate_response(chat_in.initial_query, title_mode=True)
    chat = Chat(user_id=current_user.id, name=title)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    # Add first user message
    message = Message(chat_id=chat.id, role="user", content=chat_in.initial_query)
    db.add(message)
    db.commit()
    db.refresh(message)
    chat.messages.append(message)
    return chat


@router.post(
    "/{chat_id}/messages",
    response_model=MessageRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_message(
    chat_id: str,
    message_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    # Generate assistant response using LLM if role is user
    if message_in.role == "user":
        # Save user message
        user_message = Message(chat_id=chat_id, role="user", content=message_in.content)
        db.add(user_message)
        db.commit()
        db.refresh(user_message)
        # Generate assistant reply
        assistant_content = await llm_service.generate_response(message_in.content)
        assistant_message = Message(
            chat_id=chat_id, role="assistant", content=assistant_content
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)
        return assistant_message
    else:
        # Only allow user messages to trigger LLM
        raise HTTPException(status_code=400, detail="Only user messages are accepted.")


@router.get("/", response_model=List[ChatRead])
async def list_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(Chat.created_at.desc())
        .all()
    )
    return chats


@router.get("/{chat_id}", response_model=ChatRead)
async def get_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat
