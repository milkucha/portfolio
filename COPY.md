# COPY: every piece of text on the cube page (branch `proto/cube-bio`, port 3001)

Edit anything below and hand the file back. Keep the structure (headings, `-` bullets, `key:` names) so
I can map each line to its place in the code. Source file for each block is noted in italics.
Tip: add `DELETE` or `ADD` notes in plain words if you want a line removed or a new one added.

---

## 1. Right pane: BIO

*src/components/lab/introText.ts, src/data/site.ts*

- name (big title, wraps to two lines): Camilo Álvarez
- paragraph 1: Full-stack engineer building in Python, TypeScript and Java. Hybrid workflows with agentic tools.
- paragraph 2: Drawn to complex systems and behaviours.
- paragraph 3: Shipping open source as milkucha.
  - the word `milkucha` is set in italic

## 2. Menu (under the cube)

*src/components/lab/SkillsCube.tsx*

- BIO
- PROJECTS (opens the six domain buttons, in this order, left to right):
  1. Backend
  2. Frontend
  3. Applied AI
  4. Modding
  5. Game dev
  6. Design
- CONTACT

## 3. Face hints (small text on each cube face, one item per line)

*src/components/lab/cubeFaces.ts*

- Backend: Python · Django · PostgreSQL · Docker
- Frontend: TypeScript · React · Next.js · Tailwind CSS
- Applied AI: Python · Ollama · LLM agents
- Modding: Java · Gradle · Minecraft
- Game dev: Godot · GDScript · Aseprite
- Design: Figma · Blender · MagicaVoxel

## 4. Project cards (right pane, PROJECTS)

*src/components/lab/cubeProjects.ts*. Each card has: name, one-liner, highlights, TECH chips,
WORKFLOW chips, link icons. Cards are listed per domain.

### Backend

#### Oceana Core
- one-liner: A back-office platform for a multi-region vacation-rental operator: contracts, units, reservations and revenue-share settlements.
- highlights:
  - Settlement engine for taxes, fees, commissions and multi-currency revenue-share splits, with derived values kept apart from source data for audit
  - Reservation ingestion from a property-management system's REST API
  - Relational data model on PostgreSQL, with JSON/XLSX exports
- tech chips: Python, TypeScript, Django, PostgreSQL, Docker, REST APIs
- workflow chips: Claude Code, OpenCode
- links: Website (https://www.oceanasuites.com)

### Frontend

#### This site
- one-liner: This portfolio, which doubles as my vehicle for learning React and TypeScript.
- highlights:
  - The cube is plain CSS 3D, driven by quaternions: drag with inertia, spring-snapping to a face
    - NOTE: out of date, dragging was removed from the cube
  - Animates transform and opacity only, and respects reduced-motion settings
- tech chips: TypeScript, React, Next.js, Tailwind CSS
- workflow chips: (none)
- links: GitHub (https://github.com/milkucha/portfolio)

### Applied AI

#### Provenance
- one-liner: A proof of concept for a world-building tool: AI agents play the characters and supply the language, but deterministic code handles everything consequential.
- highlights:
  - Grows a fictional society from a small authored seed into a drifting record of tales
  - Agents only see a bounded, randomly-sampled slice of a typed knowledge base, enforced structurally
  - Model-agnostic and token-lean, with part of the orchestration running locally via Ollama
- tech chips: Python, Ollama
- workflow chips: Claude Code, OpenCode
- links: GitHub (https://github.com/milkucha/provenance)

### Modding

#### The Roads More Travelled
- one-liner: A dynamic terrain mod for Minecraft: paths you travel often slowly wear into realistic, vanilla-friendly routes.
- highlights:
  - ~552K downloads across Modrinth and CurseForge; 86 GitHub stars
  - Maintained across 4 Minecraft versions and Fabric, Forge and NeoForge in parallel branches
  - Lightweight by design: a sparse, self-cleaning map tracks footsteps; everything is JSON-configurable
- tech chips: Java, Gradle, Minecraft, Fabric, Forge, NeoForge, GitHub Actions
- workflow chips: Claude Code, OpenCode
- links: GitHub (https://github.com/milkucha/trmt), Modrinth (https://modrinth.com/mod/the-roads-more-travelled), CurseForge (https://www.curseforge.com/minecraft/mc-mods/the-roads-more-travelled), YouTube (https://www.youtube.com/watch?v=OvsNVaFiK1Y)

### Game dev

#### Icarus
- one-liner: An arcade game about flying without hubris: flap as far as you can before you fall into the sea.
- highlights:
  - Two resources drive each run: stamina for flapping, health lost by flying too close to the sun
  - Layered parallax sky and a local high-score table
- tech chips: Godot, GDScript, Aseprite
- workflow chips: (none)
- links: itch.io (https://milkucha.itch.io/icarus)

#### Kucha
- one-liner: A local-multiplayer 2D arena brawler (in progress): two players plus AI bots, four weapons, destructible terrain.
- highlights:
  - Arena bots on navigation agents, with three difficulty settings
  - Gun, lightning, bomb and earthquake weapons, each with its own damage, knockback and cooldown
- tech chips: Godot, GDScript, Aseprite
- workflow chips: (none)
- links: (none)

### Design

#### Design
- one-liner: Voxel illustration on the side, after three years of UX and product design.
- highlights:
  - Voxel city renders: Minecraft builds exported through a Python pipeline into MagicaVoxel
  - UX and product design at Elim, 2021-2023
- tech chips: Figma, Blender, MagicaVoxel, Python
- workflow chips: (none)
- links: (none)

Card labels that are fixed in the code (tell me if you want them changed): the heading on each card is the
domain name (Backend, Frontend, ...); the chip group titles are `Tech` and `Workflow`; link buttons show
only icons, the labels above are their tooltips.

## 5. Contact (right pane, CONTACT)

*src/data/site.ts, src/components/lab/SkillsCube.tsx*

- heading: Contact
- text rows:
  - GitHub: github.com/milkucha (https://github.com/milkucha)
  - Email: milkucha@disroot.org (mailto:milkucha@disroot.org)
- icon row, label `Elsewhere`, icons in this order:
  1. LinkedIn (https://www.linkedin.com/in/camilo-alvarez-595292156/)
  2. itch.io (https://milkucha.itch.io), profile URL assumed from the Icarus link, please confirm
  3. YouTube (https://www.youtube.com/@milkuchachuklim), the channel

## 6. Page metadata (browser tab and search)

*src/app/layout.tsx*

- title: Camilo Álvarez — Portfolio
- description: Portfolio of Camilo Álvarez, software developer: projects, skills and contact.

## 7. Lab-only controls (below the menu, will be removed before launch)

- `faces:` color / ghost / wire
