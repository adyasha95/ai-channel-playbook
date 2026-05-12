"""
Step 6: Generate a YouTube thumbnail using Pillow.
Formula: dark gradient background + bold headline + accent color bar.
No external image needed — fully programmatic.
"""

import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from config import Config

W, H = 1280, 720
FONT_SIZES = {"headline": 110, "subtext": 48, "channel": 36}


def _get_font(size: int):
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def _draw_gradient_bg(draw: ImageDraw.Draw, w: int, h: int):
    """Draw a dark blue-to-navy gradient background."""
    for y in range(h):
        ratio = y / h
        r = int(10  + ratio * 5)
        g = int(15  + ratio * 10)
        b = int(35  + ratio * 20)
        draw.line([(0, y), (w, y)], fill=(r, g, b))


def _draw_accent_bar(draw: ImageDraw.Draw, w: int, h: int, color=(14, 165, 233)):
    """Draw a horizontal accent bar near the bottom."""
    bar_h = 12
    draw.rectangle([(0, h - bar_h), (w, h)], fill=color)


def _draw_wrapped_text(draw: ImageDraw.Draw, text: str, font, x: int, y: int,
                       max_width: int, fill="white", shadow=True, line_spacing=20):
    """Draw word-wrapped text with optional drop shadow."""
    words = text.split()
    lines, current = [], ""
    for word in words:
        test = (current + " " + word).strip()
        bbox = font.getbbox(test)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    for i, line in enumerate(lines):
        ly = y + i * (font.getbbox(line)[3] + line_spacing)
        if shadow:
            draw.text((x + 3, ly + 3), line, font=font, fill=(0, 0, 0, 160))
        draw.text((x, ly), line, font=font, fill=fill)
    return y + len(lines) * (font.getbbox(lines[0])[3] + line_spacing)


def generate_thumbnail(topic: dict, output_dir: str, config: Config) -> str:
    img  = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img, "RGBA")

    _draw_gradient_bg(draw, W, H)
    _draw_accent_bar(draw, W, H)

    headline_font = _get_font(FONT_SIZES["headline"])
    sub_font      = _get_font(FONT_SIZES["subtext"])
    ch_font       = _get_font(FONT_SIZES["channel"])

    # Accent left bar
    draw.rectangle([(50, 80), (62, H - 100)], fill=(14, 165, 233))

    # Channel name (top right)
    ch_text = config.CHANNEL_NAME.upper()
    ch_bbox = ch_font.getbbox(ch_text)
    draw.text((W - ch_bbox[2] - 60, 50), ch_text, font=ch_font, fill=(148, 163, 184))

    # Main headline
    headline = topic.get("thumbnail_headline", topic["title"])
    headline = headline.upper()
    next_y = _draw_wrapped_text(draw, headline, headline_font,
                                 x=90, y=H // 2 - 180,
                                 max_width=W - 140,
                                 fill="white", shadow=True, line_spacing=18)

    # Subtext
    sub = topic.get("topic", "")[:80]
    _draw_wrapped_text(draw, sub, sub_font,
                       x=90, y=next_y + 30,
                       max_width=W - 140,
                       fill=(148, 163, 184), shadow=False)

    # "AI EXPLAINED" tag
    tag = "AI EXPLAINED"
    tag_font = _get_font(38)
    tag_bbox = tag_font.getbbox(tag)
    draw.rectangle([(90, 60), (90 + tag_bbox[2] + 30, 60 + tag_bbox[3] + 16)],
                   fill=(14, 165, 233))
    draw.text((105, 68), tag, font=tag_font, fill="white")

    output_path = str(Path(output_dir) / "thumbnail.jpg")
    img.save(output_path, "JPEG", quality=95)
    print(f"[thumbnail] Saved: {output_path}")
    return output_path
