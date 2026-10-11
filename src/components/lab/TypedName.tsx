"use client";

import { useEffect, useState } from "react";

const START_DELAY = 500; // ms before the first character
const CHAR_MS = 85; // base ms per character
const JITTER_MS = 45; // random extra per character, so it reads as typing

/**
 * The page's h1 text, typed out once with a blinking block cursor, like a terminal. Screen readers get
 * the full text straight away (sr-only copy); the typed part is aria-hidden. The not-yet-typed rest is
 * laid out but invisible, so the line never reflows as it fills. Reduced motion: shown instantly,
 * no cursor. Costs ~14 tiny state updates in total; the blink is a CSS opacity animation.
 */
export function TypedName({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let n = 0;
    let timer: ReturnType<typeof setTimeout>;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = setTimeout(() => {
        setReduced(true);
        setCount(text.length);
      }, 0);
      return () => clearTimeout(timer);
    }
    const next = () => {
      n += 1;
      setCount(n);
      if (n < text.length) timer = setTimeout(next, CHAR_MS + Math.random() * JITTER_MS);
    };
    timer = setTimeout(next, START_DELAY);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        {reduced ? null : <span className="lab-page-cursor" data-done={count >= text.length} />}
        <span className="lab-page-untyped">{text.slice(count)}</span>
      </span>
    </>
  );
}
