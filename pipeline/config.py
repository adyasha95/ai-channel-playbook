import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # ── Required ──────────────────────────────────────────────
    ANTHROPIC_API_KEY   = os.getenv("ANTHROPIC_API_KEY")
    PEXELS_API_KEY      = os.getenv("PEXELS_API_KEY")       # free at pexels.com/api

    # ── YouTube (OAuth) ───────────────────────────────────────
    GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN")

    # ── Apify (research intelligence layer) ───────────────────
    APIFY_API_TOKEN     = os.getenv("APIFY_API_TOKEN")      # apify.com → free tier available

    # ── Optional upgrade ──────────────────────────────────────
    ELEVENLABS_API_KEY  = os.getenv("ELEVENLABS_API_KEY")   # swap in for better voice
    ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")

    # ── Video settings ────────────────────────────────────────
    OUTPUT_DIR          = os.getenv("OUTPUT_DIR", "./output")
    VIDEO_RESOLUTION    = (1920, 1080)
    VIDEO_FPS           = 30
    VOICE               = "en-US-AriaNeural"   # free Microsoft neural TTS
    VOICE_RATE          = "+5%"
    YOUTUBE_CATEGORY_ID = "28"                 # Science & Technology
    YOUTUBE_PRIVACY     = "public"             # public | unlisted | private

    # ── Channel identity ──────────────────────────────────────
    CHANNEL_NAME        = "Plain AI"
    CHANNEL_HANDLE      = "@PlainAI-channel"
    CHANNEL_URL         = "https://www.youtube.com/@PlainAI-channel"
    CHANNEL_STYLE       = "Cleo Abram — enthusiastic, uses analogies, non-technical, curious"
    NICHE               = "AI, machine learning, and emerging tech explained for everyday people"

    @classmethod
    def validate(cls):
        required = ["ANTHROPIC_API_KEY", "PEXELS_API_KEY",
                    "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"]
        missing = [k for k in required if not getattr(cls, k)]
        if missing:
            raise EnvironmentError(f"Missing required env vars: {', '.join(missing)}")
