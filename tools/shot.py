"""视觉回归小工具 (仅开发用,不进入发布包)

用法:
    python tools/shot.py capture <标签> [宽] [高] [页面,页面..]   # 对页面 x 浅/深色截图
    python tools/shot.py diff <标签A> <标签B>                      # 逐像素对比两次截图
需要本机已安装 Edge,且应用已在 http://127.0.0.1:8000 运行。
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _edge import run_edge  # noqa: E402

BASE = "http://127.0.0.1:8000"
VIEWS = ["kanban", "campus", "public-sector", "calendar", "offers", "search", "company", "resumes", "analytics"]
THEMES = ["light", "dark"]
OUT_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")


def capture(tag, width=1440, height=900, views=None):
    out_dir = os.path.join(OUT_ROOT, tag)
    os.makedirs(out_dir, exist_ok=True)
    for theme in THEMES:
        for view in (views or VIEWS):
            path = os.path.join(out_dir, f"{view}.{theme}.png")
            if os.path.exists(path):
                os.remove(path)
            args = ["--hide-scrollbars", f"--window-size={width},{height}",
                    "--virtual-time-budget=6000", f"--screenshot={path}"]
            rc, _, _ = run_edge(args, f"{BASE}/?theme={theme}#/{view}", timeout=40)
            print("shot", tag, view, theme, "ok" if os.path.exists(path) else ("TIMEOUT" if rc is None else "FAILED"), flush=True)


def diff(tag_a, tag_b):
    from PIL import Image, ImageChops
    for theme in THEMES:
        for view in VIEWS:
            a = os.path.join(OUT_ROOT, tag_a, f"{view}.{theme}.png")
            b = os.path.join(OUT_ROOT, tag_b, f"{view}.{theme}.png")
            if not (os.path.exists(a) and os.path.exists(b)):
                print(f"{view:14s}{theme:6s} MISSING")
                continue
            ia, ib = Image.open(a).convert("RGB"), Image.open(b).convert("RGB")
            if ia.size != ib.size:
                print(f"{view:14s}{theme:6s} SIZE-DIFF {ia.size} vs {ib.size}")
                continue
            d = ImageChops.difference(ia, ib)
            bbox = d.getbbox()
            if not bbox:
                print(f"{view:14s}{theme:6s} identical")
                continue
            px = sum(1 for p in d.getdata() if p != (0, 0, 0))
            print(f"{view:14s}{theme:6s} changed px={px} ({px * 100 / (ia.size[0] * ia.size[1]):.1f}%) bbox={bbox}")


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "capture":
        w = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
        h = int(sys.argv[4]) if len(sys.argv) > 4 else 900
        v = sys.argv[5].split(",") if len(sys.argv) > 5 else None
        capture(sys.argv[2], w, h, v)
    elif cmd == "diff":
        diff(sys.argv[2], sys.argv[3])
