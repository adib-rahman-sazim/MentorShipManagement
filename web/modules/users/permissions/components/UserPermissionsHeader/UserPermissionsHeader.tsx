import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/shadui/avatar";
import { Badge } from "@/shared/components/shadui/badge";
import { buttonVariants } from "@/shared/components/shadui/button";
import { Card, CardContent } from "@/shared/components/shadui/card";
import { USERS_ROUTE } from "@/shared/constants/routes.constants";
import { getInitials } from "@/shared/utils/string";

import PermissionStat from "./PermissionStat";
import {
  ADDED_STAT_LABEL,
  BACK_TO_USERS_LABEL,
  HAS_ACCESS_STAT_LABEL,
  REMOVED_STAT_LABEL,
  USER_PERMISSIONS_DESCRIPTION,
  USER_PERMISSIONS_TITLE,
} from "./UserPermissionsHeader.constants";
import { IUserPermissionsHeaderProps } from "./UserPermissionsHeader.interfaces";

const UserPermissionsHeader = ({ user, roleLabel, summary }: IUserPermissionsHeaderProps) => (
  <header className="space-y-6">
    <div className="space-y-3">
      <Link
        href={USERS_ROUTE}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2.5")}
      >
        <ArrowLeft data-icon="inline-start" />
        {BACK_TO_USERS_LABEL}
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{USER_PERMISSIONS_TITLE}</h1>
        <p className="text-sm text-muted-foreground">{USER_PERMISSIONS_DESCRIPTION}</p>
      </div>
    </div>

    <Card>
      <CardContent className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold">{user.name}</p>
              <Badge variant="outline">{roleLabel}</Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-6 md:gap-10">
          <PermissionStat
            label={HAS_ACCESS_STAT_LABEL}
            value={`${summary.granted}/${summary.total}`}
          />
          <PermissionStat
            label={ADDED_STAT_LABEL}
            value={summary.added}
            valueClassName={summary.added > 0 ? "text-success" : ""}
          />
          <PermissionStat
            label={REMOVED_STAT_LABEL}
            value={summary.removed}
            valueClassName={summary.removed > 0 ? "text-destructive" : ""}
          />
        </dl>
      </CardContent>
    </Card>
  </header>
);

export default UserPermissionsHeader;
