interface MarqueeRowProps {
  brands: Array<{ name: string; initial: string }>;
}

export default function MarqueeRow({ brands }: MarqueeRowProps) {
  const duplicated = [...brands, ...brands];

  return (
    <div className="overflow-hidden relative">
      <div className="flex items-center gap-8 animate-marquee w-max">
        {duplicated.map((brand, i) => (
          <div key={`${brand.name}-${i}`} className="flex items-center gap-2 shrink-0">
            <div className="liquid-glass w-6 h-6 rounded-lg inline-flex items-center justify-center">
              <span className="text-xs font-medium text-foreground/70">{brand.initial}</span>
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
