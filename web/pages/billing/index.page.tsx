import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { BillingContainer } from "@/modules/billing/containers/BillingContainer";
import i18nConfig from "@/next-i18next.config.mjs";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const BillingPage: NextApplicationPage = () => <BillingContainer />;

BillingPage.Layout = AuthenticatedLayout;
BillingPage.Guard = withPermissionGuard(ProtectedRoute, EPermission.PAGE_VIEW, EResource.BILLING);

export default BillingPage;

export async function getStaticProps({ locale }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en-US", ["common"], i18nConfig)),
    },
  };
}
