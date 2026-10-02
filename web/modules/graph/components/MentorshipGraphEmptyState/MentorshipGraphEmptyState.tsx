import { Network } from "lucide-react";

import { Card, CardContent } from "@/shared/components/shadui/card";

import { GRAPH_EMPTY_DESCRIPTION, GRAPH_EMPTY_TITLE } from "./MentorshipGraphEmptyState.constants";

const MentorshipGraphEmptyState = () => (
  <Card>
    <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Network className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-base font-semibold">{GRAPH_EMPTY_TITLE}</p>
      <p className="max-w-md text-sm text-muted-foreground">{GRAPH_EMPTY_DESCRIPTION}</p>
    </CardContent>
  </Card>
);

export default MentorshipGraphEmptyState;
