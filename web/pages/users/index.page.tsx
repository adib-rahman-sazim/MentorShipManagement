import UsersContainer from "@/modules/users/containers/UsersContainer";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const UsersAdministrationPage: NextApplicationPage = () => <UsersContainer />;

UsersAdministrationPage.Layout = AuthenticatedLayout;
UsersAdministrationPage.Guard = withPermissionGuard(
  ProtectedRoute,
  EPermission.PAGE_VIEW,
  EResource.USER,
);

export default UsersAdministrationPage;
