# Analytics Contract and Governance

This folder defines the analytics contract for `RobotFrameworkBookWithIDE`.

## Config file

- Source of truth: `analytics.config.json`
- Validator: `python3 tools/analytics/validate_config.py --config analytics/analytics.config.json`

## Event definitions

### `chapter_view`
- Fired once per docs chapter route load.
- Indicates chapter exposure.

### `chapter_complete`
- Fired once per chapter when reader reaches deep-scroll completion threshold.
- Indicates meaningful completion behavior.

### `code_copy`
- Fired when reader clicks a code copy button.
- Indicates practical code interaction.

### `toc_interaction`
- Fired when reader uses table-of-contents links.
- Indicates navigation behavior inside long-form content.

## Required payload envelope

Every custom event includes:

- `event_name`
- `book_id`
- `chapter_id`
- `chapter_title`
- `content_group`
- `page_path`
- `engagement_bucket`
- `version`

## KPI mapping

- Awareness: users, sessions, engaged sessions.
- Audience quality: country, region, device category.
- Content performance: top chapters by engaged sessions.
- Reading quality: chapter completion rate.
- Interaction quality: code copy rate, TOC interaction rate.

## GA4 custom-dimension setup checklist

Create GA4 custom dimensions for:

1. `book_id`
2. `chapter_id`
3. `chapter_title`
4. `content_group`
5. `engagement_bucket`
6. `version`

Recommended:

7. `authoring_stack`
8. `publish_channel`

## Privacy notes

- This implementation uses `always_on` consent mode by project decision.
- Do not collect PII (emails, names, identifiers) in event parameters.
- Keep event parameters schema-controlled and reviewable in source control.
