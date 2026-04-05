import { X } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';
import { getFileName } from '@glmpilot/shared';

export default function EditorTabs() {
  const openFiles = useEditorStore((s) => s.openFiles);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const setActive = useEditorStore((s) => s.setActive);
  const removeFile = useEditorStore((s) => s.removeFile);

  const files = Object.values(openFiles);

  if (files.length === 0) return null;

  return (
    <div className="flex items-center bg-background border-b border-border overflow-x-auto">
      {files.map((file) => (
        <button
          key={file.path}
          onClick={() => setActive(file.path)}
          className={cn(
            'group flex items-center gap-2 px-3 py-1.5 text-xs border-r border-border transition-colors min-w-0 shrink-0',
            file.path === activeFilePath
              ? 'bg-card text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          {file.isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
          <span className="truncate max-w-[120px]">{getFileName(file.path)}</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              removeFile(file.path);
            }}
            className="opacity-0 group-hover:opacity-100 hover:bg-secondary rounded p-0.5 transition-opacity"
          >
            <X className="w-3 h-3" />
          </span>
        </button>
      ))}
    </div>
  );
}
