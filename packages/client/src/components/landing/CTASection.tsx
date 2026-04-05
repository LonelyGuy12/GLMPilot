import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <div className="relative z-10 py-32 px-4">
      <div className="liquid-glass rounded-[2rem] p-12 sm:p-20 max-w-4xl mx-auto text-center">
        <h2 className="text-hero-heading text-3xl sm:text-5xl font-semibold">
          Ready to Build
          <br />
          Something Amazing?
        </h2>
        <p className="text-hero-sub mt-4 max-w-lg mx-auto">
          Join thousands of frontend developers using AI-powered code review and intelligent completions. Free to start.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link to="/ide">
            <Button variant="hero">Launch GLMPilot</Button>
          </Link>
          <Button variant="heroSecondary">View on GitHub</Button>
        </div>
      </div>
    </div>
  );
}
