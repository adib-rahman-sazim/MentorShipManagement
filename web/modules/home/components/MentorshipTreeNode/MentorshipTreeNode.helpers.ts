import { getPersonMeta } from "@/modules/graph/components/PersonNode/PersonNode.helpers";
import type { IPreviewPerson } from "@/modules/home/home.interfaces";
import { EUserState } from "@/shared/typedefs";

export function getPreviewPersonMeta(
  { name, role, reports }: IPreviewPerson,
  depth: number,
): string {
  return getPersonMeta({
    name,
    role,
    state: EUserState.ACTIVE,
    subordinateCount: reports.length,
    hasSupervisor: depth > 0,
  });
}
