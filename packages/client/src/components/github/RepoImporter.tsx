import { useState } from 'react';
import { useGitHub } from '@/hooks/useGitHub';
import { useGitHubStore } from '@/stores/githubStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';

interface RepoImporterProps {
  open: boolean;
  onClose: () => void;
}

export default function RepoImporter({ open, onClose }: RepoImporterProps) {
  const [url, setUrl] = useState('');
  const { importRepo, isImporting } = useGitHub();
  const importProgress = useGitHubStore((s) => s.importProgress);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!url.trim()) return;
    setError('');
    try {
      await importRepo(url.trim());
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to import repository');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            Paste a GitHub repository URL to import and analyze.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo or owner/repo"
            disabled={isImporting}
            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          {isImporting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {importProgress || 'Importing...'}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isImporting}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!url.trim() || isImporting}>
              {isImporting ? 'Importing...' : 'Import Repository'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
