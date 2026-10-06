"""无头 Edge 调用辅助 (仅开发用): 独立用户目录 + 超时后杀整棵进程树,避免残留进程堵住后续截图。"""
import os
import shutil
import subprocess
import tempfile

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"


def run_edge(extra_args, url, timeout=45):
    """返回 (returncode|None, stdout_bytes, stderr_bytes)。超时返回 returncode=None。"""
    profile = tempfile.mkdtemp(prefix="jc_edge_")
    cmd = [EDGE, "--headless=new", "--disable-gpu", "--no-first-run", "--disable-extensions",
           f"--user-data-dir={profile}", *extra_args, url]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        out, err = proc.communicate(timeout=timeout)
        return proc.returncode, out, err
    except subprocess.TimeoutExpired:
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            out, err = proc.communicate(timeout=5)
        except Exception:
            out, err = b"", b""
        return None, out, err
    finally:
        shutil.rmtree(profile, ignore_errors=True)
