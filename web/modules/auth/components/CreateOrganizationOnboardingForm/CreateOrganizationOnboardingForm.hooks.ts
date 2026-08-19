import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createOrganizationFormInitialValues,
  createOrganizationFormResolver,
} from "@/modules/organizations/components/CreateOrganizationDialog/CreateOrganizationDialog.helpers";
import type { TCreateOrganizationFormFields } from "@/modules/organizations/components/CreateOrganizationDialog/CreateOrganizationDialog.types";
import { DASHBOARD_ROUTE } from "@/shared/constants/routes.constants";
import { organization } from "@/shared/lib/auth-client";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useAppDispatch } from "@/shared/redux/hooks";
import projectApi from "@/shared/redux/rtk-apis/api.config";
import { useCreateOrganizationMutation } from "@/shared/redux/rtk-apis/organizations/organizations.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

export const useCreateOrganizationOnboardingForm = () => {
  const router = useRouter();
  const { refetch } = useAuth();
  const dispatch = useAppDispatch();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [createOrganization] = useCreateOrganizationMutation();

  const form = useForm<TCreateOrganizationFormFields>({
    defaultValues: createOrganizationFormInitialValues,
    resolver: createOrganizationFormResolver,
    reValidateMode: "onBlur",
  });

  const nameValue = form.watch("name");

  useEffect(() => {
    if (isSlugManuallyEdited) {
      return;
    }

    const suggestedSlug = (nameValue ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    form.setValue("slug", suggestedSlug, { shouldValidate: Boolean(suggestedSlug) });
  }, [nameValue, isSlugManuallyEdited, form]);

  const handleSlugChange = (value: string) => {
    setIsSlugManuallyEdited(true);
    form.setValue("slug", value, { shouldValidate: true });
  };

  const onSubmit = async (values: TCreateOrganizationFormFields) => {
    try {
      const slug = values.slug?.trim();
      const createdOrg = await createOrganization({
        name: values.name.trim(),
        ...(slug ? { slug } : {}),
      }).unwrap();

      const setActiveResult = await organization.setActive({ organizationId: createdOrg.id });
      if (setActiveResult.error) {
        throw setActiveResult.error;
      }

      dispatch(projectApi.util.invalidateTags(["Permissions"]));
      await refetch();

      toast.success("Organization created successfully");
      router.replace(DASHBOARD_ROUTE);
    } catch (error) {
      toast.error("Failed to create organization", {
        description: parseApiErrorMessage(error),
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleSlugChange,
  };
};
