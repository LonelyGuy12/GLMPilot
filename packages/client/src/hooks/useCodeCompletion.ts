import { useCallback, useRef, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useEditorStore } from '@/stores/editorStore';
import { useAIStore } from '@/stores/aiStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function useCodeCompletion() {
  const { socket } = useWebSocket();
  const { setCompletionSuggestion } = useAIStore();
  const aiCompletions = useSettingsStore((s) => s.aiCompletions);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!socket) return;

    const handleResult = (data: { suggestion: string }) => {
      if (data.suggestion) {
        setCompletionSuggestion(data.suggestion);
      }
    };

    socket.on('completion:result', handleResult);
    return () => { socket.off('completion:result', handleResult); };
  }, [socket, setCompletionSuggestion]);

  const requestCompletion = useCallback(
    (filePath: string, prefix: string, suffix: string, language: string) => {
      if (!aiCompletions || !socket) return;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const editorState = useEditorStore.getState();
        const recentFiles = editorState.recentFiles
          .filter((f) => f !== filePath)
          .slice(0, 3)
          .map((f) => {
            const file = editorState.openFiles[f];
            return file ? { path: f, content: file.content } : null;
          })
          .filter(Boolean);

        socket.emit('completion:request', {
          filePath,
          prefix,
          suffix,
          language,
          contextFiles: recentFiles,
        });
      }, 500);
    },
    [socket, aiCompletions]
  );

  const dismissCompletion = useCallback(() => {
    setCompletionSuggestion(null);
  }, [setCompletionSuggestion]);

  return { requestCompletion, dismissCompletion };
}
