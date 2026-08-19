import SettingsContainer from "@/modules/settings/container/SettingsContainer";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const SettingsPage: NextApplicationPage = () => <SettingsContainer />;

SettingsPage.Layout = AuthenticatedLayout;
SettingsPage.Guard = withPermissionGuard(ProtectedRoute, EPermission.PAGE_VIEW, EResource.SETTINGS);

export default SettingsPage;
