@AGENTS.md

# Portfolio — camiloalvarez.dev

Personal portfolio rebuilt in Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind v4,
d3-force. Hosted on Vercel from github.com/milkucha/portfolio. Planning notes, roadmap and status
live in the Obsidian vault at `~/vault/everything/projects/portfolio/PORTFOLIO.md` — this repo is
the code only.

## Branches

- `main` — the **old** HTML/CSS site, still live on GitHub Pages at camiloalvarez.dev. Vercel's
  production branch. **Don't touch it until cut-over.**
- `nextjs-rewrite` — the new one-page site (intro, projects graph, contact).
- `proto/cube` — CSS 3D skills cube at `/lab/cube` (`src/components/lab/`). Preferred direction.
  View/spin angles are constants at the top of `SkillsCube.tsx`.
- `graph/obsidian` — projects graph built from the real vault graph: `npm run graph [vaultPath]`
  (default `~/vault/everything`) regenerates `src/data/graph.json`, which is committed because
  Vercel can't see the vault.

Every non-`main` branch gets a Vercel preview URL on push.

Cut-over order (else the domain 404s): add the domain in Vercel → repoint DNS → disable GitHub
Pages → merge to `main`.

## Environment quirks (WSL)

- Node 24 via nvm (`.nvmrc`), not on PATH in non-interactive shells:
  `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"`.
- No global git identity; commit with
  `GIT_AUTHOR_NAME=milkucha GIT_AUTHOR_EMAIL=milkucha@disroot.org GIT_COMMITTER_NAME=milkucha GIT_COMMITTER_EMAIL=milkucha@disroot.org`.
- `.module.css` files don't work with the scaffold's Tailwind Turbopack rule — use Tailwind
  classes or plain, prefixed global CSS.
- Playwright's Chromium lacks libraries in WSL; for screenshots drive Windows Chrome headless over
  CDP with its own profile dir/port, and kill the dev server and Chrome afterwards.

## Rules

- Minimal look, old-site palette: `#020202` / `#4c91bf` / `#f7ece1` / `#6d597a` / `#b56576`
  (Tailwind `@theme` tokens in `src/app/globals.css`).
- Performance: animate only `transform`/`opacity`, no per-frame React renders, pause off-screen and
  on hidden tabs, respect `prefers-reduced-motion`, stop simulations once settled.
- No personal phone number or personal email in any committed file.
- Oceana Core is client work: no client names, money, vendors or internal specifics on the site.
- Vetted design/motion skills are vendored in `.claude/skills/` (sources in `SOURCES.md`).
