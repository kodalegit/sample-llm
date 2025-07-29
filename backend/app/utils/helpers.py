import logging
from typing import Dict, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def format_travel_response(response_text: str) -> Dict[str, Any]:
    """Format the LLM response into structured sections"""
    try:
        # Default structure
        formatted_response = {
            "visa_documentation": [],
            "passport_requirements": [],
            "additional_documents": [],
            "travel_advisories": [],
            "raw_response": response_text
        }
        
        # Simple parsing logic - this could be enhanced with more sophisticated parsing
        current_section = None
        lines = response_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check for section headers
            lower_line = line.lower()
            if 'visa' in lower_line and ('documentation' in lower_line or 'requirements' in lower_line):
                current_section = 'visa_documentation'
                continue
            elif 'passport' in lower_line and 'requirements' in lower_line:
                current_section = 'passport_requirements'
                continue
            elif 'additional' in lower_line and ('documents' in lower_line or 'documentation' in lower_line):
                current_section = 'additional_documents'
                continue
            elif 'travel' in lower_line and ('advisories' in lower_line or 'advisory' in lower_line):
                current_section = 'travel_advisories'
                continue
            
            # Add content to current section if we have one
            if current_section and line:
                # Remove bullet points and numbering
                if line.startswith('-') or line.startswith('*'):
                    line = line[1:].strip()
                elif line[0].isdigit() and line[1:3] in ['. ', ') ']:
                    line = line[3:].strip()
                    
                formatted_response[current_section].append(line)
        
        return formatted_response
    except Exception as e:
        logger.error(f"Error formatting travel response: {str(e)}")
        return {"raw_response": response_text}