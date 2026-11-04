"""Provider-agnostic AI service supporting OpenAI, Gemini, and local models."""

import json
import logging
from datetime import datetime, timezone
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)


class AIProvider:
    """Base class for AI providers."""

    async def transcribe(self, audio_path: str, language: str = "en") -> dict:
        raise NotImplementedError

    async def summarize(self, transcript: str) -> dict:
        raise NotImplementedError

    async def extract_actions(self, transcript: str) -> dict:
        raise NotImplementedError

    async def generate_follow_up(self, context: dict) -> dict:
        raise NotImplementedError

    async def chat(self, message: str, context: str = "") -> str:
        raise NotImplementedError


class OpenAIProvider(AIProvider):
    """OpenAI API integration."""

    def __init__(self):
        try:
            import openai
            self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI: {e}")
            self.client = None

    async def transcribe(self, audio_path: str, language: str = "en") -> dict:
        """Transcribe audio using Whisper."""
        if not self.client:
            return {"error": "OpenAI client not initialized"}

        try:
            with open(audio_path, "rb") as audio_file:
                response = await self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language,
                    response_format="verbose_json",
                    timestamp_granularities=["segment"],
                )

            segments = []
            if hasattr(response, "segments"):
                for i, seg in enumerate(response.segments):
                    segments.append({
                        "speaker_label": f"Speaker {i % 2 + 1}",
                        "text": seg.get("text", ""),
                        "start_time_ms": int(seg.get("start", 0) * 1000),
                        "end_time_ms": int(seg.get("end", 0) * 1000),
                        "confidence": seg.get("avg_logprob"),
                        "segment_order": i,
                    })

            return {
                "full_text": response.text,
                "segments": segments,
                "language": language,
                "confidence_score": None,
            }
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return {"error": str(e)}

    async def summarize(self, transcript: str) -> dict:
        """Generate conversation summary using GPT."""
        if not self.client:
            return {"error": "OpenAI client not initialized"}

        system_prompt = """You are an AI assistant that analyzes business conversation transcripts.
Generate a structured JSON response with these exact keys:
{
    "summary_text": "Brief 2-3 sentence summary of what was discussed",
    "client_requirements": ["requirement1", "requirement2"],
    "interest_level": "very_interested|interested|neutral|not_interested|unknown",
    "important_details": {
        "budget": "mentioned budget or null",
        "timeline": "mentioned timeline or null",
        "requirements": ["specific requirements"],
        "preferences": ["preferences mentioned"],
        "concerns": ["concerns raised"],
        "questions": ["questions asked"]
    },
    "user_commitments": ["what the user promised to do"],
    "client_commitments": ["what the client promised to do"],
    "next_steps": ["actionable next step 1", "actionable next step 2"],
    "suggested_follow_up_date": "ISO date string or null",
    "follow_up_message": "A contextual follow-up message the user can send",
    "sentiment_score": 0.0 to 1.0
}

Important rules:
- Do NOT fabricate commitments or details not present in the transcript
- Mark interest_level as "unknown" if there isn't enough evidence
- Be specific about what was actually discussed
- Generate actionable, concrete next steps"""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze this conversation transcript:\n\n{transcript}"},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )

            result = json.loads(response.choices[0].message.content)
            return result
        except Exception as e:
            logger.error(f"Summarization error: {e}")
            return {"error": str(e)}

    async def extract_actions(self, transcript: str) -> dict:
        """Extract action items and commitments from transcript."""
        if not self.client:
            return {"error": "OpenAI client not initialized"}

        system_prompt = """Extract action items from this conversation. Return JSON:
{
    "actions": [{"title": "action", "assignee": "user|client", "priority": "high|medium|low", "due_hint": "timeframe or null"}],
    "commitments": [{"who": "user|client", "what": "commitment description", "when": "timeframe or null"}],
    "follow_up_suggestion": {"date_hint": "suggested date", "reason": "why this date"}
}
Only include items explicitly mentioned. Never fabricate."""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": transcript},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            )

            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Action extraction error: {e}")
            return {"error": str(e)}

    async def generate_follow_up(self, context: dict) -> dict:
        """Generate a follow-up message based on context."""
        if not self.client:
            return {"error": "OpenAI client not initialized"}

        system_prompt = """Generate a professional, friendly follow-up message.
Return JSON:
{
    "message": "the follow-up message",
    "suggested_date": "ISO date string or null",
    "context": "brief context of why this follow-up"
}
Make the message natural and reference specific details from the conversation."""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Generate follow-up for: {json.dumps(context)}"},
                ],
                response_format={"type": "json_object"},
                temperature=0.5,
            )

            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Follow-up generation error: {e}")
            return {"error": str(e)}

    async def chat(self, message: str, context: str = "") -> str:
        """AI assistant chat with context awareness."""
        if not self.client:
            return "AI service is not available. Please check your API configuration."

        system_prompt = f"""You are CallPilot AI Assistant, a helpful assistant for managing calls and contacts.
You have access to the following context about the user's data:

{context}

Rules:
- Only reference information from the provided context
- Never fabricate conversation details, commitments, or contact information
- If asked about something not in context, say you don't have that information
- Provide source references when mentioning specific calls or contacts
- Be concise and actionable"""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                temperature=0.4,
            )

            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return f"Sorry, I encountered an error: {str(e)}"


