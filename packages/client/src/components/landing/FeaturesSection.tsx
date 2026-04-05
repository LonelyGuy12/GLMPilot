import { Shield, Zap, FileText } from 'lucide-react';
import SectionBadge from './SectionBadge';
import HLSVideo from './HLSVideo';

const features = [
  {
    icon: Shield,
    title: 'Security Agent',
    description: 'Scans for XSS, CSRF, secrets exposure, and 15+ vulnerability categories. Get OWASP-referenced findings with one-click fixes.',
    stat: '< 30s',
    statLabel: 'full repo scan',
  },
  {
    icon: Zap,
    title: 'Performance Agent',
    description: 'Detects memory leaks, unnecessary re-renders, bundle bloat, and missing optimizations. Every finding includes before/after code.',
    stat: '148%',
    statLabel: 'avg. performance improvement',
  },
  {
    icon: FileText,
    title: 'Auto Documentation',
    description: 'Generates README, component API docs, and architecture overviews from your code. Never write docs from scratch again.',
    stat: '100%',
    statLabel: 'documentation coverage',
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background HLS Video */}
      <HLSVideo
        src="https://stream.mux.com/Jwr2RhmsNrd6GEspBNgm02vJsRZAGlaoQIh4AucGdASw.m3u8"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-background via-background/80 to-transparent z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-background via-background/80 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-background/40 z-[1]" />

      {/* Content */}
      <div className="relative z-10 py-32 px-4 max-w-6xl mx-auto">
        <SectionBadge label="Core Platform" action="Overview" />

        <h2 className="text-hero-heading text-3xl sm:text-5xl font-semibold text-center mt-6">
          Built for Developers Who
          <br />
          Ship Relentlessly
        </h2>

        <p className="text-hero-sub text-center max-w-xl mx-auto mt-4">
          Four AI agents that keep your codebase clean, secure, and well-documented without slowing you down.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="liquid-glass rounded-3xl p-8 flex flex-col transition-colors hover:bg-white/[0.03]"
            >
              <feature.icon className="text-primary w-8 h-8" />
              <h3 className="text-hero-heading text-lg font-semibold mt-4">{feature.title}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed flex-1">
                {feature.description}
              </p>
              <div className="border-t border-border/50 my-6" />
              <div>
                <span className="text-2xl font-semibold text-hero-heading">{feature.stat}</span>
                <span className="text-sm text-muted-foreground ml-2">{feature.statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
