import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { TCreateOrganizationFormFields } from "./CreateOrganizationDialog.types";

export const createOrganizationFormInitialValues: TCreateOrganizationFormFields = {
  name: "",
  slug: "",
};

export const createOrganizationFormValidationSchema: z.ZodType<TCreateOrganizationFormFields> =
  z.object({
    name: z.string().min(1, "Required").max(255),
    slug: z
      .string()
      .max(255)
      .refine((value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
        message: "Slug must be lowercase alphanumeric with hyphens",
      })
      .optional(),
  });

export const createOrganizationFormResolver = zodResolver(createOrganizationFormValidationSchema);
