import { Button } from '@/components/ui/button';
import SectionBadge from './SectionBadge';
import HLSVideo from './HLSVideo';

const stats = [
  { value: '4 agents', label: 'parallel analysis' },
  { value: '< 60s', label: 'full repo review' },
  { value: '1-click', label: 'PR generation' },
  { value: '100%', label: 'ASI-1 powered' },
];

export default function ReverseChessSection() {
  return (
    <section className="py-32 px-4 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* Left — Content */}
        <div className="order-2 lg:order-1">
          <SectionBadge label="GitHub Integration" action="Beta" />
          <h2 className="text-hero-heading text-3xl sm:text-4xl font-semibold leading-tight mt-6">
            Paste a Repo URL.
            <br />
            Get a Full Review.
          </h2>
          <p className="text-hero-sub mt-4 leading-relaxed">
            Import any GitHub repository and get a comprehensive multi-agent analysis in seconds.
            Security vulnerabilities, performance issues, and auto-generated documentation — all
            delivered as PR-ready fixes.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="liquid-glass rounded-2xl p-4">
                <p className="text-lg font-semibold text-hero-heading">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button variant="hero">Import a Repo</Button>
          </div>
        </div>

        {/* Right — Video */}
        <div className="order-1 lg:order-2">
          <div className="liquid-glass rounded-3xl aspect-[4/3] overflow-hidden">
            <HLSVideo
              src="https://stream.mux.com/f0001qPDy00mvqP023lqK3lWx31uHvxirFCHK1yNLczzqxY.m3u8"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
