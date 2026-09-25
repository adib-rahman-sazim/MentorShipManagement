import { Lock } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/shadui/alert";

import {
  READ_ONLY_RECORD_DESCRIPTION,
  READ_ONLY_RECORD_TITLE,
} from "./ReadOnlyRecordNotice.constants";

const ReadOnlyRecordNotice = () => (
  <Alert>
    <Lock aria-hidden />
    <AlertTitle>{READ_ONLY_RECORD_TITLE}</AlertTitle>
    <AlertDescription>{READ_ONLY_RECORD_DESCRIPTION}</AlertDescription>
  </Alert>
);

export default ReadOnlyRecordNotice;
