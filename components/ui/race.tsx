"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RaceRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function RaceReveal({ children, className = "", delay = 0 }: RaceRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`race-reveal motion-reduce:opacity-100 ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

type TelemetryTickerProps = {
  items: string[];
  className?: string;
};

export function TelemetryTicker({ items, className = "" }: TelemetryTickerProps) {
  const row = items.join("  ///  ");
  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div className="animate-marquee-fast flex w-max items-center gap-8 motion-reduce:animate-none">
        <span className="hud-label whitespace-nowrap text-apex-chequer/80">{row}</span>
        <span aria-hidden="true" className="hud-label whitespace-nowrap text-apex-chequer/80">
          {row}
        </span>
      </div>
    </div>
  );
}

export function ChequerDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`h-3 w-full sm:h-4 ${className}`}>
      <div className="texture-chequer animate-checker-slide h-full w-full opacity-90 motion-reduce:animate-none" />
      <div className="h-[3px] w-full bg-gradient-to-r from-apex-redline via-apex-gold to-apex-redline" />
    </div>
  );
}

type RpmBarProps = {
  value: number;
  max?: number;
  className?: string;
};

export function RpmBar({ value, max = 100, className = "" }: RpmBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const hot = pct >= 85;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 w-full overflow-hidden rounded-full bg-apex-pit ${className}`}
    >
      <div
        className={`h-full origin-left rounded-full motion-reduce:animate-none ${
          hot ? "animate-rpm-pulse bg-apex-redline shadow-nitro" : "bg-apex-gold"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

type StartLightsProps = {
  count?: number;
  lit?: number;
  out?: boolean;
  className?: string;
};

export function StartLights({ count = 5, lit = 5, out = false, className = "" }: StartLightsProps) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: count }, (_, i) => {
        const on = i < lit;
        return (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border border-white/20 ${
              out
                ? "animate-lights-out bg-apex-chequer motion-reduce:animate-none"
                : on
                  ? "bg-apex-redline shadow-nitro"
                  : "bg-apex-carbon"
            }`}
          />
        );
      })}
    </div>
  );
}
