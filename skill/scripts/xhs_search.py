#!/usr/bin/env python3
"""
xhs_search.py — Xiaohongshu search & content extraction CLI.

Thin wrapper around jackwener/xhs-cli (https://github.com/jackwener/xhs-cli).
All anti-detection is handled by xhs_cli's reverse-engineered API with
proper request signing, cookie management, and browser-based QR login.

Usage:
  # Login (opens browser for QR code scan)
  python3 xhs_search.py login

  # Check auth status
  python3 xhs_search.py check-auth

  # Search notes
  python3 xhs_search.py search "GRPO 强化学习" --count 5

  # Read note detail
  python3 xhs_search.py detail "<note_id_or_url>"

Requirements:
  pip install xiaohongshu-cli

Cookie storage: ~/.xiaohongshu-cli/cookies.json
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from urllib.parse import urlparse


def _run_xhs(args: list[str], timeout: int = 60) -> dict:
    """Run xhs_cli and return parsed JSON output."""
    cmd = [sys.executable, "-m", "xhs_cli"] + args + ["--json"]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd="/home/chuan/workdir/review-handbook",
        )
        if result.returncode != 0:
            stderr = result.stderr.strip() or "unknown error"
            return {"error": stderr}
        return json.loads(result.stdout)
    except subprocess.TimeoutExpired:
        return {"error": "Command timed out ({}s)".format(timeout)}
    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON output: {e}"}
    except FileNotFoundError:
        return {"error": "xhs_cli not installed. Run: pip install xiaohongshu-cli"}


def extract_note_id(url_or_id: str) -> str:
    """Extract note ID from a Xiaohongshu URL or return as-is."""
    if url_or_id.startswith("http"):
        parsed = urlparse(url_or_id)
        path = parsed.path
        # /explore/xxxx or /discovery/item/xxxx
        parts = path.strip("/").split("/")
        if "explore" in parts:
            idx = parts.index("explore")
            if idx + 1 < len(parts):
                return parts[idx + 1]
        if "discovery" in parts:
            idx = parts.index("discovery")
            if idx + 2 < len(parts):
                return parts[idx + 2]
        return path.strip("/").split("/")[-1]
    return url_or_id


def cmd_login(args):
    """Interactive QR code login using xhs_cli."""
    print("[xhs] Starting QR login (opens browser)...", flush=True)
    print("[xhs] Scan QR code with Xiaohongshu app", flush=True)
    result = _run_xhs(["login", "--qrcode"], timeout=180)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def cmd_check_auth(args):
    """Check if currently authenticated."""
    result = _run_xhs(["status"], timeout=15)
    if result.get("ok"):
        print(json.dumps({"authenticated": True, "user": result.get("data", {})}, ensure_ascii=False))
    else:
        error_msg = result.get("error", {}).get("message", "Not authenticated")
        print(json.dumps({"authenticated": False, "message": error_msg}, ensure_ascii=False))
        sys.exit(1)


def cmd_search(args):
    """Search notes by keyword."""
    result = _run_xhs(["search", args.keyword], timeout=60)

    if not result.get("ok"):
        error_msg = result.get("error", "Search failed")
        print(json.dumps({"error": error_msg}, ensure_ascii=False))
        sys.exit(1)

    items = result.get("data", {}).get("items", [])
    notes = []
    for item in items[: args.count]:
        nc = item.get("note_card", {})
        note = {
            "note_id": nc.get("note_id", item.get("id", "")),
            "title": nc.get("display_title", nc.get("title", "")),
            "author": nc.get("user", {}).get("nickname", nc.get("user", {}).get("nick_name", "")),
            "author_id": nc.get("user", {}).get("user_id", ""),
            "likes": nc.get("interact_info", {}).get("liked_count", ""),
            "collects": nc.get("interact_info", {}).get("collected_count", ""),
            "comments": nc.get("interact_info", {}).get("comment_count", ""),
            "cover_url": nc.get("cover", {}).get("url_default", ""),
            "note_url": f"https://www.xiaohongshu.com/explore/{nc.get('note_id', item.get('id', ''))}",
            "type": nc.get("type", "normal"),
            "xsec_token": item.get("xsec_token", ""),
        }
        notes.append(note)

    output = {
        "keyword": args.keyword,
        "count": len(notes),
        "has_more": result.get("data", {}).get("has_more", False),
        "results": notes,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


def cmd_detail(args):
    """Get full detail of a single note."""
    note_id = extract_note_id(args.url_or_id)
    result = _run_xhs(["read", note_id], timeout=30)

    if not result.get("ok"):
        error_msg = result.get("error", "Read failed")
        print(json.dumps({"error": error_msg}, ensure_ascii=False))
        sys.exit(1)

    items = result.get("data", {}).get("items", [])
    if not items:
        print(json.dumps({"error": "Note not found"}, ensure_ascii=False))
        sys.exit(1)

    nc = items[0].get("note_card", {})
    image_list = nc.get("image_list", [])
    images = []
    for img in image_list:
        images.append({
            "url": img.get("url_default", img.get("url_pre", "")),
            "width": img.get("width", 0),
            "height": img.get("height", 0),
        })

    note = {
        "note_id": nc.get("note_id", items[0].get("id", "")),
        "title": nc.get("title", nc.get("display_title", "")),
        "content": nc.get("desc", ""),
        "summary": nc.get("desc", ""),
        "tags": [t.get("name", "") for t in nc.get("tag_list", [])],
        "images": images,
        "author": nc.get("user", {}).get("nickname", ""),
        "author_id": nc.get("user", {}).get("user_id", ""),
        "likes": nc.get("interact_info", {}).get("liked_count", ""),
        "collects": nc.get("interact_info", {}).get("collected_count", ""),
        "comments": nc.get("interact_info", {}).get("comment_count", ""),
        "type": nc.get("type", "normal"),
        "created_at": nc.get("time", ""),
        "note_url": f"https://www.xiaohongshu.com/explore/{nc.get('note_id', items[0].get('id', ''))}",
        "platform": "xiaohongshu",
    }
    print(json.dumps(note, ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description="Xiaohongshu Search & Content Extraction (via xhs_cli)",
    )
    sub = parser.add_subparsers(dest="command", help="Commands")

    sub.add_parser("login", help="QR code login")
    sub.add_parser("check-auth", help="Check authentication status")

    p_search = sub.add_parser("search", help="Search notes by keyword")
    p_search.add_argument("keyword", help="Search keyword")
    p_search.add_argument("--count", type=int, default=10, help="Max results (default: 10)")

    p_detail = sub.add_parser("detail", help="Read note detail")
    p_detail.add_argument("url_or_id", help="Note URL or ID")

    args = parser.parse_args()

    if args.command == "login":
        cmd_login(args)
    elif args.command == "check-auth":
        cmd_check_auth(args)
    elif args.command == "search":
        cmd_search(args)
    elif args.command == "detail":
        cmd_detail(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
