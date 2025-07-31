import logging
from app.core.prompts import TITLE_GENERATION_PROMPT, CORE_SYSTEM_PROMPT
from typing import AsyncGenerator
from app.config import settings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LLMService:
    """Service for interacting with Gemini via LangChain"""

    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        try:
            self.client = ChatGoogleGenerativeAI(
                api_key=self.api_key, model=self.model, disable_streaming=False
            )
        except Exception as e:
            logger.error(f"Error initializing LangChain Gemini: {str(e)}")
            self.client = None

    async def generate_response(
        self, query: str, title_mode: bool = False, context: list = None
    ) -> str:
        if not self.client:
            return "LLM service is not properly configured. Please check server logs."
        try:
            if title_mode:
                # Generate a concise title based on the first user message
                prompt = ChatPromptTemplate.from_messages(
                    [("system", TITLE_GENERATION_PROMPT), ("human", "{input}")]
                )
                chain = prompt | self.client
                result = await chain.ainvoke({"input": query})
                # Extract first line as title and strip whitespace
                title = result.content.strip().split("\n")[0].strip()
                # Handle long titles by truncating with ellipses
                if not title:
                    return "Untitled Chat"
                words = title.split()
                if len(words) > 7:
                    title = " ".join(words[:7]) + "..."
                return title
            # Regular conversation response
            formatted_system_prompt = CORE_SYSTEM_PROMPT.format(
                chat_history=(
                    "\n".join(
                        f"{msg['role']}: {msg['content']}"
                        for msg in (context[-5:] if context else [])
                    )
                    if context
                    else "No previous messages"
                )
            )
            prompt = ChatPromptTemplate.from_messages(
                [("system", formatted_system_prompt), ("human", "{input}")]
            )
            chain = prompt | self.client
            result = await chain.ainvoke({"input": query})
            return result.content
        except Exception as e:
            logger.error(f"Error generating Gemini response: {str(e)}")
            return f"Error generating response: {str(e)}"

    async def generate_response_stream(
        self, query: str, context: list = None
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens from the LLM"""
        if not self.client:
            yield "LLM service is not properly configured. Please check server logs."
            return

        try:
            # Format system prompt with chat history if available
            formatted_system_prompt = CORE_SYSTEM_PROMPT.format(
                chat_history=(
                    "\n".join(
                        f"{msg['role']}: {msg['content']}"
                        for msg in (context[-5:] if context else [])
                    )
                    if context
                    else "No previous messages"
                )
            )

            # Build the prompt
            messages = [("system", formatted_system_prompt), ("human", "{input}")]
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | self.client

            # Stream the response
            async for chunk in chain.astream({"input": query}):
                if hasattr(chunk, "content"):
                    yield chunk.content
                else:
                    # Handle different chunk types
                    yield str(chunk)
        except Exception as e:
            logger.error(f"Error generating streaming response: {str(e)}")
            yield f"Error generating response: {str(e)}"


llm_service = LLMService()
