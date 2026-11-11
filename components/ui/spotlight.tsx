"use client";

import { useCallback } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

type SpotlightProps = {
  children: ReactNode;
  className?: string;
};

export default function Spotlight({ children, className = "" }: SpotlightProps) {
  const onMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div
      onMouseMove={onMouseMove}
      className={`group relative overflow-hidden ${className}`}
      style={{ "--mx": "50%", "--my": "50%" } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(300px circle at var(--mx) var(--my), rgb(255 255 255 / 0.12), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
