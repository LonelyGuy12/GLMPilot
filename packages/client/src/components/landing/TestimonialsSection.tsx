const testimonials = [
  {
    quote: 'The security agent caught an XSS vulnerability in our checkout flow that our entire team missed. The fix was ready in seconds.',
    name: 'Alex Kim',
    role: 'Senior Frontend Dev, Streamline',
    initials: 'AK',
  },
  {
    quote: 'Having AI that understands my entire workspace context is a game-changer. The completions are actually useful, not just autocomplete on steroids.',
    name: 'Sarah Chen',
    role: 'Tech Lead, BuildKit',
    initials: 'SC',
  },
  {
    quote: 'We imported our React monorepo and got a full review with docs in under a minute. The PR it generated was merge-ready.',
    name: 'Marcus Webb',
    role: 'Engineering Manager, Pixelform',
    initials: 'MW',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-32 px-4 max-w-6xl mx-auto">
      <div className="text-center">
        <h2 className="text-hero-heading text-3xl sm:text-5xl font-semibold">
          Loved by Frontend
          <br />
          Developers Everywhere
        </h2>
        <p className="text-hero-sub mt-4">Hear from the developers who made the switch.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16">
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            className={`liquid-glass rounded-3xl p-8 flex flex-col ${i === 1 ? 'md:-translate-y-6' : ''}`}
          >
            <p className="text-foreground/90 text-sm leading-relaxed flex-1">"{t.quote}"</p>
            <div className="border-t border-border/50 my-6" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-muted-foreground text-sm">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
