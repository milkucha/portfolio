# portfolio

Personal portfolio of Camilo Álvarez. One page: a spinning CSS 3D cube of skill areas, with bio, projects and contact beside it. Plus Impressum and Datenschutz pages.

## Stack

TypeScript, React, Next.js 16 (App Router), Tailwind CSS 4. Node version in `.nvmrc`.

## Run

```bash
npm ci
npm run dev -- -p 3001   # http://localhost:3001
npm run build            # production build
npm run lint
```

Next.js 16 differs from older versions; see `AGENTS.md` and `node_modules/next/dist/docs/`.

## Where things are

- Copy: `COPY.md` lists every visible text. Edit it, then the text is applied in `src/components/lab/` and `src/data/site.ts`.
- Cube page: `src/components/lab/`. Legal pages: `src/app/impressum`, `src/app/datenschutz`.
- `/lab/cube` redirects to `/` (308).
- History, archive branches and tags, backup bundle, restore recipe and cut-over notes: `LOG.md`.
