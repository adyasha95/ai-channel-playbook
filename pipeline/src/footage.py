"""
Step 4: Fetch free stock footage from Pexels for each script section.
Falls back to generic AI/tech footage if a specific search returns nothing.
"""

import os, requests, time
from pathlib import Path
from config import Config

FALLBACK_TERMS = ["artificial intelligence", "technology", "computer", "data", "future"]
PEXELS_VIDEO_API = "https://api.pexels.com/videos/search"


def search_pexels_video(query: str, api_key: str, min_duration: int = 10) -> dict | None:
    headers = {"Authorization": api_key}
    params = {"query": query, "per_page": 10, "orientation": "landscape", "size": "large"}

    r = requests.get(PEXELS_VIDEO_API, headers=headers, params=params)
    r.raise_for_status()
    videos = r.json().get("videos", [])

    # Prefer clips that are at least min_duration seconds
    for video in videos:
        for file in video.get("video_files", []):
            if (file.get("quality") in ("hd", "uhd") and
                    file.get("width", 0) >= 1280 and
                    video.get("duration", 0) >= min_duration):
                return {"url": file["link"], "duration": video["duration"], "id": video["id"]}

    # Fallback: accept any quality
    if videos:
        v = videos[0]
        files = sorted(v.get("video_files", []), key=lambda f: f.get("width", 0), reverse=True)
        if files:
            return {"url": files[0]["link"], "duration": v.get("duration", 30), "id": v["id"]}
    return None


def download_clip(url: str, path: str) -> str:
    r = requests.get(url, stream=True, timeout=60)
    r.raise_for_status()
    with open(path, "wb") as f:
        for chunk in r.iter_content(chunk_size=1024 * 512):
            f.write(chunk)
    return path


def fetch_footage_for_sections(audio_sections: list, output_dir: str, config: Config) -> list:
    """Download a Pexels clip for every script section."""
    clips_dir = Path(output_dir) / "clips"
    clips_dir.mkdir(parents=True, exist_ok=True)

    results = []
    used_ids = set()  # avoid reusing the same clip back-to-back

    for item in audio_sections:
        section = item["section"]
        duration_needed = item["duration"]
        search_term = section.get("pexels_search", "technology")

        print(f"[footage] Searching Pexels for '{search_term}' (section {section['id']})")

        clip_path = str(clips_dir / f"clip_{section['id']:02d}.mp4")
        video_info = None

        # Try the section's own search term first, then fallbacks
        for term in [search_term] + FALLBACK_TERMS:
            video_info = search_pexels_video(term, config.PEXELS_API_KEY,
                                              min_duration=min(int(duration_needed), 10))
            if video_info and video_info["id"] not in used_ids:
                break
            time.sleep(0.3)  # respect rate limit

        if video_info:
            used_ids.add(video_info["id"])
            print(f"[footage] Downloading clip for section {section['id']}...")
            download_clip(video_info["url"], clip_path)
            results.append({**item, "clip_path": clip_path, "clip_duration": video_info["duration"]})
        else:
            print(f"[footage] WARNING: No clip found for section {section['id']}, using placeholder")
            results.append({**item, "clip_path": None, "clip_duration": duration_needed})

        time.sleep(0.5)  # be polite to Pexels API

    return results
