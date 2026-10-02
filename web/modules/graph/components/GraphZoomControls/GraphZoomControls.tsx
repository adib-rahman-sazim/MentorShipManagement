import { Panel, useReactFlow, useViewport } from "@xyflow/react";
import { Maximize, Minus, Plus } from "lucide-react";

import { Button } from "@/shared/components/shadui/button";

import {
  FIT_VIEW_LABEL,
  ZOOM_GROUP_LABEL,
  ZOOM_IN_LABEL,
  ZOOM_OUT_LABEL,
} from "./GraphZoomControls.constants";
import { formatZoom } from "./GraphZoomControls.helpers";

const GraphZoomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <Panel position="bottom-left">
      <div
        role="group"
        aria-label={ZOOM_GROUP_LABEL}
        className="flex h-8 items-center rounded-lg bg-card p-0.5 shadow-xs ring-1 ring-foreground/10"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 text-muted-foreground"
          aria-label={ZOOM_OUT_LABEL}
          onClick={() => zoomOut()}
        >
          <Minus />
        </Button>
        <span className="w-11 text-center font-mono text-xs">{formatZoom(zoom)}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 text-muted-foreground"
          aria-label={ZOOM_IN_LABEL}
          onClick={() => zoomIn()}
        >
          <Plus />
        </Button>
        <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 text-muted-foreground"
          aria-label={FIT_VIEW_LABEL}
          onClick={() => fitView()}
        >
          <Maximize />
        </Button>
      </div>
    </Panel>
  );
};

export default GraphZoomControls;
