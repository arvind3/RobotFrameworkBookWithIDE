import {writeJsonReport} from './common';

async function main(): Promise<void> {
  const report = {
    generatedAt: new Date().toISOString(),
    domain: 'Robot Framework + browser execution + educational UX',
    findings: [
      {
        topic: 'Robot Framework structure',
        recommendation: 'Keep resource files separated by domain and avoid giant keyword files.',
        rationale: 'Improves reuse and lowers maintenance cost as suites grow.',
      },
      {
        topic: 'Python keyword libraries',
        recommendation: 'Use small single-purpose Python libraries with explicit class keywords.',
        rationale: 'Makes custom keywords easier to test and discover in docs.',
      },
      {
        topic: 'Learning UX',
        recommendation: 'Provide immediate run/reset cycle and visible file tree for chapter examples.',
        rationale: 'Tight feedback loops reduce cognitive overhead for learners.',
      },
    ],
  };

  await writeJsonReport('docs/_meta/research-knowledge-base.json', report);
  console.log('Research agent completed: docs/_meta/research-knowledge-base.json');
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
