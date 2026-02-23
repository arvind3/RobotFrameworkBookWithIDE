#!/usr/bin/env python3
"""Validate analytics.config.json and optional built-site tagging safety checks."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

MEASUREMENT_ID_RE = re.compile(r"^G-[A-Z0-9]{8,12}$")
GTM_ID_RE = re.compile(r"^GTM-[A-Z0-9]{6,12}$")
BOOK_ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$")

ALLOWED_CONSENT_MODES = {"balanced_by_region", "strict_by_default", "always_on"}
REQUIRED_CUSTOM_EVENTS = {"chapter_view", "chapter_complete", "code_copy", "toc_interaction"}
BUILT_IN_CONFLICTS = {
    "scroll": {"scroll_50", "scroll_90"},
    "file_download": {"pdf_download"},
    "outbound_click": {"outbound_click"},
}


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in {path}: {exc}") from exc


def get_nested(obj: dict[str, Any], path: str) -> Any:
    cur: Any = obj
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def validate_config(config: dict[str, Any]) -> dict[str, list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    duplicate_event_risks: list[str] = []
    privacy_violations: list[str] = []
    missing_required_events: list[str] = []
    recommendations: list[str] = []

    required_paths = [
        "book_id",
        "book_name",
        "site_url",
        "ga4.measurement_id",
        "gtm.container_id",
        "consent.mode",
        "region_policy.restricted_regions",
        "region_policy.default_region",
        "events.custom_enabled",
        "debug.enabled",
    ]

    for path in required_paths:
        if get_nested(config, path) is None:
            errors.append(f"Missing required field: {path}")

    book_id = get_nested(config, "book_id")
    if isinstance(book_id, str):
        if not BOOK_ID_RE.match(book_id):
            errors.append("book_id must be kebab-case with lowercase letters, numbers, and hyphens")
    else:
        errors.append("book_id must be a string")

    site_url = get_nested(config, "site_url")
    if isinstance(site_url, str):
        parsed = urlparse(site_url)
        if parsed.scheme not in {"https", "http"} or not parsed.netloc:
            errors.append("site_url must be an absolute URL")
    else:
        errors.append("site_url must be a string")

    measurement_id = get_nested(config, "ga4.measurement_id")
    if isinstance(measurement_id, str):
        if not MEASUREMENT_ID_RE.match(measurement_id):
            errors.append("ga4.measurement_id must match G-XXXXXXXXXX format")
    else:
        errors.append("ga4.measurement_id must be a string")

    container_id = get_nested(config, "gtm.container_id")
    if isinstance(container_id, str):
        if not GTM_ID_RE.match(container_id):
            errors.append("gtm.container_id must match GTM-XXXXXXX format")
    else:
        errors.append("gtm.container_id must be a string")

    consent_mode = get_nested(config, "consent.mode")
    if consent_mode not in ALLOWED_CONSENT_MODES:
        errors.append(
            "consent.mode must be one of: balanced_by_region, strict_by_default, always_on"
        )

    restricted_regions = get_nested(config, "region_policy.restricted_regions")
    if not isinstance(restricted_regions, list) or not restricted_regions:
        errors.append("region_policy.restricted_regions must be a non-empty list")
    elif not all(isinstance(code, str) and len(code) == 2 for code in restricted_regions):
        errors.append("region_policy.restricted_regions must contain ISO-3166 alpha-2 codes")

    default_region = get_nested(config, "region_policy.default_region")
    if not isinstance(default_region, str) or not default_region:
        errors.append("region_policy.default_region must be a non-empty string")

    custom_enabled = get_nested(config, "events.custom_enabled")
    if not isinstance(custom_enabled, bool):
        errors.append("events.custom_enabled must be boolean")

    custom_events = get_nested(config, "events.custom_events")
    if custom_enabled:
        if not isinstance(custom_events, list):
            errors.append("events.custom_events must be a list when custom_enabled=true")
            custom_events = []
        else:
            missing_required_events = sorted(list(REQUIRED_CUSTOM_EVENTS.difference(set(custom_events))))
            if missing_required_events:
                errors.append(
                    "events.custom_events missing required events: "
                    + ", ".join(missing_required_events)
                )

    enhanced = get_nested(config, "events.enhanced_measurement")
    if not isinstance(enhanced, dict):
        warnings.append("events.enhanced_measurement not present; duplicate-risk checks are limited")
        enhanced = {}

    if isinstance(custom_events, list):
        custom_set = set(custom_events)
        for built_in, conflicting_custom in BUILT_IN_CONFLICTS.items():
            if enhanced.get(built_in) and custom_set.intersection(conflicting_custom):
                duplicate_event_risks.append(
                    f"Enhanced Measurement '{built_in}' may conflict with custom events: "
                    f"{', '.join(sorted(custom_set.intersection(conflicting_custom)))}"
                )

    if consent_mode == "always_on":
        warnings.append("consent.mode=always_on may violate regional privacy obligations")

    if consent_mode in {"balanced_by_region", "strict_by_default"}:
        recommendations.append("Ensure consent default is set before any analytics events are emitted.")

    debug_enabled = get_nested(config, "debug.enabled")
    if not isinstance(debug_enabled, bool):
        errors.append("debug.enabled must be boolean")

    if get_nested(config, "privacy.allow_pii") is True:
        privacy_violations.append("privacy.allow_pii=true is not allowed")

    return {
        "errors": errors,
        "warnings": warnings,
        "missing_required_events": missing_required_events,
        "duplicate_event_risks": duplicate_event_risks,
        "privacy_violations": privacy_violations,
        "tag_load_issues": [],
        "recommendations": recommendations,
    }


def scan_site_for_tag_issues(site_dir: Path) -> tuple[list[str], list[str]]:
    issues: list[str] = []
    recommendations: list[str] = []

    html_files = sorted(site_dir.rglob("*.html"))
    if not html_files:
        issues.append(f"No HTML files found in {site_dir}")
        return issues, recommendations

    for html in html_files:
        text = html.read_text(encoding="utf-8", errors="ignore")
        gtm_count = text.count("googletagmanager.com/gtm.js?id=")
        gtag_count = text.count("googletagmanager.com/gtag/js?id=")

        if gtm_count > 1:
            issues.append(f"{html}: GTM script appears {gtm_count} times")
        if gtag_count > 1:
            issues.append(f"{html}: gtag script appears {gtag_count} times")
        if gtm_count and gtag_count:
            recommendations.append(
                f"{html}: both GTM and direct gtag found; ensure fallback mode to avoid dual counting"
            )

    return issues, recommendations


def build_report(config_path: Path, site_dir: Path | None) -> dict[str, Any]:
    config = load_json(config_path)
    report = validate_config(config)

    if site_dir:
        tag_issues, site_recos = scan_site_for_tag_issues(site_dir)
        report["tag_load_issues"].extend(tag_issues)
        report["recommendations"].extend(site_recos)

    failed = bool(
        report["errors"]
        or report["missing_required_events"]
        or report["privacy_violations"]
        or report["tag_load_issues"]
    )
    report["status"] = "fail" if failed else "pass"

    # Keep keys in a stable contract order.
    ordered = {
        "status": report["status"],
        "missing_required_events": report["missing_required_events"],
        "duplicate_event_risks": report["duplicate_event_risks"],
        "privacy_violations": report["privacy_violations"],
        "tag_load_issues": report["tag_load_issues"],
        "recommendations": report["recommendations"],
        "errors": report["errors"],
        "warnings": report["warnings"],
    }
    return ordered


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True, type=Path, help="Path to analytics.config.json")
    parser.add_argument("--site-dir", type=Path, help="Optional built site directory to scan for duplicate tags")
    parser.add_argument("--output", type=Path, help="Optional path to write JSON report")
    args = parser.parse_args()

    try:
        report = build_report(args.config, args.site_dir)
    except ValueError as exc:
        print(json.dumps({"status": "fail", "errors": [str(exc)]}, indent=2), file=sys.stderr)
        return 1

    payload = json.dumps(report, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(payload + "\n", encoding="utf-8")

    print(payload)
    return 1 if report["status"] == "fail" else 0


if __name__ == "__main__":
    raise SystemExit(main())
