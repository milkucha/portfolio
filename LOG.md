# LOG: cube lab session, 2026-10-11

Where we left off. Everything is local: nothing pushed, `main` untouched, no Vercel previews exist.
This file lives on `proto/cube-bio`.

## Versions (one git worktree per branch)

| Port | Folder | Branch | What it is |
|---|---|---|---|
| 3000 | `~/portfolio` | `proto/cube-sections` | Three sections on one page: bio, cube carousel, contact. Base for the others. |
| 3001 | `~/portfolio-bio` | `proto/cube-bio` | **Current favourite.** Cube page, bio in the right pane, BIO / PROJECTS / CONTACT menu, tumble spin. |
| 3003 | `~/portfolio-spin-tumble` | `proto/cube-spin-tumble` | Sections page + tumble spin (continuous, drifting diagonal axis). Black right-aligned nav, typed name loop (name <-> milkucha). |
| 3005 | `~/portfolio-spin-loop` | `proto/cube-spin-loop` | Sections page + smooth closed loop through the six face poses, slows at each face. One fixed focus pose per face. |
| 3006 | `~/portfolio-spin-flow` | `proto/cube-spin-flow` | Same loop but constant speed, no slow-down (20 deg/s, ~31 s lap). |
| none | `~/portfolio-spin-cycle`, `~/portfolio-spin-steps` | `proto/cube-spin-cycle`, `proto/cube-spin-steps` | Not used. Servers stopped; branches and folders still exist (delete when decided). |

Spin versions: you liked 3003 (tumble), 3005 (loop rhythm) and then asked for 3006 (loop, but continuous). Not yet decided
which one wins, or whether 3001 keeps the tumble (it has it now).

## Restart the servers

`node_modules` in each extra worktree is a hard-linked copy (`cp -al ~/portfolio/node_modules <worktree>/node_modules`);
Turbopack rejects symlinks. In each folder:

```bash
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
npm run dev -- -p <port>      # then open http://localhost:<port>/lab/cube
```

Servers were left running on 3000, 3001, 3003, 3005, 3006. Stop one by its own PID (`ss -ltnp | grep :<port>`), not a broad pkill.

## State of 3001 (`proto/cube-bio`)

- Right pane shows one of three at a time (600 ms crossfade): bio (name 72 px League Spartan 400 + DM Mono text), project card, contact card.
- Menu under the cube: BIO / PROJECTS / CONTACT, left-aligned. PROJECTS is a button; the six domain buttons unroll to its right (staggered), uppercase, single line. Domain hover = lift 6 px (no tilt).
- Project cards: link icons only (no frame; colour change to rose `#b56576` on hover, var `--link-hover`); TECH chips with title, WORKFLOW chips (Claude Code, OpenCode on Oceana, Provenance, TRMT).
- Face hints on the cube (one item per line, mono, top-left): Backend Python/Django/PostgreSQL/Docker; Frontend TypeScript/React/Next.js/Tailwind CSS; Applied AI Python/Ollama/LLM agents; Game dev Godot/GDScript/Aseprite; Modding Java/Gradle/Minecraft; Design Figma/Blender/MagicaVoxel.
- Spin: tumble (`TUMBLE_*` constants). Label corner is chosen per pass by looking ahead; the button goes to a fixed upright pose.
- Typed-name animation and the black nav are **not** on 3001 (they are on 3003/3005/3006, which have the sections page).
- LinkedIn replaced the TRMT link in contact (`src/data/site.ts`).

## Open items / decisions to make

1. **Oceana link vs repo rule.** The Oceana card now links to `https://www.oceanasuites.com` (globe icon). CLAUDE.md says Oceana is client work: no client names or specifics. Either keep the link and update that rule in CLAUDE.md, or remove the link.
2. **TRMT YouTube** links to the channel (`@milkuchachuklim`), not a video. Give a URL if there is a specific one.
3. **Chips still to settle:** Oceana's frontend (prototype planned within ~2 weeks); when it exists, add TypeScript to its chips. "Full-stack" in the intro depends on that being real.
4. **Pick the spin** (tumble / loop / flow) and port the winner to the chosen base page. Loop/flow note: a face is within 12 deg of its pose for only ~1.2 s at 20 deg/s; use `FLOW_DEG_PER_S` (14 gives 1.7 s) or `FLOW_EASE` if the text feels brief.
5. **Pick the page structure** (sections page vs cube-as-main with the menu) and merge: the typed name, nav and PROJECTS menu live on different branches.
6. Unviewed: the agents and I could not see any of this in a browser; check phone widths, the three-state crossfade, BIO's immediate spin resume mid-snap, and resume-after-drag on the loop/flow curves.
7. Intro copy is final for now: "Full-stack software engineer building in Python, JS and Java. Hybrid workflows with agentic tools. Drawn to complex systems and behaviours." (`introText.ts` in the sections-based branches; `INTRO_LINES` elsewhere). The "Drawn to" typo fix is on every branch.
8. Cut-over order (CLAUDE.md) still applies before anything reaches `main`: add domain in Vercel, repoint DNS, disable GitHub Pages, then merge.
