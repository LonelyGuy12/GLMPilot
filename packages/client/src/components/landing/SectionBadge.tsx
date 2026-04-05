import { ChevronRight } from 'lucide-react';

interface SectionBadgeProps {
  label: string;
  action: string;
}

export default function SectionBadge({ label, action }: SectionBadgeProps) {
  return (
    <div className="flex justify-center">
      <div className="liquid-glass rounded-full px-4 py-1.5 inline-flex items-center gap-2 text-sm">
        <span className="text-foreground/80">{label}</span>
        <span className="bg-white/10 rounded-full px-2.5 py-0.5 text-xs inline-flex items-center gap-1 text-foreground/60">
          {action}
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
