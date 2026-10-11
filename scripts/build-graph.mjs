#!/usr/bin/env node
/**
 * Builds src/data/graph.json from the Obsidian vault.
 *
 *   node scripts/build-graph.mjs [vaultPath]
 *
 * Default vault path: ~/vault/everything (the repo lives at ~/portfolio, outside the vault).
 * Runs locally only; the generated JSON is committed because Vercel can't see the vault.
 *
 * PRIVACY: the output is published. It holds only note titles, category tags and links, never
 * note content. Nodes listed in EXCLUDE are dropped (and so are their links).
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vault = resolve(process.argv[2] ?? join(homedir(), "vault", "everything"));
const outFile = join(repoRoot, "src", "data", "graph.json");

/** Featured project notes (vault-relative) -> id used by src/data/projects.ts, and display label. */
const SEEDS = [
  { path: "projects/trmt/TRMT.md", id: "trmt", label: "TRMT" },
  { path: "projects/oceana-core/OCEANA-CORE.md", id: "oceana", label: "Oceana Core" },
  { path: "projects/provenance/PROVENANCE.md", id: "provenance", label: "Provenance" },
  // The site's own vault note exists, so it joins as a (minor) project node.
  { path: "projects/portfolio/PORTFOLIO.md", id: "site", label: "This site" },
];

/** Concept notes never published (client/vendor names, people, personal). Basenames, lower-case. */
const EXCLUDE = new Set([]);

/** Above this many nodes, second-degree concepts must have >= 2 links into the set. */
const SOFT_CAP = 150;

const TAGS = ["language", "framework", "tool", "technique", "data-format", "activities"];

if (!existsSync(join(vault, "concepts"))) {
  console.error(`No concepts/ folder under ${vault}. Pass the vault path as the first argument.`);
  process.exit(1);
}

// ---- index the notes Obsidian could resolve a link to ----------------------------------------

/** Every .md file in the vault, so links resolve exactly like Obsidian (then we filter nodes). */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".md")) out.push(relative(vault, p).split("\\").join("/"));
  }
  return out;
}
const allNotes = walk(vault);
const byBasename = new Map(); // lower-case basename -> [paths]
const byPath = new Map(); // lower-case path without .md -> path
for (const p of allNotes) {
  const base = basename(p, ".md").toLowerCase();
  if (!byBasename.has(base)) byBasename.set(base, []);
  byBasename.get(base).push(p);
  byPath.set(p.slice(0, -3).toLowerCase(), p);
}

/** Resolve a wikilink target like Obsidian: path match first, then shortest-path basename match. */
function resolveLink(raw) {
  let t = raw.split("|")[0].split("#")[0].split("^")[0].trim();
  if (!t) return null;
  t = t.replace(/\.md$/i, "").replace(/\\/g, "/").toLowerCase();
  if (byPath.has(t)) return byPath.get(t);
  if (t.includes("/")) {
    // Partial path, e.g. [[trmt/TRMT]].
    const hit = allNotes.find((p) => p.slice(0, -3).toLowerCase().endsWith("/" + t));
    if (hit) return hit;
  }
  const cands = byBasename.get(t.split("/").pop());
  if (!cands) return null;
  return [...cands].sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b))[0];
}

const isConcept = (p) => /^concepts\/[^/]+\.md$/.test(p);
const seedByPath = new Map(SEEDS.map((s) => [s.path, s]));
const allowed = (p) =>
  !!p && (seedByPath.has(p) || isConcept(p)) && !EXCLUDE.has(basename(p, ".md").toLowerCase());

const cache = new Map();
function read(p) {
  if (!cache.has(p)) cache.set(p, readFileSync(join(vault, p), "utf8"));
  return cache.get(p);
}

