import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/shadui/card";

import { IMentorshipSectionCardProps } from "./MentorshipSectionCard.interfaces";

const MentorshipSectionCard = ({ title, children }: IMentorshipSectionCardProps) => (
  <Card className="min-w-0 lg:flex-1">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default MentorshipSectionCard;
