/**
 * Smooth, periodic paths through a list of orientations (the six face poses), used for the cube's
 * idle motion. Pure maths, no DOM, so they can be sampled and checked outside the browser.
 *
 * `makeFlow` is the one in use: a C1 curve through every pose at constant speed. `makeLoop` is the
 * earlier variant (geodesic legs with an ease-in-out time warp, lingering at each pose), kept for
 * comparison with the loop branch.
 */
import { type Quat, conj, expMap, logMap, mul, normalize } from "./quat";

const DEG = Math.PI / 180;

export interface Loop {
  /** Seconds for one full lap. */
  period: number;
  /** Orientation at loop time `t` (seconds, wraps). Passes through `poses[i]` exactly at t = i * secondsPerFace. */
  at: (t: number) => Quat;
  /** Loop time whose orientation is closest to `q`. */
  nearest: (q: Quat) => number;
}

/**
 * @param secondsPerFace time from one pose to the next, dwell included
 * @param dwell          0..1: fraction of each leg spent near-still (half at each end, so the linger around a pose is `dwell * secondsPerFace`)
 * @param floor          0..1: speed during the dwell as a fraction of peak speed (0 would stop dead)
 */
export function makeLoop(poses: readonly Quat[], secondsPerFace: number, dwell: number, floor: number): Loop {
  const n = poses.length;
  const deltas = poses.map((p, i) => logMap(mul(poses[(i + 1) % n], conj(p))));
  const period = n * secondsPerFace;

  // Time warp: progress along a leg (0..1) against time through it (0..1), from the integral of a
  // speed profile that sits at `floor` for the dwell and swells to 1 in between.
  const d = Math.min(Math.max(dwell, 0), 0.95) / 2;
  const speed = (u: number) => {
    const v = (u - d) / (1 - 2 * d);
    if (v <= 0 || v >= 1) return floor;
    const s = Math.sin(Math.PI * v);
    return floor + (1 - floor) * s * s;
  };
  const N = 512;
  const cum = new Float64Array(N + 1);
  for (let i = 0; i < N; i++) cum[i + 1] = cum[i] + speed((i + 0.5) / N);
  for (let i = 0; i <= N; i++) cum[i] /= cum[N];
  const warp = (u: number) => {
    const x = Math.min(Math.max(u, 0), 1) * N;
    const i = Math.min(N - 1, Math.floor(x));
    return cum[i] + (cum[i + 1] - cum[i]) * (x - i);
  };

  const at = (t: number): Quat => {
    const tt = ((t % period) + period) % period;
    const i = Math.min(n - 1, Math.floor(tt / secondsPerFace));
    const s = warp(tt / secondsPerFace - i);
    const dl = deltas[i];
    return normalize(mul(expMap([dl[0] * s, dl[1] * s, dl[2] * s]), poses[i]));
  };

  const M = 1440;
  const samples = Array.from({ length: M }, (_, k) => at((k / M) * period));
  const nearest = (q: Quat): number => {
    let best = 0;
    let bestDot = -1;
    for (let k = 0; k < M; k++) {
      const p = samples[k];
      const dot = Math.abs(p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3] * q[3]);
      if (dot > bestDot) {
        bestDot = dot;
        best = k;
      }
    }
    return (best / M) * period;
  };

  return { period, at, nearest };
}

/* ---------- continuous flow ---------- */

const dotQ = (a: Quat, b: Quat) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
/** Angle (rad) between two orientations, the short way round. */
const angleBetween = (a: Quat, b: Quat) => 2 * Math.acos(Math.min(1, Math.abs(dotQ(a, b))));

type V3 = [number, number, number];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * Inverse of the rotation-vector derivative map: for q(t) = exp(r(t)) * p, the world-frame angular
 * velocity is J(r) r'. This returns r' for a wanted angular velocity `w` at rotation vector `r`.
 */
function dexpInv(r: V3, w: V3): V3 {
  const th = Math.hypot(r[0], r[1], r[2]);
  if (th < 1e-6) return w;
  const c1 = cross(r, w);
  const c2 = cross(r, c1);
  const k = 1 / (th * th) - (1 + Math.cos(th)) / (2 * th * Math.sin(th));
  return [w[0] - 0.5 * c1[0] + k * c2[0], w[1] - 0.5 * c1[1] + k * c2[1], w[2] - 0.5 * c1[2] + k * c2[2]];
}

