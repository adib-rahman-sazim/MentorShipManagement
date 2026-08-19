import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";
import CreateOrganizationPageSkeleton from "@/shared/components/skeletons/CreateOrganizationPageSkeleton";

import CreateOrganizationOnboardingForm from "../../components/CreateOrganizationOnboardingForm";
import { useCreateOrganizationOnboardingContainer } from "./CreateOrganizationOnboardingContainer.hooks";

const CreateOrganizationOnboardingContainer = () => {
  const { isLoading } = useCreateOrganizationOnboardingContainer();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <CreateOrganizationPageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create Your Organization</CardTitle>
          <CardDescription>Set up your organization to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationOnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrganizationOnboardingContainer;
