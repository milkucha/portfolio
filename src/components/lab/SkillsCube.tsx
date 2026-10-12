"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { cubeFaces, type FaceSlot } from "./cubeFaces";
import { INTRO_ACCENTS, INTRO_HANDLE, INTRO_LINES } from "./introText";
import { site } from "@/data/site";
import {
  type Quat,
  type Vec3,
  conj,
  expMap,
  fromAxisAngle,
  logMap,
  mul,
  normalize,
  rotate,
  toMatrix3d,
} from "./quat";
import { faceProjects } from "./cubeProjects";
import { LinkIcon, type LinkIconName } from "./linkIcons";
import "./cube.css";

/* ---------- view tilt + spin: hand-tweak these ---------- */

/**
 * The constant 3/4 view the cube is seen from, both while it spins and when it rests on a face.
 * Taken from the first prototype (726b35e), whose initial pose was rotX(-0.36 rad) * rotY(0.5 rad):
 * the "suspended" look.
 *   VIEW_PITCH_DEG > 0 tips the top edge toward the viewer (the top face shows).
 *   VIEW_YAW_DEG   > 0 turns the front face's right edge away (the left face shows); < 0 the right.
 *   VIEW_ROLL_DEG  tilts the whole thing in the screen plane (clockwise > 0). 726b35e had none.
 */
const VIEW_PITCH_DEG = 10.63; // = 0.36 rad
const VIEW_YAW_DEG = 5.65; // = 0.50 rad
const VIEW_ROLL_DEG = -20;
/**
 * Idle motion is a slow, calm tumble: a continuous rotation about an axis that itself drifts around
 * the vertical, so every face (top and bottom included) swings past the viewer, never snapping.
 *   TUMBLE_DEG_PER_S    rotation speed about the tumble axis (12 deg/s ~ one turn per 30 s).
 *   TUMBLE_TILT_DEG     how far the axis leans from vertical (0 = the old flat spin; ~55 reaches all faces).
 *   PRECESS_DEG_PER_S   how fast the axis circles the vertical (4 deg/s ~ once per 90 s; 0 = fixed axis,
 *                       which never brings the top face round).
 * With 55 / 12 / 4 all six faces have been in front within about a minute, each for ~7 s per visit.
 */
const TUMBLE_DEG_PER_S = 12;
const TUMBLE_TILT_DEG = 55;
const PRECESS_DEG_PER_S = 4;
/** Seconds of ease-in for the tumble on page load (short, so it is moving straight away). */
const ENTRY_RAMP = 0.5;
/** Lab only: set true to show the color / ghost / wire face-style switcher. */
const SHOW_FILL_SWITCH = false;

const styles = {
  wrap: "lab-cube-wrap",
  stage: "lab-cube-stage",
  cube: "lab-cube-cube",
  face: "lab-cube-face",
  fill: "lab-cube-fill",
  label: "lab-cube-label",
  name: "lab-cube-name",
  hint: "lab-cube-hint",
  hintPart: "lab-cube-hintPart",
  menu: "lab-cube-menu",
  menuBio: "lab-cube-menuBio",
  menuLabel: "lab-cube-menuLabel",
  menuProjects: "lab-cube-menuProjects",
  menuFaces: "lab-cube-menuFaces",
  faceName: "lab-cube-faceName",
  menuContact: "lab-cube-menuContact",
  buttons: "lab-cube-buttons",
  contact: "lab-cube-contact",
  contactList: "lab-cube-contactList",
  contactRow: "lab-cube-contactRow",
  contactLabel: "lab-cube-contactLabel",
  lab: "lab-cube-lab",
  button: "lab-cube-button",
  srOnly: "lab-cube-srOnly",
  layout: "lab-cube-layout",
  cubeCol: "lab-cube-cubeCol",
  panel: "lab-cube-panel",
  intro: "lab-cube-intro",
  introName: "lab-cube-introName",
  introBio: "lab-cube-introBio",
  introHandle: "lab-cube-introHandle",
  introAccent: "lab-cube-introAccent",
  panelCard: "lab-cube-panelCard",
  panelHead: "lab-cube-panelHead",
  swatch: "lab-cube-swatch",
  entry: "lab-cube-entry",
  entryName: "lab-cube-entryName",
  entryLine: "lab-cube-entryLine",
  highlights: "lab-cube-highlights",
  chips: "lab-cube-chips",
  footnote: "lab-cube-footnote",
  thumb: "lab-cube-thumb",
  chip: "lab-cube-chip",
  links: "lab-cube-links",
} as const;

