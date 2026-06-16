#!/usr/bin/env python3
"""
process_note.py — Deterministic helper for note processing

Validates YAML note structure, auto-assigns to best-matching week,
and generates note_id from title (slugify). Used by the /review-handbook add
command to handle mechanical I/O, freeing Claude to focus on content analysis.

Usage:
  python process_note.py validate <note_file.yaml>
  python process_note.py slugify "Some Chinese Title 标题"
  python process_note.py find-week <note_file.yaml> <roadmap.yaml>
"""

import sys
import re
import yaml
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def slugify(text: str) -> str:
    """Generate a slug from text for use as note_id."""
    # Keep alphanumeric, Chinese chars, hyphens
    slug = text.lower().strip()
    slug = re.sub(r'[^\w一-鿿-]', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug[:64]


def validate_note(filepath: str) -> bool:
    """Validate a note YAML file has all required fields."""
    required_fields = [
        'id', 'title', 'type', 'week', 'topics',
        'tags', 'sources', 'difficulty', 'status', 'rating',
        'created_at', 'updated_at'
    ]
    valid_types = {'foundation', 'interview_qa', 'paper'}
    valid_statuses = {'pending', 'in_progress', 'completed'}

    with open(filepath, 'r', encoding='utf-8') as f:
        note = yaml.safe_load(f)

    if note is None:
        print(f"ERROR: {filepath} is empty or invalid YAML")
        return False

    missing = [f for f in required_fields if f not in note]
    if missing:
        print(f"ERROR: Missing required fields: {missing}")
        return False

    if note['type'] not in valid_types:
        print(f"ERROR: Invalid type '{note['type']}'. Must be one of {valid_types}")
        return False

    if note['status'] not in valid_statuses:
        print(f"ERROR: Invalid status '{note['status']}'. Must be one of {valid_statuses}")
        return False

    if not isinstance(note['difficulty'], (int, float)) or not (1 <= note['difficulty'] <= 5):
        print(f"ERROR: difficulty must be a number 1-5, got {note['difficulty']}")
        return False

    if not isinstance(note['topics'], list) or len(note['topics']) == 0:
        print(f"ERROR: topics must be a non-empty list")
        return False

    print(f"✅ Note '{note['id']}' is valid")
    return True


def find_best_week(note_topics: list[str], roadmap_path: str) -> int:
    """
    Find the best-matching week in the roadmap for given topics.
    Returns the week number with the most topic overlap.
    """
    with open(roadmap_path, 'r', encoding='utf-8') as f:
        roadmap = yaml.safe_load(f)

    best_week = 1
    best_score = 0

    for week in roadmap.get('weeks', []):
        week_topics = set(week.get('topics', []))
        note_topics_set = set(note_topics)
        score = len(week_topics & note_topics_set)

        if score > best_score:
            best_score = score
            best_week = week['week']

    return best_week


def add_note_to_roadmap(
    note_id: str,
    note_title: str,
    note_type: str,
    note_topics: list[str],
    week_num: int,
    roadmap_path: str
) -> bool:
    """Add a note reference to the specified week in roadmap.yaml."""
    with open(roadmap_path, 'r', encoding='utf-8') as f:
        roadmap = yaml.safe_load(f)

    content_key = {
        'foundation': 'foundations',
        'interview_qa': 'interview_qa',
        'paper': 'papers',
    }.get(note_type)

    if content_key is None:
        print(f"ERROR: Unknown note type '{note_type}'")
        return False

    ref = {
        'note_id': note_id,
        'title': note_title,
        'topics': note_topics,
    }

    for week in roadmap.get('weeks', []):
        if week['week'] == week_num:
            if content_key not in week['content']:
                week['content'][content_key] = []
            # Check if already exists
            existing_ids = {r['note_id'] for r in week['content'][content_key]}
            if note_id not in existing_ids:
                week['content'][content_key].append(ref)
            break

    with open(roadmap_path, 'w', encoding='utf-8') as f:
        yaml.dump(roadmap, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print(f"✅ Added '{note_id}' to week {week_num} ({content_key})")
    return True


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == 'validate':
        if len(sys.argv) < 3:
            print("Usage: process_note.py validate <note_file.yaml>")
            sys.exit(1)
        ok = validate_note(sys.argv[2])
        sys.exit(0 if ok else 1)

    elif command == 'slugify':
        if len(sys.argv) < 3:
            print("Usage: process_note.py slugify <text>")
            sys.exit(1)
        print(slugify(sys.argv[2]))

    elif command == 'find-week':
        if len(sys.argv) < 4:
            print("Usage: process_note.py find-week <note_file.yaml> <roadmap.yaml>")
            sys.exit(1)
        with open(sys.argv[2], 'r', encoding='utf-8') as f:
            note = yaml.safe_load(f)
        week = find_best_week(note.get('topics', []), sys.argv[3])
        print(week)

    elif command == 'add-to-roadmap':
        if len(sys.argv) < 8:
            print("Usage: process_note.py add-to-roadmap <note_id> <title> <type> <topics_csv> <week> <roadmap.yaml>")
            sys.exit(1)
        topics = [t.strip() for t in sys.argv[5].split(',')]
        ok = add_note_to_roadmap(sys.argv[2], sys.argv[3], sys.argv[4], topics, int(sys.argv[6]), sys.argv[7])
        sys.exit(0 if ok else 1)

    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)
