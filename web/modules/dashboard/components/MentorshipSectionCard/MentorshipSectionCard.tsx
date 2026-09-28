import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";

import { IMentorshipSectionCardProps } from "./MentorshipSectionCard.interfaces";

const MentorshipSectionCard = ({ title, description, children }: IMentorshipSectionCardProps) => (
  <Card className="min-w-0 lg:flex-1">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default MentorshipSectionCard;
