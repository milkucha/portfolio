/**
 * Minimal quaternion helpers for the CSS cube.
 *
 * Coordinates are CSS's: +x right, +y down, +z toward the viewer. The quaternion -> matrix
 * conversion is the standard Rodrigues form, which is exactly what CSS `rotate3d()` uses, so a
 * rotation built here about (0, 1, 0) by `a` matches `rotateY(a)`.
 */

export type Vec3 = readonly [number, number, number];
/** [w, x, y, z] */
export type Quat = readonly [number, number, number, number];

export const IDENTITY: Quat = [1, 0, 0, 0];

export function fromAxisAngle(axis: Vec3, angle: number): Quat {
  const len = Math.hypot(axis[0], axis[1], axis[2]);
  if (len === 0 || angle === 0) return IDENTITY;
  const s = Math.sin(angle / 2) / len;
  return [Math.cos(angle / 2), axis[0] * s, axis[1] * s, axis[2] * s];
}

/** Hamilton product: the result applies `b` first, then `a`. */
export function mul(a: Quat, b: Quat): Quat {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

export function conj(q: Quat): Quat {
  return [q[0], -q[1], -q[2], -q[3]];
}

export function normalize(q: Quat): Quat {
  const len = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / len, q[1] / len, q[2] / len, q[3] / len];
}

/** Rotation vector (axis * angle, radians) -> quaternion. */
export function expMap(r: Vec3): Quat {
  const angle = Math.hypot(r[0], r[1], r[2]);
  return angle < 1e-9 ? IDENTITY : fromAxisAngle(r, angle);
}

/**
 * Quaternion -> rotation vector, always taking the short way round (angle <= 180deg). This is
 * what keeps snaps from ever spinning 350deg instead of 10deg.
 */
export function logMap(q: Quat): Vec3 {
  const sign = q[0] < 0 ? -1 : 1;
  const w = q[0] * sign;
  const x = q[1] * sign;
  const y = q[2] * sign;
  const z = q[3] * sign;
  const s = Math.hypot(x, y, z);
  if (s < 1e-9) return [0, 0, 0];
  const angle = 2 * Math.atan2(s, w);
  return [(x / s) * angle, (y / s) * angle, (z / s) * angle];
}

export function rotate(q: Quat, v: Vec3): Vec3 {
  const [w, x, y, z] = q;
  // v' = v + 2w(u x v) + 2 u x (u x v), u = (x, y, z)
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  return [
    v[0] + w * tx + (y * tz - z * ty),
    v[1] + w * ty + (z * tx - x * tz),
    v[2] + w * tz + (x * ty - y * tx),
  ];
}

const f = (n: number) => {
  const s = n.toFixed(6);
  return s === "-0.000000" ? "0" : s;
};

/** CSS `matrix3d()` (column-major) for a pure rotation. Deterministic, so SSR == client. */
export function toMatrix3d(q: Quat): string {
  const [w, x, y, z] = q;
  const m = [
    1 - 2 * (y * y + z * z), 2 * (x * y + w * z), 2 * (x * z - w * y), 0,
    2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x), 0,
    2 * (x * z + w * y), 2 * (y * z - w * x), 1 - 2 * (x * x + y * y), 0,
    0, 0, 0, 1,
  ];
  return `matrix3d(${m.map(f).join(",")})`;
}
