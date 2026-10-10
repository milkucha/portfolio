/** Which side of the cube a domain sits on. The four "equator" slots are what idle spin shows. */
export type FaceSlot = "front" | "right" | "back" | "left" | "top" | "bottom";

export interface CubeFace {
  id: string;
  /** Domain name, the big line on the face (and the button label). */
  name: string;
  /** Tiny one-line hint under the name. */
  hint: string;
  slot: FaceSlot;
}

/**
 * Edit me. Order here = button order. Each slot must be used exactly once.
 * Domains come from the vault's hub notes; hints are placeholders.
 */
export const cubeFaces: readonly CubeFace[] = [
  { id: "gamedev", name: "Game dev", hint: "Godot games", slot: "front" },
  { id: "web", name: "Web development", hint: "Django backends, this site", slot: "right" },
  { id: "ml", name: "Machine learning / AI", hint: "Constrained AI agents", slot: "back" },
  { id: "modding", name: "Modding", hint: "Minecraft mods, 550K+ downloads", slot: "left" },
  { id: "design", name: "Design", hint: "Layout, type and interfaces", slot: "top" },
  { id: "music", name: "Music production", hint: "Writing and producing tracks", slot: "bottom" },
];
