"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
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

/*
 * Constellation rendering. Performance notes (see .claude/skills/fixing-motion-performance):
 * - Stars are HTML elements over a hairline SVG. Twinkle is a CSS keyframe on opacity/transform
 *   of the star element only, so Chrome runs it on the compositor; the glow is a static
 *   radial-gradient painted once, never a filter.
 * - Positions are written straight to the DOM from the d3 tick (no React render per frame), and
 *   the simulation stops at alphaMin. It only runs while the graph is on screen and the tab is
 *   visible; the twinkle is paused (animation-play-state) otherwise.
 * - prefers-reduced-motion: layout is computed synchronously and nothing animates.
 */

type GraphNode =
  | { kind: "project"; id: string; label: string; project: Project; baseR: number; usage: number }
  | { kind: "tech"; id: string; label: string; tech: Tech; baseR: number; usage: number };

interface SimNode extends SimulationNodeDatum {
  id: string;
}

type Point = { x: number; y: number };

const TECH_LABEL_GAP = 16;

/** md+ only: the details card docks top-right (16px inset + 320px wide) plus a clear gap before it. */
const CARD_RESERVE = 16 + 320 + 32;

/** Width the stars lay out in: the full frame on phones, the frame minus the card on md+. */
const freeWidthFor = (w: number) => (w >= 768 ? w - CARD_RESERVE : w);

const fontSizeFor = (kind: GraphNode["kind"], scale: number) =>
  kind === "project" ? Math.max(12, 14 * scale) : Math.max(11, 12 * scale);

/** Rough label width estimate (no DOM measuring needed). */
const labelHalfWidth = (n: GraphNode, scale: number) =>
  (n.label.length * fontSizeFor(n.kind, scale) * (n.kind === "project" ? 0.6 : 0.56)) / 2;

/** Visual star geometry, in px at scale 1: core radius and glow radius. */
const starFor = (n: GraphNode) =>
  n.kind === "project"
    ? { core: n.project.minor ? 3.5 : 4.5, glow: n.project.minor ? 24 : 32 }
    : { core: 2 + Math.min(3, n.usage) * 0.45, glow: 12 + Math.min(3, n.usage) * 3 };

/** Hit target radius: a project is >= 40px across, a tech >= 30px. */
const hitRFor = (n: GraphNode, scale: number) =>
  n.kind === "project" ? Math.max(20, 24 * scale) : Math.max(15, 17 * scale);

/** Distance from star centre to the top of its label. */
const labelOffsetFor = (n: GraphNode, scale: number) => (starFor(n).core + 9) * Math.max(scale, 0.8);

/** Small deterministic hash so each star gets its own, stable twinkle timing. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

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
      usage: p.stack.length,
    })),
    ...used.map<GraphNode>((t) => ({
      kind: "tech",
      id: t.id,
      label: t.label,
      tech: t,
      baseR: Math.min(28, 20 + ((usage.get(t.id) ?? 1) - 1) * 4),
      usage: usage.get(t.id) ?? 1,
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
const linkEnds = links.map((l) => [indexById.get(l.source)!, indexById.get(l.target)!] as const);
const neighbours = new Map<string, Set<string>>(graphNodes.map((n) => [n.id, new Set([n.id])]));
for (const l of links) {
  neighbours.get(l.source)?.add(l.target);
  neighbours.get(l.target)?.add(l.source);
}

/** Per-star CSS: geometry plus a desynchronised twinkle (tech stars only; projects hold steady). */
const starStyles = graphNodes.map((n) => {
  const { core, glow } = starFor(n);
  const color = n.kind === "project" ? projectColor : categoryColors[n.tech.category];
  const h = hash(n.id);
  const duration = 3200 + (h % 3200); // 3.2s to 6.4s, so no two stars share a period
  const style: CSSProperties = {
    ["--star-color" as string]: color,
    ["--core" as string]: `${core * 2}px`,
    ["--glow" as string]: `${glow * 2}px`,
  };
  if (n.kind === "tech") {
    style.animationDuration = `${duration}ms`;
    style.animationDelay = `-${(h >>> 8) % duration}ms`; // negative: start mid-cycle, already out of phase
  }
  return style;
});

