"""
AI Channel Automation Pipeline
================================
Run locally:    python pipeline.py
Run on Actions: triggered by GitHub Actions cron (see .github/workflows/weekly_video.yml)

Flow:
  1. Research  → Claude picks a trending AI topic
  2. Script    → Claude writes a full 7-9 min structured script
  3. Voiceover → edge-tts (free) or ElevenLabs converts script to audio
  4. Footage   → Pexels API downloads matching stock video clips
  5. Video     → FFmpeg composes final 1080p video
  6. Thumbnail → Pillow generates a YouTube thumbnail
  7. Upload    → YouTube Data API uploads video + thumbnail
"""

import os, sys, json, shutil
from datetime import datetime
from pathlib import Path

from config import Config
from src.research   import get_topic
from src.script     import write_script
from src.voiceover  import generate_all_audio
from src.footage    import fetch_footage_for_sections
from src.video      import compose_video
from src.thumbnail  import generate_thumbnail
from src.uploader   import upload_to_youtube


def run():
    config = Config()
    config.validate()

    # ── Output directory for this run ────────────────────────
    run_id     = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = str(Path(config.OUTPUT_DIR) / run_id)
    os.makedirs(output_dir, exist_ok=True)
    print(f"\n{'='*60}")
    print(f"  AI Channel Pipeline — Run {run_id}")
    print(f"{'='*60}\n")

    # ── Step 1: Research ─────────────────────────────────────
    print("[ STEP 1 / 7 ] Researching topic with Claude...")
    topic = get_topic(config)
    _save_json(topic, output_dir, "topic.json")

    # ── Step 2: Script ───────────────────────────────────────
    print("\n[ STEP 2 / 7 ] Writing script with Claude...")
    script = write_script(topic, config)
    _save_json(script, output_dir, "script.json")

    # ── Step 3: Voiceover ─────────────────────────────────────
    print("\n[ STEP 3 / 7 ] Generating voiceover...")
    audio_sections = generate_all_audio(script, output_dir, config)

    # ── Step 4: Footage ───────────────────────────────────────
    print("\n[ STEP 4 / 7 ] Fetching stock footage from Pexels...")
    sections_with_footage = fetch_footage_for_sections(audio_sections, output_dir, config)

    # ── Step 5: Video ─────────────────────────────────────────
    print("\n[ STEP 5 / 7 ] Composing video with FFmpeg...")
    video_path = compose_video(sections_with_footage, output_dir, config)

    # ── Step 6: Thumbnail ─────────────────────────────────────
    print("\n[ STEP 6 / 7 ] Generating thumbnail...")
    thumbnail_path = generate_thumbnail(topic, output_dir, config)

    # ── Step 7: Upload ────────────────────────────────────────
    print("\n[ STEP 7 / 7 ] Uploading to YouTube...")
    url = upload_to_youtube(video_path, thumbnail_path, topic, config)

    # ── Done ──────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  DONE! Video live at: {url}")
    print(f"  Title: {topic['title']}")
    print(f"{'='*60}\n")

    _save_json({"url": url, "topic": topic, "run_id": run_id}, output_dir, "result.json")
    return url


def _save_json(data: dict, directory: str, filename: str):
    with open(Path(directory) / filename, "w") as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        print("\nPipeline interrupted.")
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Pipeline failed: {e}")
        raise
