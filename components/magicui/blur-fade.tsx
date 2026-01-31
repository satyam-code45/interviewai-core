"use client";

import { useRef, useEffect, useState } from "react";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  blur?: string;
}

export function BlurFade({
  children,
  className = "",
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = "down",
  inView = false,
  blur = "6px",
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!inView);

  useEffect(() => {
    if (!inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [inView]);

  const getTransform = () => {
    if (!isVisible) {
      const value =
        direction === "right" || direction === "down" ? -offset : offset;
      return direction === "left" || direction === "right"
        ? `translateX(${value}px)`
        : `translateY(${value}px)`;
    }
    return "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? "blur(0px)" : `blur(${blur})`,
        transform: getTransform(),
        transition: `all ${duration}s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
