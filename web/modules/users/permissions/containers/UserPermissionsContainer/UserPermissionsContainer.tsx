import PermissionGroupCard from "@/modules/users/permissions/components/PermissionGroupCard";
import PermissionSourceLegend from "@/modules/users/permissions/components/PermissionSourceLegend";
import ReadOnlyRecordNotice from "@/modules/users/permissions/components/ReadOnlyRecordNotice";
import UnsavedChangesBar from "@/modules/users/permissions/components/UnsavedChangesBar";
import UserPermissionsHeader from "@/modules/users/permissions/components/UserPermissionsHeader";
import UserPermissionsLoadError from "@/modules/users/permissions/components/UserPermissionsLoadError";
import UserPermissionsSkeleton from "@/modules/users/permissions/components/UserPermissionsSkeleton";
import {
  groupPermissions,
  summarizePermissions,
} from "@/modules/users/permissions/permissions.helpers";
import { USER_ROLE_LABELS } from "@/modules/users/users.constants";
import { Form } from "@/shared/components/shadui/form";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import { useUserPermissionsData, useUserPermissionsForm } from "./UserPermissionsContainer.hooks";

const UserPermissionsContainer = () => {
  const { userId, user, overrides, isLoading, error, refetch } = useUserPermissionsData();
  const { form, permissions, access, pendingChangeCount, onSubmit, onDiscard } =
    useUserPermissionsForm({ userId, overrides });

  if (isLoading) {
    return <UserPermissionsSkeleton />;
  }

  if (error || !user || !overrides) {
    return <UserPermissionsLoadError message={parseApiErrorMessage(error)} onRetry={refetch} />;
  }

  const isReadOnly = !overrides.editable;
  const summary = summarizePermissions(permissions);
  const groups = groupPermissions(permissions);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 md:px-8">
      <UserPermissionsHeader
        user={user}
        roleLabel={USER_ROLE_LABELS[overrides.role]}
        summary={summary}
      />

      {isReadOnly ? <ReadOnlyRecordNotice /> : <PermissionSourceLegend />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {groups.map((group) => (
            <PermissionGroupCard
              key={group.group}
              group={group}
              control={form.control}
              access={access}
              isReadOnly={isReadOnly}
            />
          ))}

          {pendingChangeCount > 0 ? (
            <UnsavedChangesBar
              form={form}
              pendingChangeCount={pendingChangeCount}
              onDiscard={onDiscard}
            />
          ) : null}
        </form>
      </Form>
    </div>
  );
};

export default UserPermissionsContainer;
