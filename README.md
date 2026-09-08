# TERRAX Holdings — Website

Static HTML/CSS/GSAP implementation of the TERRAX Holdings (Mauritius) Ltd
Figma design, including the hero entrance motion and scroll-triggered
section reveals.

## Structure

- `index.html` — page markup (hero, expertise, integrated services,
  how-we-work timeline, about/why-terrax, projects, contact, footer)
- `css/styles.css` — all styling (dark theme, orange accent, responsive)
- `js/main.js` — GSAP timelines: hero intro animation (recreated from the
  Figma keyframe/motion data) + ScrollTrigger reveals for every section
- `js/vendor/` — GSAP + ScrollTrigger, vendored locally (no CDN dependency)

## Running locally

Any static server works, e.g.:

```
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

Photographic imagery and the exact icon set from the Figma file could not be
downloaded in this environment (egress to Figma's asset CDN and other image
hosts was blocked), so photos were recreated as CSS gradients/SVG line art
and icons were hand-coded to match the same style. Swap the elements with
`.expertise-image` classes in `index.html` for real photography when
available.
