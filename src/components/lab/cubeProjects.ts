/**
 * What the info panel shows for each cube face. Keyed by `CubeFace.id` (see cubeFaces.ts), so the
 * compiler flags a face without content.
 *
 * Texts and links for TRMT, Oceana Core, Provenance and "This site" are taken from the main site's
 * src/data/projects.ts (nextjs-rewrite). Oceana must stay free of client-confidential detail: keep
 * it as worded there; its only link is the public website (web icon), added on request.
 */

import type { FaceId } from "./cubeFaces";
import type { LinkIconName } from "./linkIcons";

export interface PanelLink {
  /** Accessible name (also the tooltip); the button itself shows only the icon. */
  label: string;
  href: string;
  icon: LinkIconName;
}

export interface PanelEntry {
  /** Project (or card) name. */
  name: string;
  oneLiner: string;
  /** Up to 3 short factual points for strong projects; fewer (often none) for weaker ones. */
  highlights: readonly string[];
  /** Optional thumbnail shown at the top of the card. */
  image?: { src: string; alt: string };
  /** Chip labels, shown as-is. */
  stack: readonly string[];
  /** AI coding tools used on the project (shown apart from the stack); empty if none. */
  workflow: readonly string[];
  /** External links; empty for private or client work. */
  links: readonly PanelLink[];
}


const trmt: PanelEntry = {
  name: "The Roads More Travelled",
  oneLiner: "Dynamic terrain mod for Minecraft that erodes often-travelled routes turning them into realistic, yet vanilla-friendly worn paths.",
  highlights: [
    "550K+ downloads across Modrinth and CurseForge, 86 GitHub stars",
    "Maintained across 4 Minecraft versions and 3 mod loaders (Fabric, Forge, NeoForge)",
  ],
  stack: ["Java", "Gradle", "Minecraft"],
  workflow: ["Claude Code"],
  links: [
    { label: "GitHub", href: "https://github.com/milkucha/trmt", icon: "github" },
    { label: "Modrinth", href: "https://modrinth.com/mod/the-roads-more-travelled", icon: "modrinth" },
    {
      label: "CurseForge",
      href: "https://www.curseforge.com/minecraft/mc-mods/the-roads-more-travelled",
      icon: "curseforge",
    },
    { label: "YouTube", href: "https://www.youtube.com/watch?v=OvsNVaFiK1Y", icon: "youtube" },
  ],
};

const oceana: PanelEntry = {
  name: "Oceana Core",
  oneLiner: "Production backend for a multi-region vacation-rental operator.",
  highlights: [
    "Settlement engine for taxes, fees, commissions and multi-currency revenue-share splits",
    "Reservation ingestion from a property-management system's REST API",
  ],
  stack: ["Python", "TypeScript", "Django", "PostgreSQL", "Docker"],
  workflow: ["Claude Code", "OpenCode"],
  links: [{ label: "Website", href: "https://www.oceanasuites.com", icon: "web" }],
};

const provenance: PanelEntry = {
  name: "Provenance",
  oneLiner: "World-building tool that grows a fictional society from an authored seed that drifts based on typed knowledge.",
  highlights: [
    "Multiple-pass simulation on 50+ characters, seeded and reproducible",
    "Measurement scripts for drift, divergence and token usage",
    "Model-agnostic",
  ],
  stack: ["Python", "Ollama", "LLM agents"],
  workflow: ["Claude Code", "OpenCode"],
  links: [{ label: "GitHub", href: "https://github.com/milkucha/provenance", icon: "github" }],
};

const site: PanelEntry = {
  name: "Portfolio",
  oneLiner: "CSS 3D cube driven by quaternions.",
  highlights: [],
  stack: ["TypeScript", "React", "Next.js", "Tailwind CSS"],
  workflow: ["Claude Code"],
  links: [{ label: "GitHub", href: "https://github.com/milkucha/portfolio", icon: "github" }],
};

const icarus: PanelEntry = {
  name: "Icarus",
  oneLiner: "Arcade game about flying without hubris: fly as far as you can before you fall into the sea.",
  highlights: [],
  stack: ["Godot", "GDScript", "Aseprite"],
  workflow: [],
  links: [{ label: "itch.io", href: "https://milkucha.itch.io/icarus", icon: "itch" }],
};

const kucha: PanelEntry = {
  name: "Kucha",
  oneLiner:
    "2D pixel art arena brawler: two players plus AI bots, four weapons, destructible terrain. Multiplayer in progress.",
  highlights: [],
  stack: ["Godot", "GDScript", "Aseprite"],
  workflow: [],
  links: [],
};

const design: PanelEntry = {
  name: "Arranca Cover",
  oneLiner: "Voxel art isometric city. Hand authored model, Minecraft to Blender pipeline.",
  highlights: [],
  stack: ["Blender", "MagicaVoxel", "Python"],
  workflow: [],
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
