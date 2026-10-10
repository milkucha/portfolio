import { techs } from "@/data/projects";
import type { Project } from "@/data/types";

const techLabel = new Map(techs.map((t) => [t.id, t.label]));

/** Quiet details panel for the active project; a single muted hint line when nothing is active. */
export function GraphCard({
  project,
  pinned,
  onClose,
}: {
  project: Project | null;
  pinned: boolean;
  onClose: () => void;
}) {
  if (!project) {
    return (
      <p aria-live="polite" className="text-xs text-primary/60">
        <span className="hidden md:inline">Hover a project to see what it connects to. Drag to rearrange.</span>
        <span className="md:hidden">Tap a project to see what it connects to.</span>
      </p>
    );
  }
  return (
    <div
      aria-live="polite"
      key={project.id}
      className="og-card rounded-lg border border-primary bg-tertiary/90 p-4 text-sm text-primary"
    >
      <h3 className="text-sm font-semibold">{project.name}</h3>
      <p className="mt-1 leading-relaxed text-primary/80">{project.oneLiner}</p>
      <ul className="mt-3 space-y-1 text-xs leading-relaxed text-primary/70">
        {project.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-primary/60">
        {project.stack.map((id) => techLabel.get(id) ?? id).join(" · ")}
      </p>
      <p className="mt-1 text-xs text-primary/60">{project.status}</p>
      {(project.links.length > 0 || pinned) && (
        <p className="mt-3 flex flex-wrap gap-x-3 text-xs">
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
            >
              {l.label} ↗
            </a>
          ))}
          {pinned && (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto text-primary/60 underline-offset-2 hover:text-primary hover:underline"
            >
              Close
            </button>
          )}
        </p>
      )}
    </div>
  );
}
