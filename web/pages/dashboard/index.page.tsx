import dynamic from "next/dynamic";

import FormSkeleton from "@/shared/components/skeletons/FormSkeleton";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { useCan } from "@/shared/providers/AbilityProvider/AbilityProvider.hooks";
import { useAuth } from "@/shared/providers/AuthProvider";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const DashboardContainer = dynamic(
  () => import("@/modules/dashboard/containers/DashboardContainer"),
  {
    loading: () => <FormSkeleton fields={6} />,
  },
);

const SuperuserDashboardContainer = dynamic(
  () => import("@/modules/dashboard/containers/SuperuserDashboardContainer"),
  {
    loading: () => <FormSkeleton fields={6} />,
  },
);

const DashboardPage: NextApplicationPage = () => {
  const { user } = useAuth();
  const { isAllowed: canManageAll, isLoading: isManageLoading } = useCan(
    EPermission.MANAGE,
    EResource.ALL,
  );
  const { isAllowed: canDeleteOrganization, isLoading: isDeleteOrgLoading } = useCan(
    EPermission.DELETE,
    EResource.ORGANIZATION,
  );

  if (!user || isManageLoading || isDeleteOrgLoading) {
    return <FormSkeleton fields={6} />;
  }

  const isSuperuser = canManageAll || canDeleteOrganization;

  return isSuperuser ? <SuperuserDashboardContainer /> : <DashboardContainer />;
};

DashboardPage.Layout = AuthenticatedLayout;
DashboardPage.Guard = withPermissionGuard(
  ProtectedRoute,
  EPermission.PAGE_VIEW,
  EResource.DASHBOARD,
);

export default DashboardPage;
