import { Panel } from "@xyflow/react";
import { Lock } from "lucide-react";

import { READ_ONLY_HINTS } from "./DraftReadOnlyHint.constants";
import { IDraftReadOnlyHintProps } from "./DraftReadOnlyHint.interfaces";

const DraftReadOnlyHint = ({ status }: IDraftReadOnlyHintProps) => (
  <Panel position="top-center">
    <p
      role="status"
      className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-xs"
    >
      <Lock aria-hidden className="size-3.5 shrink-0" />
      {READ_ONLY_HINTS[status]}
    </p>
  </Panel>
);

export default DraftReadOnlyHint;
