import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/shadui/alert";
import { Button } from "@/shared/components/shadui/button";

import { LOAD_ERROR_TITLE, RETRY_LABEL } from "./MyMentorshipLoadError.constants";
import { IMyMentorshipLoadErrorProps } from "./MyMentorshipLoadError.interfaces";

const MyMentorshipLoadError = ({ message, onRetry }: IMyMentorshipLoadErrorProps) => (
  <div className="space-y-4">
    <Alert variant="destructive">
      <AlertCircle aria-hidden />
      <AlertTitle>{LOAD_ERROR_TITLE}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
    <Button variant="outline" onClick={onRetry}>
      {RETRY_LABEL}
    </Button>
  </div>
);

export default MyMentorshipLoadError;
