#!/usr/bin/env python3
"""
Generate the app's icon set.

The mark is a circle-of-fifths ring — twelve segments running through the
app's aurora palette — with a sine wave crossing it. It reads as "music
theory" at 1024px and as a bright ring at 40px, which is the size that
actually matters on a home screen.

Run with:  python3 tools/generate-icons.py
"""

import math
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")

# Aurora palette, matching src/theme/index.ts.
STOPS = [
    (0.00, (99, 102, 241)),   # indigo
    (0.20, (139, 92, 246)),   # violet
    (0.40, (217, 70, 239)),   # fuchsia
    (0.58, (236, 72, 153)),   # pink
    (0.74, (251, 113, 133)),  # rose
    (0.87, (34, 211, 238)),   # cyan
    (1.00, (99, 102, 241)),   # back to indigo, so the ring closes seamlessly
]

BG_TOP = (12, 14, 33)
BG_BOTTOM = (5, 6, 13)
GOLD = (252, 211, 77)

SS = 4  # supersampling factor


def ramp(t: float) -> tuple:
    """Sample the aurora gradient at position t in [0, 1]."""
    t = max(0.0, min(1.0, t))
    for i in range(len(STOPS) - 1):
        t0, c0 = STOPS[i]
        t1, c1 = STOPS[i + 1]
        if t0 <= t <= t1:
            f = 0 if t1 == t0 else (t - t0) / (t1 - t0)
            return tuple(round(c0[j] + (c1[j] - c0[j]) * f) for j in range(3))
    return STOPS[-1][1]


def vertical_gradient(size: int, top: tuple, bottom: tuple) -> Image.Image:
    img = Image.new("RGB", (1, size))
    px = img.load()
    for y in range(size):
        f = y / max(1, size - 1)
        px[0, y] = tuple(round(top[j] + (bottom[j] - top[j]) * f) for j in range(3))
    return img.resize((size, size), Image.BILINEAR)


def draw_mark(size: int, with_background: bool) -> Image.Image:
    """The ring-and-wave mark, rendered at `size` px."""
    S = size * SS
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    if with_background:
        bg = vertical_gradient(S, BG_TOP, BG_BOTTOM).convert("RGBA")
        canvas = Image.alpha_composite(canvas, bg)

        # A soft violet bloom in the upper left, echoing the app's aurora.
        glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.ellipse(
            [-S * 0.25, -S * 0.3, S * 0.75, S * 0.55],
            fill=(139, 92, 246, 90),
        )
        glow = glow.filter(ImageFilter.GaussianBlur(S * 0.10))
        canvas = Image.alpha_composite(canvas, glow)

    cx = cy = S / 2
    outer = S * 0.355
    inner = S * 0.235

    # Twelve segments, each a slice of the aurora ramp — one per key.
    ring = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    segments = 12
    gap = 2.2  # degrees of dark between segments
    for i in range(segments):
        start = i * (360 / segments) - 90 + gap / 2
        end = (i + 1) * (360 / segments) - 90 - gap / 2
        colour = ramp(i / segments)
        rd.pieslice(
            [cx - outer, cy - outer, cx + outer, cy + outer],
            start,
            end,
            fill=colour + (255,),
        )
    # Punch out the middle to make it a ring.
    rd.ellipse([cx - inner, cy - inner, cx + inner, cy + inner], fill=(0, 0, 0, 0))

    # Outer glow so the ring lifts off the background.
    bloom = ring.filter(ImageFilter.GaussianBlur(S * 0.022))
    canvas = Image.alpha_composite(canvas, bloom)
    canvas = Image.alpha_composite(canvas, ring)

    # A sine wave through the centre — the "sound" half of the mark.
    wave = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wave)
    amplitude = S * 0.072
    # Reach just past the inner edge of the ring, so the wave reads as passing
    # behind it rather than escaping the mark.
    span = (inner + outer) / 2 * 0.99
    radius = S * 0.0145
    # Stamping dense overlapping discs gives a genuinely smooth round-capped
    # stroke. PIL's line joints leave visible notches on a curve this thick.
    steps = 900
    for i in range(steps + 1):
        f = i / steps
        x = cx - span + (span * 2) * f
        y = cy + math.sin(f * math.pi * 2 - math.pi / 2) * amplitude
        wd.ellipse([x - radius, y - radius, x + radius, y + radius], fill=GOLD + (255,))

    glow = wave.filter(ImageFilter.GaussianBlur(S * 0.018))
    canvas = Image.alpha_composite(canvas, glow)
    canvas = Image.alpha_composite(canvas, wave)

    return canvas.resize((size, size), Image.LANCZOS)


def save(img: Image.Image, name: str, flatten_to=None):
    path = os.path.join(ASSETS, name)
    if flatten_to is not None:
        base = Image.new("RGB", img.size, flatten_to)
        base.paste(img, mask=img.split()[3])
        base.save(path, "PNG")
    else:
        img.save(path, "PNG")
    print(f"  {name}  {img.size[0]}×{img.size[1]}")


def main():
    os.makedirs(ASSETS, exist_ok=True)
    print("Generating icons…")

    # App Store icons must not carry an alpha channel.
    save(draw_mark(1024, with_background=True), "icon.png", flatten_to=BG_BOTTOM)

    # Splash and adaptive foregrounds keep transparency and extra padding,
    # since both get composited over a background colour by the platform.
    mark = draw_mark(1024, with_background=False)
    padded = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    scaled = mark.resize((720, 720), Image.LANCZOS)
    padded.paste(scaled, (152, 152), scaled)
    save(padded, "splash-icon.png")
    save(padded, "android-icon-foreground.png")

    background = vertical_gradient(1024, BG_TOP, BG_BOTTOM)
    save(background.convert("RGBA"), "android-icon-background.png")

    mono = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    alpha = padded.split()[3]
    white = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
    mono.paste(white, (0, 0), alpha)
    save(mono, "android-icon-monochrome.png")

    save(draw_mark(196, with_background=True), "favicon.png", flatten_to=BG_BOTTOM)

    print("Done.")


if __name__ == "__main__":
    main()
