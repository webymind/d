# TERRAX Holdings — Website

Static HTML/CSS/GSAP implementation of the TERRAX Holdings (Mauritius) Ltd
Figma design, including the hero entrance motion and scroll-triggered
section reveals.

## Structure

- `index.html` — page markup (hero, expertise, integrated services,
  how-we-work timeline, about/why-terrax, projects, contact, footer)
- `css/styles.css` — all styling (dark theme, orange accent, responsive)
- `js/main.js` — GSAP timelines: hero intro animation (recreated from the
  reference motion video) + ambient drift, scroll parallax and ScrollTrigger
  reveals for every section
- `js/vendor/` — GSAP + ScrollTrigger, vendored locally (no CDN dependency)
- `assets/hero/` — hero photo, TERRAX wordmark and the excavator cut-out
  (see `assets/hero/README.md` for the exact file names and export sizes)
- `tools/make-hero-cutout.py` — generates the excavator cut-out from the photo

## Running locally

Any static server works, e.g.:

```
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Hero

The hero is a three-layer stack so the TERRAX wordmark sits *behind* the
excavator:

1. `assets/hero/hero.jpg` — the full photo
2. `assets/hero/terrax-wordmark.png` — the wordmark
3. `assets/hero/excavator.png` — the excavator cut-out (same pixels as the
   photo, transparent everywhere else)

Layers 1 and 3 share one CSS sizing rule and one GSAP scale tween, so they stay
pixel-registered through the zoom-out, the ambient drift and the scroll
parallax. The entrance timeline is exposed as `window.terraxHeroIntro` for
tuning in devtools (`terraxHeroIntro.pause(0.3)` etc.).

Generate the cut-out once the photo is in place:

```
pip install rembg onnxruntime pillow
python3 tools/make-hero-cutout.py assets/hero/hero.jpg assets/hero/excavator.png
```

## Notes

Photographic imagery and the exact icon set from the Figma file could not be
downloaded in this environment (egress to Figma's asset CDN and other image
hosts was blocked), so photos were recreated as CSS gradients/SVG line art
and icons were hand-coded to match the same style. Swap the elements with
`.expertise-image` classes in `index.html` for real photography when
available.
