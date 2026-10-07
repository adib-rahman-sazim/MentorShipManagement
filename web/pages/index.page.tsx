import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { HERO_DESCRIPTION } from "@/modules/home/components/HomeHero/HomeHero.constants";
import HomeContainer from "@/modules/home/containers/HomeContainer";
import i18nConfig from "@/next-i18next.config.mjs";
import NextHead from "@/shared/components/NextHead";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const Home: NextApplicationPage = () => (
  <>
    <NextHead content={HERO_DESCRIPTION} />
    <HomeContainer />
  </>
);

Home.Layout = GeneralLayout;

export default Home;

export async function getStaticProps({ locale }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en-US", ["common"], i18nConfig)),
    },
  };
}