/* ---------- geometry ---------- */

const D90 = Math.PI / 2;

interface SlotGeometry {
  /** CSS transform placing the face on the cube. */
  place: string;
  /** Outward normal in cube space. */
  normal: Vec3;
  /** Cube orientation that shows this face front-on with its text upright. */
  upright: Quat;
}

const SLOTS: Record<FaceSlot, SlotGeometry> = {
  front: { place: "translateZ(var(--half))", normal: [0, 0, 1], upright: [1, 0, 0, 0] },
  right: { place: "rotateY(90deg) translateZ(var(--half))", normal: [1, 0, 0], upright: fromAxisAngle([0, 1, 0], -D90) },
  back: { place: "rotateY(180deg) translateZ(var(--half))", normal: [0, 0, -1], upright: fromAxisAngle([0, 1, 0], Math.PI) },
  left: { place: "rotateY(-90deg) translateZ(var(--half))", normal: [-1, 0, 0], upright: fromAxisAngle([0, 1, 0], D90) },
  top: { place: "rotateX(90deg) translateZ(var(--half))", normal: [0, -1, 0], upright: fromAxisAngle([1, 0, 0], -D90) },
  bottom: { place: "rotateX(-90deg) translateZ(var(--half))", normal: [0, 1, 0], upright: fromAxisAngle([1, 0, 0], D90) },
};
const SLOT_NAMES = Object.keys(SLOTS) as FaceSlot[];

/* ---------- rest pose ---------- */

const DEG = Math.PI / 180;
/**
 * World-space "view" rotation, composed on top of every face-snap target (so the cube never settles
 * dead face-on): yaw about the cube's vertical first, then pitch about screen x, then roll.
 */
const VIEW: Quat = normalize(
  mul(
    fromAxisAngle([0, 0, 1], VIEW_ROLL_DEG * DEG),
    mul(fromAxisAngle([1, 0, 0], -VIEW_PITCH_DEG * DEG), fromAxisAngle([0, 1, 0], VIEW_YAW_DEG * DEG)),
  ),
);
const VIEW_INV = conj(VIEW);
/** World-space tumble axis for a given precession phase (rad): leans TUMBLE_TILT_DEG off vertical. */
const tumbleAxis = (phase: number): Vec3 => {
  const a = TUMBLE_TILT_DEG * DEG;
  return [Math.sin(a) * Math.cos(phase), Math.cos(a), Math.sin(a) * Math.sin(phase)];
};
/** Orientation the cube rests in when `slot` is the chosen face. */
const restFor = (slot: FaceSlot): Quat => mul(VIEW, SLOTS[slot].upright);

/** Which face currently points most toward the viewer (judged with the tilt removed). */
function frontSlot(q: Quat): FaceSlot {
  const untilted = mul(VIEW_INV, q);
  let best: FaceSlot = "front";
  let bestZ = -Infinity;
  for (const s of SLOT_NAMES) {
    const z = rotate(untilted, SLOTS[s].normal)[2];
    if (z > bestZ) {
      bestZ = z;
      best = s;
    }
  }
  return best;
}

/**
 * Roll (rad) of `slot`'s face about the view axis relative to its upright rest pose, tilt removed.
 * 0 = the label sits where it does at rest; +90deg = the face has turned a quarter clockwise.
 */
function faceRoll(q: Quat, slot: FaceSlot): number {
  const r = mul(mul(VIEW_INV, q), conj(SLOTS[slot].upright));
  const sign = r[0] < 0 ? -1 : 1;
  return 2 * Math.atan2(sign * r[3], sign * r[0]);
}

/** Face-normal z (view axis, tilt removed): 1 = dead on. */
const faceZ = (q: Quat, slot: FaceSlot): number => rotate(mul(VIEW_INV, q), SLOTS[slot].normal)[2];

/**
 * The pose `slot` would naturally have, at its most front-on, if the tumble just kept going from
 * `q0`/`phase0`: runs the idle motion forward (cheap, ~3k quaternion steps) through the first pass
 * of that face. Returns the cube orientation and the precession phase at that moment, so the
 * tumble can resume from there without a jump.
 */
