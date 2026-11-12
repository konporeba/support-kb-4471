<script lang="ts">
  import rows from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, mergedInto, mistagged, WHAT, type Problem } from '#lib/kb/problems';

  // `issues`: where each problem is filed, problem → ticket URL. Words and links come from the page.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const merged = $derived(mergedInto(rows as Report[], ticket));
  const groups = $derived(groupByProblem(merged.reports, tenantOf, notes.oneDayMove));
  const covered = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const issueNo = (url: string) => url.match(/\/issues\/(\d+)/)?.[1];
</script>

<p class="sum">
  <strong>{merged.reports.length}</strong> reports merged into #{ticket}
  ({merged.rows} export rows, {merged.rows - merged.reports.length} repeated) ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'} ·
  {covered === merged.reports.length ? 'every report placed once' : `${merged.reports.length - covered} reports not placed`}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>came in by</th><th>intake tagged</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const url = g.problem === 'unplaced' ? undefined : issues[g.problem]}
      <tr>
        <td><code>{g.problem}</code><br /><span class="what">{WHAT[g.problem]}</span></td>
        <td class="n">{g.reports.length}</td>
        <td>{g.tenants.length}</td>
        <td class="tags">{list(g.channels)}</td>
        <td class="tags">{list(g.taggedAs)}{#if mistagged(g)}<br /><span class="off">{mistagged(g)} tagged as something else</span>{/if}</td>
        <td class="tags">{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if url}<a href={url}>#{issueNo(url) ?? 'ticket'}</a>{:else}<span class="off">no ticket</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.problem)}
  <details>
    <summary><code>{g.problem}</code> · {g.reports.length} reports · {g.tenants.join(', ')}</summary>
    <p class="ids">{g.reports.map((r) => r.id).sort().join(' ')}</p>
  </details>
{/each}

<style>
  .sum { font-size: 1.05rem; }
  .what { color: var(--muted); font-size: 0.82em; }
  .n { font-weight: 600; font-variant-numeric: tabular-nums; }
  .tags { color: var(--muted); font-size: 0.82em; }
  .off { color: var(--warn); font-weight: 600; }
  details { margin: 0.25rem 0; font-size: 0.9rem; }
  summary { cursor: pointer; }
  .ids { font: 0.78rem/1.5 var(--mono); color: var(--muted); word-spacing: 0.3em; }
</style>
