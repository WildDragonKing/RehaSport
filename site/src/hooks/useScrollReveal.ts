import { useEffect, useRef } from "react";

/**
 * Hook that adds scroll-reveal animations using Intersection Observer.
 *
 * Elements with the class 'scroll-reveal' will animate in when they
 * enter the viewport. The 'revealed' class is added to trigger the
 * CSS transition.
 *
 * Respects prefers-reduced-motion by checking for it before observing.
 */
export function useScrollReveal(): void {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      // If user prefers reduced motion, show all elements immediately
      document.querySelectorAll(".scroll-reveal").forEach((el) => {
        el.classList.add("revealed");
      });
      return;
    }

    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            // Once revealed, stop observing this element
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05, // Lower threshold for earlier reveal
        rootMargin: "0px 0px 0px 0px", // No negative margin
      },
    );

    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      document.querySelectorAll(".scroll-reveal").forEach((el) => {
        observerRef.current?.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(initTimer);
      observerRef.current?.disconnect();
    };
  }, []);
}

export default useScrollReveal;
