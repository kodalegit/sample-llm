import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import Any, List, AsyncGenerator
from app.api.deps import get_db, get_current_user
from app.core.llm_service import llm_service
from app.models.chat import Chat, Message
from app.schemas.chat import ChatCreate, ChatRead, MessageCreate
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=ChatRead, status_code=status.HTTP_201_CREATED)
async def create_chat(
    chat_in: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Generate title from initial query using LLM (no context for title generation)
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
        .options(joinedload(Chat.messages))
        .filter(Chat.id == chat_id, Chat.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Only allow user messages to trigger LLM
    if message_in.role != "user":
        raise HTTPException(status_code=400, detail="Only user messages are accepted.")

    # Save user message
    user_message = Message(chat_id=chat_id, role="user", content=message_in.content)
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Build context list of last 5 messages (including new user message)
    all_messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at)
        .all()
    )
    context = [{"role": msg.role, "content": msg.content} for msg in all_messages[-5:]]

    async def stream_response() -> AsyncGenerator[str, None]:
        try:
            # Stream assistant reply with context
            assistant_content = ""
            async for chunk in llm_service.generate_response_stream(
                message_in.content, context
            ):
                assistant_content += chunk
                response_chunk = {
                    "type": "token",
                    "content": chunk,
                    "id": f"streaming-{user_message.id}",
                }
                yield json.dumps(response_chunk) + "\n"

            # Save the complete assistant message
            assistant_message = Message(
                chat_id=chat_id, role="assistant", content=assistant_content
            )
            db.add(assistant_message)
            db.commit()
            db.refresh(assistant_message)

            # Send completion signal
            completion_chunk = {
                "type": "complete",
                "id": assistant_message.id,
            }
            yield json.dumps(completion_chunk) + "\n"

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            error_chunk = {
                "type": "error",
                "content": "Sorry, something went wrong. Please try again later.",
                "id": f"error-{user_message.id}",
            }
            yield json.dumps(error_chunk) + "\n"

    return StreamingResponse(
        stream_response(),
        media_type="application/json",
    )


@router.get("/", response_model=List[ChatRead])
async def list_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(Chat.updated_at.desc())
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


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Delete all messages first to maintain referential integrity
    db.query(Message).filter(Message.chat_id == chat_id).delete()
    db.delete(chat)
    db.commit()
