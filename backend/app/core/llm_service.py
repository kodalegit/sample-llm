import logging
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

    async def generate_response(self, query: str, title_mode: bool = False, context: list = None) -> str:
        if not self.client:
            return "LLM service is not properly configured. Please check server logs."
        try:
            if title_mode:
                system_prompt = "Generate a short, descriptive title (max 7 words) for the following user query. Return only the title, no punctuation or quotes."
                prompt = ChatPromptTemplate.from_messages(
                    [("system", system_prompt), ("human", "{input}")]
                )
            else:
                system_prompt = "You are a helpful travel document assistant. When asked about travel requirements, provide a well-structured response with the following sections: 1. Required visa documentation, 2. Passport requirements, 3. Additional necessary documents, 4. Relevant travel advisories. Be concise, accurate, and helpful."
                
                # Build the prompt with context if provided
                if context and len(context) > 0:
                    # Take last 5 messages
                    recent_context = context[-5:] if len(context) > 5 else context
                    messages = [("system", system_prompt)]
                    for msg in recent_context:
                        messages.append((msg["role"], msg["content"]))
                    messages.append(("human", "{input}"))
                    prompt = ChatPromptTemplate.from_messages(messages)
                else:
                    prompt = ChatPromptTemplate.from_messages(
                        [("system", system_prompt), ("human", "{input}")]
                    )
            chain = prompt | self.client
            result = await chain.ainvoke({"input": query})
            return result.content
        except Exception as e:
            logger.error(f"Error generating Gemini response: {str(e)}")
            return f"Error generating response: {str(e)}"

    async def generate_response_stream(self, query: str, context: list = None) -> AsyncGenerator[str, None]:
        """Stream response tokens from the LLM"""
        if not self.client:
            yield "LLM service is not properly configured. Please check server logs."
            return

        try:
            system_prompt = "You are a helpful travel document assistant. When asked about travel requirements, provide a well-structured response with the following sections: 1. Required visa documentation, 2. Passport requirements, 3. Additional necessary documents, 4. Relevant travel advisories. Be concise, accurate, and helpful."
            
            # Build the prompt with context if provided
            if context and len(context) > 0:
                # Take last 5 messages
                recent_context = context[-5:] if len(context) > 5 else context
                messages = [("system", system_prompt)]
                for msg in recent_context:
                    messages.append((msg["role"], msg["content"]))
                messages.append(("human", "{input}"))
                prompt = ChatPromptTemplate.from_messages(messages)
            else:
                prompt = ChatPromptTemplate.from_messages(
                    [("system", system_prompt), ("human", "{input}")]
                )
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
