import { IMentorshipChainLinkResponse } from "@/shared/typedefs";

export interface IMentorshipChainProps {
  supervisors: IMentorshipChainLinkResponse[];
  subjectLabel: string;
}
