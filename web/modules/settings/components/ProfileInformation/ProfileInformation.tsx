import { UseFormReturn } from "react-hook-form";

import UpdateProfileInformationFormFields from "@/modules/settings/components/UpdateProfileInformationForm";
import { TUpdateProfileInformationFormFields } from "@/modules/settings/components/UpdateProfileInformationForm/UpdateProfileInformationForm.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/shadui/card";

const ProfileInformation = ({
  form,
}: {
  form: UseFormReturn<TUpdateProfileInformationFormFields>;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Profile Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <UpdateProfileInformationFormFields form={form} />
    </CardContent>
  </Card>
);

export default ProfileInformation;