function naturalPose(q0: Quat, phase0: number, slot: FaceSlot, maxSeconds = 150): { q: Quat; phase: number } {
  const dt = 1 / 30;
  let q = q0;
  let phase = phase0;
  let best = -Infinity;
  let found: { q: Quat; phase: number } | null = null;
  for (let t = 0; t < maxSeconds; t += dt) {
    phase += PRECESS_SPEED * dt;
    const axis = tumbleAxis(phase);
    q = normalize(mul(expMap([axis[0] * IDLE_SPEED * dt, axis[1] * IDLE_SPEED * dt, axis[2] * IDLE_SPEED * dt]), q));
    if (frontSlot(q) === slot) {
      const z = faceZ(q, slot);
      if (z > best) {
        best = z;
        found = { q, phase };
      }
    } else if (found) {
      break;
    }
  }
  return found ?? { q: restFor(slot), phase: phase0 };
}

/** Deterministic starting pose (same on server and client, so no hydration mismatch): the rest pose. */
const INITIAL_Q: Quat = restFor("front");
/**
 * The cube is pushed back so the resting front face's centre sits at z = 0: scale exactly 1 there
 * (the tilted face is foreshortened around it, so text is near-1:1 rather than exact).
 */
const REST_DEPTH = rotate(VIEW, [0, 0, 1])[2].toFixed(6);
const transformFor = (q: Quat) => `translateZ(calc(var(--half) * -${REST_DEPTH})) ${toMatrix3d(q)}`;
const INITIAL_TRANSFORM = transformFor(INITIAL_Q);

/* ---------- motion tuning ---------- */

const IDLE_SPEED = TUMBLE_DEG_PER_S * DEG; // rad/s around the tumble axis
const PRECESS_SPEED = PRECESS_DEG_PER_S * DEG; // rad/s the tumble axis circles the vertical
const IDLE_DELAY = 3500; // ms of no interaction before idle resumes
/** Contact entries shown as icons instead of text, in display order. */
const CONTACT_ICONS: Record<string, LinkIconName> = { LinkedIn: "linkedin", "itch.io": "itch", YouTube: "youtube" };
const contactText = site.contact.filter((c) => !(c.label in CONTACT_ICONS));
const contactIcons = Object.keys(CONTACT_ICONS).flatMap((label) => site.contact.filter((c) => c.label === label));

/** "Claude Code", "Claude Code and OpenCode", "A, B and C". */
const joinList = (xs: readonly string[]) =>
  xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs.join("");
const externalProps = (href: string) =>
  href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};

const FADE_MS = 600; // panel crossfade; keep in step with cube.css
const PICK_HOLD = 10000; // ms the cube stays put after a face is picked (button / arrow key)
const IDLE_RAMP = 1.4; // s to ease idle speed in/out
const SPRING_K = 140; // stiffness (natural freq ~11.8 rad/s)
const SPRING_C = 2 * Math.sqrt(SPRING_K); // critically damped: no overshoot wobble

type Mode = "free" | "spring";

interface Sim {
  q: Quat;
  w: Vec3; // angular velocity (world space), rad/s
  mode: Mode;
  target: Quat;
  lastInteraction: number;
  holdUntil: number; // idle stays off until this time (after an explicit pick)
  idleBlend: number; // 0..1
  focused: boolean;
  /** Pointer over / keyboard focus inside the info panel: counts as interacting (no idle). */
  panelHover: boolean;
  panelFocus: boolean;
  /** Precession phase (rad) of the tumble axis. */
  phase: number;
  /** Still in the first, on-load spin-up (uses the short ENTRY_RAMP). */
  entry: boolean;
  /** Face the panel currently shows, null when hidden. Mirrors React state for the rAF loop. */
  panelSlot: FaceSlot | null;
  /** Projects mode (PROJECTS open): the panel follows whichever face is in front, spinning or not. */
  follow: boolean;
  /** Face the panel is heading for (differs from panelSlot during a crossfade). */
  wantSlot: FaceSlot | null;
  fadeTimer: ReturnType<typeof setTimeout> | null;
  /** Faces currently pointing toward the viewer (to spot the moment one comes into view). */
  vis: Record<FaceSlot, boolean>;
  panelSeq: number;
  /** Cube section is in the viewport: idle spin only runs while it is. */
  onscreen: boolean;
  reduced: boolean;
  dirty: boolean;
}

