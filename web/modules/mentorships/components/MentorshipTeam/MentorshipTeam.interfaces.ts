import { IMentorshipTeamNodeResponse } from "@/shared/typedefs";

export interface IMentorshipTeamProps {
  team: IMentorshipTeamNodeResponse[];
  isNested?: boolean;
}
