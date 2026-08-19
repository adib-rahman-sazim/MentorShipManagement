import ForgotPasswordContainer from "@/modules/forgot-password/containers/ForgotPasswordContainer";
import PublicRoute from "@/shared/components/wrappers/PublicRoute";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const ForgotPasswordPage: NextApplicationPage = () => <ForgotPasswordContainer />;

ForgotPasswordPage.Layout = GeneralLayout;
ForgotPasswordPage.Guard = PublicRoute;

export default ForgotPasswordPage;
