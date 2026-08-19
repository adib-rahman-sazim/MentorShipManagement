import { Avatar, AvatarFallback } from "@/shared/components/shadui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/shadui/card";
import { Input } from "@/shared/components/shadui/input";
import { Label } from "@/shared/components/shadui/label";
import { ICurrentUserProfileResponse } from "@/shared/redux/rtk-apis/user-profiles/user-profiles.interfaces";

const GeneralInformation = ({ userProfile }: { userProfile: ICurrentUserProfileResponse }) => (
  <Card className="mb-6 w-full">
    <CardHeader>
      <CardTitle>General Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarFallback>
            {userProfile.firstName[0]}
            {userProfile.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={userProfile.email} disabled className="bg-muted" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default GeneralInformation;
