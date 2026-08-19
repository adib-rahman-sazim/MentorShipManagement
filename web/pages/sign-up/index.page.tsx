import SignUpContainer from "@/modules/sign-up/containers/SignUpContainer";
import PublicRoute from "@/shared/components/wrappers/PublicRoute";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const SignUpPage: NextApplicationPage = () => <SignUpContainer />;

SignUpPage.Layout = GeneralLayout;
SignUpPage.Guard = PublicRoute;

export default SignUpPage;
