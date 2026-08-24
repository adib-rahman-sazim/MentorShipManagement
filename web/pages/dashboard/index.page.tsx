import dynamic from "next/dynamic";

import FormSkeleton from "@/shared/components/skeletons/FormSkeleton";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const DashboardContainer = dynamic(
  () => import("@/modules/dashboard/containers/DashboardContainer"),
  {
    loading: () => <FormSkeleton fields={6} />,
  },
);

const DashboardPage: NextApplicationPage = () => <DashboardContainer />;

DashboardPage.Layout = AuthenticatedLayout;
DashboardPage.Guard = withPermissionGuard(
  ProtectedRoute,
  EPermission.PAGE_VIEW,
  EResource.DASHBOARD,
);

export default DashboardPage;