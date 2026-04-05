import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SectionBadge from './SectionBadge';
import HLSVideo from './HLSVideo';

export default function ChessSection() {
  return (
    <section className="py-32 px-4 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* Left — Video */}
        <div className="liquid-glass rounded-3xl aspect-[4/3] overflow-hidden">
          <HLSVideo
            src="https://stream.mux.com/1CCfG6mPC7LbMOAs6iBOfPeNd3WaKlZuHuKHp00G62j8.m3u8"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right — Content */}
        <div>
          <SectionBadge label="Inline AI" action="New" />
          <h2 className="text-hero-heading text-3xl sm:text-4xl font-semibold leading-tight mt-6">
            Code Completions That
            <br />
            Actually Understand Context
          </h2>
          <p className="text-hero-sub mt-4 leading-relaxed">
            Powered by ASI-1 Mini, get intelligent inline suggestions that consider your entire
            workspace — not just the current file. Accept with Tab, dismiss with Escape.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Full workspace context awareness',
              'Framework-specific suggestions',
              'Learns your coding patterns',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-4 mt-8">
            <Link to="/ide">
              <Button variant="hero">Try It Now</Button>
            </Link>
            <Button variant="heroSecondary">Read the Docs</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
