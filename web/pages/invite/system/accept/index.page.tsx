import AcceptSystemInvitationContainer from "@/modules/invite/containers/AcceptSystemInvitationContainer";
import PublicRoute from "@/shared/components/wrappers/PublicRoute";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const AcceptSystemInvitationPage: NextApplicationPage = () => <AcceptSystemInvitationContainer />;

AcceptSystemInvitationPage.Layout = GeneralLayout;
AcceptSystemInvitationPage.Guard = PublicRoute;

export default AcceptSystemInvitationPage;
