/**
 * AmbientBackground - Minimalist animated background with 3 static blobs
 *
 * Features:
 * - 3 fixed position blobs with subtle colors
 * - Simple slow drift animation only
 * - Dark mode support with different color palette
 * - Respects prefers-reduced-motion accessibility setting
 *
 * Removed (per UI rework plan):
 * - Mouse tracking / parallax
 * - Color cycling
 * - Random blob generation
 */

import { useEffect, useState } from "react";

interface Blob {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number; // px
  lightColor: string;
  darkColor: string;
}

// 3 static blobs with fixed positions (Plan section 4)
const BLOBS: Blob[] = [
  {
    id: 1,
    x: 10,
    y: 15,
    size: 500,
    lightColor: "rgba(124, 154, 130, 0.12)", // sage
    darkColor: "rgba(80, 180, 120, 0.10)",
  },
  {
    id: 2,
    x: 75,
    y: 70,
    size: 600,
    lightColor: "rgba(200, 180, 140, 0.10)", // sand
    darkColor: "rgba(200, 100, 80, 0.08)",
  },
  {
    id: 3,
    x: 25,
    y: 55,
    size: 400,
    lightColor: "rgba(137, 167, 177, 0.08)", // cooldown blue
    darkColor: "rgba(60, 140, 180, 0.08)",
  },
];

function AmbientBackground(): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

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

    return () => observer.disconnect();
  }, []);

  return (
    <div className="ambient-background" aria-hidden="true">
      {BLOBS.map((blob) => (
        <div
          key={blob.id}
          className={`ambient-blob ${prefersReducedMotion ? "" : "ambient-blob-drift"}`}
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            background: isDarkMode ? blob.darkColor : blob.lightColor,
          }}
        />
      ))}
    </div>
  );
}

export default AmbientBackground;
