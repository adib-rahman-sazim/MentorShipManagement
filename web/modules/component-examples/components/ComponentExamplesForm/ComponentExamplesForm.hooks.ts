import { useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { COMPONENT_EXAMPLES_FORM_DEFAULT_VALUES } from "./ComponentExamplesForm.constants";
import { componentExamplesFormResolver } from "./ComponentExamplesForm.helpers";
import type { TComponentExamplesFormFields } from "./ComponentExamplesForm.types";

export const useComponentExamplesForm = () => {
  const [submittedJson, setSubmittedJson] = useState<string | null>(null);

  const form = useForm<TComponentExamplesFormFields>({
    defaultValues: COMPONENT_EXAMPLES_FORM_DEFAULT_VALUES,
    resolver: componentExamplesFormResolver,
  });

  const onSubmit = (values: TComponentExamplesFormFields) => {
    const payload = JSON.stringify(
      values,
      (_key, value) => (value instanceof Date ? value.toISOString() : value),
      2,
    );
    setSubmittedJson(payload);
    toast.success("Form submitted", {
      description: "Validated payload shown as JSON below.",
    });
  };

  return {
    form,
    submittedJson,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
