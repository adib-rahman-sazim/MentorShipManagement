import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import SignInContainer from "@/modules/sign-in/container/SignInContainer";
import i18nConfig from "@/next-i18next.config.mjs";
import NextHead from "@/shared/components/NextHead";
import PublicRoute from "@/shared/components/wrappers/PublicRoute";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const SignIn: NextApplicationPage = () => (
  <>
    <NextHead />
    <SignInContainer />
  </>
);

SignIn.Layout = GeneralLayout;
SignIn.Guard = PublicRoute;

export default SignIn;

export async function getStaticProps({ locale }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en-US", ["common", "sign-in"], i18nConfig)),
    },
  };
}
