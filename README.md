# Smart Student Dashboard: When AI Gets It Wrong

An interactive future simulation (set in 2030) for **Windesheim UX Research & Innovation — DP6**.
A fictional student follows inverted AI study advice; you then respond as Windesheim staff, analyse the
incident (ELSA), set a moral boundary, plan aftercare and choose a redesign.

> Speculative fiction for education. All people, data, logs and policies are invented.
> Windesheim has not deployed this system.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Semantic page shell: header, chapter stepper, controls, metrics sidebar, crisis-log drawer, footer |
| `style.css` | Design tokens, components, responsive layout, reduced motion, one-page print report |
| `script.js` | Data (scenes, decisions, outcomes), centralised state, renderers, events, easter egg |

No frameworks, build step, backend or external assets.

## Run locally (VS Code Live Server)

1. Open the folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey) if you don't have it.
3. Right-click `index.html` → **Open with Live Server**. It opens at `http://127.0.0.1:5500/`.

Opening `index.html` directly by double-clicking also works.

## Publish on GitHub Pages

1. Create a new public repository on GitHub, e.g. `smart-student-dashboard-2030`.
2. Upload `index.html`, `style.css`, `script.js` (and this README) to the repository root
   (*Add file → Upload files → Commit*), or push with git:
   ```bash
   git init
   git add .
   git commit -m "DP6 future simulation"
   git branch -M main
   git remote add origin https://github.com/<your-username>/smart-student-dashboard-2030.git
   git push -u origin main
   ```
3. In the repo go to **Settings → Pages → Build and deployment**: Source *Deploy from a branch*,
   Branch `main`, folder `/ (root)` → **Save**.
4. After about a minute the site is live at `https://<your-username>.github.io/smart-student-dashboard-2030/`.

## Presentation tips

- **Presenter** (top bar) unlocks every chapter, removes the gates and shows a one-line teaching point per scene,
  plus a quick-jump menu.
- **Speed** → *Fast* or *Instant* skips the mock AI loading during a live demo.
- **Reset** clears progress (stored in `localStorage` in this browser only).
- **Print / save report** on the final screen prints a one-page ethical summary (choose *Save as PDF*).

## Easter egg (spoiler)

<details>
<summary>Show</summary>

Click the tiny blue star after the footer motto exactly five times (it also works with Tab + Enter),
or type `K A I Z E N` on the intro screen. This opens **SYSTEM ARCHIVE // 2048**. Choosing to shut
down autonomous advice unlocks the secret achievement **Human Override Protocol**, which also appears
in the final report.
</details>

## Endings

Deterministic, based on your choices and the final illustrative indicators:

- **Protected Launch** — strong safeguards (human check, held moral boundary, low risk, recovered trust)
- **Unfinished Balance** — ambiguous middle ground
- **Fragile Trust** — inadequate safeguards

Indicators (Student Trust, Student Autonomy, Risk, Windesheim Workload) are fictional illustrative
simulation values, not empirical research.
