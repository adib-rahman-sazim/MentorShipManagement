import Link from "next/link";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/shadui/alert";
import { Button, buttonVariants } from "@/shared/components/shadui/button";
import { USERS_ROUTE } from "@/shared/constants/routes.constants";

import {
  BACK_TO_USERS_LABEL,
  LOAD_ERROR_TITLE,
  RETRY_LABEL,
} from "./UserPermissionsLoadError.constants";
import { IUserPermissionsLoadErrorProps } from "./UserPermissionsLoadError.interfaces";

const UserPermissionsLoadError = ({ message, onRetry }: IUserPermissionsLoadErrorProps) => (
  <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 md:px-8">
    <Alert variant="destructive">
      <AlertCircle aria-hidden />
      <AlertTitle>{LOAD_ERROR_TITLE}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onRetry}>
        {RETRY_LABEL}
      </Button>
      <Link href={USERS_ROUTE} className={buttonVariants({ variant: "ghost" })}>
        {BACK_TO_USERS_LABEL}
      </Link>
    </div>
  </div>
);

export default UserPermissionsLoadError;
