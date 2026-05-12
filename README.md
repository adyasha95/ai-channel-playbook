# AI Channel Automation Pipeline

An end-to-end agentic pipeline that researches, writes, produces, and uploads AI explainer videos to YouTube — fully automatically, every week, with no manual steps.

## How It Works

```
Claude (topic + script) → edge-tts (voiceover) → Pexels (stock footage)
   → FFmpeg (video composition) → Pillow (thumbnail) → YouTube API (upload)
```

Each Monday, GitHub Actions runs the pipeline automatically. One command also runs it on demand locally.

## Pipeline Steps

| Step | Tool | What Happens |
|------|------|--------------|
| 1. Research | **Apify + Claude** | Scrapes Google News, YouTube gaps, Reddit questions, Google Trends → Claude picks the highest-opportunity topic from real data |
| 2. Script | Claude API | Writes a structured 7-9 min explainer script |
| 3. Voiceover | edge-tts / ElevenLabs | Converts each section to audio |
| 4. Footage | Pexels API (free) | Downloads matching stock video clips |
| 5. Video | FFmpeg | Composes final 1080p video with captions |
| 6. Thumbnail | Pillow | Generates a branded YouTube thumbnail |
| 7. Upload | YouTube Data API | Uploads video + thumbnail, sets title/tags/description |

### Research Intelligence (Step 1 detail)

When `APIFY_API_TOKEN` is set, the pipeline runs a 4-source intelligence sweep before Claude picks the topic:

| Source | Apify Actor | What It Finds |
|--------|-------------|---------------|
| Google News | `data_xplorer/google-news-scraper-fast` | AI topics breaking right now |
| YouTube | `scrapesmith/youtube-free-search-scraper` | Existing videos — reveals gaps with high demand but weak content |
| Reddit | `betterdevsscrape/reddit-scraper` | Real questions from r/artificial, r/ChatGPT — validated audience demand |
| Google Trends | `joyouscam35875/google-trends-scraper` | Rising vs. declining search interest |

Claude then cross-references all four signals to find the sweet spot: **trending news + real Reddit demand + weak YouTube competition = maximum click potential**.

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/adyasha95/ai-channel-playbook.git
cd ai-channel-playbook/pipeline
pip install -r requirements.txt
sudo apt install ffmpeg   # Ubuntu/macOS: brew install ffmpeg
```

### 2. Set up API keys

```bash
cp .env.example .env
# Fill in your keys (see API Setup below)
```

### 3. Authenticate YouTube (one time only)

```bash
# Download client_secret.json from Google Cloud Console first
python setup_youtube_auth.py
# Opens browser → log in → copies refresh token to terminal
# Paste the three values into your .env file
```

### 4. Run the pipeline

```bash
python pipeline.py
```

### 5. Set up GitHub Actions (for fully automatic weekly uploads)

Add these as repository secrets at `Settings → Secrets and variables → Actions`:

```
ANTHROPIC_API_KEY
PEXELS_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
ELEVENLABS_API_KEY     (optional)
```

The workflow in `.github/workflows/weekly_video.yml` runs every Monday at 8am UTC automatically.

## API Setup

| API | Cost | Where to Get |
|-----|------|--------------|
| Anthropic (Claude) | ~$0.20/video | console.anthropic.com |
| Pexels | Free | pexels.com/api |
| YouTube Data API | Free | console.cloud.google.com → Enable YouTube Data API v3 |
| **Apify** | **~$0.05–0.10/video** | **apify.com → Settings → Integrations (free tier available)** |
| ElevenLabs | Optional, ~$0.30/video | elevenlabs.io (upgrade for more natural voice) |

## Project Structure

```
pipeline/
├── pipeline.py                   # Main orchestrator — run this
├── config.py                     # All settings and env vars
├── setup_youtube_auth.py         # One-time YouTube OAuth setup
├── requirements.txt
├── .env.example
├── src/
│   ├── research.py               # Claude: topic selection
│   ├── script.py                 # Claude: script writing
│   ├── voiceover.py              # edge-tts / ElevenLabs: audio generation
│   ├── footage.py                # Pexels API: stock footage download
│   ├── video.py                  # FFmpeg: video composition
│   ├── thumbnail.py              # Pillow: thumbnail generation
│   └── uploader.py               # YouTube API: upload
└── .github/
    └── workflows/
        └── weekly_video.yml      # GitHub Actions: runs every Monday
```

## Customisation

- **Voice**: Change `VOICE` in `config.py` — any [edge-tts voice](https://github.com/rany2/edge-tts#voices) works
- **Upload schedule**: Edit the cron in `weekly_video.yml` (`0 8 * * 1` = Monday 8am UTC)
- **Privacy**: Set `YOUTUBE_PRIVACY=unlisted` to review before publishing
- **Channel style**: Edit `CHANNEL_STYLE` and `NICHE` in `config.py` to change the AI's persona

## Cost Per Video

| Item | Cost |
|------|------|
| Claude API (topic + script) | ~$0.15–0.25 |
| Pexels footage | Free |
| edge-tts voiceover | Free |
| YouTube upload | Free |
| GitHub Actions | Free (2,000 min/mo) |
| **Total** | **~$0.20/video** |

Upgrading to ElevenLabs adds ~$0.30/video for significantly better voice quality.
