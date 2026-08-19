import AcceptInvitationContainer from "@/modules/invite/containers/AcceptInvitationContainer";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const AcceptInvitationPage: NextApplicationPage = () => <AcceptInvitationContainer />;

AcceptInvitationPage.Layout = GeneralLayout;

export default AcceptInvitationPage;
