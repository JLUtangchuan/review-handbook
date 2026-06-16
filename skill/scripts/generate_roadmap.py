#!/usr/bin/env python3
"""
generate_roadmap.py — Generate 100-day learning roadmap

Reads config.yaml and topics.yaml, generates a structured 15-week
study plan for the target role, and writes roadmap.yaml.

Usage:
  python generate_roadmap.py [--role "具身智能算法工程师"] [--start-date 2026-06-16] [--dry-run]
"""

import sys
import yaml
from pathlib import Path
from datetime import datetime, timedelta

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / 'data'

# Role-specific week themes
ROLE_TEMPLATES = {
    "具身智能算法工程师": [
        {"theme": "机器人学基础：运动学与坐标变换", "topics": ["kinematics", "motion-planning", "ros"]},
        {"theme": "机器人动力学与控制基础", "topics": ["dynamics", "control-theory", "state-estimation"]},
        {"theme": "深度学习基础回顾", "topics": ["deep-learning-basics", "optimization", "transformers"]},
        {"theme": "计算机视觉基础：2D→3D", "topics": ["3d-perception", "object-detection", "point-cloud"]},
        {"theme": "强化学习基础", "topics": ["rl-basics", "imitation-learning"]},
        {"theme": "模仿学习与离线强化学习", "topics": ["imitation-learning", "offline-rl", "rl-for-manipulation"]},
        {"theme": "视觉语言模型（VLM）基础", "topics": ["vlm-foundation", "multi-modal-fusion", "generative-models"]},
        {"theme": "VLA模型：RT系列与基础模型", "topics": ["rt-series", "action-tokenization", "vlm-foundation"]},
        {"theme": "VLA模型：开源方案与最新进展", "topics": ["octo-openvla", "action-tokenization", "multi-modal-fusion"]},
        {"theme": "3D感知与NeRF/Gaussian Splatting", "topics": ["nerf-gaussian", "3d-perception", "point-cloud"]},
        {"theme": "操作任务与灵巧操作", "topics": ["rl-for-manipulation", "imitation-learning", "sim-to-real"]},
        {"theme": "Sim-to-Real迁移与域适应", "topics": ["domain-randomization", "domain-adaptation", "simulators"]},
        {"theme": "ML系统设计与工程实践", "topics": ["ml-system-design", "distributed-training", "model-deployment"]},
        {"theme": "前沿论文与最新趋势", "topics": ["vla", "generative-models", "sim-to-real"]},
        {"theme": "综合复习与模拟面试", "topics": ["robotics-foundation", "vla", "reinforcement-learning", "computer-vision"]},
    ],
    "自动驾驶感知算法工程师": [
        {"theme": "深度学习基础回顾", "topics": ["deep-learning-basics", "optimization", "transformers"]},
        {"theme": "计算机视觉基础", "topics": ["3d-perception", "object-detection", "video-understanding"]},
        {"theme": "3D目标检测：方法对比", "topics": ["3d-perception", "object-detection", "point-cloud"]},
        {"theme": "点云处理与特征提取", "topics": ["point-cloud", "3d-perception"]},
        {"theme": "BEV感知：从LSS到BEVFormer", "topics": ["3d-perception", "transformers"]},
        {"theme": "Occupancy Network与3D重建", "topics": ["3d-perception", "nerf-gaussian"]},
        {"theme": "时序融合与轨迹预测", "topics": ["video-understanding", "rl-basics"]},
        {"theme": "传感器融合策略", "topics": ["3d-perception", "point-cloud", "object-detection"]},
        {"theme": "端到端自动驾驶", "topics": ["imitation-learning", "rl-basics", "transformers"]},
        {"theme": "世界模型与预测", "topics": ["generative-models", "video-understanding"]},
        {"theme": "多模态融合与VLM", "topics": ["vlm-foundation", "multi-modal-fusion"]},
        {"theme": "模型部署与推理优化", "topics": ["model-deployment", "distributed-training"]},
        {"theme": "ML系统设计", "topics": ["ml-system-design", "model-deployment"]},
        {"theme": "前沿论文与最新趋势", "topics": ["3d-perception", "vla", "generative-models"]},
        {"theme": "综合复习与模拟面试", "topics": ["3d-perception", "transformers", "ml-system-design"]},
    ],
}


def generate_roadmap(
    role: str,
    start_date_str: str,
    total_days: int = 100,
    existing_roadmap: dict | None = None
) -> dict:
    """Generate a complete roadmap YAML structure."""
    template = ROLE_TEMPLATES.get(role, ROLE_TEMPLATES["具身智能算法工程师"])
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")

    # Preserve existing content references if updating
    existing_weeks = {}
    if existing_roadmap:
        for w in existing_roadmap.get('weeks', []):
            existing_weeks[w['week']] = w.get('content', {
                'foundations': [],
                'interview_qa': [],
                'papers': [],
            })

    weeks = []
    current_date = start_date

    for i, tmpl in enumerate(template):
        week_num = i + 1
        week_start = current_date
        week_end = current_date + timedelta(days=6)

        # Use existing content if available, otherwise empty slots
        content = existing_weeks.get(week_num, {
            'foundations': [],
            'interview_qa': [],
            'papers': [],
        })

        weeks.append({
            'week': week_num,
            'theme': tmpl['theme'],
            'start_date': week_start.strftime('%Y-%m-%d'),
            'end_date': week_end.strftime('%Y-%m-%d'),
            'day_range': [week_num * 7 - 6, week_num * 7],
            'topics': tmpl['topics'],
            'content': content,
        })

        current_date = week_end + timedelta(days=1)

    return {
        'role': role,
        'start_date': start_date_str,
        'total_days': total_days,
        'total_weeks': len(weeks),
        'weeks': weeks,
    }


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Generate 100-day learning roadmap')
    parser.add_argument('--role', default='具身智能算法工程师', help='Target role')
    parser.add_argument('--start-date', default='2026-06-16', help='Start date (YYYY-MM-DD)')
    parser.add_argument('--dry-run', action='store_true', help='Print but do not write')
    parser.add_argument('--update', action='store_true', help='Preserve existing content references')

    args = parser.parse_args()

    # Read existing roadmap if updating
    existing = None
    roadmap_path = DATA_DIR / 'roadmap.yaml'
    if args.update and roadmap_path.exists():
        with open(roadmap_path, 'r', encoding='utf-8') as f:
            existing = yaml.safe_load(f)

    roadmap = generate_roadmap(args.role, args.start_date, existing_roadmap=existing)

    if args.dry_run:
        print(yaml.dump(roadmap, allow_unicode=True, default_flow_style=False, sort_keys=False))
    else:
        with open(roadmap_path, 'w', encoding='utf-8') as f:
            yaml.dump(roadmap, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
        print(f"✅ Roadmap written to {roadmap_path}")
        print(f"   Role: {args.role}")
        print(f"   Weeks: {len(roadmap['weeks'])}")
        print(f"   Start: {args.start_date}")


if __name__ == '__main__':
    # Support both CLI args and direct module import
    if len(sys.argv) > 1:
        main()
    else:
        # Default: print help
        print(__doc__)
