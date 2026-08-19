import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ComponentExamplesContainer from "@/modules/component-examples/containers/ComponentExamplesContainer";
import NextHead from "@/shared/components/NextHead";
import { Button } from "@/shared/components/shadui/button";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

import i18nConfig from "../next-i18next.config.mjs";

const Home: NextApplicationPage = () => (
  <>
    <NextHead />

    <div className="w-full">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to Sazim&rsquo;s NextJS + ShadCN Starter Template
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Jumpstart your next project with our beautifully designed and fully functional
                template.
              </p>
            </div>
            <div className="space-x-4">
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-muted/40 py-12 md:py-24 lg:py-32">
        <ComponentExamplesContainer />
      </section>
    </div>
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
