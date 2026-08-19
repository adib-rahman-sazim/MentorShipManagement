import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/shadui/button";
import { Form } from "@/shared/components/shadui/form";
import FormSkeleton from "@/shared/components/skeletons/FormSkeleton";
import { useGetUserProfileQuery } from "@/shared/redux/rtk-apis/user-profiles/user-profiles.api";

import GeneralInformation from "../../components/GeneralInformation";
import ProfileInformation from "../../components/ProfileInformation";
import { useUpdateUserProfileInformationForm } from "../../components/UpdateProfileInformationForm";

const SettingsContainer = () => {
  const { data, isLoading } = useGetUserProfileQuery();

  const { form, onSubmit } = useUpdateUserProfileInformationForm(data);
  const isSubmitting = form.formState.isSubmitting;

  if (isLoading) {
    return <FormSkeleton fields={4} showSubmitButton />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-6 w-full">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Form {...form}>
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <GeneralInformation userProfile={data} />

          <ProfileInformation userProfile={data} form={form} />

          <Button type="submit" className="mt-6" disabled={!form.formState.isDirty}>
            {isSubmitting ? <LoadingSpinner /> : null}
            {isSubmitting ? "Updating..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SettingsContainer;
