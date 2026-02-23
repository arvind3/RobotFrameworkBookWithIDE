#!/usr/bin/env -S node --no-warnings

import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

type Args = {
  url: string;
  output: string;
  timeoutMs: number;
  headless: boolean;
};

type AuditReport = {
  status: 'pass' | 'fail';
  missing_required_events: string[];
  duplicate_event_risks: string[];
  privacy_violations: string[];
  tag_load_issues: string[];
  recommendations: string[];
  observed_events: string[];
  details: {
    code_copy_clicked: boolean;
    toc_clicked: boolean;
    gtm_script_count: number;
    gtag_script_count: number;
    consent_defaults_seen: number;
  };
};

function parseArgs(argv: string[]): Args {
  const args: Record<string, string> = {};
  let i = 2;

  while (i < argv.length) {
    const key = argv[i];
    const next = argv[i + 1];

    if (!key.startsWith('--')) {
      i += 1;
      continue;
    }

    if (!next || next.startsWith('--')) {
      args[key.slice(2)] = 'true';
      i += 1;
      continue;
    }

    args[key.slice(2)] = next;
    i += 2;
  }

  if (!args.url) {
    throw new Error('Missing required --url');
  }

  return {
    url: args.url,
    output: args.output ?? 'artifacts/ga4-runtime-audit.json',
    timeoutMs: Number(args.timeout_ms ?? '60000'),
    headless: args.headless !== 'false',
  };
}

function extractEventName(entry: unknown): string | null {
  if (Array.isArray(entry)) {
    if (entry[0] === 'event' && typeof entry[1] === 'string') {
      return entry[1];
    }
    if (entry[0] === 'consent' && entry[1] === 'default') {
      return 'consent_default';
    }
    return null;
  }

  if (entry && typeof entry === 'object') {
    const rec = entry as Record<string, unknown>;
    if (typeof rec.event === 'string') {
      return rec.event;
    }
  }

  return null;
}

async function runAudit(args: Args): Promise<AuditReport> {
  const browser = await chromium.launch({headless: args.headless});
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => {
    (window as any).__ga4Audit = {
      pushes: [] as unknown[],
      events: [] as string[],
    };

    const dl = ((window as any).dataLayer = (window as any).dataLayer || []);
    const originalPush = dl.push.bind(dl);
    dl.push = (...items: unknown[]) => {
      const audit = (window as any).__ga4Audit;
      audit.pushes.push(...items);

      for (const item of items) {
        if (Array.isArray(item) && item[0] === 'event' && typeof item[1] === 'string') {
          audit.events.push(item[1]);
        } else if (item && typeof item === 'object' && typeof (item as any).event === 'string') {
          audit.events.push((item as any).event);
        } else if (Array.isArray(item) && item[0] === 'consent' && item[1] === 'default') {
          audit.events.push('consent_default');
        }
      }

      return originalPush(...items);
    };
  });

  try {
    await page.goto(args.url, {waitUntil: 'domcontentloaded', timeout: args.timeoutMs});
    await page.waitForTimeout(1200);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight * 0.95);
    });
    await page.waitForTimeout(900);

    const codeCopyClicked = await page.evaluate(() => {
      const copyButton = document.querySelector('button[class*="copyButton"], button[aria-label*="Copy" i]') as HTMLButtonElement | null;
      if (!copyButton) {
        return false;
      }
      copyButton.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
      return true;
    });

    const tocClicked = await page.evaluate(() => {
      const tocLink = document.querySelector('nav.table-of-contents a, a.table-of-contents__link') as HTMLAnchorElement | null;
      if (!tocLink) {
        return false;
      }
      tocLink.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
      return true;
    });

    await page.waitForTimeout(800);

    const raw = await page.evaluate(() => {
      const audit = (window as any).__ga4Audit || {pushes: [], events: []};
      const gtmScriptCount = document.querySelectorAll("script[src*='googletagmanager.com/gtm.js']").length;
      const gtagScriptCount = document.querySelectorAll("script[src*='googletagmanager.com/gtag/js']").length;
      return {
        pushes: audit.pushes,
        events: audit.events,
        gtmScriptCount,
        gtagScriptCount,
      };
    });

    const observed = new Set<string>();
    for (const entry of raw.pushes as unknown[]) {
      const name = extractEventName(entry);
      if (name) {
        observed.add(name);
      }
    }
    for (const evt of raw.events as string[]) {
      observed.add(evt);
    }

    const observedEvents = Array.from(observed).sort();

    const requiredEvents = ['chapter_view', 'chapter_complete'];
    const missingRequired = requiredEvents.filter((evt) => !observed.has(evt));

    if (codeCopyClicked && !observed.has('code_copy')) {
      missingRequired.push('code_copy');
    }
    if (tocClicked && !observed.has('toc_interaction')) {
      missingRequired.push('toc_interaction');
    }

    const duplicateRisks: string[] = [];
    if (observed.has('scroll_50') || observed.has('scroll_90')) {
      duplicateRisks.push('Custom scroll_50/scroll_90 observed while Enhanced Measurement scroll should be preferred');
    }
    if (observed.has('pdf_download')) {
      duplicateRisks.push('Custom pdf_download observed while Enhanced Measurement file_download should be preferred');
    }
    if (observed.has('outbound_click')) {
      duplicateRisks.push('Custom outbound_click observed while Enhanced Measurement click should be preferred');
    }

    const privacyViolations: string[] = [];
    const consentDefaultsSeen = observedEvents.filter((e) => e === 'consent_default').length;
    if (consentDefaultsSeen === 0) {
      privacyViolations.push('No consent_default signal observed before analytics events');
    }

    const tagLoadIssues: string[] = [];
    if (raw.gtmScriptCount > 1) {
      tagLoadIssues.push(`GTM script loaded ${raw.gtmScriptCount} times`);
    }
    if (raw.gtagScriptCount > 1) {
      tagLoadIssues.push(`gtag script loaded ${raw.gtagScriptCount} times`);
    }

    const recommendations: string[] = [];
    if (duplicateRisks.length > 0) {
      recommendations.push('Remove overlapping custom generic events when Enhanced Measurement is enabled');
    }
    if (privacyViolations.length > 0) {
      recommendations.push('Emit consent default state before any analytics event in page lifecycle');
    }

    const failed = missingRequired.length > 0 || privacyViolations.length > 0 || tagLoadIssues.length > 0;

    return {
      status: failed ? 'fail' : 'pass',
      missing_required_events: missingRequired,
      duplicate_event_risks: duplicateRisks,
      privacy_violations: privacyViolations,
      tag_load_issues: tagLoadIssues,
      recommendations,
      observed_events: observedEvents,
      details: {
        code_copy_clicked: codeCopyClicked,
        toc_clicked: tocClicked,
        gtm_script_count: raw.gtmScriptCount,
        gtag_script_count: raw.gtagScriptCount,
        consent_defaults_seen: consentDefaultsSeen,
      },
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv);
  const report = await runAudit(args);

  const outputPath = path.resolve(args.output);
  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf-8');

  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  return report.status === 'pass' ? 0 : 1;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error(String(err));
    process.exitCode = 1;
  });