export function ProjectGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<Simulation<SimNode, SimulationLinkDatum<SimNode>> | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const nodeEls = useRef<(HTMLDivElement | null)[]>([]);
  const lineEls = useRef<(SVGLineElement | null)[]>([]);
  const litEls = useRef<(SVGLineElement | null)[]>([]);
  const visibleRef = useRef(false);
  const dragRef = useRef<{ id: string; pointerId: number; x0: number; y0: number; moved: boolean } | null>(
    null,
  );

  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [paused, setPaused] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  // Scale node sizes and forces to the space the stars actually get (the frame minus the docked
  // card on md+), so the layout fits that area with room to spare instead of packing its edges.
  const scale = size ? Math.max(0.7, Math.min(1, freeWidthFor(size.w) / 960)) : 1;

  /** Write current simulation positions straight to the DOM (no React render). */
  const applyPositionsRef = useRef(() => {});
  useLayoutEffect(() => {
    applyPositionsRef.current = () => {
      const nodes = simNodesRef.current;
      if (!nodes.length) return;
      for (let i = 0; i < nodes.length; i++) {
        const el = nodeEls.current[i];
        if (el) el.style.transform = `translate(${nodes[i].x ?? 0}px, ${nodes[i].y ?? 0}px) translate(-50%, -50%)`;
      }
      for (let li = 0; li < linkEnds.length; li++) {
        const [s, t] = linkEnds[li];
        const a = nodes[s];
        const b = nodes[t];
        const base = lineEls.current[li];
        if (base) setLine(base, a, b);
        const lit = litEls.current[li];
        // Lit lines draw outward from the active star, so reverse them when it's the target.
        if (lit) {
          if (lit.hasAttribute("data-rev")) setLine(lit, b, a);
          else setLine(lit, a, b);
        }
      }
    };
  });
  // After every render (hover, pin, resize), re-apply positions so React never owns them.
  useLayoutEffect(() => applyPositionsRef.current());

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
  // Layout effect, so the first positions land before the first paint.
  useLayoutEffect(() => {
    if (!size) return;
    const { w, h } = size;
    // On wide screens the details card docks top-right, so centre the graph in the remaining space.
    const freeW = freeWidthFor(w);
    const cx = freeW / 2;
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
        forceCollide<SimNode>((d, i) => {
          const g = graphNodes[i];
          const r = radius(i) + pad + (g.kind === "tech" ? TECH_LABEL_GAP * scale : 0);
          // Long labels need more room than the star, or neighbouring labels overlap on phones.
          return Math.max(r, labelHalfWidth(g, scale) + pad);
        }),
      )
      .force("x", forceX<SimNode>(cx).strength(w < 640 ? 0.09 : 0.045))
      .force("y", forceY<SimNode>(h / 2).strength(w < 640 ? 0.05 : 0.07))
      // Slow, floaty settle: gentle cooling and heavy damping, so stars glide in rather than jitter.
      .alphaDecay(0.016)
      .alphaMin(0.004)
      .velocityDecay(0.55);

    // On wide screens the legend is overlaid along the bottom edge and the card docks top-right,
    // so keep stars out from under both.
    const legendSpace = w >= 768 ? 34 : 4;
    const right = freeW;
    // Soft margin: inside this band a star is eased back toward the middle, so the layout settles
    // with breathing room at the edges instead of a column of stars pressed flat against a wall.
    // The hard clamp below is only a backstop. Phones keep the old tight fit (no soft margin).
    const margin = w >= 768 ? 40 * scale : 0;
    const extentFor = (i: number) => {
      const g = graphNodes[i];
      const r = Math.max(starFor(g).glow * 0.5, hitRFor(g, scale));
      return { r, half: Math.max(r, labelHalfWidth(g, scale)), bottom: labelOffsetFor(g, scale) + fontSizeFor(g.kind, scale) + 4 };
    };
    const softEdges = (alpha: number) => {
      if (!margin) return;
      const k = Math.min(0.8, 3 * alpha);
      nodes.forEach((n, i) => {
        if (n.fx != null) return;
        const { r, half, bottom } = extentFor(i);
        const x = n.x ?? 0;
        const y = n.y ?? 0;
        const minX = half + margin;
        const maxX = right - half - margin;
        const minY = r + margin * 0.5;
        const maxY = h - bottom - legendSpace - margin * 0.5;
        if (x < minX) n.vx = (n.vx ?? 0) + (minX - x) * k;
        else if (x > maxX) n.vx = (n.vx ?? 0) + (maxX - x) * k;
        if (y < minY) n.vy = (n.vy ?? 0) + (minY - y) * k;
        else if (y > maxY) n.vy = (n.vy ?? 0) + (maxY - y) * k;
      });
    };
    sim.force("edges", softEdges);
    const clamp = () => {
      nodes.forEach((n, i) => {
        // Keep labels (drawn under the star) inside the frame too.
        const { r, half, bottom } = extentFor(i);
        n.x = Math.max(half + 4, Math.min(right - half - 4, n.x ?? w / 2));
        n.y = Math.max(r + 4, Math.min(h - bottom - legendSpace, n.y ?? h / 2));
      });
    };

    if (reducedMotion) {
      sim.on("tick", null).stop().alpha(1);
      for (let i = 0; i < 300; i++) {
        sim.tick();
        clamp();
      }
      applyPositionsRef.current();
      return;
    }

    sim.on("tick", () => {
      clamp();
      applyPositionsRef.current();
    });
    clamp();
    applyPositionsRef.current();
    sim.alpha(Math.max(sim.alpha(), 0.6));
    // Only run while on screen; the visibility effect below starts it otherwise.
    if (visibleRef.current) sim.restart();
    return () => {
      sim.stop();
    };
  }, [size, scale, reducedMotion]);

  // Pause everything while the graph is off-screen or the tab is hidden.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      const vis = inView && document.visibilityState === "visible";
      visibleRef.current = vis;
      setPaused(!vis);
      const sim = simRef.current;
      if (!sim || reducedMotion) return;
      if (!vis) sim.stop();
      else if (sim.alpha() > sim.alphaMin()) sim.restart();
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [reducedMotion]);

  useEffect(() => () => void simRef.current?.stop(), []);

  const active = hovered ?? pinned;
  const lit = active ? neighbours.get(active) : null;

  // ---- interaction -------------------------------------------------------

  const toLocal = (e: PointerEvent<Element>): Point => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onNodePointerDown = (id: string) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toLocal(e);
    dragRef.current = { id, pointerId: e.pointerId, x0: p.x, y0: p.y, moved: false };
  };

  const onNodePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !size) return;
    const p = toLocal(e);
    if (!drag.moved && Math.hypot(p.x - drag.x0, p.y - drag.y0) < 4) return;
    const i = indexById.get(drag.id)!;
    const n = simNodesRef.current[i];
    const r = hitRFor(graphNodes[i], scale);
    const x = Math.max(r, Math.min(size.w - r, p.x));
    const y = Math.max(r, Math.min(size.h - r, p.y));
    const sim = simRef.current;
    if (!drag.moved) {
      drag.moved = true;
      if (sim && !reducedMotion) sim.alphaTarget(0.2).restart();
    }
    n.fx = x;
    n.fy = y;
    if (reducedMotion) {
      n.x = x;
      n.y = y;
      applyPositionsRef.current();
    }
  };

  const onNodePointerUp = (e: PointerEvent<HTMLDivElement>) => {
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

  const onNodeKeyDown = (id: string) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setPinned((cur) => (cur === id ? null : id));
    } else if (e.key === "Escape") {
      setPinned(null);
      e.currentTarget.blur();
    }
  };

  const activeNode = active ? graphNodes[indexById.get(active)!] : null;

  return (
    <div className="flex w-full flex-col md:relative">
      <div
        ref={containerRef}
        className="cst relative h-[min(68svh,560px)] w-full overflow-hidden md:h-[max(520px,calc(100svh-11rem))]"
        data-paused={paused || undefined}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || (e.target as Element).tagName === "svg") setPinned(null);
        }}
      >
        {size && (
          <>
            <svg
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
              className="absolute inset-0 block select-none"
              aria-hidden="true"
            >
              <g className="cst-links" data-dim={active ? "" : undefined}>
                {links.map((l, li) => (
                  <line
                    key={`${l.source}-${l.target}`}
                    ref={(el) => {
                      lineEls.current[li] = el;
                    }}
                  />
                ))}
              </g>
              {active && (
                // Keyed by the active node, so switching stars replays the draw-in.
                <g key={active}>
                  {links.map((l, li) =>
                    l.source === active || l.target === active ? (
                      <line
                        key={`${l.source}-${l.target}`}
                        className="cst-link-lit"
                        pathLength={1}
                        data-rev={l.target === active ? "" : undefined}
                        ref={(el) => {
                          litEls.current[li] = el;
                        }}
                      />
                    ) : null,
                  )}
                </g>
              )}
            </svg>
            <div
              role="group"
              aria-label="Interactive graph of projects and the technologies they use"
              className="pointer-events-none absolute inset-0 select-none"
            >
              {graphNodes.map((n, i) => {
                const hit = hitRFor(n, scale);
                const fontSize = fontSizeFor(n.kind, scale);
                return (
                  <div
                    key={n.id}
                    ref={(el) => {
                      nodeEls.current[i] = el;
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={pinned === n.id}
                    aria-label={
                      n.kind === "project"
                        ? `${n.project.name}: ${n.project.oneLiner}`
                        : `${n.label}, used in ${n.usage} project(s)`
                    }
                    className="cst-node pointer-events-auto absolute left-0 top-0 cursor-grab outline-none active:cursor-grabbing"
                    data-kind={n.kind}
                    data-active={active === n.id || undefined}
                    data-dim={(!!lit && !lit.has(n.id)) || undefined}
                    style={{ width: hit * 2, height: hit * 2, touchAction: "none" }}
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
                    <span className="cst-star" style={starStyles[i]}>
                      <span className="cst-glow" />
                      <span className="cst-core" />
                    </span>
                    <span className="cst-ring" />
                    <span
                      className="cst-label"
                      style={{ top: `calc(50% + ${labelOffsetFor(n, scale)}px)`, fontSize }}
                    >
                      {n.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Legend />

      <div className="w-full px-4 pt-4 md:absolute md:right-4 md:top-4 md:w-80 md:p-0">
        <GraphCard node={activeNode} pinned={!!pinned && pinned === active} onClose={() => setPinned(null)} />
      </div>
    </div>
  );
}

function setLine(el: SVGLineElement, a: SimNode, b: SimNode) {
  el.setAttribute("x1", String(a.x ?? 0));
  el.setAttribute("y1", String(a.y ?? 0));
  el.setAttribute("x2", String(b.x ?? 0));
  el.setAttribute("y2", String(b.y ?? 0));
}

function Legend() {
  const cats = Array.from(new Set(techs.map((t) => t.category))) as TechCategory[];
  return (
    <ul className="pointer-events-none flex px-4 pt-3 md:absolute md:bottom-3 md:left-4 md:p-0 flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
      <li className="flex items-center gap-1.5">
        <span className="cst-legend-dot" style={{ ["--star-color" as string]: projectColor }} />
        Project
      </li>
      {cats.map((c) => (
        <li key={c} className="flex items-center gap-1.5">
          <span className="cst-legend-dot" style={{ ["--star-color" as string]: categoryColors[c] }} />
          {categoryLabels[c]}
        </li>
      ))}
    </ul>
  );
}
