import {chapterDocs, readProjectFile, writeJsonReport} from './common';

interface ReadabilityFinding {
  chapter: string;
  veryLongSentenceCount: number;
}

async function main(): Promise<void> {
  const findings: ReadabilityFinding[] = [];

  for (const chapter of chapterDocs) {
    const content = await readProjectFile(chapter);
    const sentences = content
      .replace(/\n+/g, ' ')
      .split(/[.!?]/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const veryLongSentenceCount = sentences.filter((sentence) => sentence.split(/\s+/).length > 32).length;

    findings.push({
      chapter,
      veryLongSentenceCount,
    });
  }

  const failures = findings.filter((finding) => finding.veryLongSentenceCount > 8);
  const report = {
    generatedAt: new Date().toISOString(),
    failures,
    findings,
    passed: failures.length === 0,
  };

  await writeJsonReport('reports/editor.json', report);

  if (!report.passed) {
    console.error('Editor agent failed readability thresholds.');
    process.exitCode = 1;
  } else {
    console.log('Editor agent passed readability thresholds.');
  }
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
