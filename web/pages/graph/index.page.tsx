import MentorshipGraphContainer from "@/modules/graph/containers/MentorshipGraphContainer";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const MentorshipGraphPage: NextApplicationPage = () => <MentorshipGraphContainer />;

MentorshipGraphPage.Layout = AuthenticatedLayout;
MentorshipGraphPage.Guard = withPermissionGuard(
  ProtectedRoute,
  EPermission.PAGE_VIEW,
  EResource.MENTORSHIP_GRAPH,
);

export default MentorshipGraphPage;