class GeminiProvider(AIProvider):
    """Google Gemini API integration."""

    def __init__(self):
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            self.model = None

    async def transcribe(self, audio_path: str, language: str = "en") -> dict:
        """Gemini doesn't have dedicated STT - return info to use alternative."""
        return {"error": "Use OpenAI Whisper or local model for transcription"}

    async def summarize(self, transcript: str) -> dict:
        if not self.model:
            return {"error": "Gemini not initialized"}

        prompt = f"""Analyze this business conversation transcript and return a JSON object with these exact keys:
- summary_text: Brief 2-3 sentence summary
- client_requirements: array of requirements
- interest_level: one of very_interested, interested, neutral, not_interested, unknown
- important_details: object with budget, timeline, requirements, preferences, concerns, questions
- user_commitments: array of user promises
- client_commitments: array of client promises
- next_steps: array of actionable steps
- suggested_follow_up_date: ISO date or null
- follow_up_message: contextual follow-up message
- sentiment_score: 0.0 to 1.0

Only include information actually present in the transcript. Never fabricate.

Transcript:
{transcript}"""

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json", "temperature": 0.3},
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini summarization error: {e}")
            return {"error": str(e)}

    async def extract_actions(self, transcript: str) -> dict:
        if not self.model:
            return {"error": "Gemini not initialized"}

        prompt = f"""Extract action items from this conversation. Return JSON with:
- actions: array of {{title, assignee, priority, due_hint}}
- commitments: array of {{who, what, when}}
- follow_up_suggestion: {{date_hint, reason}}

Transcript: {transcript}"""

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json", "temperature": 0.2},
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini extraction error: {e}")
            return {"error": str(e)}

    async def generate_follow_up(self, context: dict) -> dict:
        if not self.model:
            return {"error": "Gemini not initialized"}

        prompt = f"""Generate a professional follow-up message. Return JSON with:
- message: the follow-up message
- suggested_date: ISO date or null
- context: brief context

Context: {json.dumps(context)}"""

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json", "temperature": 0.5},
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini follow-up error: {e}")
            return {"error": str(e)}

    async def chat(self, message: str, context: str = "") -> str:
        if not self.model:
            return "Gemini AI is not available."

        prompt = f"""You are CallPilot AI Assistant. Use this context about the user's data:

{context}

Rules: Only reference provided context. Never fabricate details. Be concise.

User: {message}"""

        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini chat error: {e}")
            return f"Sorry, I encountered an error: {str(e)}"


class LocalProvider(AIProvider):
    """Placeholder for local AI model integration."""

    async def transcribe(self, audio_path: str, language: str = "en") -> dict:
        return {"error": "Local transcription not yet configured. Please set up a local Whisper model."}

    async def summarize(self, transcript: str) -> dict:
        return {"error": "Local summarization not yet configured."}

    async def extract_actions(self, transcript: str) -> dict:
        return {"error": "Local action extraction not yet configured."}

    async def generate_follow_up(self, context: dict) -> dict:
        return {"error": "Local follow-up generation not yet configured."}

    async def chat(self, message: str, context: str = "") -> str:
        return "Local AI model is not yet configured. Please set up a compatible local model."


def get_ai_provider(provider_name: str | None = None) -> AIProvider:
    """Factory to get the appropriate AI provider."""
    name = provider_name or settings.DEFAULT_AI_PROVIDER

    providers = {
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
        "local": LocalProvider,
    }

    provider_class = providers.get(name, OpenAIProvider)
    return provider_class()
