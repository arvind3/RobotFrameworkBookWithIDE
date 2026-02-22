import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface FileNode {
  name: string;
  path: string;
  children: Map<string, FileNode>;
  isFile: boolean;
}

interface FileExplorerProps {
  files: string[];
  selectedFile: string;
  onSelect: (path: string) => void;
}

function createNode(name: string, path: string, isFile: boolean): FileNode {
  return {
    name,
    path,
    children: new Map<string, FileNode>(),
    isFile,
  };
}

function buildTree(paths: string[]): FileNode {
  const root = createNode('root', '', false);

  for (const fullPath of paths) {
    const segments = fullPath.split('/');
    let current = root;
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isFile = index === segments.length - 1;
      if (!current.children.has(segment)) {
        current.children.set(segment, createNode(segment, currentPath, isFile));
      }
      current = current.children.get(segment)!;
    });
  }

  return root;
}

function TreeNode({node, selectedFile, onSelect}: {node: FileNode; selectedFile: string; onSelect: (path: string) => void}): React.JSX.Element {
  if (node.isFile) {
    return (
      <li>
        <button
          type="button"
          className={clsx(styles.fileItem, {
            [styles.fileItemSelected]: selectedFile === node.path,
          })}
          onClick={() => onSelect(node.path)}>
          {node.name}
        </button>
      </li>
    );
  }

  const children = Array.from(node.children.values()).sort((a, b) => {
    if (a.isFile !== b.isFile) {
      return a.isFile ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <li>
      {node.path ? <div className={styles.folderLabel}>{node.name}</div> : null}
      <ul className={styles.fileTree}>
        {children.map((child) => (
          <TreeNode key={child.path} node={child} selectedFile={selectedFile} onSelect={onSelect} />
        ))}
      </ul>
    </li>
  );
}

export default function FileExplorer({files, selectedFile, onSelect}: FileExplorerProps): React.JSX.Element {
  const tree = buildTree(files);

  return (
    <aside className={styles.fileExplorer} data-testid="file-explorer">
      <h3 className={styles.panelTitle}>Files</h3>
      <ul className={styles.fileTree}>
        {Array.from(tree.children.values()).map((node) => (
          <TreeNode key={node.path} node={node} selectedFile={selectedFile} onSelect={onSelect} />
        ))}
      </ul>
    </aside>
  );
}
