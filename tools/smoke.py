"""前端冒烟检测 (仅开发用): 用无头 Edge 逐页加载,收集本站脚本的控制台错误。

用法: python tools/smoke.py      (需要应用已在 http://127.0.0.1:8000 运行)
有任何 Uncaught / SyntaxError / ReferenceError 即以非 0 退出码结束。
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _edge import run_edge  # noqa: E402

BASE = "http://127.0.0.1:8000"
VIEWS = ["kanban", "campus", "public-sector", "calendar", "offers", "search", "company", "resumes", "analytics"]
ERR = re.compile(r"CONSOLE:\d+\] \"(.*?)\", source: (http://127\.0\.0\.1:8000/\S+?) \((\d+)\)")
BAD = re.compile(r"Uncaught|SyntaxError|ReferenceError|TypeError|is not defined|is not a function")


def run():
    bad, timeouts = [], []
    for theme in ("light", "dark"):
        for view in VIEWS:
            rc, _, err = run_edge(["--virtual-time-budget=6000", "--enable-logging=stderr", "--v=0", "--dump-dom"],
                                  f"{BASE}/?theme={theme}#/{view}", timeout=40)
            if rc is None:
                timeouts.append(f"{theme}/{view}")
            for m in ERR.finditer(err.decode("utf-8", "replace")):
                msg, src, line = m.groups()
                if BAD.search(msg):
                    bad.append((theme, view, msg, src.split("?")[0], line))
    seen = set()
    for theme, view, msg, src, line in bad:
        if (msg, src, line) in seen:
            continue
        seen.add((msg, src, line))
        print(f"[{theme}/{view}] {msg}  @ {src}:{line}")
    for t in timeouts:
        print(f"[timeout] {t}")
    print("OK: no frontend script errors" if not bad and not timeouts else f"FAIL: {len(seen)} errors, {len(timeouts)} timeouts")
    return 1 if (bad or timeouts) else 0


if __name__ == "__main__":
    sys.exit(run())
