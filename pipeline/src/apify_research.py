"""
Apify-powered research layer.
Scrapes real data from Google News, YouTube, Reddit, and Google Trends
before Claude picks the video topic — so every decision is evidence-based.

Actors used (all free or very cheap):
  - data_xplorer/google-news-scraper-fast   ~$0.004/article  ← AI news right now
  - scrapesmith/youtube-free-search-scraper  FREE             ← gap analysis
  - betterdevsscrape/reddit-scraper          $0.003/result    ← what people ask
  - joyouscam35875/google-trends-scraper     FREE             ← search volume proof

Total cost per pipeline run: ~$0.05–0.10 extra
"""

import os, time, requests
from typing import Optional

APIFY_BASE = "https://api.apify.com/v2"


class ApifyClient:
    def __init__(self, token: str):
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"}

    def run_actor(self, actor_id: str, input_data: dict,
                  timeout_secs: int = 300) -> list:
        """Run an Apify actor synchronously and return output items.
        201 = run started but timed out (increase timeout or poll).
        200 = success with data.
        """
        url = f"{APIFY_BASE}/acts/{actor_id}/run-sync-get-dataset-items"
        params = {"token": self.token, "timeout": timeout_secs, "memory": 256}
        r = requests.post(url, json=input_data, params=params, timeout=timeout_secs + 60)
        if r.status_code == 200:
            data = r.json()
            return data if isinstance(data, list) else data.get("items", [])
        print(f"  [apify] Warning: {actor_id} returned {r.status_code} — skipping")
        return []


# ── 1. Google News ─────────────────────────────────────────────────────────────

def get_ai_news(client: ApifyClient, max_articles: int = 8) -> list:
    """Get the latest AI/ML news headlines from Google News."""
    print("[apify] Fetching AI news from Google News...")
    results = client.run_actor("data_xplorer~google-news-scraper-fast", {
        "keywords": [
            "artificial intelligence breakthrough",
            "AI agent autonomous",
            "large language model new",
            "AI explained simply",
        ],
        "topics": ["TECHNOLOGY"],
        "maxArticles": max(4, max_articles // 2),
        "timeframe": "7d",
        "region_language": "US:en",
    })
    articles = [
        {
            "title": r.get("title", ""),
            "source": r.get("source", ""),
            "snippet": r.get("description", r.get("snippet", "")),
            "date": r.get("publishedAt", r.get("date", "")),
        }
        for r in results if r.get("title")
    ]
    print(f"  [apify] Got {len(articles)} news articles")
    return articles[:max_articles]


# ── 2. YouTube Gap Analysis ────────────────────────────────────────────────────

def get_youtube_competition(client: ApifyClient, topics: list) -> list:
    """Search YouTube for existing videos on our topics — find the gaps.

    Uses searchTerms (array) per the scrapesmith/youtube-free-search-scraper schema.
    Batch all topics in one call to save costs.
    """
    print("[apify] Analyzing YouTube competition...")
    search_terms = [t for t in topics[:5]]   # up to 5 search queries
    results = client.run_actor("scrapesmith~youtube-free-search-scraper", {
        "searchTerms": search_terms,
        "maxResultsPerQuery": 8,
    })
    all_videos = [
        {
            "title": r.get("title", ""),
            "views": r.get("views", r.get("viewCount", 0)),
            "likes": r.get("likes", r.get("likeCount", 0)),
            "channel": r.get("channel_name", r.get("channelName", "")),
            "subscribers": r.get("subscribers", 0),
            "published": r.get("date_posted", r.get("publishedAt", "")),
            "search_topic": r.get("source_input", ""),
        }
        for r in results if r.get("title")
    ]
    print(f"  [apify] Analyzed {len(all_videos)} competing YouTube videos")
    return all_videos


# ── 3. Reddit Real Questions ───────────────────────────────────────────────────

def get_reddit_questions(client: ApifyClient, max_posts: int = 15) -> list:
    """Find what questions people are genuinely asking about AI on Reddit."""
    print("[apify] Scraping Reddit for real audience questions...")
    subreddits = ["artificial", "ChatGPT", "MachineLearning", "singularity"]
    all_posts = []

    for sub in subreddits[:2]:  # keep costs low
        results = client.run_actor("betterdevsscrape~reddit-scraper", {
            "startUrls": [{"url": f"https://www.reddit.com/r/{sub}/hot/"}],
            "maxItems": 8,
            "includeComments": False,
        })
        posts = [
            {
                "title": r.get("title", ""),
                "score": r.get("score", 0),
                "comments": r.get("numComments", 0),
                "subreddit": sub,
            }
            for r in results if r.get("title") and r.get("score", 0) > 10
        ]
        all_posts.extend(posts)
        time.sleep(1)

    # Sort by engagement (score + comments)
    all_posts.sort(key=lambda x: x["score"] + x["comments"] * 2, reverse=True)
    print(f"  [apify] Got {len(all_posts)} high-engagement Reddit posts")
    return all_posts[:max_posts]


# ── 4. Google Trends Validation ────────────────────────────────────────────────

def get_trending_keywords(client: ApifyClient, keywords: list) -> list:
    """Validate search interest for candidate topics using Google Trends."""
    print("[apify] Checking Google Trends for search volume...")
    results = client.run_actor("joyouscam35875~google-trends-scraper", {
        "keywords": keywords[:5],
        "geo": "",
        "timeRange": "now 7-d",
    })
    trends = [
        {
            "keyword": r.get("keyword", ""),
            "interest": r.get("averageInterest", r.get("interest", 0)),
            "rising_queries": r.get("risingQueries", []),
        }
        for r in results if r.get("keyword")
    ]
    print(f"  [apify] Trends data for {len(trends)} keywords")
    return trends


# ── Master research function ───────────────────────────────────────────────────

def run_full_research(apify_token: str, candidate_topics: Optional[list] = None) -> dict:
    """
    Run all Apify research in sequence and return a structured intel report
    for Claude to analyze and pick the best video topic from.
    """
    client = ApifyClient(apify_token)

    default_topics = [
        "why AI agents fail explained",
        "how AI agents work simply",
        "AI hallucinations explained for beginners",
        "AI changing your job explained",
        "what is an AI agent non-technical",
    ]
    topics = candidate_topics or default_topics

    news     = get_ai_news(client)
    youtube  = get_youtube_competition(client, topics)
    reddit   = get_reddit_questions(client)
    trends   = get_trending_keywords(client, [t.split()[-1] for t in topics[:5]])

    return {
        "news": news,
        "youtube_competition": youtube,
        "reddit_questions": reddit,
        "google_trends": trends,
    }
