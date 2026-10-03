import { Panel, useConnection } from "@xyflow/react";

import { getConnectionHint } from "./DraftConnectionHint.helpers";
import { IDraftConnectionHintProps } from "./DraftConnectionHint.interfaces";

const DraftConnectionHint = ({ context, movingSubordinateId }: IDraftConnectionHintProps) => {
  const connection = useConnection();

  return connection.inProgress ? (
    <Panel position="top-center">
      <p className="rounded-md border bg-background px-3 py-1.5 text-xs shadow-xs" role="status">
        {getConnectionHint(connection.fromNode.id, connection.fromHandle.type === "source", {
          ...context,
          movingSubordinateId,
        })}
      </p>
    </Panel>
  ) : null;
};

export default DraftConnectionHint;
