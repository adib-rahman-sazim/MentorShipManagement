import { ArrowDown, UserRound } from "lucide-react";

import MentorshipPerson from "@/modules/mentorships/components/MentorshipPerson";
import { Avatar, AvatarFallback } from "@/shared/components/shadui/avatar";

import { sortChainTopDown } from "./MentorshipChain.helpers";
import { IMentorshipChainProps } from "./MentorshipChain.interfaces";

const MentorshipChain = ({ supervisors, subjectLabel }: IMentorshipChainProps) => (
  <ol className="flex flex-col">
    {sortChainTopDown(supervisors).map((link) => (
      <li key={link.mentorshipId} className="flex flex-col">
        <MentorshipPerson name={link.supervisor.name} role={link.supervisor.role} />
        <ArrowDown className="my-1 ml-2 size-4 text-muted-foreground" aria-hidden />
      </li>
    ))}
    <li aria-current="true" className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback className="bg-primary text-primary-foreground">
          <UserRound className="size-4" aria-hidden />
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">{subjectLabel}</span>
    </li>
  </ol>
);

export default MentorshipChain;
