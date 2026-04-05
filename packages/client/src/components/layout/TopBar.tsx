import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Play, Shield, Github, Monitor, Columns, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAgentReview } from '@/hooks/useAgentReview';
import RepoImporter from '@/components/github/RepoImporter';
import { useEnvStore } from '@/stores/envStore';

interface TopBarProps {
  layout: 'editor' | 'split' | 'preview';
  onLayoutChange: (layout: 'editor' | 'split' | 'preview') => void;
}

export default function TopBar({ layout, onLayoutChange }: TopBarProps) {
  const navigate = useNavigate();
  const { reviewWorkspace, isReviewing } = useAgentReview();
  const [showImporter, setShowImporter] = useState(false);
  const environment = useEnvStore((s) => s.environment);

  // Define global window method or a custom hook to trigger execution that terminal listens to?
  // We'll dispatch a custom event for now that terminal/execution handler can listen to.
  const executeCode = () => {
    window.dispatchEvent(new CustomEvent('glmpilot:execute'));
  };

  return (
    <>
      <div className="h-10 bg-background border-b border-border flex items-center px-2 gap-2">
        <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground">
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-foreground ml-1">GLMPilot</span>

        <div className="flex-1" />

        {/* Layout toggles */}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          {([
            { id: 'editor' as const, icon: Monitor, label: 'Editor' },
            { id: 'split' as const, icon: Columns, label: 'Split' },
            { id: 'preview' as const, icon: Eye, label: 'Preview' },
          ]).map((item) => (
            <button
              key={item.id}
              onClick={() => onLayoutChange(item.id)}
              className={`p-1.5 transition-colors ${
                layout === item.id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={item.label}
            >
              <item.icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {(environment === 'java' || environment === 'python') && (
          <Button
            size="sm"
            onClick={executeCode}
            className="gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => reviewWorkspace()}
          disabled={isReviewing}
          className="gap-1.5 text-xs"
        >
          <Shield className="w-3.5 h-3.5" />
          {isReviewing ? 'Reviewing...' : 'Review'}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowImporter(true)}
          className="gap-1.5 text-xs"
        >
          <Github className="w-3.5 h-3.5" />
          Import
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/ide')}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground ml-2"
        >
          Change Environment
        </Button>
      </div>

      <RepoImporter open={showImporter} onClose={() => setShowImporter(false)} />
    </>
  );
}
