from __future__ import annotations

from io import BytesIO

from PIL import Image, ImageOps
try:
    from pillow_heif import register_heif_opener

    register_heif_opener()
except ImportError:
    # JPEG/PNG processing should still work if a broken deployment omits the
    # optional native HEIF wheel. HEIC then fails per file and uses original fallback.
    pass


def render_webp(source: bytes, max_long_edge: int, quality: int) -> tuple[bytes, tuple[int, int]]:
    """Decode, apply EXIF orientation, resize without upscaling, and emit metadata-free WebP."""
    with Image.open(BytesIO(source)) as opened:
        image = ImageOps.exif_transpose(opened)
        image.thumbnail((max_long_edge, max_long_edge), Image.Resampling.LANCZOS)

        if image.mode in ("RGBA", "LA"):
            converted = image.convert("RGBA")
        else:
            converted = image.convert("RGB")

        output = BytesIO()
        converted.save(output, format="WEBP", quality=quality, method=6)
        return output.getvalue(), converted.size
