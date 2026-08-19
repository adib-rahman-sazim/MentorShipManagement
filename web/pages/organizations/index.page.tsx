import OrganizationsContainer from "@/modules/organizations/containers/OrganizationsContainer";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const OrganizationsPage: NextApplicationPage = () => <OrganizationsContainer />;

OrganizationsPage.Layout = AuthenticatedLayout;
OrganizationsPage.Guard = withPermissionGuard(
  ProtectedRoute,
  EPermission.PAGE_VIEW,
  EResource.ORGANIZATION,
);

export default OrganizationsPage;
