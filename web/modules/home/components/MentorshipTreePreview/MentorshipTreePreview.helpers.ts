import type { IPreviewPerson } from "@/modules/home/home.interfaces";

export function getTierCounts(person: IPreviewPerson, depth = 0, counts: number[] = []): number[] {
  counts[depth] = (counts[depth] ?? 0) + 1;

  for (const report of person.reports) {
    getTierCounts(report, depth + 1, counts);
  }

  return counts;
}
