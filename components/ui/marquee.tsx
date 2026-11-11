"use client";

import type { ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  speed?: number;
};

export default function Marquee({ children, className = "", speed = 30 }: MarqueeProps) {
  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div
        className="marquee-track animate-marquee flex w-max items-center gap-8 motion-reduce:animate-none"
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        <div aria-hidden="true" className="flex items-center gap-8">
          {children}
        </div>
      </div>
    </div>
  );
}
