import { USER_ROLE_LABELS } from "@/modules/users/users.constants";
import { Avatar, AvatarFallback } from "@/shared/components/shadui/avatar";
import { Badge } from "@/shared/components/shadui/badge";
import { getInitials } from "@/shared/utils/string";

import { IMentorshipPersonProps } from "./MentorshipPerson.interfaces";

const MentorshipPerson = ({ name, role }: IMentorshipPersonProps) => (
  <div className="flex min-w-0 items-center gap-3">
    <Avatar>
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
    <span className="min-w-0 truncate font-medium" title={name}>
      {name}
    </span>
    <Badge variant="outline">{USER_ROLE_LABELS[role]}</Badge>
  </div>
);

export default MentorshipPerson;
