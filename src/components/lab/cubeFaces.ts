/** Which side of the cube a domain sits on. The four "equator" slots are what idle spin shows. */
export type FaceSlot = "front" | "right" | "back" | "left" | "top" | "bottom";

/** Site palette. */
export const palette = {
  primary: "#020202", // black (ink)
  secondary: "#4c91bf", // blue
  tertiary: "#f7ece1", // cream, page background
  quaternary: "#6d597a", // purple
  quinary: "#b56576", // rose
} as const;

export type PaletteColor = (typeof palette)[keyof typeof palette];
/** Text is always black or cream: whichever clears 4.5:1 on the face colour. */
export type FaceInk = typeof palette.primary | typeof palette.tertiary;

export interface CubeFace {
  id: string;
  /** Domain name, the big line on the face (and the button label). */
  name: string;
  /** Tiny one-line hint under the name. */
  hint: string;
  slot: FaceSlot;
  /** Face fill in "color" mode (ghost mode uses a light tint of it). */
  color: PaletteColor;
  /** Text colour on the opaque fill. */
  ink: FaceInk;
}

const { primary: black, secondary: blue, tertiary: cream, quaternary: purple, quinary: rose } = palette;

/**
 * Edit me. Order here = button order. Each slot must be used exactly once.
 * The equator (front/right/back/left) holds the four software domains idle spin cycles through.
 *
 * Colours: cream is used twice, on the opposite top/bottom "lids", so every pair of adjacent faces
 * differs and the idle spin (front/right/back/left) shows the four saturated colours.
 * WCAG contrast of the chosen ink on each fill (the other ink in brackets):
 *   blue   + black 6.04 (cream 2.95)    purple + cream 5.37 (black 3.32)
 *   rose   + black 5.03 (cream 3.55)    black  + cream 17.82
 *   cream  + black 17.82
 */
export const cubeFaces: readonly CubeFace[] = [
  { id: "backend", name: "Backend", hint: "Django · PostgreSQL · REST APIs", slot: "front", color: blue, ink: black },
  { id: "frontend", name: "Frontend", hint: "React · TypeScript · this site", slot: "right", color: purple, ink: cream },
  { id: "ai", name: "Applied AI", hint: "Constrained AI agents · local LLMs", slot: "back", color: rose, ink: black },
  { id: "gamedev", name: "Game dev", hint: "Godot games", slot: "left", color: black, ink: cream },
  { id: "modding", name: "Modding", hint: "Minecraft mods · 550K+ downloads", slot: "bottom", color: cream, ink: black },
  { id: "design", name: "Design", hint: "Voxel illustration · UX at Elim", slot: "top", color: cream, ink: black },
];
