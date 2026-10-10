"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import {
  categoryColors,
  categoryLabels,
  links,
  projectColor,
  projects,
  techs,
} from "@/data/projects";
import type { Project, Tech, TechCategory } from "@/data/types";
import { GraphCard } from "./GraphCard";

type GraphNode =
  | { kind: "project"; id: string; label: string; project: Project; baseR: number }
  | { kind: "tech"; id: string; label: string; tech: Tech; baseR: number };

interface SimNode extends SimulationNodeDatum {
  id: string;
}

type Point = { x: number; y: number };

const TECH_LABEL_GAP = 16;

const fontSizeFor = (kind: GraphNode["kind"], scale: number) =>
  kind === "project" ? Math.max(11, 15 * scale) : Math.max(11, 13 * scale);

/** Rough label width estimate (no DOM measuring needed). */
const labelHalfWidth = (label: string, scale: number) => (label.length * fontSizeFor("tech", scale) * 0.56) / 2;

/** Static graph description derived from the data module. */
function buildNodes(): GraphNode[] {
  const usage = new Map<string, number>();
  for (const l of links) usage.set(l.target, (usage.get(l.target) ?? 0) + 1);
  const used = techs.filter((t) => usage.has(t.id));
  return [
    ...projects.map<GraphNode>((p) => ({
      kind: "project",
      id: p.id,
      label: p.label,
      project: p,
      baseR: p.minor ? 40 : Math.min(56, 44 + p.stack.length * 1.5),
    })),
    ...used.map<GraphNode>((t) => ({
      kind: "tech",
      id: t.id,
      label: t.label,
      tech: t,
      baseR: Math.min(28, 20 + ((usage.get(t.id) ?? 1) - 1) * 4),
    })),
  ];
}

/**
 * Deterministic starting layout (no randomness, so no hydration or run-to-run surprises):
 * projects on a ring around the centre, each tech near the average of the projects using it,
 * nudged outward along a golden-angle spiral so neighbours don't start stacked.
 */
function seedPositions(nodes: GraphNode[], w: number, h: number): Point[] {
  const cx = w / 2;
  const cy = h / 2;
  const projectNodes = nodes.filter((n) => n.kind === "project");
  const projectPos = new Map<string, Point>(
    projectNodes.map((n, i) => {
      const a = (i / projectNodes.length) * Math.PI * 2 - Math.PI / 2;
      return [n.id, { x: cx + Math.cos(a) * w * 0.22, y: cy + Math.sin(a) * h * 0.22 }];
    }),
  );
  let ti = 0;
  return nodes.map((n) => {
    if (n.kind === "project") return projectPos.get(n.id)!;
    const users = links.filter((l) => l.target === n.id).map((l) => projectPos.get(l.source)!);
    const ax = users.reduce((s, p) => s + p.x, 0) / users.length;
    const ay = users.reduce((s, p) => s + p.y, 0) / users.length;
    const a = ti++ * 2.39996;
    const rad = Math.min(w, h) * 0.12;
    return { x: ax + Math.cos(a) * rad, y: ay + Math.sin(a) * rad };
  });
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    mq.addEventListener("change", update);
    const id = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", update);
    };
  }, []);
  return reduced;
}

// The graph's shape is static (derived from the data module), so compute it once.
const graphNodes = buildNodes();
const indexById = new Map(graphNodes.map((n, i) => [n.id, i] as const));
const neighbours = new Map<string, Set<string>>(graphNodes.map((n) => [n.id, new Set([n.id])]));
for (const l of links) {
  neighbours.get(l.source)?.add(l.target);
  neighbours.get(l.target)?.add(l.source);
}

