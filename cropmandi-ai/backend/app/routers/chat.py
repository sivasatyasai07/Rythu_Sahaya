import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from google import genai
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["AI Chatbot Agent"])

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    history: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    reply: str
    source: str = "gemini"
    model: str

@router.post("", response_model=ChatResponse)
async def chat_with_gemini(req: ChatRequest):
    """
    AI Agricultural Chatbot powered by Google Gemini API.
    Provides verified mandi insights, crop disease advice, and scheme guidance in multiple Indian languages.
    """
    user_query = req.message.strip()
    if not user_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    api_key = (settings.GEMINI_API_KEY or "").strip()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured on the server."
        )

    lang_map = {
        "te": "Telugu (తెలుగు)",
        "hi": "Hindi (हिंदी)",
        "ml": "Malayalam (മലയാളം)",
        "ta": "Tamil (தமிழ்)",
        "en": "English",
    }
    target_language = lang_map.get(req.language, "English")

    system_instruction = (
        f"You are Rythu Sahaya, an expert agricultural AI advisor for farmers in Andhra Pradesh and across India. "
        f"Motto: Better Market. Best Price. Save Time. "
        f"You specialize in APMC market mandi prices, crop disease prevention and diagnosis, weather advisory, and government farmer schemes "
        f"(such as PM-KISAN, Annadata Sukhibhava, PM Fasal Bima Yojana, and Kisan Credit Card). "
        f"Language requirement: You MUST respond strictly in {target_language}. "
        f"Tone & formatting rules: "
        f"1. Give a direct, factual, practical, and concise answer directly addressing the farmer's question. "
        f"2. Do NOT use introductory filler like 'Namaste', 'I am Rythu Sahaya AI', or conversational introductions. "
        f"3. Keep responses within 2 to 4 clear, well-structured sentences or concise bullet points with exact figures."
    )

    prompt = f"{system_instruction}\n\nFarmer's Question: {user_query}"

    candidate_models = [
        settings.GEMINI_MODEL or "gemini-3.6-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash"
    ]

    client = genai.Client(api_key=api_key)

    last_err = None
    for model_name in candidate_models:
        try:
            logger.info(f"Dispatching query to Gemini model '{model_name}'...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            if response and response.text:
                clean_text = response.text.strip()
                return ChatResponse(
                    reply=clean_text,
                    source="gemini",
                    model=model_name
                )
        except Exception as e:
            logger.warning(f"Model '{model_name}' failed: {e}")
            last_err = e
            continue

    logger.error(f"All Gemini models failed. Last error: {last_err}")
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Failed to fetch response from Gemini API: {str(last_err)}"
    )
