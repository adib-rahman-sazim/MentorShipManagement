import dynamic from "next/dynamic";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import i18nConfig from "@/next-i18next.config.mjs";
import FormSkeleton from "@/shared/components/skeletons/FormSkeleton";
import ProtectedRoute from "@/shared/components/wrappers/ProtectedRoute";
import { withPermissionGuard } from "@/shared/hocs/withPermissionGuard";
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";
import { EPermission, EResource, NextApplicationPage } from "@/shared/typedefs";

const DocumentVectorStoreContainer = dynamic(
  () => import("@/modules/document-vector-store/containers/DocumentVectorStoreContainer"),
  {
    loading: () => <FormSkeleton fields={4} />,
  },
);

const DocumentVectorStorePage: NextApplicationPage = () => <DocumentVectorStoreContainer />;

DocumentVectorStorePage.Layout = AuthenticatedLayout;
DocumentVectorStorePage.Guard = withPermissionGuard(
  ProtectedRoute,
  EPermission.PAGE_VIEW,
  EResource.DOCUMENT_VECTOR_STORE,
);

export default DocumentVectorStorePage;

export async function getStaticProps({ locale }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? "en-US",
        ["common", "document-vector-store"],
        i18nConfig,
      )),
    },
  };
}
