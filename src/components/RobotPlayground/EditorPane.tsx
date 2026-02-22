import React from 'react';
import Editor from '@monaco-editor/react';
import styles from './styles.module.css';

interface EditorPaneProps {
  path: string;
  value: string;
  theme: 'light' | 'dark';
  height: number;
  onChange: (value: string) => void;
}

function inferLanguage(path: string): string {
  if (path.endsWith('.py')) {
    return 'python';
  }
  if (path.endsWith('.json')) {
    return 'json';
  }
  if (path.endsWith('.yaml') || path.endsWith('.yml')) {
    return 'yaml';
  }
  if (path.endsWith('.robot') || path.endsWith('.resource')) {
    return 'plaintext';
  }
  return 'plaintext';
}

export default function EditorPane({path, value, theme, height, onChange}: EditorPaneProps): React.JSX.Element {
  return (
    <section className={styles.editorSection}>
      <div className={styles.editorHeader}>
        <h3 className={styles.panelTitle}>Editor</h3>
        <span className={styles.currentFile}>{path}</span>
      </div>
      <Editor
        height={height}
        path={path}
        defaultLanguage={inferLanguage(path)}
        language={inferLanguage(path)}
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={(nextValue) => onChange(nextValue ?? '')}
        options={{
          minimap: {enabled: false},
          fontSize: 14,
          scrollBeyondLastLine: false,
          lineNumbersMinChars: 3,
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </section>
  );
}
