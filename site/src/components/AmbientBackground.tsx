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

// 3 static blobs with fixed positions
const BLOBS: Blob[] = [
  {
    id: 1,
    x: 10,
    y: 15,
    size: 500,
    lightColor: "rgba(80, 140, 90, 0.5)", // sage grün
    darkColor: "rgba(80, 180, 120, 0.5)",
  },
  {
    id: 2,
    x: 75,
    y: 70,
    size: 600,
    lightColor: "rgba(210, 160, 100, 0.45)", // sand/gold
    darkColor: "rgba(200, 120, 80, 0.45)",
  },
  {
    id: 3,
    x: 25,
    y: 55,
    size: 400,
    lightColor: "rgba(100, 150, 180, 0.4)", // blau
    darkColor: "rgba(80, 160, 200, 0.4)",
  },
];

function AmbientBackground(): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    // Check for mobile viewport
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 639px)").matches);
    };
    checkMobile();

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

    // Watch for viewport changes
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const handleMobileChange = (e: MediaQueryListEvent) =>
      setIsMobile(e.matches);
    mobileQuery.addEventListener("change", handleMobileChange);

    return () => {
      observer.disconnect();
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
  }, []);

  // Only render 2 blobs on mobile for better performance
  const displayBlobs = isMobile ? BLOBS.slice(0, 2) : BLOBS;

  return (
    <div className="ambient-background" aria-hidden="true">
      {displayBlobs.map((blob) => (
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
