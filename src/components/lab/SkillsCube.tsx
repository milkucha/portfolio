"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { cubeFaces, type FaceSlot } from "./cubeFaces";
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
import "./cube.css";

const styles = {
  wrap: "lab-cube-wrap",
  stage: "lab-cube-stage",
  dragging: "lab-cube-dragging",
  cube: "lab-cube-cube",
  face: "lab-cube-face",
  fill: "lab-cube-fill",
  label: "lab-cube-label",
  name: "lab-cube-name",
  hint: "lab-cube-hint",
  hintPart: "lab-cube-hintPart",
  buttons: "lab-cube-buttons",
  lab: "lab-cube-lab",
  button: "lab-cube-button",
  srOnly: "lab-cube-srOnly",
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

/**
 * Tilt of the rest pose, composed on top of every face-snap target: the cube never settles dead
 * face-on but at a slight 3/4 view. Edit these two.
 *   REST_PITCH > 0 tips the top edge toward the viewer (top face shows).
 *   REST_YAW   > 0 turns the front face's right edge away (left face shows); < 0 shows the right.
 */
const REST_PITCH_DEG = 18;
const REST_YAW_DEG = 22;

const DEG = Math.PI / 180;
/** World-space "view" rotation: yaw about the cube's vertical first, then pitch about screen x. */
const VIEW: Quat = normalize(
  mul(fromAxisAngle([1, 0, 0], -REST_PITCH_DEG * DEG), fromAxisAngle([0, 1, 0], REST_YAW_DEG * DEG)),
);
const VIEW_INV = conj(VIEW);
/** The cube's own vertical as seen through the tilt: idle spins about this, so it never wobbles. */
const SPIN_AXIS: Vec3 = rotate(VIEW, [0, 1, 0]);
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

/** Deterministic starting pose (same on server and client, so no hydration mismatch): the rest pose. */
const INITIAL_Q: Quat = restFor("front");
/**
 * The cube is pushed back so the resting front face's centre sits at z = 0: scale exactly 1 there
 * (the tilted face is foreshortened around it, so text is near-1:1 rather than exact).
 */
const REST_DEPTH = rotate(VIEW, [0, 0, 1])[2].toFixed(6);
const transformFor = (q: Quat) => `translateZ(calc(var(--half) * -${REST_DEPTH})) ${toMatrix3d(q)}`;
const INITIAL_TRANSFORM = transformFor(INITIAL_Q);
const INITIAL_SLOT = frontSlot(INITIAL_Q);

/* ---------- motion tuning ---------- */

const IDLE_SPEED = 0.32; // rad/s around the vertical axis
const IDLE_DELAY = 3500; // ms of no interaction before idle resumes
const PICK_HOLD = 10000; // ms the cube stays put after a face is picked (button / arrow key)
const IDLE_RAMP = 1.4; // s to ease idle speed in/out
const SPRING_K = 140; // stiffness (natural freq ~11.8 rad/s)
const SPRING_C = 2 * Math.sqrt(SPRING_K); // critically damped: no overshoot wobble
const COAST = 0.16; // s of momentum used to pick the landing face after a fling
const MAX_SPIN = 16; // rad/s cap on fling speed
const DRAG_RELEASE_STALE = 70; // ms: if the pointer rested this long before release, no fling

type Mode = "free" | "drag" | "spring";

interface Sim {
  q: Quat;
  w: Vec3; // angular velocity (world space), rad/s
  mode: Mode;
  target: Quat;
  pending: [number, number]; // drag pixels not yet applied
  lastMove: number;
  lastInteraction: number;
  holdUntil: number; // idle stays off until this time (after an explicit pick)
  idleBlend: number; // 0..1
  hovering: boolean;
  focused: boolean;
  reduced: boolean;
  pointerId: number | null;
  lastX: number;
  lastY: number;
  dirty: boolean;
}

/** Event-handler clock (wrapped so the React compiler lint doesn't mistake handlers for render). */
const clock = () => performance.now();

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function SkillsCube() {
  const cubeRef = useRef<HTMLDivElement>(null);
  const sim = useRef<Sim>({
    q: INITIAL_Q,
    w: [0, 0, 0],
    mode: "free",
    target: INITIAL_Q,
    pending: [0, 0],
    lastMove: 0,
    lastInteraction: -Infinity,
    holdUntil: 0,
    idleBlend: 0,
    hovering: false,
    focused: false,
    reduced: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    dirty: false,
  });
  const [active, setActive] = useState<FaceSlot>(INITIAL_SLOT);
  const [dragging, setDragging] = useState(false);
  const [fill, setFill] = useState<"color" | "ghost" | "wire">("color");

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

  // The one animation loop: the only writer of the cube's transform.
  useEffect(() => {
    let raf = 0;
    let last = clock();
    let shownSlot: FaceSlot = INITIAL_SLOT;

    const tick = (now: number) => {
      const s = sim.current;
      const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 30); // clamp: no jumps after tab switches
      last = now;

      if (s.mode === "drag") {
        const [dx, dy] = s.pending;
        s.pending = [0, 0];
        const size = cubeRef.current?.offsetWidth || 200;
        const len = Math.hypot(dx, dy);
        // Dragging one face-width turns the cube ~90deg: the surface tracks the finger.
        const angle = (len / size) * D90;
        // Screen-space axis, applied in world space (pre-multiplied): no Euler angles, no gimbal lock.
        const r: Vec3 = len > 0 ? [(-dy / len) * angle, (dx / len) * angle, 0] : [0, 0, 0];
        if (len > 0) {
          s.q = normalize(mul(expMap(r), s.q));
          s.dirty = true;
        }
        if (dt > 0) {
          const a = 1 - Math.exp(-dt / 0.045); // time-based smoothing of the velocity estimate
          s.w = [s.w[0] + (r[0] / dt - s.w[0]) * a, s.w[1] + (r[1] / dt - s.w[1]) * a, 0];
        }
      } else if (s.mode === "spring") {
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
          !s.hovering &&
          !s.focused &&
          now - s.lastInteraction > IDLE_DELAY &&
          now > s.holdUntil;
        s.idleBlend = Math.min(1, Math.max(0, s.idleBlend + (allowed ? dt : -dt) / IDLE_RAMP));
        if (s.idleBlend > 0) {
          const speed = IDLE_SPEED * smoothstep(s.idleBlend);
          s.w = [SPIN_AXIS[0] * speed, SPIN_AXIS[1] * speed, SPIN_AXIS[2] * speed];
          s.q = normalize(mul(expMap([s.w[0] * dt, s.w[1] * dt, s.w[2] * dt]), s.q));
          s.dirty = true;
        } else {
          s.w = [0, 0, 0];
        }
      }

      if (s.dirty && cubeRef.current) {
        cubeRef.current.style.transform = transformFor(s.q);
        s.dirty = false;
        const slot = frontSlot(s.q);
        if (slot !== shownSlot) {
          shownSlot = slot;
          setActive(slot);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- commands ---------- */

  const snapTo = (target: Quat) => {
    const s = sim.current;
    s.lastInteraction = clock();
    s.idleBlend = 0;
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

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (s.pointerId !== null || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    s.pointerId = e.pointerId;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastMove = clock();
    s.pending = [0, 0];
    s.w = [0, 0, 0]; // grabbing stops the cube dead, like catching it
    s.mode = "drag";
    s.idleBlend = 0;
    s.lastInteraction = clock();
    s.holdUntil = 0; // a drag is a fresh interaction with the normal idle delay
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (e.pointerId !== s.pointerId) return;
    s.pending = [s.pending[0] + e.clientX - s.lastX, s.pending[1] + e.clientY - s.lastY];
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastMove = clock();
    s.lastInteraction = s.lastMove;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (e.pointerId !== s.pointerId) return;
    s.pointerId = null;
    setDragging(false);
    const now = clock();
    s.lastInteraction = now;
    let w = s.w;
    if (now - s.lastMove > DRAG_RELEASE_STALE || s.reduced) w = [0, 0, 0];
    const speed = Math.hypot(...w);
    if (speed > MAX_SPIN) w = [(w[0] / speed) * MAX_SPIN, (w[1] / speed) * MAX_SPIN, 0];
    s.w = w;
    // Pick the landing face from where the momentum would carry it, then spring there.
    const projected = mul(expMap([w[0] * COAST, w[1] * COAST, 0]), s.q);
    snapToNearest(projected);
  };

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

  const activeFace = cubeFaces.find((f) => f.slot === active);

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.stage} ${dragging ? styles.dragging : ""}`}
        data-fill={fill}
        tabIndex={0}
        role="group"
        aria-roledescription="rotating cube"
        aria-label="Skills cube. Drag, or use the arrow keys, to rotate."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          sim.current.hovering = true;
          settle();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          sim.current.hovering = false;
          sim.current.lastInteraction = clock();
        }}
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
              style={
                {
                  transform: SLOTS[face.slot].place,
                  "--face-bg": face.color,
                  "--face-ink": face.ink,
                } as CSSProperties
              }
            >
              <div className={styles.fill} />
              <div className={styles.label} aria-hidden="true">
                <span className={styles.name}>{face.name}</span>
                <span className={styles.hint}>
                  {/* Wrap only between " · " segments, never inside one ("REST / APIs"). */}
                  {face.hint.split(" · ").map((part, i, all) => (
                    <Fragment key={i}>
                      {i > 0 ? " " : ""}
                      <span className={styles.hintPart}>
                        {part}
                        {i < all.length - 1 ? " ·" : ""}
                      </span>
                    </Fragment>
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {activeFace ? `${activeFace.name}: ${activeFace.hint}` : ""}
      </p>

      <nav aria-label="Cube faces" className={styles.buttons}>
        {cubeFaces.map((face) => (
          <button
            key={face.id}
            type="button"
            className={styles.button}
            aria-pressed={face.slot === active}
            onClick={() => goTo(face.slot)}
          >
            {face.name}
          </button>
        ))}
      </nav>

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
    </div>
  );
}
