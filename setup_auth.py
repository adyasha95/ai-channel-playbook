from google_auth_oauthlib.flow import InstalledAppFlow
import json

CLIENT_CONFIG = {
    "installed": {
        "client_id": "1012509967757-vmrqgn5ub01h5jh84knepr66vode28q8.apps.googleusercontent.com",
        "client_secret": "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",
        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
    }
}

SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube"]

flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, SCOPES)
creds = flow.run_local_server(port=0)

print("\n✅ Copy these into your .env file:")
print(f"GOOGLE_REFRESH_TOKEN={creds.refresh_token}")
