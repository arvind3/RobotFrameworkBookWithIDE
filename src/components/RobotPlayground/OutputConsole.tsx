import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface OutputConsoleProps {
  output: string;
  status: 'idle' | 'running' | 'pass' | 'fail';
}

export default function OutputConsole({output, status}: OutputConsoleProps): React.JSX.Element {
  return (
    <section className={styles.consoleSection} aria-live="polite">
      <div className={styles.consoleHeader}>
        <strong>Execution Output</strong>
        <span
          className={clsx(styles.statusBadge, {
            [styles.statusIdle]: status === 'idle',
            [styles.statusRunning]: status === 'running',
            [styles.statusPass]: status === 'pass',
            [styles.statusFail]: status === 'fail',
          })}>
          {status.toUpperCase()}
        </span>
      </div>
      <pre className={styles.consoleBody}>{output || 'Run a test to see output here.'}</pre>
    </section>
  );
}
