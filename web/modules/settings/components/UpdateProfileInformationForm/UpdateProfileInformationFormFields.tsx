import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadui/form";
import { Input } from "@/shared/components/shadui/input";

import {
  PROFILE_NAME_LABEL,
  PROFILE_NAME_PLACEHOLDER,
} from "./UpdateProfileInformationForm.constants";
import { TUpdateProfileInformationFormFields } from "./UpdateProfileInformationForm.types";

const UpdateProfileInformationFormFields = ({
  form,
}: {
  form: UseFormReturn<TUpdateProfileInformationFormFields>;
}) => {
  const isSubmitting = form.formState.isSubmitting;

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{PROFILE_NAME_LABEL}</FormLabel>
          <FormControl>
            <Input placeholder={PROFILE_NAME_PLACEHOLDER} disabled={isSubmitting} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UpdateProfileInformationFormFields;