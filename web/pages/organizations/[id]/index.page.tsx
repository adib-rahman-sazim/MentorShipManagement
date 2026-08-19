import OrganizationDetailContainer from "@/modules/organizations/containers/OrganizationDetailContainer";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const OrganizationDetailPage: NextApplicationPage = () => <OrganizationDetailContainer />;

OrganizationDetailPage.Layout = AuthenticatedLayout;
OrganizationDetailPage.Guard = withPermissionGuard(
  ProtectedRoute,
  EPermission.PAGE_VIEW,
  EResource.ORGANIZATION,
);

export default OrganizationDetailPage;
