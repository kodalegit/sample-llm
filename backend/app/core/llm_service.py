import os
import logging
from typing import Dict, Any, Optional

from app.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LLMService:
    """Service for interacting with LLM providers"""
    
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        
        # Initialize the appropriate client based on provider
        if not self.api_key:
            logger.warning(f"No API key provided for {self.provider}. LLM functionality will be limited.")
        
        self._init_client()
    
    def _init_client(self):
        """Initialize the appropriate LLM client"""
        if self.provider == "openai":
            try:
                import openai
                openai.api_key = self.api_key
                self.client = openai
            except ImportError:
                logger.error("OpenAI package not installed. Run 'pip install openai'")
                self.client = None
        
        elif self.provider == "deepseek":
            try:
                import deepseek
                # Setup deepseek client
                self.client = deepseek.Client(api_key=self.api_key)
            except ImportError:
                logger.error("Deepseek package not installed. Run 'pip install deepseek'")
                self.client = None
        
        elif self.provider == "gemini":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai
            except ImportError:
                logger.error("Google Generative AI package not installed. Run 'pip install google-generativeai'")
                self.client = None
        
        elif self.provider == "claude":
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
            except ImportError:
                logger.error("Anthropic package not installed. Run 'pip install anthropic'")
                self.client = None
        
        else:
            logger.error(f"Unsupported LLM provider: {self.provider}")
            self.client = None
    
    async def generate_response(self, query: str) -> str:
        """Generate a response from the LLM based on the query"""
        if not self.client:
            return "LLM service is not properly configured. Please check server logs."
        
        try:
            # Define the prompt for travel document queries
            system_prompt = (
                "You are a helpful travel document assistant. When asked about travel requirements, "
                "provide a well-structured response with the following sections: "
                "1. Required visa documentation, "
                "2. Passport requirements, "
                "3. Additional necessary documents, "
                "4. Relevant travel advisories. "
                "Be concise, accurate, and helpful."
            )
            
            # Handle different LLM providers
            if self.provider == "openai":
                response = await self._generate_openai_response(system_prompt, query)
            elif self.provider == "deepseek":
                response = await self._generate_deepseek_response(system_prompt, query)
            elif self.provider == "gemini":
                response = await self._generate_gemini_response(system_prompt, query)
            elif self.provider == "claude":
                response = await self._generate_claude_response(system_prompt, query)
            else:
                response = "Unsupported LLM provider"
            
            return response
        
        except Exception as e:
            logger.error(f"Error generating LLM response: {str(e)}")
            return f"Error generating response: {str(e)}"
    
    async def _generate_openai_response(self, system_prompt: str, query: str) -> str:
        """Generate response using OpenAI"""
        try:
            response = await self.client.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    async def _generate_deepseek_response(self, system_prompt: str, query: str) -> str:
        """Generate response using Deepseek"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Deepseek API error: {str(e)}")
            raise
    
    async def _generate_gemini_response(self, system_prompt: str, query: str) -> str:
        """Generate response using Google's Gemini"""
        try:
            model = self.client.GenerativeModel(self.model)
            response = model.generate_content(
                [
                    system_prompt,
                    query
                ]
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            raise
    
    async def _generate_claude_response(self, system_prompt: str, query: str) -> str:
        """Generate response using Anthropic's Claude"""
        try:
            response = await self.client.messages.create(
                model=self.model,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": query}
                ],
                max_tokens=1000
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Claude API error: {str(e)}")
            raise


# Create a singleton instance
llm_service = LLMService()