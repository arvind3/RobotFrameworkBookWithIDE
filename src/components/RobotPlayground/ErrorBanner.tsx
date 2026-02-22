import React from 'react';
import styles from './styles.module.css';

interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({message}: ErrorBannerProps): React.JSX.Element {
  return <div className={styles.errorBanner}>{message}</div>;
}
