import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/shadui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadui/form";
import { Input } from "@/shared/components/shadui/input";

import { useCreateOrganizationOnboardingForm } from "./CreateOrganizationOnboardingForm.hooks";

const CreateOrganizationOnboardingForm = () => {
  const { form, onSubmit, handleSlugChange } = useCreateOrganizationOnboardingForm();
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} placeholder="Organization name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  placeholder="my-organization"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(event) => handleSlugChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner /> : null}
          Create Organization
        </Button>
      </form>
    </Form>
  );
};

export default CreateOrganizationOnboardingForm;
