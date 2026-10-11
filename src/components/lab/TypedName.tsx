"use client";

import { useEffect, useState } from "react";

const START_DELAY = 500; // ms before the first character
const TYPE_MS = 85; // base ms per typed character
const TYPE_JITTER_MS = 45; // random extra per character, so it reads as typing
const DELETE_MS = 45; // ms per deleted character (backspacing is quicker)
const HOLD_MS = 3500; // ms a finished word stays on screen
const GAP_MS = 450; // ms of empty line between deleting and typing the next word

/**
 * The page's h1: types the real name, holds it, deletes it, types the alias, holds, deletes, and
 * loops, with a terminal-style block cursor (solid while typing/deleting, blinking while holding).
 * Screen readers always get `text` (sr-only copy); the animated part is aria-hidden. Layout never
 * reflows: a hidden copy of `text` reserves the box, and the not-yet-typed rest of the current word
 * is laid out invisibly. Reduced motion: `text` shown, no cursor, no loop. Cost: one tiny state
 * update per character; the blink is a CSS opacity animation.
 */
export function TypedName({ text, alt }: { text: string; alt: string }) {
  const words = [text, alt];
  const [state, setState] = useState({ word: 0, count: 0, busy: true });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = setTimeout(() => {
        setReduced(true);
        setState({ word: 0, count: text.length, busy: false });
      }, 0);
      return () => clearTimeout(timer);
    }
    const list = [text, alt];
    let word = 0;
    let count = 0;
    const set = (busy: boolean) => setState({ word, count, busy });
    const type = () => {
      count += 1;
      if (count < list[word].length) {
        set(true);
        timer = setTimeout(type, TYPE_MS + Math.random() * TYPE_JITTER_MS);
      } else {
        set(false);
        timer = setTimeout(erase, HOLD_MS);
      }
    };
    const erase = () => {
      count -= 1;
      set(true);
      if (count > 0) {
        timer = setTimeout(erase, DELETE_MS);
      } else {
        word = (word + 1) % list.length;
        timer = setTimeout(type, GAP_MS);
      }
    };
    timer = setTimeout(type, START_DELAY);
    return () => clearTimeout(timer);
  }, [text, alt]);

  const current = words[state.word];
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="lab-page-typed">
        <span className="lab-page-spacer">{text}</span>
        <span className="lab-page-live">
          {current.slice(0, state.count)}
          {reduced ? null : <span className="lab-page-cursor" data-done={!state.busy} />}
          <span className="lab-page-untyped">{current.slice(state.count)}</span>
        </span>
      </span>
    </>
  );
}
