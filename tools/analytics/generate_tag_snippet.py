#!/usr/bin/env python3
"""Generate GTM-first and gtag fallback snippets from analytics config."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def load_config(path: Path | None) -> dict[str, Any]:
    if path is None:
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def consent_mode_script(consent_mode: str) -> str:
    if consent_mode == "always_on":
        return """
window.dataLayer.push({
  event: 'consent_default',
  analytics_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
""".strip()

    return """
window.dataLayer.push({
  event: 'consent_default',
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
""".strip()


def render_gtm(container_id: str, book_id: str, consent_mode: str) -> str:
    consent_block = consent_mode_script(consent_mode)
    return f"""<!-- GA4 Skill v2: GTM primary snippet -->
<script>
(function() {{
  if (window.__ga4SkillTagLoaded) return;
  window.__ga4SkillTagLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.bookAnalyticsContext = {{
    book_id: '{book_id}',
    version: 'v2'
  }};

  {consent_block}

  window.bookAnalyticsTrack = function(eventName, params) {{
    var payload = Object.assign({{}}, params || {{}}, {{
      event_name: eventName,
      book_id: window.bookAnalyticsContext.book_id,
      page_path: window.location.pathname,
      version: window.bookAnalyticsContext.version
    }});
    window.dataLayer.push(Object.assign({{ event: eventName }}, payload));
  }};

  (function(w, d, s, l, i) {{
    w[l] = w[l] || [];
    w[l].push({{ 'gtm.start': new Date().getTime(), event: 'gtm.js' }});
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  }})(window, document, 'script', 'dataLayer', '{container_id}');
}})();
</script>
"""


def render_gtag(measurement_id: str, book_id: str, consent_mode: str) -> str:
    consent_state = (
        "'granted'" if consent_mode == "always_on" else "'denied'"
    )
    return f"""<!-- GA4 Skill v2: direct gtag fallback snippet -->
<script>
(function() {{
  if (window.__ga4SkillTagLoaded) return;
  window.__ga4SkillTagLoaded = true;

  window.dataLayer = window.dataLayer || [];
  function gtag() {{ dataLayer.push(arguments); }}
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {{
    analytics_storage: {consent_state},
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  }});

  gtag('js', new Date());
  gtag('config', '{measurement_id}', {{
    send_page_view: true,
    debug_mode: false
  }});

  window.bookAnalyticsContext = {{
    book_id: '{book_id}',
    version: 'v2'
  }};

  window.bookAnalyticsTrack = function(eventName, params) {{
    var payload = Object.assign({{}}, params || {{}}, {{
      event_name: eventName,
      book_id: window.bookAnalyticsContext.book_id,
      page_path: window.location.pathname,
      version: window.bookAnalyticsContext.version
    }});
    gtag('event', eventName, payload);
  }};
}})();
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id={measurement_id}"></script>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, help="Path to analytics.config.json")
    parser.add_argument("--mode", choices=["gtm", "gtag", "both"], default="both")
    parser.add_argument("--book-id", help="Override book_id")
    parser.add_argument("--measurement-id", help="Override ga4.measurement_id")
    parser.add_argument("--container-id", help="Override gtm.container_id")
    parser.add_argument("--consent-mode", help="Override consent.mode")
    parser.add_argument("--output-dir", type=Path, help="Write snippets to this directory")
    args = parser.parse_args()

    cfg = load_config(args.config)

    book_id = args.book_id or cfg.get("book_id", "book-id")
    measurement_id = args.measurement_id or cfg.get("ga4", {}).get("measurement_id", "G-XXXXXXXXXX")
    container_id = args.container_id or cfg.get("gtm", {}).get("container_id", "GTM-XXXXXXX")
    consent_mode = args.consent_mode or cfg.get("consent", {}).get("mode", "balanced_by_region")

    outputs: dict[str, str] = {}
    if args.mode in {"gtm", "both"}:
        outputs["gtm"] = render_gtm(container_id, book_id, consent_mode)
    if args.mode in {"gtag", "both"}:
        outputs["gtag"] = render_gtag(measurement_id, book_id, consent_mode)

    if args.output_dir:
        args.output_dir.mkdir(parents=True, exist_ok=True)
        for mode, snippet in outputs.items():
            path = args.output_dir / f"snippet.{mode}.html"
            path.write_text(snippet + "\n", encoding="utf-8")

    for mode, snippet in outputs.items():
        print(f"\n# --- {mode.upper()} SNIPPET START ---\n")
        print(snippet)
        print(f"\n# --- {mode.upper()} SNIPPET END ---\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
