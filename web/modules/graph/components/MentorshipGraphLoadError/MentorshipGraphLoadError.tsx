import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/shadui/alert";
import { Button } from "@/shared/components/shadui/button";

import { GRAPH_LOAD_ERROR_TITLE, GRAPH_RETRY_LABEL } from "./MentorshipGraphLoadError.constants";
import { IMentorshipGraphLoadErrorProps } from "./MentorshipGraphLoadError.interfaces";

const MentorshipGraphLoadError = ({ message, onRetry }: IMentorshipGraphLoadErrorProps) => (
  <div className="space-y-4">
    <Alert variant="destructive">
      <AlertCircle aria-hidden />
      <AlertTitle>{GRAPH_LOAD_ERROR_TITLE}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
    <Button variant="outline" onClick={onRetry}>
      {GRAPH_RETRY_LABEL}
    </Button>
  </div>
);

export default MentorshipGraphLoadError;
