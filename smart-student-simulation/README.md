# Smart Student Dashboard: The AI Failure Files

A complete, deterministic Future Simulation for a 10-minute English DP6 presentation. Set in a fictional Windesheim of 2048. Built with HTML, CSS, vanilla JavaScript and SVG; no backend, AI API, package installation or external fonts.

## Run

Open this folder in VS Code and choose **Open with Live Server** on `index.html`. Alternatively, from this folder run `python -m http.server 8000`, then open `http://localhost:8000`. Files also work directly, but browser storage behaviour for `file://` varies; a local server is recommended.

## Publish on GitHub Pages

Commit the complete folder. In repository **Settings → Pages**, select the intended publishing branch and root folder, then save. If publishing this repository root, its `index.html` opens this simulation automatically. If publishing only this project as a separate repository, put these contents at that repository's root. All paths are relative, so subpath hosting works. Publishing settings have not been changed automatically.

## Seven chapters

1. **The future is here:** premise, stakeholders and how to play.
2. **Your dashboard:** overview, live results, timetable and explorable AI sources. Accept or challenge advice.
3. **The failure:** three-month time jump, academic report, original/corrected AI output and student complaint artifact. Choices change the harm; AI is a contributing factor alongside reliance and missing safeguards.
4. **Your complaint:** validated fictional feedback form, local case receipt and investigation handoff.
5. **Crisis control:** student/system/institution tabs and three decision rounds. Indicators and the incident log update consistently.
6. **Aftercare:** Respond, Recover, Improve and Exit; seven-stage responsibility timeline; a required recovery-capacity decision.
7. **The decision:** ELSA tabs, moral boundary, interactive Kill / Keep / Change, six interventions, choose and reorder three, then a personalised report.

The last chapter groups ethical reflection and the final design decision so that the whole experience remains seven interconnected chapters.

## Presentation route (about 7 minutes)

Enable **Presenter mode** in the header for English speaker notes and chapter jumps. Jumps preview a chapter; they do not fabricate decisions, complaints or completed interventions. An unplayed case cannot acquire a completed ending.

- 0:00–0:30: possible future, central question and stakeholders.
- 0:30–1:30: inspect results, discover the source mismatch, accept the plan.
- 1:30–2:15: show the 4.2, specific harm and corrected recommendation.
- 2:15–3:00: submit a fictional complaint and track the handoff.
- 3:00–4:30: choose containment, support and prevention; discuss a trade-off.
- 4:30–5:30: assign recovery capacity and inspect support/exit responsibilities.
- 5:30–7:00: inspect ELSA and the boundary, select commitments and rank three interventions, finish with the report.

Keep the remaining presentation time for the Design Brief and discussion.

## Outcomes and controls

- **Responsible Recovery:** pause affected advice, assign an adviser, require meaningful high-impact review and reserve recovery capacity. This is not certification of safe deployment.
- **Systemic Failure:** continue without individual guidance, or substitute a statement and technical patch for recovery.
- **Fragile Trust:** other complete combinations provide partial protection but retain gaps.
- An **Unfinished case** remains unfinished in presenter previews.

Ending logic is structural, not a score threshold. All grades, dates, indicators and consequences are authored scenario material, not measurements, causal estimates or predictions. Repeated clicks cannot accumulate benefits. Student safety, autonomy and workload trade-offs remain visible; workload is demand, not a success score.

The moral boundary is supported by consequentialism and deontology. Source validation, removal of AI write permissions, authorised human review, independent appeals and stop authority enforce it. Selected interventions are only a first tranche; the report identifies missing deployment conditions.

## Optional Human Override Protocol

Type **KAIZEN** outside a text field, or focus the small footer symbol. Investigate the permission conflict and choose restore authority, disable autonomy or independent review. Each has a distinct outcome and the fictional achievement **HUMAN OVERRIDE PROTOCOL ACTIVATED**. This optional scene contains no mandatory rubric content unavailable in the main simulation.

## Privacy, accessibility and persistence

One versioned LocalStorage key (`ssd-failure-files-v1`) stores progress, choices and fictional complaint text on the device. No information is sent to Windesheim or any service. Do not enter real personal information. Reset clears only this simulation's saved record. If browser storage is unavailable, the current tab can still be used and the interface reports the limitation.

Native form validation, labels, semantic headings, keyboard tabs with arrow/Home/End navigation, visible focus, dialog focus trapping/Escape, reduced-motion device support and an explicit reduced-motion control are included. Presenter mode does not replace normal progression. Responsive layouts support phones and large screens.

## Report and PDF

Use **Print / save PDF** in the final report and select the browser's PDF destination. Printing expands the final report; navigation and controls are removed and paper colours are light. The report includes crisis, student harm, system failures, institutional response, ELSA, ethical boundary, ranked interventions, Kill / Keep / Change and deployment conditions. The browser's native PDF save dialog requires the presenter to choose a destination.

## Files

```text
index.html
css/style.css          # Shell, controls, responsive and print styles
css/dashboard.css      # Dashboard, documents, decisions and report
css/animations.css     # Restrained motion and reduced-motion overrides
js/scenarios.js        # Authored content and data
js/decisions.js        # Pure indicator, ending and deployment-gap logic
js/simulation.js       # State, persistence and chapter components
js/easter-egg.js       # Optional scripted conflict
js/app.js              # Navigation, forms, events, presenter and printing
assets/Inter.ttf       # Local Inter font
assets/OFL-Inter.txt   # Font licence
tests/simulation.test.cjs
```

## Verification

Run `node tests/simulation.test.cjs` from this folder. The test covers all **108** student/response/support/prevention/aftercare combinations, all three endings, indicator bounds, repeated-choice consistency, chapter rendering, report prerequisites, complaint escaping, persistence and malformed-state recovery.

Browser verification covers the main route, complaint submission and reload, all nine crisis options across alternative endings, aftercare, intervention ranking, ELSA, keyboard tab switching, presenter jumps and Human Override activation. Check an exported PDF in the browser before the assessed presentation; page breaks can differ by browser and printer settings.

## Research and limitations

The lifecycle, aftercare and Kill / Keep / Change approach draws on the supplied Les 6 brief. The other five full lesson documents were not supplied. 2048 adoption, capacities, time commitments and events are speculative assumptions. There are no invented interviews or pilot results.

The current [GDPR text](https://eur-lex.europa.eu/eli/reg/2016/679/oj) is a legal starting point, not a prediction of 2048 rules or a liability judgement. Before real deployment, review applicable law, data processing, accessibility, staffing and educational accountability with qualified people and affected students.

AI assisted scenario development and implementation. Manesh must assess, adopt and defend the final design and moral stance. Earlier prototypes in the parent repository are retained separately.
