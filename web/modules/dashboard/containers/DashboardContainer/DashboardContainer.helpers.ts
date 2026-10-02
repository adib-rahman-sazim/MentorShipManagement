import { IMyMentorshipResponse } from "@/shared/typedefs";

export function isMentorshipEmpty({ supervisors, team }: IMyMentorshipResponse): boolean {
  return supervisors.length === 0 && team.length === 0;
}