/**
 * A closed, C1-smooth path that passes exactly through every pose, traversed at constant angular
 * speed (arc-length reparametrised through a lookup table). Same interface as `makeLoop`, so the
 * idle code does not care which one it runs.
 *
 * Each leg is a cubic Hermite curve in the rotation-vector chart around its start pose, with
 * Catmull-Rom tangents (half the difference between the vectors to the next and previous pose) and
 * the end tangent corrected for the chart, so the angular velocity matches across every knot:
 * no kinks, however the direction changes.
 *
 * @param degPerSecond angular speed along the path; the lap takes (path length) / this
 * @param tension      scales the Catmull-Rom tangents: 1 is the classic spline, larger sweeps wider (rounder)
 *                     corners but bulges further off the straight legs, smaller hugs the legs
 * @param ease         0..1: 0 is perfectly constant speed; larger values slow the cube slightly
 *                     near each pose (down to `1 - ease` of full speed, within ~15 deg of it)
 */
export function makeFlow(poses: readonly Quat[], degPerSecond: number, ease = 0, tension = 1): Loop {
  const n = poses.length;
  const to = (i: number, j: number): V3 => {
    const d = logMap(mul(poses[((j % n) + n) % n], conj(poses[i])));
    return [d[0], d[1], d[2]];
  };
  const m = poses.map((_, i): V3 => {
    const a = to(i, i + 1);
    const b = to(i, i - 1);
    return [(tension * (a[0] - b[0])) / 2, (tension * (a[1] - b[1])) / 2, (tension * (a[2] - b[2])) / 2];
  });
  const d = poses.map((_, i) => to(i, i + 1));
  const e = poses.map((_, i) => dexpInv(d[i], m[(i + 1) % n]));
  /** The path at parameter u in [0, n): knot i at u = i. */
  const spline = (u: number): Quat => {
    const uu = ((u % n) + n) % n;
    const i = Math.min(n - 1, Math.floor(uu));
    const t = uu - i;
    const h10 = t * t * t - 2 * t * t + t;
    const h01 = -2 * t * t * t + 3 * t * t;
    const h11 = t * t * t - t * t;
    const r: V3 = [
      h10 * m[i][0] + h01 * d[i][0] + h11 * e[i][0],
      h10 * m[i][1] + h01 * d[i][1] + h11 * e[i][1],
      h10 * m[i][2] + h01 * d[i][2] + h11 * e[i][2],
    ];
    return normalize(mul(expMap(r), poses[i]));
  };

  // Arc-length table over u: cumulative angle at M+1 samples.
  const M = 6000;
  const arc = new Float64Array(M + 1);
  let prev = spline(0);
  for (let k = 1; k <= M; k++) {
    const q = spline((k / M) * n);
    arc[k] = arc[k - 1] + angleBetween(prev, q);
    prev = q;
  }
  const length = arc[M]; // rad
  /** u for an arc length s (rad, 0..length). */
  const uAt = (s: number): number => {
    let lo = 0;
    let hi = M;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (arc[mid] <= s) lo = mid;
      else hi = mid;
    }
    const span = arc[hi] - arc[lo] || 1;
    return ((lo + (s - arc[lo]) / span) / M) * n;
  };

  // Time along the arc: dt = ds / v(s), v = 1 everywhere unless `ease` dips it near a pose.
  const poseArc = poses.map((_, i) => arc[Math.round((i / n) * M)]);
  const W = 15 * DEG;
  const v = (s: number) => {
    if (ease <= 0) return 1;
    let dmin = Infinity;
    for (const a of poseArc) dmin = Math.min(dmin, Math.abs(s - a), Math.abs(s - a + length), Math.abs(s - a - length));
    const x = Math.min(dmin / W, 1);
    return 1 - ease * (1 - x * x * (3 - 2 * x));
  };
  const T = 4096;
  const cumT = new Float64Array(T + 1);
  const speed = degPerSecond * DEG;
  for (let k = 0; k < T; k++) cumT[k + 1] = cumT[k] + length / T / (v(((k + 0.5) / T) * length) * speed);
  const period = cumT[T];
  /** arc length (rad) at loop time tt. */
  const sAt = (tt: number): number => {
    let lo = 0;
    let hi = T;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cumT[mid] <= tt) lo = mid;
      else hi = mid;
    }
    const span = cumT[hi] - cumT[lo] || 1;
    return ((lo + (tt - cumT[lo]) / span) / T) * length;
  };

  const at = (t: number): Quat => spline(uAt(sAt(((t % period) + period) % period)));

  const K = 1440;
  const samples = Array.from({ length: K }, (_, k) => at((k / K) * period));
  const nearest = (q: Quat): number => {
    let best = 0;
    let bestDot = -1;
    for (let k = 0; k < K; k++) {
      const d = Math.abs(dotQ(samples[k], q));
      if (d > bestDot) {
        bestDot = d;
        best = k;
      }
    }
    return (best / K) * period;
  };

  return { period, at, nearest };
}
