import CTASection from './CTASection';
import FooterSection from './FooterSection';
import HLSVideo from './HLSVideo';

export default function CTAFooterWrapper() {
  return (
    <section className="relative overflow-hidden">
      {/* Background HLS Video */}
      <HLSVideo
        src="https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, hsl(260 87% 3%) 0%, hsl(260 87% 3% / 0.85) 15%, hsl(260 87% 3% / 0.4) 40%, hsl(260 87% 3% / 0.15) 60%, hsl(260 87% 3% / 0.3) 100%)',
        }}
      />

      <CTASection />
      <FooterSection />
    </section>
  );
}
