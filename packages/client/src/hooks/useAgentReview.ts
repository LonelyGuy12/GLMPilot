import { useCallback, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAIStore } from '@/stores/aiStore';
import { useFileStore } from '@/stores/fileStore';
import type { AgentType, AgentProgressEvent, FullReviewResult } from '@glmpilot/shared';

export function useAgentReview() {
  const { socket } = useWebSocket();
  const { setAgentResult, setAgentRunning } = useAIStore();
  const files = useFileStore((s) => s.files);
  const [isReviewing, setIsReviewing] = useState(false);
  const [progress, setProgress] = useState<AgentProgressEvent | null>(null);

  const reviewWorkspace = useCallback(
    (agents?: AgentType[]) => {
      if (!socket || isReviewing) return;
      setIsReviewing(true);

      const onProgress = (event: AgentProgressEvent) => {
        setProgress(event);
        setAgentRunning(event.agent as AgentType, event.status === 'started' || event.status === 'analyzing');
      };

      const onComplete = (result: FullReviewResult) => {
        if (result.agentResults) {
          for (const [agent, agentResult] of Object.entries(result.agentResults)) {
            setAgentResult(agent as AgentType, agentResult);
            setAgentRunning(agent as AgentType, false);
          }
        }
        setIsReviewing(false);
        setProgress(null);
        socket.off('review:progress', onProgress);
        socket.off('review:complete', onComplete);
      };

      socket.on('review:progress', onProgress);
      socket.on('review:complete', onComplete);
      socket.emit('review:start', { files, agents });
    },
    [socket, files, isReviewing, setAgentResult, setAgentRunning]
  );

  const reviewCurrentFile = useCallback(
    (filePath: string, content: string) => {
      if (!socket) return;
      socket.emit('review:file', { filePath, content });
    },
    [socket]
  );

  return { reviewWorkspace, reviewCurrentFile, isReviewing, progress };
}
