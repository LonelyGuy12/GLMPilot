import { create } from 'zustand';
import type { FileNode } from '@glmpilot/shared';

const DEFAULT_FILES: Record<string, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Project</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="app">
    <h1>Hello, GLMPilot!</h1>
    <p>Start editing to see changes in the live preview.</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
  'style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #0a0a0f;
  color: #e8e8e8;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #81f084, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #a0a0a0;
  font-size: 1.1rem;
}`,
  'script.js': `// Welcome to GLMPilot!
console.log("Hello from GLMPilot!");

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const btn = document.createElement('button');
  btn.textContent = 'Click me';
  btn.style.cssText = 'margin-top:1.5rem;padding:0.75rem 2rem;background:#81f084;color:#000;border:none;border-radius:8px;font-size:1rem;cursor:pointer;font-weight:600';
  btn.addEventListener('click', () => alert('GLMPilot is working!'));
  app?.appendChild(btn);
});`,
  'README.md': `# My Project\n\nBuilt with GLMPilot — the AI-powered browser IDE.\n`,
};

interface FileStore {
  fileTree: FileNode[];
  files: Record<string, string>;
  initialized: boolean;
  setFileTree: (tree: FileNode[]) => void;
  setFiles: (files: Record<string, string>) => void;
  updateFile: (path: string, content: string) => void;
  createFile: (path: string, content?: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  importFiles: (files: Record<string, string>, tree: FileNode[]) => void;
  initialize: () => void;
}

function buildTreeFromPaths(paths: string[]): FileNode[] {
  const root: FileNode[] = [];
  for (const path of paths.sort()) {
    const parts = path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      if (i === parts.length - 1) {
        current.push({ name, path, type: 'file' });
      } else {
        let dir = current.find((n) => n.name === name && n.type === 'directory');
        if (!dir) {
          dir = { name, path: parts.slice(0, i + 1).join('/'), type: 'directory', children: [] };
          current.push(dir);
        }
        current = dir.children!;
      }
    }
  }
  return root;
}

export const useFileStore = create<FileStore>((set, get) => ({
  fileTree: [],
  files: {},
  initialized: false,

  initialize: () => {
    if (get().initialized) return;
    // Try loading from localStorage
    const saved = localStorage.getItem('ff-workspace');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.files && Object.keys(parsed.files).length > 0) {
          set({ files: parsed.files, fileTree: buildTreeFromPaths(Object.keys(parsed.files)), initialized: true });
          return;
        }
      } catch { /* fallback */ }
    }
    // Use default files
    set({
      files: DEFAULT_FILES,
      fileTree: buildTreeFromPaths(Object.keys(DEFAULT_FILES)),
      initialized: true,
    });
  },

  setFileTree: (tree) => set({ fileTree: tree }),
  setFiles: (files) => set({ files }),

  updateFile: (path, content) => {
    set((state) => {
      const files = { ...state.files, [path]: content };
      persist(files);
      return { files };
    });
  },

  createFile: (path, content = '') => {
    set((state) => {
      const files = { ...state.files, [path]: content };
      persist(files);
      return { files, fileTree: buildTreeFromPaths(Object.keys(files)) };
    });
  },

  deleteFile: (path) => {
    set((state) => {
      const files = { ...state.files };
      delete files[path];
      persist(files);
      return { files, fileTree: buildTreeFromPaths(Object.keys(files)) };
    });
  },

  renameFile: (oldPath, newPath) => {
    set((state) => {
      const files = { ...state.files };
      files[newPath] = files[oldPath] || '';
      delete files[oldPath];
      persist(files);
      return { files, fileTree: buildTreeFromPaths(Object.keys(files)) };
    });
  },

  importFiles: (importedFiles, tree) => {
    set({ files: importedFiles, fileTree: tree, initialized: true });
    persist(importedFiles);
  },
}));

function persist(files: Record<string, string>) {
  try {
    localStorage.setItem('ff-workspace', JSON.stringify({ files }));
  } catch { /* storage full */ }
}
