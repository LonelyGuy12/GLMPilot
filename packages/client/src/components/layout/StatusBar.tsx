import { useEditorStore } from '@/stores/editorStore';
import { useAIStore } from '@/stores/aiStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

const agents = ['security', 'performance', 'style', 'documentation'] as const;

export default function StatusBar() {
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const activeFile = useEditorStore((s) => activeFilePath ? s.openFiles[activeFilePath] : null);
  const agentRunning = useAIStore((s) => s.agentRunning);
  const { isConnected } = useWebSocket();

  return (
    <div className="h-6 bg-card/80 border-t border-border flex items-center px-3 text-[11px] text-muted-foreground gap-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <span className="uppercase">{activeFile.language}</span>
        )}
        <span>main</span>
      </div>

      <div className="flex-1" />

      {/* Center — Agent status dots */}
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1.5">
          {agents.map((agent) => {
            const running = agentRunning[agent];
            return (
              <Tooltip key={agent}>
                <TooltipTrigger>
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      running ? 'bg-yellow-400 animate-pulse' : 'bg-green-500/50'
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>{agent} agent: {running ? 'running' : 'idle'}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      <div className="flex-1" />

      {/* Right */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <span>Ln {activeFile.cursorPosition.lineNumber}, Col {activeFile.cursorPosition.column}</span>
        )}
        <span>UTF-8</span>
        <span className="flex items-center gap-1">
          <span className={cn('w-1.5 h-1.5 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')} />
          ASI-1
        </span>
      </div>
    </div>
  );
}
