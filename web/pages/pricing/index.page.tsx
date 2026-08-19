import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { PricingContainer } from "@/modules/pricing/containers/PricingContainer";
import i18nConfig from "@/next-i18next.config.mjs";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const PricingPage: NextApplicationPage = () => <PricingContainer />;

PricingPage.Layout = GeneralLayout;

export default PricingPage;

export async function getStaticProps({ locale }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en-US", ["common"], i18nConfig)),
    },
  };
}