export function ProjectGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<Simulation<SimNode, SimulationLinkDatum<SimNode>> | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const dragRef = useRef<{ id: string; pointerId: number; x0: number; y0: number; moved: boolean } | null>(
    null,
  );

  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [positions, setPositions] = useState<Point[] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Scale node sizes and forces down on narrow screens so the graph fits at phone width.
  const scale = size ? Math.max(0.7, Math.min(1, size.w / 960)) : 1;

  // Measure the container.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Create / reconfigure the simulation whenever the size (or motion preference) changes.
  useEffect(() => {
    if (!size) return;
    const { w, h } = size;
    // On wide screens the details card docks top-right, so centre the graph in the remaining space.
    const cx = w >= 768 ? (w - 330) / 2 : w / 2;
    const radius = (i: number) => graphNodes[i].baseR * scale;

    if (!simRef.current) {
      const seeds = seedPositions(graphNodes, w, h);
      simNodesRef.current = graphNodes.map((n, i) => ({ id: n.id, ...seeds[i] }));
      simRef.current = forceSimulation<SimNode>(simNodesRef.current).stop();
    }
    const sim = simRef.current;
    const nodes = simNodesRef.current;
    const pad = 10 * scale;

    sim
      .force(
        "link",
        forceLink<SimNode, SimulationLinkDatum<SimNode>>(links.map((l) => ({ ...l })))
          .id((d) => d.id)
          .distance((l) => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            return radius(indexById.get(s.id)!) + radius(indexById.get(t.id)!) + 95 * scale;
          })
          .strength(0.5),
      )
      .force("charge", forceManyBody<SimNode>().strength(-1100 * scale * scale))
      .force(
        "collide",
        forceCollide<SimNode>((d, i) => radius(i) + pad + (graphNodes[i].kind === "tech" ? TECH_LABEL_GAP * scale : 0)),
      )
      .force("x", forceX<SimNode>(cx).strength(w < 640 ? 0.09 : 0.045))
      .force("y", forceY<SimNode>(h / 2).strength(w < 640 ? 0.05 : 0.07))
      .alphaDecay(0.035)
      .velocityDecay(0.35);

    // On wide screens the legend is overlaid along the bottom edge.
    const legendSpace = w >= 768 ? 34 : 4;
    const clamp = () => {
      nodes.forEach((n, i) => {
        const r = radius(i);
        const isTech = graphNodes[i].kind === "tech";
        const bottom = isTech ? r + 22 * scale : r;
        // Keep tech labels (drawn under the node) inside the frame too.
        const half = isTech ? Math.max(r, labelHalfWidth(graphNodes[i].label, scale)) : r;
        n.x = Math.max(half + 4, Math.min(w - half - 4, n.x ?? w / 2));
        n.y = Math.max(r + 4, Math.min(h - bottom - legendSpace, n.y ?? h / 2));
      });
    };
    const publish = () => setPositions(nodes.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 })));

    if (reducedMotion) {
      sim.on("tick", null).stop().alpha(1);
      for (let i = 0; i < 300; i++) {
        sim.tick();
        clamp();
      }
      const id = requestAnimationFrame(publish);
      return () => cancelAnimationFrame(id);
    }

    sim.on("tick", () => {
      clamp();
      publish();
    });
    sim.alpha(Math.max(sim.alpha(), 0.6)).restart();
    return () => {
      sim.stop();
    };
  }, [size, scale, reducedMotion]);

  useEffect(() => () => void simRef.current?.stop(), []);

  const active = hovered ?? pinned;
  const lit = active ? neighbours.get(active) : null;

  // ---- interaction -------------------------------------------------------

  const toLocal = (e: PointerEvent<Element>): Point => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onNodePointerDown = (id: string) => (e: PointerEvent<SVGGElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toLocal(e);
    dragRef.current = { id, pointerId: e.pointerId, x0: p.x, y0: p.y, moved: false };
  };

  const onNodePointerMove = (e: PointerEvent<SVGGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !size) return;
    const p = toLocal(e);
    if (!drag.moved && Math.hypot(p.x - drag.x0, p.y - drag.y0) < 4) return;
    const i = indexById.get(drag.id)!;
    const n = simNodesRef.current[i];
    const r = graphNodes[i].baseR * scale;
    const x = Math.max(r, Math.min(size.w - r, p.x));
    const y = Math.max(r, Math.min(size.h - r, p.y));
    const sim = simRef.current;
    if (!drag.moved) {
      drag.moved = true;
      if (sim && !reducedMotion) sim.alphaTarget(0.25).restart();
    }
    n.fx = x;
    n.fy = y;
    if (reducedMotion) {
      n.x = x;
      n.y = y;
      setPositions(simNodesRef.current.map((m) => ({ x: m.x ?? 0, y: m.y ?? 0 })));
    }
  };

  const onNodePointerUp = (e: PointerEvent<SVGGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    const n = simNodesRef.current[indexById.get(drag.id)!];
    if (drag.moved) {
      if (reducedMotion) {
        // Leave it where it was dropped; there's no animation to hand it back to.
        n.x = n.fx ?? n.x;
        n.y = n.fy ?? n.y;
      }
      n.fx = null;
      n.fy = null;
      simRef.current?.alphaTarget(0);
    } else {
      // A tap/click pins the card (the only way to select on touch screens).
      setPinned((cur) => (cur === drag.id ? null : drag.id));
      if (e.pointerType !== "mouse") setHovered(null);
    }
  };

  const onNodeKeyDown = (id: string) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setPinned((cur) => (cur === id ? null : id));
    } else if (e.key === "Escape") {
      setPinned(null);
      (e.currentTarget as SVGGElement).blur();
    }
  };

  const activeNode = active ? graphNodes[indexById.get(active)!] : null;

  return (
    <div className="flex w-full flex-col md:relative">
      <div
        ref={containerRef}
        className="relative h-[min(68svh,560px)] w-full overflow-hidden md:h-[max(520px,calc(100svh-11rem))]"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || (e.target as Element).tagName === "svg") setPinned(null);
        }}
      >
        {size && positions && (
          <svg
            width={size.w}
            height={size.h}
            viewBox={`0 0 ${size.w} ${size.h}`}
            className="absolute inset-0 block select-none"
            aria-label="Interactive graph of projects and the technologies they use"
            role="group"
          >
            <g>
              {links.map((l) => {
                const a = positions[indexById.get(l.source)!];
                const b = positions[indexById.get(l.target)!];
                if (!a || !b) return null;
                const on = !!active && (l.source === active || l.target === active);
                return (
                  <line
                    key={`${l.source}-${l.target}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={on ? "var(--graph-link-active)" : "var(--graph-link)"}
                    strokeWidth={on ? 2 : 1.25}
                    opacity={active && !on ? 0.25 : 1}
                    className="transition-opacity duration-200"
                  />
                );
              })}
            </g>
            <g>
              {graphNodes.map((n, i) => {
                const p = positions[i];
                const r = n.baseR * scale;
                const isActive = active === n.id;
                const dim = !!lit && !lit.has(n.id);
                const fill = n.kind === "project" ? projectColor : categoryColors[n.tech.category];
                const fontSize = fontSizeFor(n.kind, scale);
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x} ${p.y})`}
                    tabIndex={0}
                    role="button"
                    aria-pressed={pinned === n.id}
                    aria-label={
                      n.kind === "project"
                        ? `${n.project.name}: ${n.project.oneLiner}`
                        : `${n.label}, used in ${links.filter((l) => l.target === n.id).length} project(s)`
                    }
                    className="cursor-grab outline-none transition-opacity duration-200 active:cursor-grabbing"
                    style={{ touchAction: "none" }}
                    opacity={dim ? 0.18 : 1}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(n.id)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(null)}
                    onPointerDown={onNodePointerDown(n.id)}
                    onPointerMove={onNodePointerMove}
                    onPointerUp={onNodePointerUp}
                    onPointerCancel={onNodePointerUp}
                    onFocus={() => setHovered(n.id)}
                    onBlur={() => setHovered(null)}
                    onKeyDown={onNodeKeyDown(n.id)}
                  >
                    {isActive && (
                      <circle r={r + 6} fill="none" stroke="var(--color-tertiary)" strokeOpacity={0.8} strokeWidth={2} />
                    )}
                    <circle
                      r={r}
                      fill={fill}
                      fillOpacity={n.kind === "project" ? 1 : 0.92}
                      stroke="var(--graph-bg)"
                      strokeWidth={2}
                    />
                    {n.kind === "project" ? (
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={fontSize}
                        fontWeight={600}
                        fill="var(--color-primary)"
                        className="pointer-events-none"
                      >
                        {n.label}
                      </text>
                    ) : (
                      <text
                        y={r + fontSize + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={fontSize}
                        fill="var(--graph-label)"
                        stroke="var(--graph-bg)"
                        strokeWidth={3}
                        paintOrder="stroke"
                        className="pointer-events-none"
                      >
                        {n.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>
      <Legend />

      <div className="w-full px-4 pt-4 md:absolute md:right-4 md:top-4 md:w-80 md:p-0">
        <GraphCard node={activeNode} pinned={!!pinned && pinned === active} onClose={() => setPinned(null)} />
      </div>
    </div>
  );
}

function Legend() {
  const cats = Array.from(new Set(techs.map((t) => t.category))) as TechCategory[];
  return (
    <ul className="pointer-events-none flex px-4 pt-3 md:absolute md:bottom-3 md:left-4 md:p-0 flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
      <li className="flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-full" style={{ background: projectColor }} />
        Project
      </li>
      {cats.map((c) => (
        <li key={c} className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ background: categoryColors[c] }} />
          {categoryLabels[c]}
        </li>
      ))}
    </ul>
  );
}
