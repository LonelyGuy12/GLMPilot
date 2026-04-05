import { useCallback, useState } from 'react';
import { githubAPI } from '@/services/api';
import { useFileStore } from '@/stores/fileStore';
import { useGitHubStore } from '@/stores/githubStore';

export function useGitHub() {
  const { importFiles } = useFileStore();
  const { setRepo, setImporting } = useGitHubStore();
  const [isImporting, setIsImportingLocal] = useState(false);

  const importRepo = useCallback(async (url: string, branch?: string) => {
    setIsImportingLocal(true);
    setImporting(true, 'Fetching repository structure...');

    try {
      setImporting(true, 'Reading files...');
      const response = await githubAPI.importRepo(url, branch);
      const { fileTree, files, totalFiles } = response.data.data;

      setImporting(true, 'Loading workspace...');
      importFiles(files, fileTree);

      // Parse owner/repo from URL
      const match = url.match(/github\.com\/([^/]+)\/([^/.]+)/);
      if (match) setRepo(match[1], match[2], branch);

      setImporting(false);
      return { fileTree, totalFiles };
    } catch (error) {
      setImporting(false);
      throw error;
    } finally {
      setIsImportingLocal(false);
    }
  }, [importFiles, setRepo, setImporting]);

  const createPR = useCallback(async (
    owner: string, repo: string, baseBranch: string,
    changes: unknown[], title: string, body: string
  ) => {
    const response = await githubAPI.createPR(owner, repo, baseBranch, changes, title, body);
    return response.data.data.prUrl;
  }, []);

  return { importRepo, createPR, isImporting };
}
