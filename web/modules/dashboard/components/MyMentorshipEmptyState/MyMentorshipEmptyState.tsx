import { UsersRound } from "lucide-react";

import { Card, CardContent } from "@/shared/components/shadui/card";

import { EMPTY_STATE_DESCRIPTION, EMPTY_STATE_TITLE } from "./MyMentorshipEmptyState.constants";

const MyMentorshipEmptyState = () => (
  <Card>
    <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <UsersRound className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-base font-semibold">{EMPTY_STATE_TITLE}</p>
      <p className="max-w-md text-sm text-muted-foreground">{EMPTY_STATE_DESCRIPTION}</p>
    </CardContent>
  </Card>
);

export default MyMentorshipEmptyState;
