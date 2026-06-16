#!/usr/bin/env python3
"""
update_progress.py — Atomic progress mutations

Validates day/week consistency, calculates streaks, and writes
progress.yaml. Used by the /review-handbook progress command.

Usage:
  python update_progress.py complete <note_id> --rating <1-5>
  python update_progress.py set-day <day_number>
  python update_progress.py set-week <week_number>
  python update_progress.py add-note <week_number> "<note_text>"
  python update_progress.py status
"""

import sys
import yaml
from pathlib import Path
from datetime import datetime, date

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / 'data'
PROGRESS_PATH = DATA_DIR / 'progress.yaml'


def read_progress() -> dict:
    with open(PROGRESS_PATH, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def write_progress(p: dict):
    with open(PROGRESS_PATH, 'w', encoding='utf-8') as f:
        yaml.dump(p, f, allow_unicode=True, default_flow_style=False, sort_keys=False)


def calculate_streak(completed_days: list[int]) -> dict:
    """Calculate current and longest streak from completed days list."""
    if not completed_days:
        return {'current': 0, 'longest': 0}

    sorted_days = sorted(set(completed_days))

    longest = 1
    current_streak = 1

    for i in range(1, len(sorted_days)):
        if sorted_days[i] == sorted_days[i - 1] + 1:
            current_streak += 1
        else:
            longest = max(longest, current_streak)
            current_streak = 1

    longest = max(longest, current_streak)

    # Check if streak extends to today
    today_day = (date.today() - date(2026, 6, 16)).days + 1
    if today_day not in sorted_days and sorted_days[-1] != today_day - 1:
        current_streak = 0

    return {'current': current_streak, 'longest': longest}


def complete_note(note_id: str, rating: int):
    """Mark a note as completed."""
    p = read_progress()

    p['completed_items'][note_id] = {
        'completed_at': date.today().isoformat(),
        'rating': rating,
    }

    # Also mark today as a completed day
    today_day = (date.today() - date(2026, 6, 16)).days + 1
    if today_day not in p['completed_days']:
        p['completed_days'].append(today_day)
        p['completed_days'].sort()

    p['streak'] = calculate_streak(p['completed_days'])
    p['current_day'] = today_day

    write_progress(p)
    print(f"✅ Marked '{note_id}' as completed (rating: {rating}/5)")
    print(f"   Day: {today_day}/100 | Streak: {p['streak']['current']} days")


def set_day(day: int):
    """Set current day."""
    p = read_progress()
    p['current_day'] = day

    if day not in p['completed_days']:
        p['completed_days'].append(day)
        p['completed_days'].sort()

    p['streak'] = calculate_streak(p['completed_days'])
    # Auto-set current week
    p['current_week'] = (day - 1) // 7 + 1

    write_progress(p)
    print(f"✅ Day set to {day}/100 (Week {p['current_week']}) | Streak: {p['streak']['current']}")


def set_week(week: int):
    """Set current week."""
    p = read_progress()
    p['current_week'] = week
    p['current_day'] = (week - 1) * 7 + 1
    write_progress(p)
    print(f"✅ Week set to {week}/15")


def add_weekly_note(week: int, text: str):
    """Add a reflection note for a week."""
    p = read_progress()
    p['weekly_notes'][str(week)] = text
    write_progress(p)
    print(f"✅ Added note for week {week}")


def show_status():
    """Display current progress status."""
    p = read_progress()
    completed = len(p['completed_items'])
    days = len(p['completed_days'])

    print(f"📊 复习手册进度")
    print(f"   当前: Day {p['current_day']}/100 (Week {p['current_week']}/15)")
    print(f"   打卡: {days} 天 | 连续 {p['streak']['current']} 天 | 最长 {p['streak']['longest']} 天")
    print(f"   笔记: {completed} 篇已完成")

    if p['weekly_notes']:
        print(f"   周记: {len(p['weekly_notes'])} 篇")

    # Calculate pace
    today = date.today()
    start = date(2026, 6, 16)
    total_days = (today - start).days + 1
    expected = total_days  # Ideally 1 day = 1 day
    if days >= expected:
        print(f"   🎯 进度正常！({days}/{expected} 天打卡)")
    else:
        print(f"   ⚠️ 略有落后 ({days}/{expected} 天打卡，差 {expected - days} 天)")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == 'complete':
        if len(sys.argv) < 4 or '--rating' not in sys.argv:
            print("Usage: update_progress.py complete <note_id> --rating <1-5>")
            sys.exit(1)
        note_id = sys.argv[2]
        rating_idx = sys.argv.index('--rating')
        rating = int(sys.argv[rating_idx + 1])
        complete_note(note_id, rating)

    elif command == 'set-day':
        if len(sys.argv) < 3:
            print("Usage: update_progress.py set-day <day_number>")
            sys.exit(1)
        set_day(int(sys.argv[2]))

    elif command == 'set-week':
        if len(sys.argv) < 3:
            print("Usage: update_progress.py set-week <week_number>")
            sys.exit(1)
        set_week(int(sys.argv[2]))

    elif command == 'add-note':
        if len(sys.argv) < 4:
            print("Usage: update_progress.py add-note <week_number> <text>")
            sys.exit(1)
        add_weekly_note(int(sys.argv[2]), sys.argv[3])

    elif command == 'status':
        show_status()

    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)
