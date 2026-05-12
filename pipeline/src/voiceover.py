"""
Step 3: Convert each script section to audio.
Uses edge-tts (free Microsoft neural voices) by default.
Set ELEVENLABS_API_KEY in .env to upgrade to more natural voice.
"""

import asyncio, os, requests
from pathlib import Path
import edge_tts
from config import Config


async def _tts_edge(text: str, output_path: str, voice: str, rate: str):
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(output_path)


def generate_section_audio(text: str, output_path: str, config: Config) -> float:
    """Generate audio for one script section. Returns duration in seconds."""
    if config.ELEVENLABS_API_KEY:
        return _elevenlabs(text, output_path, config)
    else:
        asyncio.run(_tts_edge(text, output_path, config.VOICE, config.VOICE_RATE))
        return _get_audio_duration(output_path)


def _elevenlabs(text: str, output_path: str, config: Config) -> float:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{config.ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": config.ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_turbo_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}
    }
    r = requests.post(url, json=payload, headers=headers)
    r.raise_for_status()
    with open(output_path, "wb") as f:
        f.write(r.content)
    return _get_audio_duration(output_path)


def _get_audio_duration(path: str) -> float:
    """Get audio duration in seconds using ffprobe."""
    import subprocess, json
    result = subprocess.run([
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_streams", path
    ], capture_output=True, text=True)
    data = json.loads(result.stdout)
    for stream in data.get("streams", []):
        if "duration" in stream:
            return float(stream["duration"])
    return 60.0  # fallback


def generate_all_audio(script: dict, output_dir: str, config: Config) -> list:
    """Generate audio for all sections. Returns list of {section, audio_path, duration}."""
    audio_dir = Path(output_dir) / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    results = []
    for section in script["sections"]:
        path = str(audio_dir / f"section_{section['id']:02d}.mp3")
        print(f"[voiceover] Generating audio for section {section['id']}: {section['title']}")
        duration = generate_section_audio(section["narration"], path, config)
        results.append({
            "section": section,
            "audio_path": path,
            "duration": duration
        })
        print(f"[voiceover] Section {section['id']} → {duration:.1f}s")

    total = sum(r["duration"] for r in results)
    print(f"[voiceover] Total audio duration: {total:.0f}s ({total/60:.1f} min)")
    return results
