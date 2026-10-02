import { useEffect, useMemo } from "react";

import { useRouter } from "next/router";

import { skipToken } from "@reduxjs/toolkit/query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { USER_ID_QUERY_PARAM } from "@/modules/users/permissions/permissions.constants";
import {
  buildPermissionOverrides,
  countPendingChanges,
  getSingleQueryParam,
  getUserPermissionsDefaultValues,
  getVisiblePermissions,
  userPermissionsValidationSchemaResolver,
} from "@/modules/users/permissions/permissions.helpers";
import type { TUserPermissionsFormFields } from "@/modules/users/permissions/permissions.types";
import {
  useGetUserPermissionOverridesQuery,
  useReplaceUserPermissionOverridesMutation,
} from "@/shared/redux/rtk-apis/permissions/permissions.api";
import { useGetUserQuery } from "@/shared/redux/rtk-apis/users/users.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import {
  TOAST_MESSAGE_PERMISSIONS_SAVE_FAILED,
  TOAST_MESSAGE_PERMISSIONS_SAVED,
} from "./UserPermissionsContainer.constants";
import { IUseUserPermissionsFormParams } from "./UserPermissionsContainer.interfaces";

export const useUserPermissionsData = () => {
  const router = useRouter();
  const userId = getSingleQueryParam(router.query[USER_ID_QUERY_PARAM]);

  const userQuery = useGetUserQuery(userId ?? skipToken);
  const overridesQuery = useGetUserPermissionOverridesQuery(userId ?? skipToken);

  const refetch = () => {
    void userQuery.refetch();
    void overridesQuery.refetch();
  };

  return {
    userId,
    user: userQuery.data,
    overrides: overridesQuery.data,
    isLoading: !router.isReady || userQuery.isLoading || overridesQuery.isLoading,
    error: overridesQuery.error ?? userQuery.error,
    refetch,
  };
};

export const useUserPermissionsForm = ({ userId, overrides }: IUseUserPermissionsFormParams) => {
  const permissions = useMemo(
    () => getVisiblePermissions(overrides?.permissions ?? []),
    [overrides],
  );

  const form = useForm<TUserPermissionsFormFields>({
    defaultValues: getUserPermissionsDefaultValues(permissions),
    resolver: userPermissionsValidationSchemaResolver,
  });

  useEffect(() => {
    form.reset(getUserPermissionsDefaultValues(permissions));
  }, [form, permissions]);

  const access = form.watch("access");
  const pendingChangeCount = countPendingChanges(permissions, access);

  const [replaceUserPermissionOverrides] = useReplaceUserPermissionOverridesMutation();

  const onSubmit = async (values: TUserPermissionsFormFields) => {
    if (!userId) {
      return;
    }

    try {
      await replaceUserPermissionOverrides({
        userId,
        overrides: buildPermissionOverrides(permissions, values.access),
      }).unwrap();
      toast.success(TOAST_MESSAGE_PERMISSIONS_SAVED);
    } catch (error) {
      toast.error(TOAST_MESSAGE_PERMISSIONS_SAVE_FAILED, {
        description: parseApiErrorMessage(error),
      });
    }
  };

  const onDiscard = () => {
    form.reset(getUserPermissionsDefaultValues(permissions));
  };

  return {
    form,
    permissions,
    access,
    pendingChangeCount,
    onSubmit,
    onDiscard,
  };
};
