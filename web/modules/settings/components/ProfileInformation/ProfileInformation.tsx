import { UseFormReturn } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/shadui/card";
import {
  ICurrentUserProfileResponse,
  IUpdateProfileDto,
} from "@/shared/redux/rtk-apis/user-profiles/user-profiles.interfaces";

import UpdateProfileInformationFormFields from "../UpdateProfileInformationForm";

const ProfileInformation = ({
  form,
}: {
  userProfile: ICurrentUserProfileResponse;
  form: UseFormReturn<IUpdateProfileDto>;
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
