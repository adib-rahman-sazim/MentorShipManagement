import MentorshipPerson from "@/modules/mentorships/components/MentorshipPerson";

import { IMentorshipTeamProps } from "./MentorshipTeam.interfaces";

const MentorshipTeam = ({ team, isNested = false }: IMentorshipTeamProps) => (
  <ul className={isNested ? "ml-4" : "space-y-3"}>
    {team.map((node) => (
      <li
        key={node.mentorshipId}
        className={
          isNested
            ? "relative pt-3 pl-6 before:absolute before:top-0 before:left-0 before:h-full before:border-l after:absolute after:top-7 after:left-0 after:w-4 after:border-t last:before:h-7"
            : undefined
        }
      >
        <MentorshipPerson name={node.user.name} role={node.user.role} />
        {node.team.length > 0 ? <MentorshipTeam team={node.team} isNested /> : null}
      </li>
    ))}
  </ul>
);

export default MentorshipTeam;
