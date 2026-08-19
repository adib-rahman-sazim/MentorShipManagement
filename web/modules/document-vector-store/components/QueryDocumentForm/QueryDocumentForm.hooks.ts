import { useState } from "react";

import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useQueryDocumentMutation } from "@/shared/redux/rtk-apis/document-vector-store/document-vector-store.api";
import { IQueryDocumentResultDto } from "@/shared/typedefs/api";

import {
  queryDocumentFormInitialValues,
  queryDocumentFormResolver,
} from "./QueryDocumentForm.helpers";
import { TQueryDocumentFormFields, TUseQueryDocumentFormOptions } from "./QueryDocumentForm.types";

export const useQueryDocumentForm = (options: TUseQueryDocumentFormOptions) => {
  const { t } = useTranslation("document-vector-store");
  const [queryDocument, { isLoading }] = useQueryDocumentMutation();
  const [results, setResults] = useState<IQueryDocumentResultDto[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const form = useForm<TQueryDocumentFormFields>({
    defaultValues: queryDocumentFormInitialValues,
    resolver: queryDocumentFormResolver,
    reValidateMode: "onBlur",
  });

  const onSubmit = async (values: TQueryDocumentFormFields) => {
    try {
      const result = await queryDocument({
        query: values.query,
        maxResults: values.maxResults,
      }).unwrap();

      setResults(result.results);
      setHasSearched(true);
      options.onResults?.(result.results);
    } catch {
      toast.error(t("queryFailed"));
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    results,
    hasSearched,
  };
};
