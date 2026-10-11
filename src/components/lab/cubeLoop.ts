/**
 * A smooth, periodic path through a list of orientations (the six face poses), used for the cube's
 * idle motion. Pure maths, no DOM, so it can be sampled and checked outside the browser.
 *
 * Each leg is the geodesic (shortest rotation) from one pose to the next, traversed with an
 * ease-in-out time warp that never quite reaches zero speed: the cube lingers near each pose
 * (the "dwell") and flows through it, never stopping dead.
 */
import { type Quat, conj, expMap, logMap, mul, normalize } from "./quat";

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
