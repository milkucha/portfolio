# COPY: every piece of text on the cube page (branch `proto/cube-bio`, port 3001)

Edit anything below and hand the file back. Keep the structure (headings, `-` bullets, `key:` names) so
I can map each line to its place in the code. Source file for each block is noted in italics.
Tip: add `DELETE` or `ADD` notes in plain words if you want a line removed or a new one added.

---

## 1. Right pane: BIO

*src/components/lab/introText.ts, src/data/site.ts*

- name (big title, wraps to two lines): Camilo Álvarez
- line 1: Full-stack developer based in Berlin.
- line 2: Python, TypeScript, Java, agentic tools.
- line 3: Open source as milkucha.
  - the word `milkucha` (in line 3) is set in italic
- line 4: Minecraft mod maintainer, 550K+ downloads.

## 2. Menu (under the cube)

*src/components/lab/SkillsCube.tsx*

- BIO
- PROJECTS (opens the six domain buttons, in this order, left to right):
  1. Backend
  2. Frontend
  3. Applied AI
  4. Modding
  5. Game Dev
  6. Design
- CONTACT

## 3. Face hints (small text on each cube face, one item per line)

*src/components/lab/cubeFaces.ts*

- Backend: Python · Django · PostgreSQL · Docker
- Frontend: TypeScript · React · Next.js · Tailwind CSS
- Applied AI: Python · Ollama · LLM agents
- Modding: Java · Gradle · Minecraft
- Game Dev: Godot · GDScript · Aseprite
- Design: Figma · Blender · MagicaVoxel

## 4. Project cards (right pane, PROJECTS)

*src/components/lab/cubeProjects.ts*. Each card has: name, one-liner, highlights (up to 3 for strong projects; fewer, often none, for weaker ones), tech chips (untitled), a footnote, link icons, and an optional thumbnail (none set yet).
The footnote reads "Built with Claude Code" or "Built with Claude Code and OpenCode" (workflow tools joined
with ", " and " and "); it is omitted when there are none. Cards are listed per domain.
The card title is a link (new tab) to the GitHub link if the card has one, else to its only link if it has exactly one; otherwise it is plain text (Kucha, Arranca Cover).

### Backend

#### Oceana Core
- one-liner: Production backend for a multi-region vacation-rental operator.
- highlights:
  - Settlement engine for taxes, fees, commissions and multi-currency revenue-share splits
  - Reservation ingestion from a property-management system's REST API
- tech chips: Python, TypeScript, Django, PostgreSQL, Docker
- footnote: Built with Claude Code and OpenCode
- links: Website (https://www.oceanasuites.com)

### Frontend

#### Portfolio
- one-liner: CSS 3D cube driven by quaternions..
- highlights: (none)
- tech chips: TypeScript, React, Next.js, Tailwind CSS
- footnote: Built with Claude Code
- links: GitHub (https://github.com/milkucha/portfolio)

### Applied AI

#### Provenance
- one-liner: World-building tool that grows a fictional society from an authored seed that drifts based on typed knowledge.
- highlights:
  - Multiple-pass simulation on 50+ characters, seeded and reproducible
  - Measurement scripts for drift, divergence and token usage
  - Model-agnostic
- tech chips: Python, Ollama, LLM agents
- footnote: Built with Claude Code and OpenCode
- links: GitHub (https://github.com/milkucha/provenance)

### Modding

#### The Roads More Travelled
- one-liner: Dynamic terrain mod for Minecraft that erodes often-travelled routes turning them into realistic, yet vanilla-friendly worn paths.
- highlights:
  - 550K+ downloads
  - 86 GitHub stars
  - Multi-version and multi-loader support
- tech chips: Java, Gradle, Minecraft
- footnote: Built with Claude Code
- links: GitHub (https://github.com/milkucha/trmt), Modrinth (https://modrinth.com/mod/the-roads-more-travelled), CurseForge (https://www.curseforge.com/minecraft/mc-mods/the-roads-more-travelled), YouTube (https://www.youtube.com/watch?v=OvsNVaFiK1Y)

### Game dev

#### Icarus
- one-liner: Arcade game about flying without hubris: fly as far as you can before you fall into the sea.
- highlights: (none)
- tech chips: Godot, GDScript, Aseprite
- footnote: (none)
- links: itch.io (https://milkucha.itch.io/icarus)

#### Kucha
- one-liner: 2D pixel art arena brawler: two players plus AI bots, four weapons, destructible terrain. Multiplayer in progress.
- highlights: (none)
- tech chips: Godot, GDScript, Aseprite
- footnote: (none)
- links: (none)

### Design

#### Arranca Cover
- one-liner: Voxel art isometric city. Hand authored model, Minecraft to Blender pipeline.
- highlights: (none)
- tech chips: Blender, MagicaVoxel, Python
- footnote: (none)
- links: (none)

Card labels that are fixed in the code (tell me if you want them changed): the heading on each card is the
domain name (Backend, Frontend, ...); chips have no group title; link buttons show
only icons, the labels above are their tooltips.

## 5. Contact (right pane, CONTACT)

*src/data/site.ts, src/components/lab/SkillsCube.tsx*

- heading: Contact
- text rows:
  - GitHub: github.com/milkucha (https://github.com/milkucha)
  - Email: milkucha@disroot.org (mailto:milkucha@disroot.org)
  - Location: Berlin (plain text, no link)
- icon row, label `Elsewhere`, icons in this order:
  1. LinkedIn (https://www.linkedin.com/in/camilo-alvarez-595292156/)
  2. itch.io (https://milkucha.itch.io), profile URL assumed from the Icarus link, please confirm
  3. YouTube (https://www.youtube.com/@milkuchachuklim), the channel

## 6. Page metadata (browser tab and search)

*src/app/layout.tsx*

- title: Camilo Álvarez, Full-stack Developer
- description: Portfolio of Camilo Álvarez, software developer: projects, skills and contact.

## 7. Lab-only controls (hidden)

- `faces:` color / ghost / wire switcher, hidden behind `SHOW_FILL_SWITCH = false` in `src/components/lab/SkillsCube.tsx` (set true to show it). Default face style is ghost.

## 8. Footer and legal pages

- footer labels (bottom of the lab page, mono, small): `Impressum · Datenschutz` (links to /impressum and /datenschutz)
- drafts live at `src/app/impressum` and `src/app/datenschutz` (shared shell in `src/components/legal/LegalShell.tsx`), English, marked "Draft. Have it reviewed before launch."
- address filled: Ueckermünderstrasse 1, 10439 Berlin. No phone number published; contact is by email only (milkucha@disroot.org).
- page titles: Impressum, Datenschutz

## 9. Open items

- CV link missing (no file or URL exists yet; not added to Contact).
- Thumbnails/pictures dropped by owner. Backdrop pictures (TRMT, Provenance) were tried and parked on branch `proto/cube-bio-pictures`. Arranca Cover thumbnail still missing (cards support an optional `image`).
- Oceana "Production" wording is the owner's own earlier claim.
