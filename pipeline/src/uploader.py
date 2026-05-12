"""
Step 7: Upload the finished video and thumbnail to YouTube.
Uses OAuth 2.0 refresh token (run setup.py once locally to generate it).
"""

import os, json, time
from pathlib import Path
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from config import Config

SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube"]


def _get_youtube_client(config: Config):
    creds = Credentials(
        token=None,
        refresh_token=config.GOOGLE_REFRESH_TOKEN,
        client_id=config.GOOGLE_CLIENT_ID,
        client_secret=config.GOOGLE_CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token",
        scopes=SCOPES,
    )
    creds.refresh(Request())
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def upload_to_youtube(video_path: str, thumbnail_path: str,
                      topic: dict, config: Config) -> str:
    print("[upload] Authenticating with YouTube...")
    youtube = _get_youtube_client(config)

    body = {
        "snippet": {
            "title": topic["title"],
            "description": topic.get("description", topic["topic"]),
            "tags": topic.get("tags", []),
            "categoryId": config.YOUTUBE_CATEGORY_ID,
            "defaultLanguage": "en",
        },
        "status": {
            "privacyStatus": config.YOUTUBE_PRIVACY,
            "selfDeclaredMadeForKids": False,
        }
    }

    media = MediaFileUpload(video_path, mimetype="video/mp4",
                            resumable=True, chunksize=5 * 1024 * 1024)

    print(f"[upload] Uploading video: {topic['title']}")
    request = youtube.videos().insert(part=",".join(body.keys()), body=body, media_body=media)

    video_id = None
    while video_id is None:
        status, response = request.next_chunk()
        if response:
            video_id = response["id"]
        elif status:
            pct = int(status.progress() * 100)
            print(f"[upload] Progress: {pct}%", end="\r")

    print(f"\n[upload] Video uploaded: https://youtu.be/{video_id}")

    # Set thumbnail (non-fatal — requires YouTube channel verification)
    if thumbnail_path and os.path.exists(thumbnail_path):
        try:
            print("[upload] Setting thumbnail...")
            youtube.thumbnails().set(
                videoId=video_id,
                media_body=MediaFileUpload(thumbnail_path, mimetype="image/jpeg")
            ).execute()
            print("[upload] Thumbnail set.")
        except Exception as e:
            print(f"[upload] Thumbnail skipped (verify channel at youtube.com/verify): {e}")

    return f"https://youtu.be/{video_id}"
