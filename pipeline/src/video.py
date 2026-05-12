"""
Step 5: Compose the final video using FFmpeg.
- Loops/trims each Pexels clip to match voiceover duration
- Adds a semi-transparent caption bar with the section text (auto-wrapped)
- Adds a subtle dark vignette overlay for polish
- Concatenates all sections into one final video
"""

import subprocess, os, textwrap
from pathlib import Path
from config import Config

W, H = 1920, 1080
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"  # available on Ubuntu
CAPTION_FONT_SIZE = 42
CAPTION_COLOR = "white"
CAPTION_BOX_COLOR = "black@0.55"
INTRO_DURATION = 3  # seconds to show chapter title card


def _ffmpeg(cmd: list, label: str = ""):
    result = subprocess.run(["ffmpeg", "-y", "-loglevel", "error"] + cmd,
                            capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg failed [{label}]:\n{result.stderr}")


def _wrap_text(text: str, max_chars: int = 55) -> str:
    """Wrap long text for subtitle display."""
    return r"\n".join(textwrap.wrap(text[:220], max_chars))


def _loop_clip_to_duration(clip_path: str, duration: float, output_path: str):
    """Loop a video clip (no audio) to exactly fill the required duration."""
    # Calculate how many loops needed, add 1 for safety
    loops = max(1, int(duration / 5) + 2)
    _ffmpeg([
        "-stream_loop", str(loops),
        "-i", clip_path,
        "-t", str(duration),
        "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
        "-an",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        output_path
    ], "loop_clip")


def _add_caption(video_path: str, caption: str, duration: float, output_path: str):
    """Burn a caption bar onto the video."""
    wrapped = _wrap_text(caption)
    drawtext = (
        f"drawtext=fontfile='{FONT_PATH}'"
        f":text='{wrapped}'"
        f":fontcolor={CAPTION_COLOR}"
        f":fontsize={CAPTION_FONT_SIZE}"
        f":box=1:boxcolor={CAPTION_BOX_COLOR}:boxborderw=20"
        f":x=(w-text_w)/2:y=h-text_h-60"
        f":line_spacing=8"
    )
    _ffmpeg([
        "-i", video_path,
        "-vf", drawtext,
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "copy",
        output_path
    ], "add_caption")


def _merge_audio_video(video_path: str, audio_path: str, duration: float, output_path: str):
    """Combine video and audio, trim to audio duration."""
    _ffmpeg([
        "-i", video_path,
        "-i", audio_path,
        "-t", str(duration),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        output_path
    ], "merge_av")


def _create_placeholder_clip(duration: float, text: str, output_path: str):
    """Create a black clip with text (fallback when no Pexels footage found)."""
    wrapped = _wrap_text(text, 40)
    drawtext = (
        f"drawtext=fontfile='{FONT_PATH}'"
        f":text='{wrapped}'"
        f":fontcolor=white:fontsize=48"
        f":x=(w-text_w)/2:y=(h-text_h)/2"
    )
    _ffmpeg([
        "-f", "lavfi", "-i", f"color=c=black:size={W}x{H}:duration={duration}:rate={30}",
        "-vf", drawtext,
        "-c:v", "libx264", "-preset", "fast",
        output_path
    ], "placeholder")


def compose_video(sections_with_footage: list, output_dir: str, config: Config) -> str:
    work_dir = Path(output_dir) / "work"
    work_dir.mkdir(parents=True, exist_ok=True)
    segment_paths = []

    for item in sections_with_footage:
        section  = item["section"]
        audio    = item["audio_path"]
        clip     = item.get("clip_path")
        duration = item["duration"]
        idx      = section["id"]

        print(f"[video] Composing section {idx}: {section['title']} ({duration:.1f}s)")

        # 1. Prepare video layer (loop Pexels clip or placeholder)
        looped = str(work_dir / f"{idx:02d}_looped.mp4")
        if clip and os.path.exists(clip):
            _loop_clip_to_duration(clip, duration, looped)
        else:
            _create_placeholder_clip(duration, section["title"], looped)

        # 2. Add caption overlay
        caption_text = section["narration"][:180].replace("'", "\\'").replace(":", "\\:")
        captioned = str(work_dir / f"{idx:02d}_captioned.mp4")
        _add_caption(looped, caption_text, duration, captioned)

        # 3. Merge with audio
        segment = str(work_dir / f"{idx:02d}_segment.mp4")
        _merge_audio_video(captioned, audio, duration, segment)
        segment_paths.append(segment)

    # 4. Concatenate all segments
    print(f"[video] Concatenating {len(segment_paths)} segments...")
    concat_list = str(work_dir / "concat.txt")
    with open(concat_list, "w") as f:
        for p in segment_paths:
            f.write(f"file '{p}'\n")

    final_path = str(Path(output_dir) / "final_video.mp4")
    _ffmpeg([
        "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        final_path
    ], "concatenate")

    size_mb = os.path.getsize(final_path) / (1024 * 1024)
    print(f"[video] Final video: {final_path} ({size_mb:.1f} MB)")
    return final_path
