#!/usr/bin/env python3
"""
zh_search.py — Zhihu collections export CLI.

Based on Zhihu-Collections-MCP (github.com/JasonJarvan/Zhihu-Collections-MCP).
Exports Zhihu collections/favorites to Markdown files with YAML frontmatter.

Usage:
  # Login (extract cookies from Chrome CDP, requires Chrome running)
  python3 zh_search.py login

  # Check auth status
  python3 zh_search.py check-auth

  # List all collections
  python3 zh_search.py list

  # Export all collections to Markdown
  python3 zh_search.py fetch --output data/collections/zhihu

  # Export a single collection
  python3 zh_search.py fetch-one "https://www.zhihu.com/collection/123456" --output data/collections/zhihu
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

SKILL_DIR = Path(__file__).resolve().parent
COOKIE_FILE = SKILL_DIR / "zh_cookies.json"
CONFIG_FILE = SKILL_DIR / "zh_config.json"
PROJECT_ROOT = SKILL_DIR.parent.parent


def _check_cookies() -> bool:
    """Check if cookies exist and are valid."""
    if not COOKIE_FILE.exists():
        return False
    try:
        cookies = json.loads(COOKIE_FILE.read_text())
        return any(c.get("name") == "z_c0" for c in cookies)
    except (json.JSONDecodeError, KeyError):
        return False


def cmd_login(args):
    """Extract Zhihu cookies from Chrome CDP session."""
    import http.client
    import websocket
    import time

    print("Connecting to Chrome CDP...")
    conn = http.client.HTTPConnection("localhost", 9222, timeout=10)
    conn.request("GET", "/json")
    resp = conn.getresponse()
    data = json.loads(resp.read().decode())

    ws_url = None
    for page in data:
        if page.get("type") == "page" and "webSocketDebuggerUrl" in page:
            ws_url = page["webSocketDebuggerUrl"]
            break

    if not ws_url:
        print(json.dumps({"error": "No Chrome CDP page found. Run Chrome with --remote-debugging-port=9222"}))
        sys.exit(1)

    ws = websocket.create_connection(ws_url, timeout=10)
    _mid = [0]

    def cmd(method, params=None):
        _mid[0] += 1
        ws.send(json.dumps({"id": _mid[0], "method": method, "params": params or {}}))
        while True:
            r = json.loads(ws.recv())
            if r.get("id") == _mid[0]:
                return r.get("result", {})

    cmd("Page.enable")
    cmd("Network.enable")
    cmd("Page.navigate", {"url": "https://www.zhihu.com"})
    time.sleep(5)

    cookies = cmd("Network.getCookies").get("cookies", [])

    # Check login
    zh = {c["name"]: c["value"] for c in cookies if "zhihu.com" in c.get("domain", "")}
    if "z_c0" not in zh:
        print(json.dumps({"error": "Not logged in. Please open https://www.zhihu.com in Chrome and login first."}))
        ws.close()
        sys.exit(1)

    # Save in Chrome cookie format
    cookie_list = []
    for c in cookies:
        if "zhihu.com" in c.get("domain", ""):
            entry = {
                "domain": c.get("domain", ""),
                "name": c.get("name", ""),
                "value": c.get("value", ""),
                "path": c.get("path", "/"),
                "httpOnly": c.get("httpOnly", False),
                "secure": c.get("secure", False),
                "sameSite": c.get("sameSite", "unspecified"),
            }
            if c.get("expires") and c["expires"] > 0:
                entry["expirationDate"] = c["expires"]
            cookie_list.append(entry)

    COOKIE_FILE.write_text(json.dumps(cookie_list, indent=2, ensure_ascii=False))
    ws.close()
    print(json.dumps({"status": "ok", "message": f"Saved {len(cookie_list)} cookies"}))
    print()
    print("✅ 知乎登录成功！运行 python3 zh_search.py list 查看收藏夹")


def cmd_check_auth(args):
    """Check authentication status."""
    if _check_cookies():
        print(json.dumps({"authenticated": True, "message": "Cookies found"}))
    else:
        print(json.dumps({"authenticated": False, "message": "No cookies. Run: python3 zh_search.py login"}))
        sys.exit(1)


def cmd_list(args):
    """List all Zhihu collections."""
    if not _check_cookies():
        print(json.dumps({"error": "Not logged in. Run: python3 zh_search.py login"}))
        sys.exit(1)

    # Run fetch_collections.py
    print("Fetching collections... (may take a moment)")
    result = subprocess.run(
        [sys.executable, str(SKILL_DIR / "fetch_collections.py")],
        capture_output=True, text=True, timeout=60,
        cwd=str(SKILL_DIR)
    )

    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)


def cmd_fetch(args):
    """Export all collections to Markdown."""
    if not _check_cookies():
        print(json.dumps({"error": "Not logged in. Run: python3 zh_search.py login"}))
        sys.exit(1)

    output_dir = Path(args.output) if args.output else PROJECT_ROOT / "data" / "collections" / "zhihu"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Build config
    config = {
        "zhihuUrls": [],
        "outputPath": str(output_dir.resolve()),
        "os": "linux",
        "openCollection": False,
    }

    # Load urls from fetch_collections output or manual config
    urls_file = SKILL_DIR / "zhihuUrls.json"
    if urls_file.exists():
        urls = json.loads(urls_file.read_text())
        config["zhihuUrls"] = urls

    if not config["zhihuUrls"]:
        print("No collections configured. Run 'python3 zh_search.py list' first.")
        sys.exit(1)

    CONFIG_FILE.write_text(json.dumps(config, indent=2, ensure_ascii=False))
    print(f"Exporting {len(config['zhihuUrls'])} collections to {output_dir}...")

    result = subprocess.run(
        [sys.executable, str(SKILL_DIR / "zh_fetch.py")],
        capture_output=True, text=True, timeout=300,
        cwd=str(SKILL_DIR)
    )

    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)


def cmd_fetch_one(args):
    """Export a single collection by URL."""
    if not _check_cookies():
        print(json.dumps({"error": "Not logged in. Run: python3 zh_search.py login"}))
        sys.exit(1)

    url = args.url
    # Extract collection name from URL
    parsed = urlparse(url)
    collection_id = parsed.path.strip("/").split("/")[-1]

    output_dir = Path(args.output) if args.output else PROJECT_ROOT / "data" / "collections" / "zhihu"
    output_dir.mkdir(parents=True, exist_ok=True)

    config = {
        "zhihuUrls": [{"name": f"collection-{collection_id}", "url": url}],
        "outputPath": str(output_dir.resolve()),
        "os": "linux",
        "openCollection": False,
    }

    CONFIG_FILE.write_text(json.dumps(config, indent=2, ensure_ascii=False))
    print(f"Exporting collection to {output_dir}...")

    result = subprocess.run(
        [sys.executable, str(SKILL_DIR / "zh_fetch.py")],
        capture_output=True, text=True, timeout=120,
        cwd=str(SKILL_DIR)
    )

    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="Zhihu Collections Export")
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("login", help="Extract cookies from Chrome CDP")
    sub.add_parser("check-auth", help="Check authentication")
    sub.add_parser("list", help="List all collections")

    p_fetch = sub.add_parser("fetch", help="Export all collections")
    p_fetch.add_argument("--output", help="Output directory")

    p_one = sub.add_parser("fetch-one", help="Export single collection")
    p_one.add_argument("url", help="Collection URL")
    p_one.add_argument("--output", help="Output directory")

    args = parser.parse_args()

    if args.command == "login":
        cmd_login(args)
    elif args.command == "check-auth":
        cmd_check_auth(args)
    elif args.command == "list":
        cmd_list(args)
    elif args.command == "fetch":
        cmd_fetch(args)
    elif args.command == "fetch-one":
        cmd_fetch_one(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
