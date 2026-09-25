import UserPermissionsContainer from "@/modules/users/permissions/containers/UserPermissionsContainer";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const UserPermissionsPage: NextApplicationPage = () => <UserPermissionsContainer />;

UserPermissionsPage.Layout = AuthenticatedLayout;
UserPermissionsPage.Guard = withPermissionGuard(
  ProtectedRoute,
  EPermission.READ,
  EResource.PERMISSIONS,
);

export default UserPermissionsPage;
