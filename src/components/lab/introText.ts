/** Bio copy for the lab page (the main site keeps site.bio). */
export const INTRO_LINES = [
  "Full-stack developer based in Berlin.",
  "Python, TypeScript, Java, agentic tools.",
  "Open source as milkucha.",
  "Minecraft mod maintainer, 550K+ downloads.",
] as const;

/** The handle, set in italic (and the accent colour) wherever it appears in a line. */
export const INTRO_HANDLE = "milkucha";

/** Tokens set in the accent colour wherever they appear in a line (the handle also gets italic). */
export const INTRO_ACCENTS = [INTRO_HANDLE, "550K+"] as const;
