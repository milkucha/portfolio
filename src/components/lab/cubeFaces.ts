/** Which side of the cube a domain sits on. The four "equator" slots are what idle spin shows. */
export type FaceSlot = "front" | "right" | "back" | "left" | "top" | "bottom";

/** Site palette. */
export const palette = {
  primary: "#020202", // black (ink)
  secondary: "#4c91bf", // blue
  tertiary: "#f7ece1", // cream, page background
  quaternary: "#6d597a", // purple
  quinary: "#b56576", // rose
  senary: "#f4e285", // pastel yellow
  septenary: "#7fb2d6", // light blue
} as const;

export type PaletteColor = (typeof palette)[keyof typeof palette];
/** Text is always black or cream: whichever clears 4.5:1 on the face colour. */
export type FaceInk = typeof palette.primary | typeof palette.tertiary;

export type FaceId = "backend" | "frontend" | "ai" | "gamedev" | "modding" | "design";

export interface CubeFace {
  /** Also the key into faceProjects (cubeProjects.ts). */
  id: FaceId;
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

const { primary: black, tertiary: cream, quaternary: purple, quinary: rose, senary: yellow, septenary: lightBlue } = palette;

/**
 * Edit me. Order here = button order. Each slot must be used exactly once.
 *
 * Opposite faces are front/back, right/left and top/bottom, so: Backend/Modding (purple/rose),
 * Applied AI/Design (black/cream) and Frontend/Game dev (light blue/yellow). Black and cream sit
 * opposite each other, and every pair of adjacent faces differs in colour. (Spin order is a tumble,
 * so slots do not follow the list order.)
 * WCAG contrast of the chosen ink on each fill:
 *   purple + cream 5.37    light blue + black 9.13    rose   + black 5.03
 *   black  + cream 17.82   yellow     + black 15.87   cream  + black 17.82
 */
export const cubeFaces: readonly CubeFace[] = [
  { id: "backend", name: "Backend", hint: "Python · Django · PostgreSQL · Docker", slot: "front", color: purple, ink: cream },
  { id: "frontend", name: "Frontend", hint: "TypeScript · React · Next.js · Tailwind CSS", slot: "bottom", color: lightBlue, ink: black },
  { id: "ai", name: "Applied AI", hint: "Python · Ollama · LLM agents", slot: "right", color: black, ink: cream },
  { id: "modding", name: "Modding", hint: "Java · Gradle · Minecraft", slot: "back", color: rose, ink: black },
  { id: "gamedev", name: "Game dev", hint: "Godot · GDScript · Aseprite", slot: "top", color: yellow, ink: black },
  { id: "design", name: "Design", hint: "Figma · Blender · MagicaVoxel", slot: "left", color: cream, ink: black },
];
