"use client";

import { useEffect, useRef } from "react";

/**
 * The intro's drifting blue/rose glow (styles: .intro-glow-layer in globals.css). Transform-only,
 * so it runs on the compositor; this component just pauses it while the intro is off-screen or
 * the tab is hidden, so it costs nothing when nobody can see it.
 */
export function IntroGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section) return;
    let inView = true;
    const update = () => {
      if (inView && document.visibilityState === "visible") el.removeAttribute("data-paused");
      else el.setAttribute("data-paused", "");
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    io.observe(section);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="intro-glow-layer" />;
}
