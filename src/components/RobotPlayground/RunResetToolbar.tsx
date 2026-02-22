import React from 'react';
import styles from './styles.module.css';

interface RunResetToolbarProps {
  running: boolean;
  onRun: () => void;
  onReset: () => void;
}

export default function RunResetToolbar({running, onRun, onReset}: RunResetToolbarProps): React.JSX.Element {
  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        className={styles.runButton}
        onClick={onRun}
        disabled={running}
        data-testid="run-button">
        {running ? 'Running...' : 'Run'}
      </button>
      <button type="button" className={styles.resetButton} onClick={onReset} disabled={running} data-testid="reset-button">
        Reset
      </button>
    </div>
  );
}
