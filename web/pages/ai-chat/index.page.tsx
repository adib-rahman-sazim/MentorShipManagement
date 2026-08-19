import dynamic from "next/dynamic";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import i18nConfig from "@/next-i18next.config.mjs";
import FormSkeleton from "@/shared/components/skeletons/FormSkeleton";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const AIChatContainer = dynamic(() => import("@/modules/ai-chat/containers/AIChatContainer"), {
  loading: () => <FormSkeleton fields={4} />,
});

const AIChatPage: NextApplicationPage = () => <AIChatContainer />;

AIChatPage.Layout = AuthenticatedLayout;
AIChatPage.Guard = withPermissionGuard(ProtectedRoute, EPermission.PAGE_VIEW, EResource.AI_CHAT);

export default AIChatPage;

export async function getStaticProps({ locale }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en-US", ["common", "ai-chat"], i18nConfig)),
    },
  };
}
