import { Check } from 'lucide-react';
import { parseMarkdown } from '@/utils/markdownParser';

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  const segments = parseMarkdown(content);

  return (
    <div className="space-y-3">
      {segments.map((segment, i) => {
        if (segment.type === 'text') {
          return (
            <div key={i} className="whitespace-pre-wrap break-words text-sm">
              {segment.content}
            </div>
          );
        }

        return (
          <div key={i} className="my-3 flex flex-col gap-2">
            {segment.filename && (
              <div className="flex items-center gap-1.5 py-1.5 px-3 bg-primary/10 text-primary border border-primary/20 rounded-md w-fit text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                Applied changes to {segment.filename}
              </div>
            )}
            <div className="relative rounded-md bg-muted overflow-hidden border border-border">
              <div className="flex items-center justify-between px-3 py-1.5 bg-muted-foreground/10 text-xs text-muted-foreground border-b border-border">
                <span>{segment.filename || segment.language || 'code'}</span>
              </div>
              <pre className="p-3 overflow-x-auto text-[13px] leading-relaxed font-mono text-foreground whitespace-pre-wrap">
                <code>{segment.code}</code>
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}
