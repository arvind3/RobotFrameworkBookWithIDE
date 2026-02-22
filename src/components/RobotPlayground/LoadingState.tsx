import React from 'react';
import styles from './styles.module.css';

interface LoadingStateProps {
  label: string;
}

export default function LoadingState({label}: LoadingStateProps): React.JSX.Element {
  return (
    <div className={styles.loadingState}>
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
