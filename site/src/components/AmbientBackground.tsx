/**
 * AmbientBackground - Dynamic animated background with random blobs
 *
 * Features:
 * - Random blob positions, sizes, and colors
 * - Blobs change color over time
 * - Dark mode support with different color palette
 * - More aggressive movement animations
 * - Mouse interaction for parallax effect
 * - Respects prefers-reduced-motion accessibility setting
 */

import { useEffect, useMemo, useRef, useState } from "react";

interface MousePos {
  x: number;
  y: number;
}

interface Blob {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number; // px
  colorIndex: number;
  speed: number; // animation duration multiplier
  delay: number; // animation delay
  intensity: number; // mouse parallax intensity
  invert: boolean;
}

// Light mode - sanfte, transparente Farben (weniger Deckkraft für Überlappung)
const COLORS_LIGHT = [
  "rgba(124, 154, 130, 0.25)", // sage
  "rgba(180, 130, 100, 0.2)", // terracotta
  "rgba(200, 180, 140, 0.2)", // sand
  "rgba(180, 200, 120, 0.18)", // lime
  "rgba(100, 140, 110, 0.22)", // dark sage
  "rgba(220, 160, 120, 0.18)", // peach
  "rgba(160, 190, 150, 0.2)", // mint
  "rgba(190, 150, 130, 0.18)", // dusty rose
];

// Dark mode - leuchtende Farben für screen blend
const COLORS_DARK = [
  "rgba(80, 180, 120, 0.2)", // vibrant sage
  "rgba(200, 100, 80, 0.18)", // deep terracotta
  "rgba(60, 140, 180, 0.15)", // ocean blue
  "rgba(180, 120, 200, 0.18)", // lavender
  "rgba(100, 200, 150, 0.15)", // mint glow
  "rgba(220, 140, 100, 0.18)", // amber
  "rgba(140, 100, 180, 0.15)", // purple
  "rgba(80, 160, 160, 0.18)", // teal
];

function generateRandomBlobs(count: number): Blob[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 400 + Math.random() * 500, // 400-900px
    colorIndex: Math.floor(Math.random() * COLORS_LIGHT.length),
    speed: 0.7 + Math.random() * 0.6, // 0.7-1.3x speed
    delay: Math.random() * -30, // random start offset
    intensity: 20 + Math.random() * 50, // mouse parallax 20-70
    invert: Math.random() > 0.5,
  }));
}

function AmbientBackground(): JSX.Element {
  const [mousePos, setMousePos] = useState<MousePos>({ x: 0.5, y: 0.5 });
  const [colorShift, setColorShift] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const rafRef = useRef<number>(0);
  const colorIntervalRef = useRef<number>(0);

  // Generate random blobs once on mount
  const blobs = useMemo(() => generateRandomBlobs(8), []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Check initial dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.dataset.theme === "dark");
    };
    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    if (prefersReducedMotion) {
      return () => observer.disconnect();
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setMousePos({
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        });
        rafRef.current = 0;
      });
    };

    // Color cycling every 8 seconds
    colorIntervalRef.current = window.setInterval(() => {
      setColorShift((prev) => (prev + 1) % COLORS_LIGHT.length);
    }, 8000);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
    };
  }, []);

  const getBlobStyle = (blob: Blob) => {
    const mult = blob.invert ? -1 : 1;
    const offsetX = (mousePos.x - 0.5) * blob.intensity * mult;
    const offsetY = (mousePos.y - 0.5) * blob.intensity * mult;

    // Use dark or light colors based on theme
    const colors = isDarkMode ? COLORS_DARK : COLORS_LIGHT;
    const currentColorIndex = (blob.colorIndex + colorShift) % colors.length;

    return {
      left: `${blob.x}%`,
      top: `${blob.y}%`,
      width: `${blob.size}px`,
      height: `${blob.size}px`,
      background: colors[currentColorIndex],
      transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`,
      animationDuration: `${45 * blob.speed}s, ${90 * blob.speed}s`,
      animationDelay: `${blob.delay}s, ${blob.delay * 0.8}s`,
    };
  };

  return (
    <div className="ambient-background" aria-hidden="true">
      {blobs.map((blob) => (
        <div
          key={blob.id}
          className="ambient-blob ambient-blob-random"
          style={getBlobStyle(blob)}
        />
      ))}
    </div>
  );
}

export default AmbientBackground;
