# TERRAX Holdings (Mauritius) Ltd — Website

Static HTML / CSS / GSAP implementation of the approved Terrax design canvas.
No build step: open `index.html` from any static server.

## Structure

- `index.html` — the full home page, sections 01–10
- `css/styles.css` — design tokens and all styling (Archivo + IBM Plex Mono, `#FF741F`)
- `js/main.js` — hero intro timeline, sticky scroll-scrubbed services section,
  stage selector, quality/safety tabs, reveals, mobile menu
- `js/vendor/` — GSAP + ScrollTrigger, vendored locally (no CDN dependency)
- `assets/hero/` — hero photo, TERRAX wordmark, excavator cut-out
- `tools/make-hero-cutout.py` — generates the cut-out from the hero photo

## Sections

| # | Section | Notes |
|---|---------|-------|
| — | Hero | Three-layer stack, wordmark behind the machine, services ticker |
| 01 | How we are | Company statement, four pillars |
| 02 | What we do | Sticky, scroll-scrubbed video with eight service reveals |
| 03 | How we work | Eight-stage selector |
| 04 | Why Terrax | Seven working principles |
| 05 | Sectors we serve | Eight sectors |
| 06 | Quality & Safety | Quality / Health & Safety tabs |
| 07 | Sustainability | Six commitments |
| 08 | Projects | Portfolio status, reserved slots |
| 09 | Start a project | CTA and direct lines |
| 10 | Footer | Navigation, contact, legal |

## Hero

Three layers stack so the TERRAX wordmark sits *behind* the excavator:

1. `assets/hero/hero.jpg` — the full photo
2. `assets/hero/terrax-wordmark.png` — the wordmark
3. `assets/hero/excavator.png` — the excavator cut-out (identical pixels to the
   photo, transparent everywhere else)

Layers 1 and 3 share one CSS sizing rule and one GSAP scale tween, so they stay
pixel-registered through the zoom-out, the ambient drift and the scroll
parallax. Without layer 3 the wordmark simply sits on top of the photo, and
without layer 2 a styled text fallback is used — the page degrades cleanly
either way.

The entrance timeline is exposed as `window.terraxHeroIntro`, so it can be
paused and scrubbed in devtools (`terraxHeroIntro.pause(0.3)`).

Generate the cut-out once the photo is in place:

```
pip install rembg onnxruntime pillow
python3 tools/make-hero-cutout.py assets/hero/hero.jpg assets/hero/excavator.png
```

## Services video (section 02)

Drop an MP4 at `assets/what-we-do.mp4`. The page checks for it at runtime; when
it is present the video replaces the striped placeholder and its playhead is
scrubbed by scroll position across the eight service panels. Encode it with
frequent keyframes so seeking stays smooth:

```
ffmpeg -i source.mp4 -an -g 6 -crf 24 -movflags +faststart assets/what-we-do.mp4
```

## Running locally

```
npx serve .
# or
python3 -m http.server 8080
```

## Outstanding

- `assets/hero/hero.jpg` and `assets/hero/terrax-wordmark.png` are still to be
  added; see `assets/hero/README.md`.
- Phone number, email and office address are prototype placeholders.
- Projects section stays empty until genuine Terrax project photography exists.
