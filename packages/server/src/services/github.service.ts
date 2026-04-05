import { Octokit } from '@octokit/rest';
import { FileNode, FileChange, EXCLUDED_DIRECTORIES, FRONTEND_EXTENSIONS } from '@glmpilot/shared';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { getLanguageFromPath, isBinaryFile } from '../utils/file-utils.js';

class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({ auth: config.GITHUB_TOKEN || undefined });
  }

  parseRepoUrl(url: string): { owner: string; repo: string } {
    let cleaned = url.trim().replace(/\.git$/, '').replace(/\/$/, '');
    // owner/repo format
    if (/^[\w.-]+\/[\w.-]+$/.test(cleaned)) {
      const [owner, repo] = cleaned.split('/');
      return { owner, repo };
    }
    // Full URL
    const match = cleaned.match(/(?:github\.com)[/:]([^/]+)\/([^/]+)/);
    if (match) return { owner: match[1], repo: match[2] };
    throw new Error(`Invalid GitHub URL: ${url}`);
  }

  async getRepoTree(owner: string, repo: string, branch?: string): Promise<FileNode[]> {
    const ref = branch || 'main';
    try {
      const { data } = await this.octokit.git.getTree({
        owner, repo, tree_sha: ref, recursive: '1',
      });

      const items = data.tree.filter((item) => {
        if (item.type !== 'blob') return false;
        const path = item.path || '';
        const parts = path.split('/');
        if (parts.some(p => EXCLUDED_DIRECTORIES.has(p))) return false;
        if (isBinaryFile(path)) return false;
        const ext = path.slice(path.lastIndexOf('.'));
        return FRONTEND_EXTENSIONS.has(ext) || path.endsWith('.env.example') || this.isConfigFile(path);
      });

      return this.buildTree(items.map(i => ({
        path: i.path || '',
        type: 'file' as const,
        size: i.size,
        sha: i.sha,
      })));
    } catch (err) {
      // Fallback: try 'master' if 'main' fails
      if (!branch && (err as Record<string, unknown>).status === 404) {
        return this.getRepoTree(owner, repo, 'master');
      }
      throw err;
    }
  }

  async getFileContent(owner: string, repo: string, path: string, branch?: string): Promise<string> {
    const { data } = await this.octokit.repos.getContent({
      owner, repo, path, ref: branch || 'main',
    });
    if ('content' in data && data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    throw new Error(`Cannot read file: ${path}`);
  }

  async getRepoFiles(owner: string, repo: string, branch?: string): Promise<Map<string, string>> {
    const tree = await this.getRepoTree(owner, repo, branch);
    const files = new Map<string, string>();
    const filePaths = this.flattenTree(tree);

    // Concurrency-limited file fetching (max 5 parallel)
    const batchSize = 5;
    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (fp) => {
          const content = await this.getFileContent(owner, repo, fp, branch);
          return { path: fp, content };
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          files.set(result.value.path, result.value.content);
        } else {
          logger.warn('Failed to fetch file', { error: result.reason });
        }
      }
    }

    logger.info(`Fetched ${files.size} files from ${owner}/${repo}`);
    return files;
  }

  async createPR(
    owner: string,
    repo: string,
    baseBranch: string,
    changes: FileChange[],
    title: string,
    body: string
  ): Promise<string> {
    // Get base branch ref
    const { data: ref } = await this.octokit.git.getRef({
      owner, repo, ref: `heads/${baseBranch}`,
    });
    const baseSha = ref.object.sha;

    // Create blobs
    const blobs = await Promise.all(
      changes.map(async (change) => {
        const { data } = await this.octokit.git.createBlob({
          owner, repo, content: change.fixedContent, encoding: 'utf-8',
        });
        return { path: change.path, sha: data.sha };
      })
    );

    // Create tree
    const { data: tree } = await this.octokit.git.createTree({
      owner, repo, base_tree: baseSha,
      tree: blobs.map(b => ({
        path: b.path, mode: '100644' as const, type: 'blob' as const, sha: b.sha,
      })),
    });

    // Create commit
    const { data: commit } = await this.octokit.git.createCommit({
      owner, repo,
      message: title,
      tree: tree.sha,
      parents: [baseSha],
    });

    // Create branch
    const branchName = `glmpilot/fix-${Date.now()}`;
    await this.octokit.git.createRef({
      owner, repo, ref: `refs/heads/${branchName}`, sha: commit.sha,
    });

    // Create PR
    const { data: pr } = await this.octokit.pulls.create({
      owner, repo, title, body, head: branchName, base: baseBranch,
    });

    logger.info(`Created PR: ${pr.html_url}`);
    return pr.html_url;
  }

  private isConfigFile(path: string): boolean {
    const name = path.split('/').pop() || '';
    const configPatterns = [
      'package.json', 'tsconfig', 'vite.config', 'next.config',
      'tailwind.config', 'postcss.config', '.eslintrc', '.prettierrc',
      'svelte.config', 'vue.config',
    ];
    return configPatterns.some(p => name.includes(p));
  }

  private flattenTree(nodes: FileNode[]): string[] {
    const paths: string[] = [];
    for (const node of nodes) {
      if (node.type === 'file') paths.push(node.path);
      if (node.children) paths.push(...this.flattenTree(node.children));
    }
    return paths;
  }

  private buildTree(items: Array<{ path: string; type: 'file'; size?: number; sha?: string }>): FileNode[] {
    const root: FileNode[] = [];
    for (const item of items) {
      const parts = item.path.split('/');
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const name = parts[i];
        if (i === parts.length - 1) {
          current.push({
            name,
            path: item.path,
            type: 'file',
            size: item.size,
            language: getLanguageFromPath(item.path),
          });
        } else {
          let dir = current.find(n => n.name === name && n.type === 'directory');
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
}

export const github = new GitHubService();
export { GitHubService };
