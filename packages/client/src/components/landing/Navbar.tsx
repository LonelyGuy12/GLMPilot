import { Link } from 'react-router-dom';
import { Terminal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="relative z-20 flex justify-center pt-4 px-4">
      <div className="liquid-glass rounded-3xl px-6 py-3 flex items-center justify-between w-full max-w-[850px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-secondary to-muted flex items-center justify-center">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">GLMPilot</span>
        </Link>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-6">
          <button className="text-sm text-foreground/70 hover:text-foreground transition-colors">Features</button>
          <button className="text-sm text-foreground/70 hover:text-foreground transition-colors inline-flex items-center gap-1">
            Agents <ChevronDown className="w-3 h-3" />
          </button>
          <button className="text-sm text-foreground/70 hover:text-foreground transition-colors">Pricing</button>
          <button className="text-sm text-foreground/70 hover:text-foreground transition-colors inline-flex items-center gap-1">
            Docs <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* CTA */}
        <Link to="/ide">
          <Button variant="hero" size="sm">Get Started</Button>
        </Link>
      </div>
    </nav>
  );
}
