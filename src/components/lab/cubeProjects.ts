/**
 * What the info panel shows for each cube face. Keyed by `CubeFace.id` (see cubeFaces.ts), so the
 * compiler flags a face without content.
 *
 * Texts and links for TRMT, Oceana Core, Provenance and "This site" are taken from the main site's
 * src/data/projects.ts (nextjs-rewrite). Oceana must stay free of client-confidential detail: keep
 * it exactly as worded there, with no links.
 */

import type { FaceId } from "./cubeFaces";

export interface PanelLink {
  label: string;
  href: string;
}

export interface PanelEntry {
  /** Project (or card) name. */
  name: string;
  oneLiner: string;
  /** 2-3 short factual points. */
  highlights: readonly string[];
  /** Chip labels, shown as-is. */
  stack: readonly string[];
  /** External links; empty for private or client work. */
  links: readonly PanelLink[];
}


const trmt: PanelEntry = {
  name: "The Roads More Travelled",
  oneLiner:
    "A dynamic terrain mod for Minecraft: paths you travel often slowly wear into realistic, vanilla-friendly routes.",
  highlights: [
    "~552K downloads across Modrinth and CurseForge; 86 GitHub stars",
    "Maintained across 4 Minecraft versions and Fabric, Forge and NeoForge in parallel branches",
    "Lightweight by design: a sparse, self-cleaning map tracks footsteps; everything is JSON-configurable",
  ],
  stack: ["Java", "Gradle", "Minecraft modding", "GitHub Actions", "JSON", "Claude Code"],
  links: [
    { label: "GitHub", href: "https://github.com/milkucha/trmt" },
    { label: "Modrinth", href: "https://modrinth.com/mod/the-roads-more-travelled" },
    { label: "CurseForge", href: "https://www.curseforge.com/minecraft/mc-mods/the-roads-more-travelled" },
  ],
};

const oceana: PanelEntry = {
  name: "Oceana Core",
  oneLiner:
    "A back-office platform for a multi-region vacation-rental operator: contracts, units, reservations and revenue-share settlements.",
  highlights: [
    "Settlement engine for taxes, fees, commissions and multi-currency revenue-share splits, with derived values kept apart from source data for audit",
    "Reservation ingestion from a property-management system's REST API",
    "Relational data model on PostgreSQL, with JSON/XLSX exports",
  ],
  stack: ["Python", "Django", "PostgreSQL", "JavaScript", "Docker", "REST APIs", "JSON", "Claude Code"],
  links: [],
};

const provenance: PanelEntry = {
  name: "Provenance",
  oneLiner:
    "A proof of concept for a world-building tool: AI agents play the characters and supply the language, but deterministic code handles everything consequential.",
  highlights: [
    "Grows a fictional society from a small authored seed into a drifting record of tales",
    "Agents only see a bounded, randomly-sampled slice of a typed knowledge base, enforced structurally",
    "Model-agnostic and token-lean, with part of the orchestration running locally via Ollama",
  ],
  stack: ["Python", "JavaScript", "JSON", "Ollama", "Claude Code"],
  links: [{ label: "GitHub", href: "https://github.com/milkucha/provenance" }],
};

const site: PanelEntry = {
  name: "This site",
  oneLiner: "This portfolio, which doubles as my vehicle for learning React and TypeScript.",
  highlights: [
    "The cube is plain CSS 3D, driven by quaternions: drag with inertia, spring-snapping to a face",
    "Animates transform and opacity only, and respects reduced-motion settings",
  ],
  stack: ["TypeScript", "React", "Next.js", "Tailwind CSS"],
  links: [{ label: "GitHub", href: "https://github.com/milkucha/portfolio" }],
};

const icarus: PanelEntry = {
  name: "Icarus",
  oneLiner:
    "An arcade game about flying without hubris: flap as far as you can before you fall into the sea.",
  highlights: [
    "Two resources drive each run: stamina for flapping, health lost by flying too close to the sun",
    "Layered parallax sky and a local high-score table",
  ],
  stack: ["Godot", "GDScript", "Aseprite"],
  links: [{ label: "itch.io", href: "https://milkucha.itch.io/icarus" }],
};

const kucha: PanelEntry = {
  name: "Kucha",
  oneLiner:
    "A local-multiplayer 2D arena brawler (in progress): two players plus AI bots, four weapons, destructible terrain.",
  highlights: [
    "Arena bots on navigation agents, with three difficulty settings",
    "Gun, lightning, bomb and earthquake weapons, each with its own damage, knockback and cooldown",
  ],
  stack: ["Godot", "GDScript", "Aseprite"],
  links: [],
};

const design: PanelEntry = {
  name: "Design",
  oneLiner: "Voxel illustration on the side, after three years of UX and product design.",
  highlights: [
    "Voxel city renders: Minecraft builds exported through a Python pipeline into MagicaVoxel",
    "UX and product design at Elim, 2021-2023",
  ],
  stack: ["MagicaVoxel", "Python", "Minecraft"],
  links: [],
};

/** Edit me: which project(s) each face's panel lists, in order. */
export const faceProjects: Record<FaceId, readonly PanelEntry[]> = {
  backend: [oceana],
  frontend: [site],
  ai: [provenance],
  modding: [trmt],
  gamedev: [icarus, kucha],
  design: [design],
};
