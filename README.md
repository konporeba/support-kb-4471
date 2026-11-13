# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

## Building it here

The export ships without its app shell, so this repo adds the smallest one that renders it:
`package.json`, `svelte.config.js` (mdsvex, `layout: runbook`, `#lib` → `src/lib`), `vite.config.js`,
`src/app.html`, `src/routes/+layout.js`.

```sh
npm install
npm run build      # prerenders every kb page to build/
```

`build/` is committed: it is the kb as the desk sees it. Added on top of the export:

- `src/routes/kb/incidents/4471-problems/+page.svx`: #4471 split into its problems (signed with the course ticket)
  → rendered at `build/kb/incidents/4471-problems/index.html`
- `src/lib/kb/problems.ts`, `src/lib/kb/ProblemTable.svelte`: the logic and table behind it
- Issues [#1](https://github.com/konporeba/support-kb-4471/issues/1) parser ·
  [#2](https://github.com/konporeba/support-kb-4471/issues/2) booking-v3 hint ·
  [#3](https://github.com/konporeba/support-kb-4471/issues/3) one-day shift

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
