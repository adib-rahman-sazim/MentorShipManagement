import { useRouter } from "next/router";

import { Avatar, AvatarFallback } from "@/shared/components/shadui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadui/dropdown-menu";
import { useSignOut } from "@/shared/hooks/useSignOut";
import { TSessionUser } from "@/shared/providers/AuthProvider.types";

const SignedInUserAvatarAndMenu = ({ user }: { user: TSessionUser }) => {
  const router = useRouter();
  const { signOut } = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback>{user.email.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SignedInUserAvatarAndMenu;
