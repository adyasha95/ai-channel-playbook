"""
Step 2: Use Claude to write a full structured video script.
Returns sections with text, visual cues, and pexels search terms per section.
"""

import json, re
import anthropic
from config import Config


PROMPT = """You are a writer for "{channel}", a YouTube channel that explains AI like Cleo Abram explains tech.
Style: {style}

Write a complete 7-9 minute video script for this topic:
Title: {title}
Hook: {hook}
Topic: {topic}

SCRIPT RULES:
- Open with the hook provided — no "Hey guys welcome back"
- Use ONE clear analogy per complex concept
- Conversational, warm, enthusiastic — like talking to a smart friend
- Short sentences. Vary rhythm. Never monotone.
- No bullet points in narration — this is spoken word
- End with a genuine reflection question that makes viewers comment
- Total word count: 1,100-1,400 words (approx 7-9 min at 160wpm)

Return ONLY valid JSON in this exact format:
{{
  "sections": [
    {{
      "id": 1,
      "title": "Hook",
      "narration": "The full spoken text for this section",
      "visual_cue": "What should appear on screen — describe the visual",
      "pexels_search": "best 2-3 word search term for stock footage",
      "duration_estimate_seconds": 40
    }},
    ...
  ],
  "total_word_count": 1200,
  "call_to_action": "Subscribe and hit the bell if you want AI explained simply every week."
}}

Include these sections (in order): Hook, Background/Context, Core Explanation (split into 2-3 parts), Real-World Impact, What This Means For You, Reflection/Outro"""


def write_script(topic: dict, config: Config) -> dict:
    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": PROMPT.format(
                channel=config.CHANNEL_NAME,
                style=config.CHANNEL_STYLE,
                title=topic["title"],
                hook=topic["hook"],
                topic=topic["topic"],
            )
        }]
    )

    raw = response.content[0].text
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    script = json.loads(match.group() if match else raw)

    total_words = sum(len(s["narration"].split()) for s in script["sections"])
    print(f"[script] Written: {len(script['sections'])} sections, ~{total_words} words")
    return script
