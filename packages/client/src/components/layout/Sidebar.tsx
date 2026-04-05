import { useState } from 'react';
import {
  Files, Search, MessageSquare, GitBranch, Shield, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import FileTree from '@/components/explorer/FileTree';
import AIChatPanel from '@/components/ai/AIChatPanel';

type SidebarPanel = 'files' | 'search' | 'chat' | 'git' | 'agents' | 'settings';

const sidebarItems: Array<{ id: SidebarPanel; icon: typeof Files; label: string }> = [
  { id: 'files', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
  { id: 'git', icon: GitBranch, label: 'Git' },
  { id: 'agents', icon: Shield, label: 'Agents' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [activePanel, setActivePanel] = useState<SidebarPanel>('files');

  return (
    <div className="flex h-full">
      {/* Icon strip */}
      <TooltipProvider delayDuration={300}>
        <div className="w-12 bg-background border-r border-border flex flex-col items-center pt-2 gap-1">
          {sidebarItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActivePanel(item.id)}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
                    activePanel === item.id
                      ? 'text-foreground bg-secondary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Panel content */}
      <div className="flex-1 bg-card/30 overflow-hidden flex flex-col min-w-0">
        <div className="px-3 py-2 border-b border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {sidebarItems.find((i) => i.id === activePanel)?.label}
          </h4>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          {activePanel === 'files' && <FileTree />}
          {activePanel === 'search' && (
            <div className="p-3">
              <input
                placeholder="Search files..."
                className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">Type to search across workspace files.</p>
            </div>
          )}
          {activePanel === 'chat' && (
            <p className="p-3 text-xs text-muted-foreground">AI Chat is in the right panel.</p>
          )}
          {activePanel === 'git' && (
            <div className="p-3 text-xs text-muted-foreground">
              <p>Git integration</p>
              <p className="mt-1">Import a repository to see Git status.</p>
            </div>
          )}
          {activePanel === 'agents' && (
            <div className="p-3 text-xs text-muted-foreground">
              <p>Agent controls will appear here after running a review.</p>
            </div>
          )}
          {activePanel === 'settings' && (
            <div className="p-3 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Settings</p>
              <p>Font Size: 14px</p>
              <p>Tab Size: 2</p>
              <p>Word Wrap: On</p>
              <p>AI Completions: On</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
