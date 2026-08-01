import { useEffect, useRef } from "react";
import { renderCanvas } from "./canvas";

/**
 * Full-bleed interactive mouse-trail canvas, meant to sit behind hero content
 * (pointer-events are disabled so it never blocks clicks). Skips the animation
 * entirely for users who prefer reduced motion, and lightens the trail count on
 * small screens to keep it smooth on mobile.
 */
const HeroCanvas = ({ className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !canvasRef.current) return;

    const stop = renderCanvas(canvasRef.current, {
      trails: window.innerWidth < 640 ? 40 : 80,
    });
    return stop;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
};

export default HeroCanvas;
