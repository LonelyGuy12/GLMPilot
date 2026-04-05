import { create } from 'zustand';
import type { FileNode } from '@glmpilot/shared';

interface GitHubState {
  owner: string;
  repo: string;
  branch: string;
  isImporting: boolean;
  importProgress: string;
  isAuthenticated: boolean;
  prDraftUrl: string | null;
  setRepo: (owner: string, repo: string, branch?: string) => void;
  setImporting: (importing: boolean, progress?: string) => void;
  setAuthenticated: (auth: boolean) => void;
  setPRDraft: (url: string | null) => void;
}

export const useGitHubStore = create<GitHubState>((set) => ({
  owner: '',
  repo: '',
  branch: 'main',
  isImporting: false,
  importProgress: '',
  isAuthenticated: false,
  prDraftUrl: null,

  setRepo: (owner, repo, branch = 'main') => set({ owner, repo, branch }),
  setImporting: (importing, progress = '') => set({ isImporting: importing, importProgress: progress }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setPRDraft: (url) => set({ prDraftUrl: url }),
}));
