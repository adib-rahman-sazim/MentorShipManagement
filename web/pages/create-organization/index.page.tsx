import CreateOrganizationOnboardingContainer from "@/modules/auth/containers/CreateOrganizationOnboardingContainer";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const CreateOrganizationPage: NextApplicationPage = () => <CreateOrganizationOnboardingContainer />;

CreateOrganizationPage.Layout = GeneralLayout;
CreateOrganizationPage.Guard = ProtectedRoute;

export default CreateOrganizationPage;
