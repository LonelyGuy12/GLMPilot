import { useRef, useEffect, useState } from 'react';
import { useLivePreview } from '@/hooks/useLivePreview';
import { RefreshCw, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const viewports = [
  { icon: Smartphone, width: 375, label: 'Mobile' },
  { icon: Tablet, width: 768, label: 'Tablet' },
  { icon: Monitor, width: '100%', label: 'Desktop' },
];

export default function LivePreview() {
  const { srcdoc } = useLivePreview();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewportIndex, setViewportIndex] = useState(2);
  const [consoleOutput, setConsoleOutput] = useState<Array<{ method: string; args: string[] }>>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        setConsoleOutput((prev) => [...prev.slice(-50), { method: event.data.method, args: event.data.args }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const viewport = viewports[viewportIndex];

  const handleOpenInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(srcdoc);
      newWindow.document.close();
      newWindow.document.title = 'GLMPilot Preview';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-1.5 hover:bg-secondary rounded transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={handleOpenInNewTab}
          className="p-1.5 hover:bg-secondary rounded transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        {viewports.map((vp, i) => (
          <button
            key={vp.label}
            onClick={() => setViewportIndex(i)}
            className={cn(
              'p-1.5 rounded transition-colors',
              i === viewportIndex ? 'bg-secondary text-foreground' : 'hover:bg-secondary/50 text-muted-foreground'
            )}
            title={vp.label}
          >
            <vp.icon className="w-3.5 h-3.5" />
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowConsole(!showConsole)}
          className={cn(
            'px-2 py-1 text-xs rounded transition-colors',
            showConsole ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50'
          )}
        >
          Console {consoleOutput.length > 0 && `(${consoleOutput.length})`}
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-2 min-h-0">
        <iframe
          key={refreshKey}
          ref={iframeRef}
          srcDoc={srcdoc}
          sandbox="allow-scripts allow-modals"
          className="bg-white rounded border border-border"
          style={{
            width: typeof viewport.width === 'number' ? `${viewport.width}px` : viewport.width,
            height: '100%',
            maxWidth: '100%',
          }}
          title="Live Preview"
        />
      </div>

      {/* Console */}
      {showConsole && (
        <div className="h-32 border-t border-border overflow-auto p-2 text-xs font-mono">
          {consoleOutput.map((entry, i) => (
            <div
              key={i}
              className={cn(
                'py-0.5',
                entry.method === 'error' ? 'text-red-400' : entry.method === 'warn' ? 'text-yellow-400' : 'text-muted-foreground'
              )}
            >
              {entry.args.join(' ')}
            </div>
          ))}
          {consoleOutput.length === 0 && (
            <p className="text-muted-foreground">No console output yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
