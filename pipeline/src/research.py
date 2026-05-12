"""
Step 1: Evidence-based topic selection.

WITHOUT Apify: Claude picks a topic from training knowledge alone.
WITH    Apify: Claude reads real Google News, YouTube gap analysis,
               Reddit questions, and Google Trends — then picks the
               highest-opportunity topic backed by actual data.

Set APIFY_API_TOKEN in .env to unlock the full intelligence layer.
"""

import json, re
import anthropic
from config import Config


# ─────────────────────────────────────────────────────────────────────────────
# Prompt: Claude WITHOUT Apify data (baseline)
# ─────────────────────────────────────────────────────────────────────────────
PROMPT_BASIC = """You are a YouTube channel strategist for "{channel}".
Style: {style} | Niche: {niche}

Suggest ONE high-potential AI/ML explainer video topic for this week.

Pick a topic that:
- Has high search demand right now
- Has a fresh angle not overdone by existing videos
- Works as a 7-9 min explainer for curious non-technical people
- Has good stock footage availability

Respond ONLY with valid JSON:
{{
  "title": "YouTube title (compelling, under 65 chars)",
  "topic": "One sentence on what the video covers",
  "description": "YouTube description (150-200 words with natural keywords, end with a comment question)",
  "tags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"],
  "pexels_terms": ["term1","term2","term3"],
  "thumbnail_headline": "3-5 word bold thumbnail hook",
  "hook": "Opening 2 sentences — surprising fact or provocative question",
  "target_audience": "Who this is for",
  "why_this_week": "Why this topic is timely right now"
}}"""


# ─────────────────────────────────────────────────────────────────────────────
# Prompt: Claude WITH Apify intelligence data
# ─────────────────────────────────────────────────────────────────────────────
PROMPT_WITH_INTEL = """You are a YouTube channel strategist for "{channel}".
Style: {style} | Niche: {niche}

You have been given real-time research intelligence. Use it to pick the single
highest-opportunity AI/ML explainer video topic for this week.

━━━ LIVE INTELLIGENCE REPORT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📰 TRENDING AI NEWS RIGHT NOW:
{news}

📺 YOUTUBE COMPETITION ANALYSIS (what's already ranking):
{youtube}

💬 REAL AUDIENCE QUESTIONS (Reddit — sorted by engagement):
{reddit}

📈 GOOGLE TRENDS (search volume this week):
{trends}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANALYSIS INSTRUCTIONS:
1. Look for topics where news is trending BUT YouTube coverage is thin or low-quality
2. Look for Reddit questions that have high upvotes — that's real demand with no good answer yet
3. Prefer topics where Google Trends shows rising interest (not just peak)
4. The best opportunity = trending news + Reddit demand + weak YouTube competition

Pick ONE topic. Make it specific and niche enough to rank, but broad enough to appeal.

Respond ONLY with valid JSON:
{{
  "title": "YouTube title (compelling, under 65 chars, no clickbait)",
  "topic": "One sentence on what the video covers",
  "description": "YouTube description (150-200 words, keywords natural, ends with comment question)",
  "tags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"],
  "pexels_terms": ["term1","term2","term3"],
  "thumbnail_headline": "3-5 word bold thumbnail hook",
  "hook": "Opening 2 sentences — surprising fact or question from the real data above",
  "target_audience": "Who this is for",
  "why_this_week": "Specific reason from the data why this topic wins right now",
  "opportunity_score": 8,
  "data_signals": ["Signal 1 from the data that supports this choice", "Signal 2", "Signal 3"]
}}"""


def _format_news(news: list) -> str:
    if not news:
        return "No news data available."
    lines = []
    for n in news[:6]:
        lines.append(f"• [{n.get('source','')}] {n.get('title','')} — {n.get('snippet','')[:120]}")
    return "\n".join(lines)


def _format_youtube(videos: list) -> str:
    if not videos:
        return "No YouTube data available."
    lines = []
    seen_topics = {}
    for v in videos:
        topic = v.get("search_topic", "")
        if topic not in seen_topics:
            seen_topics[topic] = []
        seen_topics[topic].append(v)
    for topic, vids in seen_topics.items():
        lines.append(f"\nSearch: '{topic}'")
        for v in vids[:4]:
            views = v.get("views", 0)
            views_str = f"{views:,}" if isinstance(views, int) else str(views)
            lines.append(f"  • {v.get('title','')} | {views_str} views | {v.get('channel','')}")
    return "\n".join(lines)


def _format_reddit(posts: list) -> str:
    if not posts:
        return "No Reddit data available."
    lines = []
    for p in posts[:8]:
        lines.append(
            f"• r/{p.get('subreddit','')} | ↑{p.get('score',0)} | "
            f"{p.get('comments',0)} comments — \"{p.get('title','')}\""
        )
    return "\n".join(lines)


def _format_trends(trends: list) -> str:
    if not trends:
        return "No trends data available."
    lines = []
    for t in trends:
        rising = t.get("rising_queries", [])
        rising_str = ", ".join(str(q) for q in rising[:3]) if rising else "none"
        lines.append(
            f"• '{t.get('keyword','')}' — interest: {t.get('interest','?')} | "
            f"rising queries: {rising_str}"
        )
    return "\n".join(lines)


def get_topic(config: Config) -> dict:
    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

    # ── Try Apify-enhanced research first ─────────────────────────────────────
    intel = None
    if config.APIFY_API_TOKEN:
        try:
            from src.apify_research import run_full_research
            print("[research] Running Apify intelligence layer...")
            intel = run_full_research(config.APIFY_API_TOKEN)
        except Exception as e:
            print(f"[research] Apify research failed ({e}), falling back to basic mode")

    # ── Build the right prompt ─────────────────────────────────────────────────
    if intel:
        prompt = PROMPT_WITH_INTEL.format(
            channel=config.CHANNEL_NAME,
            style=config.CHANNEL_STYLE,
            niche=config.NICHE,
            news=_format_news(intel["news"]),
            youtube=_format_youtube(intel["youtube_competition"]),
            reddit=_format_reddit(intel["reddit_questions"]),
            trends=_format_trends(intel["google_trends"]),
        )
        print("[research] Sending intelligence report to Claude for topic selection...")
    else:
        prompt = PROMPT_BASIC.format(
            channel=config.CHANNEL_NAME,
            style=config.CHANNEL_STYLE,
            niche=config.NICHE,
        )
        print("[research] Asking Claude for topic (no Apify data)...")

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.content[0].text
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    topic = json.loads(match.group() if match else raw)

    if intel:
        topic["_research_signals"] = topic.get("data_signals", [])
        topic["_opportunity_score"] = topic.get("opportunity_score", "N/A")

    print(f"[research] Topic selected: {topic['title']}")
    if topic.get("why_this_week"):
        print(f"[research] Why now: {topic['why_this_week']}")
    if topic.get("_opportunity_score"):
        print(f"[research] Opportunity score: {topic['_opportunity_score']}/10")

    return topic
