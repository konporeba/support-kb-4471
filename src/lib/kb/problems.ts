// The problems inside one merged ticket, one row per fix. Pages explain it; this file is what runs.
//
// causes.ts places a report by its tenant (locale + booking form) and channel: `parser` or `hint`.
// Both are a day/month swap. A one-day move is not a swap: no parser or hint reading turns 12 May
// into 11 May, or gives Lisbon Tuesday and Toronto Monday for the same meeting. The desk already
// lists those reports in desk-notes.json (`oneDayMove`); here they get a row of their own instead
// of a footnote. Counts follow the desk's view (CauseTable): every report stays counted under the
// cause its tenant files it under, so the `shift` row is also inside its tenant's row (`alsoIn`).
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'shift'];

// What the problem is, in one line. The fix lives in the ticket, not here.
export const WHAT: Record<Problem | 'unplaced', string> = {
  parser: 'The shared parser reads every date month first; day-first tenants get day and month swapped.',
  hint: 'booking-v3 prints MM/DD/YYYY under its date field; day-first tenants type month first and the form reads it day first.',
  shift: 'The date moves by one day, not a swap: the same booking lands a day early (time zone), whatever the tenant writes.',
  unplaced: 'No tenant on file, or a tenant that writes the month first: no known cause.',
};

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  // Rows these reports are also counted in (the desk files a one-day move under its tenant's cause).
  alsoIn: Record<string, number>;
  taggedAs: Record<string, number>;
  tenants: string[];
  channels: Record<string, number>;
  subjects: number;
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  shiftIds: readonly string[],
): ProblemGroup[] {
  const by = new Map<ProblemGroup['problem'], Report[]>();
  const add = (p: ProblemGroup['problem'], r: Report) => by.set(p, [...(by.get(p) ?? []), r]);
  const filed = (r: Report) => causeOf(r, tenantOf(r)) ?? 'unplaced';
  for (const r of reports) {
    add(filed(r), r);
    if (shiftIds.includes(r.id)) add('shift', r);
  }
  const count = (rs: Report[], key: (r: Report) => string) =>
    rs.reduce<Record<string, number>>((n, r) => ({ ...n, [key(r)]: (n[key(r)] ?? 0) + 1 }), {});
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        alsoIn: problem === 'shift' ? count(rs, filed) : {},
        taggedAs: count(rs, (r) => r.meta.intakeTag),
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: count(rs, (r) => r.channel),
        subjects: new Set(rs.map((r) => r.subject)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

// One ticket's reports, each counted once: the export pages overlap, so rows repeat.
export function mergedInto(rows: Report[], ticket: number): { rows: number; reports: Report[] } {
  const all = rows.filter((r) => r.mergedInto === ticket);
  return { rows: all.length, reports: uniqueById(all) };
}

// Reports whose intake tag disagrees with the problem they belong to. Intake only knows causes.
export function mistagged(g: ProblemGroup): number {
  if (g.problem === 'unplaced' || g.problem === 'shift') return 0;
  return g.reports.filter((r) => r.meta.intakeTag !== g.problem).length;
}
