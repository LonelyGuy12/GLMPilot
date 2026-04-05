import { useEditorStore } from '@/stores/editorStore';
import CodeEditor from './CodeEditor';
import EditorTabs from './EditorTabs';

export default function MultiFileEditor() {
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const activeFile = useEditorStore((s) => activeFilePath ? s.openFiles[activeFilePath] : null);

  return (
    <div className="flex flex-col h-full">
      <EditorTabs />
      <div className="flex-1 min-h-0">
        {activeFile ? (
          <CodeEditor
            key={activeFile.path}
            filePath={activeFile.path}
            language={activeFile.language}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No file open</p>
              <p className="text-sm mt-1">Select a file from the explorer to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
