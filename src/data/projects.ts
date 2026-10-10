import type { GraphLink, Project, Tech, TechCategory } from "./types";

// Tech nodes, curated for the graph. A later version may generate this from the vault.
export const techs: Tech[] = [
  { id: "java", label: "Java", category: "language" },
  { id: "python", label: "Python", category: "language" },
  { id: "javascript", label: "JavaScript", category: "language" },
  { id: "typescript", label: "TypeScript", category: "language" },
  { id: "modding", label: "Minecraft modding", category: "framework", note: "Fabric · Forge · NeoForge" },
  { id: "django", label: "Django", category: "framework" },
  { id: "react", label: "React", category: "framework" },
  { id: "nextjs", label: "Next.js", category: "framework" },
  { id: "tailwind", label: "Tailwind CSS", category: "framework" },
  { id: "gradle", label: "Gradle", category: "tool" },
  { id: "gh-actions", label: "GitHub Actions", category: "tool", note: "CI" },
  { id: "postgresql", label: "PostgreSQL", category: "tool" },
  { id: "docker", label: "Docker", category: "tool", note: "Dev container" },
  { id: "claude-code", label: "Claude Code", category: "tool", note: "Working with LLM coding agents" },
  { id: "ollama", label: "Ollama", category: "tool", note: "Local LLMs" },
  { id: "rest", label: "REST APIs", category: "technique" },
  { id: "json", label: "JSON", category: "data-format" },
];

export const projects: Project[] = [
  {
    id: "trmt",
    label: "TRMT",
    name: "The Roads More Travelled",
    oneLiner:
      "A dynamic terrain mod for Minecraft: paths you travel often slowly wear into realistic, vanilla-friendly routes.",
    highlights: [
      "~552K downloads across Modrinth and CurseForge; 86 GitHub stars",
      "Maintained across 4 Minecraft versions and Fabric, Forge and NeoForge in parallel branches",
      "Lightweight by design: a sparse, self-cleaning map tracks footsteps; everything is JSON-configurable",
    ],
    status: "Open source · active, heading to a stable feature-closed state",
    stack: ["java", "gradle", "modding", "gh-actions", "json", "claude-code"],
    links: [
      { label: "GitHub", href: "https://github.com/milkucha/trmt" },
      { label: "Modrinth", href: "https://modrinth.com/mod/the-roads-more-travelled" },
      {
        label: "CurseForge",
        href: "https://www.curseforge.com/minecraft/mc-mods/the-roads-more-travelled",
      },
    ],
  },
  {
    id: "oceana",
    label: "Oceana Core",
    name: "Oceana Core",
    oneLiner:
      "A back-office platform for a multi-region vacation-rental operator: contracts, units, reservations and revenue-share settlements.",
    highlights: [
      "Settlement engine for taxes, fees, commissions and multi-currency revenue-share splits, with derived values kept apart from source data for audit",
      "Reservation ingestion from a property-management system's REST API",
      "Relational data model on PostgreSQL, with JSON/XLSX exports",
    ],
    status: "Freelance client work · in production, active development",
    stack: ["python", "django", "postgresql", "javascript", "docker", "rest", "json", "claude-code"],
    links: [],
  },
  {
    id: "provenance",
    label: "Provenance",
    name: "Provenance",
    oneLiner:
      "A proof of concept for a world-building tool: AI agents play the characters and supply the language, but deterministic code handles everything consequential.",
    highlights: [
      "Grows a fictional society from a small authored seed into a drifting record of tales",
      "Agents only see a bounded, randomly-sampled slice of a typed knowledge base, enforced structurally",
      "Model-agnostic and token-lean, with part of the orchestration running locally via Ollama",
    ],
    status: "Solo project · active, proof of concept in progress",
    stack: ["python", "javascript", "json", "claude-code", "ollama"],
    links: [{ label: "GitHub", href: "https://github.com/milkucha/provenance" }],
  },
  {
    id: "site",
    label: "This site",
    name: "This site",
    oneLiner: "This portfolio, which doubles as my vehicle for learning React and TypeScript.",
    highlights: [
      "The graph is modelled on my Obsidian vault's graph view",
      "Rendered as SVG by React, laid out with d3-force",
    ],
    status: "v1 · in progress",
    stack: ["typescript", "react", "nextjs", "tailwind"],
    links: [{ label: "GitHub", href: "https://github.com/milkucha/portfolio" }],
    minor: true,
  },
];

export const links: GraphLink[] = projects.flatMap((p) =>
  p.stack.map((t) => ({ source: p.id, target: t })),
);

export const categoryLabels: Record<TechCategory, string> = {
  language: "Language",
  framework: "Framework",
  tool: "Tool",
  "data-format": "Data format",
  technique: "Technique",
};

/**
 * Node colors reference the CSS tokens in src/app/globals.css (old-site palette),
 * so they can be tweaked in one place. Tech categories are shades of the
 * secondary blue, blending toward the quaternary purple.
 */
export const categoryColors: Record<TechCategory, string> = {
  language: "var(--color-cat-language)",
  framework: "var(--color-cat-framework)",
  tool: "var(--color-cat-tool)",
  "data-format": "var(--color-cat-data-format)",
  technique: "var(--color-cat-technique)",
};

export const projectColor = "var(--color-quinary)";

export function projectsUsing(techId: string): Project[] {
  return projects.filter((p) => p.stack.includes(techId));
}
