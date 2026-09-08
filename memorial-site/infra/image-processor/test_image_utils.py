from __future__ import annotations

import sys
from io import BytesIO
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from image_utils import render_webp  # noqa: E402


def verify(source_path: Path) -> None:
    source = source_path.read_bytes()
    with Image.open(BytesIO(source)) as original:
        original_size = original.size

    web, web_size = render_webp(source, 2560, 82)
    thumb, thumb_size = render_webp(source, 640, 72)
    assert max(web_size) <= min(2560, max(original_size))
    assert max(thumb_size) <= min(640, max(original_size))

    for payload in (web, thumb):
        with Image.open(BytesIO(payload)) as generated:
            assert generated.format == "WEBP"
            assert not generated.getexif()
            assert "exif" not in generated.info

    print({"original": original_size, "web": web_size, "thumb": thumb_size, "webBytes": len(web), "thumbBytes": len(thumb)})


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python test_image_utils.py <image-path>")
    verify(Path(sys.argv[1]))
