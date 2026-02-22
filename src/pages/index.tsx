import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

interface ChapterCard {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  outcome: string;
}

const chapterCards: ChapterCard[] = [
  {
    id: '01-introduction',
    title: 'Introduction',
    level: 'Beginner',
    duration: '20 min',
    outcome: 'Learn the run-edit-learn loop.',
  },
  {
    id: '02-installation-concepts',
    title: 'Installation Concepts',
    level: 'Beginner',
    duration: '25 min',
    outcome: 'Understand dependency and runtime setup boundaries.',
  },
  {
    id: '03-robot-framework-basics',
    title: 'Robot Framework Basics',
    level: 'Beginner',
    duration: '30 min',
    outcome: 'Write readable suites with reusable keywords.',
  },
  {
    id: '04-multi-file-architecture',
    title: 'Multi-file Architecture',
    level: 'Intermediate',
    duration: '35 min',
    outcome: 'Organize suites, resources, and libraries safely.',
  },
  {
    id: '05-advanced-keywords',
    title: 'Advanced Keywords',
    level: 'Intermediate',
    duration: '35 min',
    outcome: 'Design composable business-level keyword APIs.',
  },
  {
    id: '06-python-integration',
    title: 'Python Integration',
    level: 'Intermediate',
    duration: '35 min',
    outcome: 'Expose robust Python helpers to Robot.',
  },
  {
    id: '07-best-practices',
    title: 'Best Practices',
    level: 'Intermediate',
    duration: '30 min',
    outcome: 'Reduce flaky tests with deterministic patterns.',
  },
  {
    id: '08-enterprise-patterns',
    title: 'Enterprise Patterns',
    level: 'Advanced',
    duration: '40 min',
    outcome: 'Scale quality architecture across teams.',
  },
  {
    id: '09-real-world-case-study',
    title: 'Real-world Case Study',
    level: 'Advanced',
    duration: '45 min',
    outcome: 'Map real business flow to maintainable automation.',
  },
  {
    id: '10-final-capstone-project',
    title: 'Final Capstone Project',
    level: 'Advanced',
    duration: '60+ min',
    outcome: 'Build a production-style Robot project baseline.',
  },
];

const productHighlights = [
  {
    title: 'Browser-Native Playground',
    description:
      'Run Robot Framework directly in the browser using Pyodide, without local Python installation.',
  },
  {
    title: 'Chapter-Scoped Projects',
    description:
      'Each chapter ships with realistic multi-file examples that mirror real automation repositories.',
  },
  {
    title: 'Production Safety Rails',
    description:
      'CI, Playwright checks, and live-site smoke tests protect quality before every public deployment.',
  },
  {
    title: 'Teachability-First Content',
    description:
      'Every chapter follows a consistent structure: scenario, concepts, execution, mistakes, and next steps.',
  },
  {
    title: 'Authoritative Foundations',
    description:
      'Recommendations are aligned with official Robot Framework guidance and style recommendations.',
  },
  {
    title: 'Capstone-Ready Progression',
    description:
      'The path moves from basics to enterprise patterns, ending in a full project architecture you can reuse.',
  },
];

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="Interactive Robot Framework Book"
      description="A complete interactive Robot Framework learning path with an in-browser IDE, real project structures, and production-quality practices.">
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.badge}>Production-Grade Learning Book</p>
            <Heading as="h1">Robot Framework IDE Book: Learn Fast, Build Correctly, Ship Confidently</Heading>
            <p className={styles.subtitle}>
              A chapter-by-chapter learning experience for QA engineers, developers, and test architects. Edit files,
              run suites instantly, and learn scalable automation patterns from real project structures.
            </p>
            <div className={styles.stats}>
              <div>
                <span className={styles.statNumber}>10</span>
                <span className={styles.statLabel}>Chapters</span>
              </div>
              <div>
                <span className={styles.statNumber}>26+</span>
                <span className={styles.statLabel}>Capstone Files</span>
              </div>
              <div>
                <span className={styles.statNumber}>100%</span>
                <span className={styles.statLabel}>In-Browser Run Flow</span>
              </div>
            </div>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to="/docs/01-introduction">
                Start Chapter 01
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/book-overview">
                Book Overview
              </Link>
            </div>
          </div>
          <div className={styles.heroCard} data-testid="hero-code-card">
            <pre data-testid="hero-code-snippet">{`*** Settings ***
Resource    resources/common.resource
Library     libraries/session.py

*** Test Cases ***
Checkout Happy Path
    ${session}=    Open Session
    Login As User  demo_user
    Create Order   ${session}
    Should Be Equal    ${'{'}status{'}'}    PASS`}</pre>
          </div>
        </section>

        <section className={styles.audienceSection}>
          <p className={styles.audienceLabel}>Designed for</p>
          <div className={styles.audiencePills}>
            <span>QA Engineers</span>
            <span>Developers</span>
            <span>Test Architects</span>
          </div>
        </section>

        <section className={styles.featureSection}>
          <Heading as="h2">What You Will Get</Heading>
          <div className={styles.featureGrid}>
            {productHighlights.map((item) => (
              <article key={item.title} className={styles.featureCard}>
                <Heading as="h3">{item.title}</Heading>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.pathSection}>
          <div className={styles.pathHeader}>
            <Heading as="h2">Chapter Roadmap</Heading>
            <p>Follow the sequence for maximum learning continuity. Each chapter is executable and intentionally scoped.</p>
          </div>
          <div className={styles.chapterGrid}>
            {chapterCards.map((chapter, index) => (
              <Link
                key={chapter.id}
                to={`/docs/${chapter.id}`}
                className={styles.chapterCard}
                data-testid="homepage-chapter-card">
                <span className={styles.chapterNumber}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.chapterTitle}>{chapter.title}</span>
                <span className={styles.chapterMeta}>
                  <strong>{chapter.level}</strong> • {chapter.duration}
                </span>
                <span className={styles.chapterOutcome}>{chapter.outcome}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.bottomCta}>
          <Heading as="h2">Build Your Own Automation Blueprint</Heading>
          <p>
            Complete the capstone to leave with a practical Robot Framework project structure you can adapt to your
            product team.
          </p>
          <Link className="button button--primary button--lg" to="/docs/10-final-capstone-project">
            Explore Capstone
          </Link>
        </section>
      </main>
    </Layout>
  );
}
