import { useState } from "react";

import Link from "next/link";

import { GitBranchPlus, UserPlus, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import CreateUserDialog from "@/modules/users/components/CreateUserDialog";
import { Button, buttonVariants } from "@/shared/components/shadui/button";
import { USERS_ROUTE } from "@/shared/constants/routes.constants";
import { useCan } from "@/shared/providers/AbilityProvider";
import { EPermission, EResource } from "@/shared/typedefs";

import {
  CREATE_USER_DESCRIPTION,
  CREATE_USER_LABEL,
  MANAGE_USERS_DESCRIPTION,
  MANAGE_USERS_LABEL,
  NEW_DRAFT_DESCRIPTION,
  NEW_DRAFT_HREF,
  NEW_DRAFT_LABEL,
  QUICK_ACTION_TILE_CLASS,
  QUICK_ACTIONS_TITLE,
} from "./QuickActions.constants";

const QuickActions = () => {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const { isAllowed: canCreateUsers } = useCan(EPermission.CREATE, EResource.USER);
  const { isAllowed: canCreateDrafts } = useCan(EPermission.CREATE, EResource.DRAFT);
  const { isAllowed: canViewUsers } = useCan(EPermission.PAGE_VIEW, EResource.USER);

  if (!canCreateUsers && !canCreateDrafts && !canViewUsers) {
    return null;
  }

  const tileClassName = cn(buttonVariants({ variant: "outline" }), QUICK_ACTION_TILE_CLASS);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">{QUICK_ACTIONS_TITLE}</h2>
        
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canCreateUsers ? (
          <Button
            variant="outline"
            className={QUICK_ACTION_TILE_CLASS}
            onClick={() => setIsCreateUserDialogOpen(true)}
          >
            <UserPlus aria-hidden className="size-6" />
            <span className="text-base font-semibold">{CREATE_USER_LABEL}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {CREATE_USER_DESCRIPTION}
            </span>
          </Button>
        ) : null}
        {canCreateDrafts ? (
          <Link href={NEW_DRAFT_HREF} className={tileClassName}>
            <GitBranchPlus aria-hidden className="size-6" />
            <span className="text-base font-semibold">{NEW_DRAFT_LABEL}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {NEW_DRAFT_DESCRIPTION}
            </span>
          </Link>
        ) : null}
        {canViewUsers ? (
          <Link href={USERS_ROUTE} className={tileClassName}>
            <Users aria-hidden className="size-6" />
            <span className="text-base font-semibold">{MANAGE_USERS_LABEL}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {MANAGE_USERS_DESCRIPTION}
            </span>
          </Link>
        ) : null}
      </div>
      {canCreateUsers ? (
        <CreateUserDialog
          isOpen={isCreateUserDialogOpen}
          onOpenChange={setIsCreateUserDialogOpen}
        />
      ) : null}
    </section>
  );
};

export default QuickActions;
