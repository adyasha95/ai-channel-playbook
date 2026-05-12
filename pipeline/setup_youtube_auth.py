"""
Run this ONCE on your local machine to generate your YouTube OAuth refresh token.
The refresh token never expires and is what GitHub Actions uses to upload videos.

Steps:
  1. Create a project at console.cloud.google.com
  2. Enable YouTube Data API v3
  3. Create OAuth 2.0 credentials (Desktop app)
  4. Download client_secret.json and put it in this folder
  5. Run: python setup_youtube_auth.py
  6. A browser window opens — log in and grant permission
  7. Copy the refresh token printed at the end into your .env file
"""

import json
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube",
]

def main():
    flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", SCOPES)
    creds = flow.run_local_server(port=8080)

    print("\n" + "="*60)
    print("  SUCCESS — Copy these into your .env file:")
    print("="*60)
    print(f"  GOOGLE_CLIENT_ID     = {creds.client_id}")
    print(f"  GOOGLE_CLIENT_SECRET = {creds.client_secret}")
    print(f"  GOOGLE_REFRESH_TOKEN = {creds.refresh_token}")
    print("="*60)
    print("\nAlso add these as GitHub Actions secrets (Settings → Secrets).")

if __name__ == "__main__":
    main()
