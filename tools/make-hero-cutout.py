#!/usr/bin/env python3
"""
Generate the excavator cut-out layer for the hero.

The hero stacks three layers: photo -> TERRAX wordmark -> excavator cut-out.
The cut-out is the SAME pixels as the photo with everything except the machine
made transparent, so the wordmark reads as sitting behind the excavator.

Usage:
    pip install rembg onnxruntime pillow
    python3 tools/make-hero-cutout.py assets/hero/hero.jpg assets/hero/excavator.png

Options:
    --model   rembg model (default: isnet-general-use; alternatives: u2net, birefnet-general)
    --no-matting  skip alpha matting (faster, harder edges)

The output is written at exactly the same pixel size as the input, which the
CSS relies on for pixel-perfect registration of the two layers.
"""
import argparse
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("photo", type=Path, help="hero photo (jpg/png)")
    ap.add_argument("out", type=Path, nargs="?", default=Path("assets/hero/excavator.png"))
    ap.add_argument("--model", default="isnet-general-use")
    ap.add_argument("--no-matting", action="store_true")
    args = ap.parse_args()

    if not args.photo.exists():
        print(f"error: {args.photo} not found", file=sys.stderr)
        return 1

    photo = Image.open(args.photo)
    photo = photo.convert("RGB")
    print(f"input  {args.photo}  {photo.size[0]}x{photo.size[1]}")

    session = new_session(args.model)
    kwargs = dict(session=session, post_process_mask=True)
    if not args.no_matting:
        kwargs.update(
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=15,
            alpha_matting_erode_size=8,
        )
    try:
        cut = remove(photo, **kwargs)
    except Exception as exc:  # matting can fail on some images; fall back to a plain mask
        print(f"alpha matting failed ({exc.__class__.__name__}); retrying without matting")
        cut = remove(photo, session=session, post_process_mask=True)

    if cut.size != photo.size:
        cut = cut.resize(photo.size, Image.LANCZOS)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    cut.save(args.out, optimize=True)
    print(f"output {args.out}  {cut.size[0]}x{cut.size[1]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
