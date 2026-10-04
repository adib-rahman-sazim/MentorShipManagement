import { ArrowDown } from "lucide-react";

import MentorshipPerson from "@/modules/mentorships/components/MentorshipPerson";
import { Avatar, AvatarFallback } from "@/shared/components/shadui/avatar";
import { getInitials } from "@/shared/utils/string";

import { CURRENT_USER_INDICATOR } from "./MentorshipChain.constants";
import { sortChainTopDown } from "./MentorshipChain.helpers";
import { IMentorshipChainProps } from "./MentorshipChain.interfaces";

const MentorshipChain = ({ supervisors, subjectName }: IMentorshipChainProps) => (
  <ol className="flex flex-col">
    {sortChainTopDown(supervisors).map((link) => (
      <li key={link.mentorshipId} className="flex flex-col">
        <MentorshipPerson name={link.supervisor.name} role={link.supervisor.role} />
        <ArrowDown className="my-1 ml-2 size-4 text-muted-foreground" aria-hidden />
      </li>
    ))}
    <li aria-current="true" className="flex min-w-0 items-center gap-3">
      <Avatar>
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(subjectName)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate font-medium" title={subjectName}>
        {subjectName}
      </span>
      <span className="shrink-0 text-muted-foreground">{CURRENT_USER_INDICATOR}</span>
    </li>
  </ol>
);

export default MentorshipChain;
