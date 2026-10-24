# -*- coding: utf-8 -*-
"""向 IndexNow 提交本站 sitemap 全量 URL。

用法：python3 submit_indexnow.py
依赖：仓库根存在 <32-hex>.txt 密钥文件（内容即密钥），且已随 Pages 部署可访问。
说明：走系统 curl 发送（macOS 自带 CA），避免部分 Python 环境缺少根证书。
"""
import glob
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
HOST = "screscent.github.io"
BASE = f"https://{HOST}/xiaoning-ai-tools"
ENDPOINT = "https://api.indexnow.org/indexnow"


def find_key():
    keys = [os.path.basename(p)[:-4] for p in glob.glob(os.path.join(HERE, "*.txt"))
            if re.fullmatch(r"[0-9a-f]{32}\.txt", os.path.basename(p))]
    if not keys:
        raise SystemExit("未找到 32 位十六进制 IndexNow 密钥文件")
    return keys[0]


def main():
    key = find_key()
    sitemap = os.path.join(HERE, "sitemap.xml")
    with open(sitemap, encoding="utf-8") as f:
        urls = re.findall(r"<loc>(.*?)</loc>", f.read())
    if not urls:
        raise SystemExit("sitemap.xml 中没有 URL，请先运行 build.py")

    payload = {
        "host": HOST,
        "key": key,
        "keyLocation": f"{BASE}/{key}.txt",
        "urlList": urls,
    }
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False)
        path = f.name
    try:
        code = subprocess.run(
            ["curl", "-sS", "-o", os.devnull, "-w", "%{http_code}",
             "-X", "POST", ENDPOINT,
             "-H", "Content-Type: application/json; charset=utf-8",
             "--data-binary", f"@{path}"],
            capture_output=True, text=True, timeout=60,
        ).stdout.strip()
    finally:
        os.unlink(path)

    print(f"IndexNow HTTP {code} · 提交 {len(urls)} 条 URL")
    if code not in ("200", "202"):
        sys.exit(1)


if __name__ == "__main__":
    main()
