import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from './Navbar';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260309_042944_4a2205b7-b061-490a-852b-92d9e9955ce9.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 30%, hsl(260 87% 3% / 0.1) 45%, hsl(260 87% 3% / 0.4) 60%, hsl(260 87% 3% / 0.75) 75%, hsl(260 87% 3%) 95%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Announcement Badge */}
          <div className="liquid-glass rounded-full px-4 py-1.5 inline-flex items-center gap-2 text-sm mb-6">
            <span className="text-foreground/80">AI Code Review</span>
            <span className="bg-white/10 rounded-full px-2.5 py-0.5 text-xs inline-flex items-center gap-1 text-foreground/60">
              Explore
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-hero-heading text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-center max-w-5xl mx-auto">
            Build, Review, and Ship
            <br />
            Frontend Code Faster
          </h1>

          {/* Subheading */}
          <p className="text-hero-sub text-lg max-w-md text-center mx-auto mt-4 opacity-80">
            A browser-based IDE with AI-powered multi-agent code review, inline completions, and one-click GitHub integration.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/ide">
              <Button variant="hero">Launch IDE</Button>
            </Link>
            <Button variant="heroSecondary">Watch Demo</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
