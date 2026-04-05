import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import type { FileNode } from '@glmpilot/shared';
import { useEditorStore } from '@/stores/editorStore';
import { useFileStore } from '@/stores/fileStore';
import { getLanguageFromPath } from '@glmpilot/shared';
import { cn } from '@/lib/utils';

const FILE_ICONS: Record<string, string> = {
  html: '🌐', css: '🎨', scss: '🎨', javascript: '⚡', typescript: '💠',
  javascriptreact: '⚛️', typescriptreact: '⚛️', json: '📋', markdown: '📝', svg: '🖼️',
};

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
}

function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const addFile = useEditorStore((s) => s.addFile);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const files = useFileStore((s) => s.files);

  const handleClick = () => {
    if (node.type === 'directory') {
      setExpanded(!expanded);
    } else {
      const language = getLanguageFromPath(node.path);
      const content = files[node.path] || '';
      addFile(node.path, content, language);
    }
  };

  const isActive = node.path === activeFilePath;
  const lang = node.type === 'file' ? getLanguageFromPath(node.path) : '';
  const icon = FILE_ICONS[lang] || '';

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-1 px-2 py-0.5 text-sm hover:bg-secondary/50 transition-colors rounded-sm',
          isActive && 'bg-secondary text-foreground'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.type === 'directory' ? (
          <>
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            {expanded ? (
              <FolderOpen className="w-4 h-4 text-primary/70 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-primary/70 shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            {icon ? (
              <span className="text-xs shrink-0">{icon}</span>
            ) : (
              <File className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </>
        )}
        <span className={cn('truncate', isActive ? 'text-foreground' : 'text-foreground/70')}>
          {node.name}
        </span>
      </button>

      {node.type === 'directory' && expanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <FileTreeItem key={child.path} node={child} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree() {
  const fileTree = useFileStore((s) => s.fileTree);

  return (
    <div className="py-1">
      {fileTree
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .map((node) => (
          <FileTreeItem key={node.path} node={node} depth={0} />
        ))}
    </div>
  );
}
