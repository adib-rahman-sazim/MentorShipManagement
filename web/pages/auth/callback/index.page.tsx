import AuthCallbackContainer from "@/modules/auth/containers/AuthCallbackContainer";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const AuthCallbackPage: NextApplicationPage = () => <AuthCallbackContainer />;

AuthCallbackPage.Layout = GeneralLayout;

export default AuthCallbackPage;
