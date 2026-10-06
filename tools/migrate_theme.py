"""一次性迁移脚本:把「仅深色」的 Tailwind 类改写成「浅色 + dark: 深色」成对写法。

背景: 旧版 style.css 用 `html:not(.dark) .bg-slate-900 { ... !important }` 这类全局覆盖
来给只写了深色类的组件"补"浅色。这里把同样的映射直接落到类名上,从而可以删除那批 hack。

映射必须与旧 CSS 完全一致,才能保证浅色外观不变:
    bg-slate-950                      -> bg-slate-100
    bg-slate-900(/60 /80 /90)         -> bg-white
    bg-slate-800(/80 /90)             -> bg-slate-50
    border-slate-800(/80), -700       -> border-slate-200
    text-slate-100/200/300            -> text-slate-900
    text-slate-400/500                -> text-slate-500
同一个 class 列表里若已有同类 `dark:` 写法,则不再追加,避免冲突。
"""
import re
import sys
from pathlib import Path

LIGHT = {
    "bg-slate-950": "bg-slate-100",
    "bg-slate-900": "bg-white", "bg-slate-900/60": "bg-white",
    "bg-slate-900/80": "bg-white", "bg-slate-900/90": "bg-white",
    "bg-slate-800": "bg-slate-50", "bg-slate-800/80": "bg-slate-50", "bg-slate-800/90": "bg-slate-50",
    "border-slate-800": "border-slate-200", "border-slate-800/80": "border-slate-200",
    "border-slate-700": "border-slate-200",
    "text-slate-100": "text-slate-900", "text-slate-200": "text-slate-900", "text-slate-300": "text-slate-900",
    "text-slate-400": "text-slate-500", "text-slate-500": "text-slate-500",
}
TOKEN = r"[A-Za-z0-9_:/\[\]%.#!()-]+"
RUN = re.compile(rf"(?<![A-Za-z0-9_:/\[\]%.#!()-]){TOKEN}(?:[ \t]+{TOKEN})*")


def family(tok):
    return tok.split("-", 1)[0]


def fix_run(match):
    run = match.group(0)
    if not any(t in LIGHT for t in run.split()):
        return run
    toks = run.split()
    dark_fam = {t[5:].split("-", 1)[0] for t in toks if t.startswith("dark:") and "-" in t[5:]}
    out = []
    for t in toks:
        if t in LIGHT:
            light = LIGHT[t]
            out.append(light)
            if light != t and family(t) not in dark_fam:
                out.append("dark:" + t)
        else:
            out.append(t)
    # 保持原有的单空格分隔(原 run 内可能有多空格,压缩无副作用)
    return " ".join(out)


def main(paths):
    total = 0
    for p in paths:
        path = Path(p)
        text = path.read_text(encoding="utf-8")
        new, n = RUN.subn(fix_run, text)
        if new != text:
            changed = sum(1 for a, b in zip(RUN.findall(text), RUN.findall(new)) if a != b)
            path.write_text(new, encoding="utf-8", newline="")
            total += changed
            print(f"{path.name}: {changed} class lists rewritten")
    print("total", total)


if __name__ == "__main__":
    main(sys.argv[1:])
