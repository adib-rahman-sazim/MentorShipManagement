import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUploadDocumentMutation } from "@/shared/redux/rtk-apis/document-vector-store/document-vector-store.api";
import { useGetPresignedUrlMutation } from "@/shared/redux/rtk-apis/file-uploads/file-uploads.api";
import { EAllowedMimeTypes } from "@/shared/typedefs/api";
import { uploadToS3 } from "@/shared/utils/files";

import {
  uploadDocumentFormInitialValues,
  uploadDocumentFormResolver,
} from "./UploadDocumentForm.helpers";
import type { TUploadDocumentFormSchema } from "./UploadDocumentForm.types";

export const useUploadDocumentForm = () => {
  const { t } = useTranslation("document-vector-store");
  const [getPresignedUrl] = useGetPresignedUrlMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  const form = useForm<TUploadDocumentFormSchema>({
    defaultValues: uploadDocumentFormInitialValues,
    resolver: uploadDocumentFormResolver,
    reValidateMode: "onBlur",
  });

  const onSubmit = async (values: TUploadDocumentFormSchema) => {
    const file = values.file;
    if (!file) {
      return;
    }

    try {
      const presignedUrls = await getPresignedUrl({
        files: [{ name: file.name, type: file.type as EAllowedMimeTypes }],
      }).unwrap();

      const signedUrl = presignedUrls[0]?.signedUrl;
      if (!signedUrl) {
        throw new Error("Failed to get presigned URL");
      }

      await uploadToS3(signedUrl, file);

      await uploadDocument({ fileKey: signedUrl }).unwrap();

      toast.success(t("uploadSuccess"));
      form.reset();
    } catch {
      toast.error(t("uploadFailed"));
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
