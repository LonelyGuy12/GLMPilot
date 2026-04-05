import { create } from 'zustand';

interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface OpenFile {
  path: string;
  content: string;
  isDirty: boolean;
  language: string;
  cursorPosition: CursorPosition;
}

interface EditorState {
  openFiles: Record<string, OpenFile>;
  activeFilePath: string | null;
  recentFiles: string[];
  addFile: (path: string, content: string, language: string) => void;
  removeFile: (path: string) => void;
  setActive: (path: string) => void;
  updateContent: (path: string, content: string) => void;
  markClean: (path: string) => void;
  setCursorPosition: (path: string, position: CursorPosition) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  openFiles: {},
  activeFilePath: null,
  recentFiles: [],

  addFile: (path, content, language) =>
    set((state) => {
      if (state.openFiles[path]) {
        return { activeFilePath: path, recentFiles: [path, ...state.recentFiles.filter((f) => f !== path)].slice(0, 10) };
      }
      return {
        openFiles: {
          ...state.openFiles,
          [path]: { path, content, isDirty: false, language, cursorPosition: { lineNumber: 1, column: 1 } },
        },
        activeFilePath: path,
        recentFiles: [path, ...state.recentFiles.filter((f) => f !== path)].slice(0, 10),
      };
    }),

  removeFile: (path) =>
    set((state) => {
      const { [path]: _, ...rest } = state.openFiles;
      const remainingPaths = Object.keys(rest);
      const activeFilePath = state.activeFilePath === path
        ? remainingPaths[remainingPaths.length - 1] || null
        : state.activeFilePath;
      return { openFiles: rest, activeFilePath };
    }),

  setActive: (path) => set({ activeFilePath: path }),

  updateContent: (path, content) =>
    set((state) => {
      const file = state.openFiles[path];
      if (!file) return state;
      return {
        openFiles: {
          ...state.openFiles,
          [path]: { ...file, content, isDirty: true },
        },
      };
    }),

  markClean: (path) =>
    set((state) => {
      const file = state.openFiles[path];
      if (!file) return state;
      return {
        openFiles: {
          ...state.openFiles,
          [path]: { ...file, isDirty: false },
        },
      };
    }),

  setCursorPosition: (path, position) =>
    set((state) => {
      const file = state.openFiles[path];
      if (!file) return state;
      return {
        openFiles: {
          ...state.openFiles,
          [path]: { ...file, cursorPosition: position },
        },
      };
    }),
}));
