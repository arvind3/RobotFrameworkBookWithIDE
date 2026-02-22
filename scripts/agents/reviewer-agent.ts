import {chapterDocs, readProjectFile, requiredSections, writeJsonReport} from './common';

interface ChapterIssue {
  chapter: string;
  missingSections: string[];
}

async function main(): Promise<void> {
  const issues: ChapterIssue[] = [];

  for (const chapter of chapterDocs) {
    const content = await readProjectFile(chapter);
    const missingSections = requiredSections.filter((section) => !content.includes(section));

    if (missingSections.length > 0) {
      issues.push({
        chapter,
        missingSections,
      });
    }
  }

  const score = Math.max(0, 100 - issues.length * 10);
  const report = {
    generatedAt: new Date().toISOString(),
    score,
    issues,
    passed: issues.length === 0,
  };

  await writeJsonReport('reports/reviewer.json', report);

  if (!report.passed) {
    console.error('Reviewer agent found missing required sections.');
    process.exitCode = 1;
  } else {
    console.log('Reviewer agent passed with score', score);
  }
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
