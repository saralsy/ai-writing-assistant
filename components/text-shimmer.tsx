"use client";

import type React from "react";

import { useEffect, useRef } from "react";

interface ShimmerTextProps {
  text: string;
}

export function ShimmerText({ text }: ShimmerTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const textContent = text || "";

    // Clear previous content
    container.innerHTML = "";

    // Create shimmer wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "shimmer-wrapper relative overflow-hidden";

    // Add each character with a span for individual styling
    textContent.split("").forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.className = "shimmer-char relative inline-block";
      span.style.animationDelay = `${index * 30}ms`;
      wrapper.appendChild(span);
    });

    container.appendChild(wrapper);
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="shimmer-text-container"
      style={
        {
          "--shimmer-color": "rgba(255, 255, 255, 0.1)",
          "--shimmer-size": "10px",
          "--shimmer-duration": "2s",
        } as React.CSSProperties
      }
    >
      <style jsx global>{`
        .shimmer-wrapper {
          position: relative;
          display: inline-block;
          line-height: 1.5;
        }

        .shimmer-char {
          background-image: linear-gradient(
            90deg,
            transparent 0%,
            var(--shimmer-color) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          background-position: 100% 0;
          animation: shimmer var(--shimmer-duration) infinite;
          animation-fill-mode: forwards;
          animation-timing-function: linear;
          background-repeat: no-repeat;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          position: relative;
          z-index: 1;
        }

        @keyframes shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
      {text}
    </div>
  );
}
