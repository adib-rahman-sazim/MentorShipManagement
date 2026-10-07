import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/shadui/avatar";
import { getInitials } from "@/shared/utils/string";

import { IAppSidebarUserProps } from "./AppSidebarUser.interfaces";

const AppSidebarUser = ({ user }: IAppSidebarUserProps) => (
  <div className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!">
    <Avatar>
      <AvatarImage src={user.image ?? undefined} alt={user.name} />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
    <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
      {user.name}
    </span>
  </div>
);

export default AppSidebarUser;
