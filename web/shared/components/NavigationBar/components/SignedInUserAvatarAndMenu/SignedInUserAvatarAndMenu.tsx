import { useRouter } from "next/router";

import { Avatar, AvatarFallback } from "@/shared/components/shadui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadui/dropdown-menu";
import { DASHBOARD_ROUTE } from "@/shared/constants/routes.constants";
import { useSignOut } from "@/shared/hooks/useSignOut";
import { useCan } from "@/shared/providers/AbilityProvider";
import { TSessionUser } from "@/shared/providers/AuthProvider.types";
import { EPermission, EResource } from "@/shared/typedefs";

const SignedInUserAvatarAndMenu = ({ user }: { user: TSessionUser }) => {
  const router = useRouter();
  const { signOut } = useSignOut();
  const { isAllowed: canViewDashboard } = useCan(EPermission.PAGE_VIEW, EResource.DASHBOARD);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback>{user.email.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canViewDashboard ? (
          <DropdownMenuItem onClick={() => router.push(DASHBOARD_ROUTE)}>
            Dashboard
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SignedInUserAvatarAndMenu;