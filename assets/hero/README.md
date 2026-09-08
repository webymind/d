# Hero assets

Drop the real files here with these exact names:

| File | What | Notes |
|------|------|-------|
| `hero.jpg` | Main hero photo (excavator at dusk) | Export at 2560px wide or larger, JPEG quality 85–90 (or use `.jpg` → `.webp` and update `index.html`). |
| `terrax-wordmark.png` | TERRAX text mark, transparent background | Export at ≥ 2× display size (≈ 2600px wide) so it stays crisp on retina. |
| `excavator.png` | Excavator cut-out, transparent background | Generated from `hero.jpg` by `tools/make-hero-cutout.py`. Must be the **same pixel size** as `hero.jpg`. |

Generate the cut-out:

```
pip install rembg onnxruntime pillow
python3 tools/make-hero-cutout.py assets/hero/hero.jpg assets/hero/excavator.png
```

Only the boom/arm edges need to be clean — that is the only area the wordmark
passes behind. Everywhere else the cut-out is pixel-identical to the photo, so
a soft edge lower down is invisible.

If a file is missing the page degrades gracefully: no cut-out → the wordmark
simply sits on top of the photo; no wordmark PNG → a styled text fallback.
