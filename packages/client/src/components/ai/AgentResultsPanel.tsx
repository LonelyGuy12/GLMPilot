import { useAIStore } from '@/stores/aiStore';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Paintbrush, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';
import type { Finding, Severity } from '@glmpilot/shared';
import { useState } from 'react';

const agentIcons: Record<string, typeof Shield> = {
  security: Shield,
  performance: Zap,
  style: Paintbrush,
  documentation: FileText,
};

const severityColors: Record<Severity, string> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const addFile = useEditorStore((s) => s.addFile);

  return (
    <div className="liquid-glass rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={severityColors[finding.severity] as any}>{finding.severity}</Badge>
        <Badge variant="outline" className="text-[10px]">{finding.category}</Badge>
        <button
          onClick={() => addFile(finding.file, '', 'typescript')}
          className="text-xs text-primary hover:underline truncate"
        >
          {finding.file}{finding.lineStart ? `:${finding.lineStart}` : ''}
        </button>
      </div>
      <p className="text-sm font-medium">{finding.title}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{finding.description}</p>

      {(finding.currentCode || finding.fixedCode) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'Show code'}
        </button>
      )}

      {expanded && (
        <div className="space-y-2 mt-2">
          {finding.currentCode && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current code:</p>
              <pre className="text-xs bg-background rounded p-2 overflow-x-auto">{finding.currentCode}</pre>
            </div>
          )}
          {finding.fixedCode && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fixed code:</p>
              <pre className="text-xs bg-background rounded p-2 overflow-x-auto text-primary/80">{finding.fixedCode}</pre>
            </div>
          )}
          {finding.fixExplanation && (
            <p className="text-xs text-muted-foreground">{finding.fixExplanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AgentResultsPanel() {
  const agentResults = useAIStore((s) => s.agentResults);

  const allFindings: Finding[] = Object.values(agentResults)
    .flatMap((r) => r?.findings || [])
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity] || 9) - (order[b.severity] || 9);
    });

  const byAgent = (agent: string) => allFindings.filter((f) => f.agent === agent);

  if (allFindings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
        <div>
          <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p>No review results yet.</p>
          <p className="text-xs mt-1">Run a review to see agent findings here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Summary */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-3 text-xs">
        <span className="font-medium">{allFindings.length} findings</span>
        <Badge variant="critical" className="text-[10px]">{allFindings.filter(f => f.severity === 'critical').length}</Badge>
        <Badge variant="high" className="text-[10px]">{allFindings.filter(f => f.severity === 'high').length}</Badge>
        <Badge variant="medium" className="text-[10px]">{allFindings.filter(f => f.severity === 'medium').length}</Badge>
        <Badge variant="low" className="text-[10px]">{allFindings.filter(f => f.severity === 'low').length}</Badge>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 justify-start h-8">
          <TabsTrigger value="all" className="text-xs">All ({allFindings.length})</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security ({byAgent('security').length})</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">Perf ({byAgent('performance').length})</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style ({byAgent('style').length})</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-auto p-4">
          <TabsContent value="all" className="space-y-3 mt-0">
            {allFindings.map((f, i) => <FindingCard key={`${f.id}-${i}`} finding={f} />)}
          </TabsContent>
          {['security', 'performance', 'style'].map((agent) => (
            <TabsContent key={agent} value={agent} className="space-y-3 mt-0">
              {byAgent(agent).map((f, i) => <FindingCard key={`${f.id}-${i}`} finding={f} />)}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
