import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCreateOrganizationMutation } from "@/shared/redux/rtk-apis/organizations/organizations.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import {
  createOrganizationFormInitialValues,
  createOrganizationFormResolver,
} from "./CreateOrganizationDialog.helpers";
import { TCreateOrganizationFormFields } from "./CreateOrganizationDialog.types";

export const useCreateOrganizationForm = ({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) => {
  const form = useForm<TCreateOrganizationFormFields>({
    defaultValues: createOrganizationFormInitialValues,
    resolver: createOrganizationFormResolver,
  });

  const [createOrganization] = useCreateOrganizationMutation();

  const onSubmit = async (values: TCreateOrganizationFormFields) => {
    try {
      const slug = values.slug?.trim();
      await createOrganization({
        name: values.name.trim(),
        ...(slug ? { slug } : {}),
      }).unwrap();
      toast.success("Organization created successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create organization", {
        description: parseApiErrorMessage(error),
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
