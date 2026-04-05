import HLSVideo from './HLSVideo';

export default function NumbersSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background HLS Video */}
      <HLSVideo
        src="https://stream.mux.com/Kec29dVyJgiPdtWaQtPuEiiGHkJIYQAVUJcNiIHUYeo.m3u8"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to top, hsl(260 87% 3%) 0%, hsl(260 87% 3% / 0.85) 15%, hsl(260 87% 3% / 0.4) 40%, hsl(260 87% 3% / 0.15) 60%, hsl(260 87% 3% / 0.3) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 py-32 max-w-6xl mx-auto text-center px-4">
        <p className="text-7xl sm:text-[8rem] lg:text-[10rem] font-semibold tracking-tighter text-hero-heading leading-none">
          50K+
        </p>
        <p className="text-primary text-lg font-medium mt-2">Lines of code reviewed</p>
        <p className="text-hero-sub max-w-md mx-auto mt-4">
          Every day, GLMPilot's AI agents analyze thousands of files to keep codebases secure and performant.
        </p>

        <div className="mt-24">
          <div className="liquid-glass rounded-3xl p-12 grid md:grid-cols-2 max-w-3xl mx-auto">
            <div className="md:border-r border-border/50 md:pr-12">
              <p className="text-5xl font-semibold text-hero-heading">4</p>
              <p className="text-hero-sub mt-2">Specialized AI agents</p>
            </div>
            <div className="md:pl-12 mt-8 md:mt-0">
              <p className="text-5xl font-semibold text-hero-heading">99.9%</p>
              <p className="text-hero-sub mt-2">API uptime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
