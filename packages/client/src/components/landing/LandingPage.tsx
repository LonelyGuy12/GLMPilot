import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import ChessSection from './ChessSection';
import ReverseChessSection from './ReverseChessSection';
import NumbersSection from './NumbersSection';
import CTAFooterWrapper from './CTAFooterWrapper';

export default function LandingPage() {
  return (
    <main className="bg-background min-h-screen overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <ChessSection />
      <ReverseChessSection />
      <NumbersSection />
      <CTAFooterWrapper />
    </main>
  );
}
