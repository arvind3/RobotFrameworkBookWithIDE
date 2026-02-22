import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const highlights = [
  {
    title: 'Browser-Native Execution',
    description:
      'Pyodide runs Python and Robot Framework in the browser, so chapters stay interactive without a backend.',
  },
  {
    title: 'Multi-File Learning',
    description:
      'Each chapter includes nested project files and a file explorer to mirror realistic automation suites.',
  },
  {
    title: 'Production Pipeline',
    description:
      'Playwright checks, quality gates, and GitHub Pages deployment are wired for continuous updates.',
  },
];

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="Interactive Robot Framework Book"
      description="Learn Robot Framework from beginner to capstone project with in-browser execution.">
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Autonomous Interactive Robot Framework Book</p>
            <Heading as="h1">Build Practical Test Automation Skills Inside the Browser</Heading>
            <p className={styles.lead}>
              Open a chapter, edit files, run Robot Framework instantly, and iterate with zero local setup.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to="/docs/01-introduction">
                Start Chapter 01
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/10-final-capstone-project">
                Explore Capstone
              </Link>
            </div>
          </div>
          <div className={styles.heroCard} data-testid="hero-code-card">
            <pre data-testid="hero-code-snippet">{`*** Test Cases ***
Run In Browser
    Open Playground
    Execute Robot Suite
    Should Be Equal    ${'{'}status{'}'}    PASS`}</pre>
          </div>
        </section>

        <section className={styles.gridSection}>
          {highlights.map((highlight) => (
            <article key={highlight.title} className={styles.card}>
              <Heading as="h2">{highlight.title}</Heading>
              <p>{highlight.description}</p>
            </article>
          ))}
        </section>
      </main>
    </Layout>
  );
}
