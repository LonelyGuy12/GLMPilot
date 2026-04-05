import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Typed API methods
export const chatAPI = {
  send: (message: string, history: Array<{ role: string; content: string }>, stream = true) =>
    api.post('/chat', { message, history, stream }),
};

export const completeAPI = {
  getCompletion: (prefix: string, suffix: string, language: string, contextFiles?: Array<{ path: string; content: string }>) =>
    api.post('/complete', { prefix, suffix, language, contextFiles }),
};

export const analyzeAPI = {
  analyzeCodebase: (files: Record<string, string>, agents?: string[], mode?: string) =>
    api.post('/analyze', { files, agents, mode }),
  analyzeFile: (filePath: string, content: string) =>
    api.post('/analyze/file', { filePath, content }),
};

export const githubAPI = {
  importRepo: (url: string, branch?: string) =>
    api.post('/github/import', { url, branch }),
  createPR: (owner: string, repo: string, baseBranch: string, changes: unknown[], title: string, body: string) =>
    api.post('/github/pr', { owner, repo, baseBranch, changes, title, body }),
  getTree: (owner: string, repo: string, branch?: string) =>
    api.get(`/github/repo/${owner}/${repo}/tree`, { params: { branch } }),
};

export const docsAPI = {
  generate: (code: string, language?: string, type?: string) =>
    api.post('/docs/generate', { code, language, type }),
};