/** Splits a bio line around the accent tokens (the capture group keeps them in the result). */
const INTRO_ACCENT_RE = new RegExp(
  `(${INTRO_ACCENTS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
);

/** Event-handler clock (wrapped so the React compiler lint doesn't mistake handlers for render). */
const clock = () => performance.now();

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Turn a face's label to `deg`. A face that is facing away (backface-hidden) changes instantly, so
 * the turn is never seen when it swings into view; a visible face keeps the CSS transition.
 */
function setLabelRot(cube: HTMLElement | null, slot: FaceSlot, deg: number, instant: boolean) {
  const face = cube?.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (!face) return;
  const label = face.querySelector<HTMLElement>("[data-label]");
  if (instant && label) {
    label.style.transition = "none";
    face.style.setProperty("--label-rot", `${deg}deg`);
    void label.offsetWidth; // commit the un-animated value before transitions come back
    label.style.transition = "";
  } else {
    face.style.setProperty("--label-rot", `${deg}deg`);
  }
}

export function SkillsCube() {
  const cubeRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageRect = useRef<DOMRect | null>(null);
  const sim = useRef<Sim>({
    q: INITIAL_Q,
    w: [0, 0, 0],
    mode: "free",
    target: INITIAL_Q,
    lastInteraction: -Infinity,
    holdUntil: 0,
    idleBlend: 0,
    focused: false,
    panelHover: false,
    panelFocus: false,
    phase: 0,
    follow: false,
    wantSlot: null,
    fadeTimer: null,
    entry: true,
    panelSlot: null,
    vis: Object.fromEntries(SLOT_NAMES.map((n) => [n, faceZ(INITIAL_Q, n) > 0])) as Record<FaceSlot, boolean>,
    panelSeq: 0,
    onscreen: true,
    reduced: false,
    dirty: false,
  });
  const [fill, setFill] = useState<"color" | "ghost" | "wire">("ghost");
  /** Info panel: last face shown (kept while fading out), `seq` re-keys the card to replay its entrance. */
  const [panel, setPanel] = useState<{ slot: FaceSlot; seq: number; open: boolean } | null>(null);
  /** Right pane shows the contact card (exclusive with the intro and the project panel). */
  const [contactOpen, setContactOpen] = useState(false);
  /** PROJECTS menu unrolled: the face buttons are hidden until it is opened. */
  const [projectsOpen, setProjectsOpen] = useState(false);

  const mode = contactOpen ? "contact" : projectsOpen || panel?.open ? "projects" : "bio";

  // Phones: the layout change on a mode switch is instant; the visual change is a FLIP on the stage
  // (transform only, compositor-friendly) from the old box to the new one. Never on first render.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const prev = stageRect.current;
    stage.getAnimations().forEach((a) => a.cancel());
    const settled = stage.getBoundingClientRect();
    stageRect.current = settled;
    if (!prev || !settled.width || !settled.height) return;
    if (
      !window.matchMedia("(max-width: 640px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (prev.left === settled.left && prev.top === settled.top && prev.width === settled.width)
    ) {
      return;
    }
    const k = prev.width / settled.width;
    const dx = prev.left - settled.left;
    const dy = prev.top - settled.top;
    stage.style.willChange = "transform";
    const anim = stage.animate(
      [
        { transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${k})` },
        { transformOrigin: "0 0", transform: "none" },
      ],
      { duration: 450, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
    const done = () => {
      stage.style.willChange = "";
    };
    anim.onfinish = done;
    anim.oncancel = done;
  }, [mode]);

  // Keep the stage's last settled box current (resize, orientation change) for the next FLIP.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      if (stage.getAnimations().length === 0) stageRect.current = stage.getBoundingClientRect();
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      sim.current.reduced = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Idle spin only runs while the cube is on screen.
  useEffect(() => {
    const s = sim.current;
    const el = layoutRef.current;
    let io: IntersectionObserver | undefined;
    if (el) {
      io = new IntersectionObserver(([entry]) => {
        s.onscreen = entry.isIntersecting;
      });
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      if (s.fadeTimer) clearTimeout(s.fadeTimer);
    };
  }, []);

  /* ---------- info panel ---------- */

  /** Show the panel for `slot` (null hides it, keeping the last content to fade out). Cancels any crossfade in flight. */
  const showPanel = (slot: FaceSlot | null) => {
    const s = sim.current;
    const pending = s.fadeTimer !== null;
    if (s.fadeTimer) {
      clearTimeout(s.fadeTimer);
      s.fadeTimer = null;
    }
    s.wantSlot = slot;
    if (s.panelSlot === slot) {
      if (pending && slot !== null) setPanel((p) => p && { ...p, open: true }); // fade-out interrupted
      return;
    }
    s.panelSlot = slot;
    if (slot === null) {
      setPanel((p) => p && { ...p, open: false });
      return;
    }
    setContactOpen(false); // choosing a face, any way, replaces the contact card
    s.panelSeq += 1;
    setPanel({ slot, seq: s.panelSeq, open: true });
  };

  /** Projects mode: fade the current card out, then swap in `slot`'s. Only acts when the face changes. */
  const crossfadeTo = (slot: FaceSlot) => {
    const s = sim.current;
    if (s.wantSlot === slot) return;
    s.wantSlot = slot;
    if (s.fadeTimer) clearTimeout(s.fadeTimer);
    const swap = () => {
      s.fadeTimer = null;
      s.panelSlot = slot;
      s.panelSeq += 1;
      setContactOpen(false);
      setPanel({ slot, seq: s.panelSeq, open: true });
    };
    if (s.panelSlot === null) {
      swap(); // nothing showing yet: no fade-out to wait for
      return;
    }
    setPanel((p) => p && { ...p, open: false });
    s.fadeTimer = setTimeout(swap, s.reduced ? 0 : FADE_MS);
  };

  // The one animation loop: the only writer of the cube's transform.
  useEffect(() => {
    let raf = 0;
    let last = clock();

    const tick = (now: number) => {
      const s = sim.current;
      const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 30); // clamp: no jumps after tab switches
      last = now;

      if (s.mode === "spring") {
        // Critically damped spring on the rotation error. Velocity carries over from the fling or
        // idle spin, so there is never a speed discontinuity when a snap starts.
        const e = logMap(mul(s.target, conj(s.q)));
        const steps = 2;
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          const err = i === 0 ? e : logMap(mul(s.target, conj(s.q)));
          s.w = [
            s.w[0] + (SPRING_K * err[0] - SPRING_C * s.w[0]) * h,
            s.w[1] + (SPRING_K * err[1] - SPRING_C * s.w[1]) * h,
            s.w[2] + (SPRING_K * err[2] - SPRING_C * s.w[2]) * h,
          ];
          s.q = normalize(mul(expMap([s.w[0] * h, s.w[1] * h, s.w[2] * h]), s.q));
        }
        s.dirty = true;
        const errLen = Math.hypot(...logMap(mul(s.target, conj(s.q))));
        if (errLen < 2e-4 && Math.hypot(...s.w) < 2e-3) {
          s.q = s.target; // land exactly on the rest pose: stable transform, crisp re-raster
          s.w = [0, 0, 0];
          s.mode = "free";
        }
      } else {
        const allowed =
          !s.reduced &&
          s.onscreen &&
          !s.focused &&
          !s.panelHover &&
          !s.panelFocus &&
          now - s.lastInteraction > IDLE_DELAY &&
          now > s.holdUntil;
        const ramp = s.entry ? ENTRY_RAMP : IDLE_RAMP;
        s.idleBlend = Math.min(1, Math.max(0, s.idleBlend + (allowed ? dt : -dt) / ramp));
        if (s.idleBlend >= 1) s.entry = false;
        if (s.idleBlend > 0 && s.panelSlot !== null && !s.follow) {
          // Spinning again: the panel no longer describes the front face.
          s.panelSlot = null;
          setPanel((p) => p && { ...p, open: false });
        }
        if (s.reduced && s.idleBlend === 0 && s.panelSlot === null && s.panelSeq === 0) {
          // Reduced motion: the cube never spins, so the face it rests on counts as focused.
          const slot = frontSlot(s.q);
          s.panelSlot = slot;
          s.panelSeq = 1;
          setPanel({ slot, seq: 1, open: true });
        }
        if (s.idleBlend > 0) {
          const speed = IDLE_SPEED * smoothstep(s.idleBlend);
          s.phase += PRECESS_SPEED * dt;
          const axis = tumbleAxis(s.phase);
          s.w = [axis[0] * speed, axis[1] * speed, axis[2] * speed];
          s.q = normalize(mul(expMap([s.w[0] * dt, s.w[1] * dt, s.w[2] * dt]), s.q));
          s.dirty = true;
        } else {
          s.w = [0, 0, 0];
        }
      }

      if (s.dirty && cubeRef.current) {
        cubeRef.current.style.transform = transformFor(s.q);
        s.dirty = false;
        // When a face comes into view, decide once which corner its label sits in: look ahead to the
        // pose the tumble will give it at its most front-on, and turn the label in quarter turns so
        // the text is upper-left there. It then stays put on the face, even as the face drifts on.
        for (const slotName of SLOT_NAMES) {
          const visible = faceZ(s.q, slotName) > 0;
          if (visible && !s.vis[slotName] && !(s.mode === "spring" && slotName === frontSlot(s.target))) {
            const ahead =
              s.mode === "free" && s.idleBlend > 0 ? naturalPose(s.q, s.phase, slotName, 40) : null;
            const k = Math.round(faceRoll(ahead ? ahead.q : s.q, slotName) / D90);
            setLabelRot(cubeRef.current, slotName, -k * 90, false);
          }
          s.vis[slotName] = visible;
        }
        // Projects mode: the card follows the front face while it spins or is dragged. A snap already
        // named its target, so the faces passed on the way there don't flicker the card.
        if (s.follow && s.mode !== "spring") crossfadeTo(frontSlot(s.q));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- commands ---------- */

  /** PROJECTS: open the menu and show the card of the face in front right away; it then follows the spin. */
  const openProjects = () => {
    const s = sim.current;
    s.follow = true;
    setProjectsOpen(true);
    showPanel(frontSlot(s.q));
  };

  /**
   * Let the idle spin start again at once: no pick hold, no idle delay. The panel is closed by now, so
   * a hover/focus flag left over from it (the pointer or focus can vanish with the panel, with no
   * leave/blur event) must not keep the cube still.
   */
  const resumeSpin = () => {
    const s = sim.current;
    s.lastInteraction = -Infinity;
    s.holdUntil = 0;
    s.panelHover = false;
    s.panelFocus = false;
  };

  /** BIO: back to the intro. Closes any card and lets the idle spin resume straight away. */
  const showBio = () => {
    const s = sim.current;
    s.follow = false;
    showPanel(null);
    setContactOpen(false);
    resumeSpin();
  };

  /** CONTACT: replaces the intro or project card with the contact card; the cube idles on its own. */
  const showContact = () => {
    const s = sim.current;
    s.follow = false;
    showPanel(null);
    setContactOpen(true);
    resumeSpin();
  };

  const snapTo = (target: Quat) => {
    const s = sim.current;
    s.lastInteraction = clock();
    s.idleBlend = 0;
    s.entry = false;
    // Every snap lands a face front-on: show its panel straight away, while the spring settles.
    const targetSlot = frontSlot(target);
    showPanel(targetSlot);
    // A snap lands every face in its upright rest pose, so its label belongs at 0 now, not once it
    // has rolled into view (the visibility check below would otherwise pick a roll from mid-turn).
    setLabelRot(cubeRef.current, targetSlot, 0, faceZ(s.q, targetSlot) <= 0);
    if (s.reduced) {
      s.q = target;
      s.w = [0, 0, 0];
      s.mode = "free";
      s.dirty = true;
      return;
    }
    s.target = target;
    s.mode = "spring";
  };

  const snapToNearest = (q: Quat) => snapTo(restFor(frontSlot(q)));

  /** An explicit pick: hold the chosen face longer before idle spin may resume. */
  const hold = () => {
    sim.current.holdUntil = clock() + PICK_HOLD;
  };

  /** Settle on the nearest face without a jolt (keeps current velocity). */
  const settle = () => {
    const s = sim.current;
    if (s.mode === "free" && s.idleBlend > 0) snapToNearest(s.q);
  };

  const goTo = (slot: FaceSlot) => {
    hold();
    // One fixed, upright pose per face: snapTo pins the label upper-left there.
    snapTo(restFor(slot));
  };

  const turn = (axis: Vec3, angle: number) => {
    const s = sim.current;
    hold();
    // Build on where we are heading, so fast repeated presses queue up 90deg steps cleanly. The
    // step is taken in the untilted frame, so arrows turn about the screen axes, not tilted ones.
    const base = mul(VIEW_INV, s.mode === "spring" ? s.target : restFor(frontSlot(s.q)));
    snapToNearest(mul(VIEW, mul(fromAxisAngle(axis, angle), base)));
  };

  /* ---------- input ---------- */

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [Vec3, number]> = {
      ArrowLeft: [[0, 1, 0], -D90],
      ArrowRight: [[0, 1, 0], D90],
      ArrowUp: [[1, 0, 0], D90],
      ArrowDown: [[1, 0, 0], -D90],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    turn(m[0], m[1]);
  };

  const panelFace = panel ? cubeFaces.find((f) => f.slot === panel.slot) : undefined;

  const onPanelLeave = () => {
    sim.current.lastInteraction = clock();
  };

  return (
    <div
      ref={layoutRef}
      className={styles.layout}
      data-mode={mode}
    >
      <div className={`${styles.wrap} ${styles.cubeCol}`}>
        <div
          ref={stageRef}
          className={styles.stage}
          data-fill={fill}
          tabIndex={0}
          role="group"
          aria-roledescription="rotating cube"
          aria-label="Skills cube. Use the arrow keys to rotate."
          onFocus={(e) => {
            // Only keyboard focus pauses idle; a mouse/touch drag shouldn't pin it until blur.
            if (!e.currentTarget.matches(":focus-visible")) return;
            sim.current.focused = true;
            settle();
          }}
          onBlur={() => {
            sim.current.focused = false;
            sim.current.lastInteraction = clock();
          }}
          onKeyDown={onKeyDown}
        >
          <div ref={cubeRef} className={styles.cube} style={{ transform: INITIAL_TRANSFORM }}>
            {cubeFaces.map((face) => (
              <div
                key={face.id}
                className={styles.face}
                data-slot={face.slot}
                style={
                  {
                    transform: SLOTS[face.slot].place,
                    "--face-bg": face.color,
                    "--face-ink": face.ink,
                  } as CSSProperties
                }
              >
                <div className={styles.fill} />
                <div className={styles.label} data-label aria-hidden="true">
                  <span className={styles.name}>{face.name}</span>
                  <span className={styles.hint}>
                    {/* One item per line. */}
                    {face.hint.split(" · ").map((part) => (
                      <span key={part} className={styles.hintPart}>
                        {part}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.menu}>
          <button
            type="button"
            className={`${styles.button} ${styles.menuLabel} ${styles.menuBio}`}
            aria-pressed={!contactOpen && !projectsOpen && !panel?.open}
            onClick={() => {
              setProjectsOpen(false);
              showBio();
            }}
          >
            Bio
          </button>
          <button
            type="button"
            id="lab-cube-projects-label"
            className={`${styles.button} ${styles.menuLabel} ${styles.menuProjects}`}
            aria-expanded={projectsOpen}
            aria-controls="lab-cube-faces"
            onClick={() => {
              if (projectsOpen) {
                setProjectsOpen(false);
                showBio();
              } else {
                openProjects();
              }
            }}
          >
            Projects
          </button>
          <nav
            id="lab-cube-faces"
            aria-labelledby="lab-cube-projects-label"
            className={styles.menuFaces}
            data-open={projectsOpen ? "true" : "false"}
            inert={!projectsOpen}
          >
            {cubeFaces.map((face, i) => (
              <button
                key={face.id}
                style={{ "--i": i } as CSSProperties}
                type="button"
                className={styles.button}
                aria-pressed={!!panel && (panel.open || projectsOpen) && face.slot === panel.slot}
                onClick={() => goTo(face.slot)}
              >
                <span className={styles.faceName}>{face.name}</span>
              </button>
            ))}
          </nav>
          <button
            type="button"
            className={`${styles.button} ${styles.menuLabel} ${styles.menuContact}`}
            aria-pressed={contactOpen}
            onClick={() => {
              setProjectsOpen(false);
              showContact();
            }}
          >
            Contact
          </button>
        </div>

        {SHOW_FILL_SWITCH && (
          <div className={styles.lab} role="group" aria-label="Face style (lab only)">
            <span>faces:</span>
            {(["color", "ghost", "wire"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={styles.button}
                aria-pressed={fill === v}
                onClick={() => setFill(v)}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Intro text: fades in while the cube spins (no face chosen), out when the panel opens. */}
      <section
        className={styles.intro}
        aria-labelledby="lab-cube-intro-title"
        data-open={panel?.open || contactOpen || projectsOpen ? "false" : "true"}
        inert={!!panel?.open || contactOpen || projectsOpen}
      >
        <h1 id="lab-cube-intro-title" className={styles.introName}>
          {site.name}
        </h1>
        {INTRO_LINES.map((para) => (
          <p key={para} className={styles.introBio}>
            {para.split(INTRO_ACCENT_RE).map((part, i) =>
              (INTRO_ACCENTS as readonly string[]).includes(part) ? (
                <span
                  key={i}
                  className={part === INTRO_HANDLE ? styles.introHandle : styles.introAccent}
                >
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </p>
        ))}
      </section>

      {/* Contact card: the third state of the right pane. Always mounted so it can fade out. */}
      <section
        className={styles.contact}
        aria-label="Contact"
        data-open={contactOpen ? "true" : "false"}
        inert={!contactOpen}
      >
        <h2 className={styles.panelHead}>Contact</h2>
        <ul className={styles.contactList}>
          {contactText.map((c, i) => (
            <li key={c.label} className={styles.contactRow} style={{ "--i": i } as CSSProperties}>
              <span className={styles.contactLabel}>{c.label}</span>
              {c.href ? (
                <a href={c.href} {...externalProps(c.href)}>
                  {c.display}
                </a>
              ) : (
                <span>{c.display}</span>
              )}
            </li>
          ))}
          <li className={styles.contactRow} style={{ "--i": contactText.length } as CSSProperties}>
            <span className={styles.contactLabel}>Elsewhere</span>
            <span className={styles.links}>
              {contactIcons.map((c) =>
                c.href ? (
                  <a key={c.href} href={c.href} aria-label={c.label} title={c.label} {...externalProps(c.href)}>
                    <LinkIcon name={CONTACT_ICONS[c.label]} />
                  </a>
                ) : null,
              )}
            </span>
          </li>
        </ul>
      </section>

      {/* Info panel for the focused face. Always mounted, so the live region exists before it first
          fills; hidden (inert, faded) while the cube spins. Focus never moves here on its own. */}
      <section
        className={styles.panel}
        aria-label="Projects for the focused face"
        aria-live="polite"
        data-open={panel?.open ? "true" : "false"}
        inert={!panel?.open}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") sim.current.panelHover = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          sim.current.panelHover = false;
          onPanelLeave();
        }}
        onFocus={() => {
          sim.current.panelFocus = true;
        }}
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          sim.current.panelFocus = false;
          onPanelLeave();
        }}
      >
        {panel && panelFace ? (
          <div
            key={panel.seq}
            className={styles.panelCard}
            style={{ "--accent": panelFace.color } as CSSProperties}
          >
            <h2 className={styles.panelHead}>
              <span className={styles.swatch} aria-hidden="true" />
              {panelFace.name}
            </h2>
            {faceProjects[panelFace.id].map((p) => {
              const titleLink =
                p.links.find((l) => l.label === "GitHub") ?? (p.links.length === 1 ? p.links[0] : undefined);
              return (
              <article key={p.name} className={styles.entry}>
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.thumb} src={p.image.src} alt={p.image.alt} />
                ) : null}
                <h3 className={styles.entryName}>
                  {titleLink ? (
                    <a href={titleLink.href} target="_blank" rel="noopener noreferrer">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </h3>
                <p className={styles.entryLine}>{p.oneLiner}</p>
                {p.highlights.length > 0 ? (
                  <ul className={styles.highlights}>
                    {p.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                ) : null}
                {p.stack.length > 0 ? (
                  <ul className={styles.chips} aria-label="Tech">
                    {p.stack.map((t) => (
                      <li key={t} className={styles.chip}>
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {p.workflow.length > 0 ? (
                  <p className={styles.footnote}>Built with {joinList(p.workflow)}</p>
                ) : null}
                {p.links.length > 0 ? (
                  <p className={styles.links}>
                    {p.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${l.label} (opens in a new tab)`}
                        title={l.label}
                      >
                        <LinkIcon name={l.icon} />
                      </a>
                    ))}
                  </p>
                ) : null}
              </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
