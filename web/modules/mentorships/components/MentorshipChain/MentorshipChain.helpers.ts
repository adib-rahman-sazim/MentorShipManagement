import { IMentorshipChainLinkResponse } from "@/shared/typedefs";

export function sortChainTopDown(
  supervisors: readonly IMentorshipChainLinkResponse[],
): IMentorshipChainLinkResponse[] {
  return [...supervisors].sort((left, right) => right.depth - left.depth);
}