/** Outgoing resolved links of a note (fenced code is ignored, as in Obsidian). */
function linksOf(p) {
  const text = read(p).replace(/```[\s\S]*?```/g, "");
  const out = new Set();
  for (const m of text.matchAll(/!?\[\[([^\]\n]+)\]\]/g)) {
    const target = resolveLink(m[1]);
    if (target && target !== p) out.add(target);
  }
  return out;
}

/** Category tag: the first known #tag in the note's first few non-empty lines. */
function tagOf(p) {
  const lines = read(p).replace(/^---[\s\S]*?\n---\n/, "").split("\n").filter((l) => l.trim()).slice(0, 4);
  for (const l of lines) {
    for (const m of l.matchAll(/#([a-z-]+)/g)) if (TAGS.includes(m[1])) return m[1];
  }
  return null;
}

// ---- build the node set ---------------------------------------------------------------------

for (const s of SEEDS) if (!existsSync(join(vault, s.path))) throw new Error(`Missing seed ${s.path}`);

const first = new Set();
for (const s of SEEDS) for (const t of linksOf(s.path)) if (allowed(t) && isConcept(t)) first.add(t);

const secondCandidates = new Map(); // path -> number of links into (seeds + first)
const core = new Set([...SEEDS.map((s) => s.path), ...first]);
for (const c of first) {
  for (const t of linksOf(c)) {
    if (!allowed(t) || core.has(t) || !isConcept(t)) continue;
    secondCandidates.set(t, 0);
  }
}
// Count connections (either direction) between each candidate and the core set.
for (const cand of secondCandidates.keys()) {
  let n = 0;
  const out = linksOf(cand);
  for (const c of core) if (out.has(c) || linksOf(c).has(cand)) n++;
  secondCandidates.set(cand, n);
}
let second = [...secondCandidates.keys()];
let capped = false;
if (core.size + second.length > SOFT_CAP) {
  second = second.filter((p) => secondCandidates.get(p) >= 2);
  capped = true;
}

const nodePaths = [...SEEDS.map((s) => s.path), ...[...first].sort(), ...second.sort()];
const inSet = new Set(nodePaths);

// Undirected, de-duplicated links among all nodes (Obsidian draws links and backlinks alike).
const edgeKeys = new Set();
const links = [];
for (const p of nodePaths) {
  for (const t of linksOf(p)) {
    if (!inSet.has(t)) continue;
    const [a, b] = [p, t].sort();
    const key = `${a}\u0000${b}`;
    if (edgeKeys.has(key)) continue;
    edgeKeys.add(key);
    links.push([a, b]);
  }
}

const idOf = (p) =>
  seedByPath.get(p)?.id ??
  basename(p, ".md").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const degree = new Map(nodePaths.map((p) => [p, 0]));
for (const [a, b] of links) {
  degree.set(a, degree.get(a) + 1);
  degree.set(b, degree.get(b) + 1);
}

const firstSet = new Set(first);
const nodes = nodePaths.map((p) => {
  const seed = seedByPath.get(p);
  const tag = seed ? null : tagOf(p);
  return {
    id: idOf(p),
    label: seed?.label ?? basename(p, ".md"),
    kind: seed ? "project" : tag === "activities" ? "hub" : "concept",
    tag,
    ring: seed ? 0 : firstSet.has(p) ? 1 : 2,
    degree: degree.get(p),
  };
});
const ids = new Set();
for (const n of nodes) {
  if (ids.has(n.id)) throw new Error(`Duplicate node id ${n.id}`);
  ids.add(n.id);
}

const graph = {
  nodes,
  links: links.map(([a, b]) => ({ source: idOf(a), target: idOf(b) })),
};
writeFileSync(outFile, JSON.stringify(graph, null, 1) + "\n");

console.log(
  `graph.json: ${nodes.length} nodes (${SEEDS.length} projects, ${first.size} first-degree, ` +
    `${second.length} second-degree of ${secondCandidates.size} candidates${capped ? ", capped" : ""}), ` +
    `${links.length} links`,
);
