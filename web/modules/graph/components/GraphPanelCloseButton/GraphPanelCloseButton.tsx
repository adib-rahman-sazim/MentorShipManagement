import { X } from "lucide-react";

import { Button } from "@/shared/components/shadui/button";

import { CLOSE_PANEL_LABEL } from "./GraphPanelCloseButton.constants";
import { IGraphPanelCloseButtonProps } from "./GraphPanelCloseButton.interfaces";

const GraphPanelCloseButton = ({ onClose }: IGraphPanelCloseButtonProps) => (
  <Button
    variant="ghost"
    size="icon-sm"
    className="absolute top-3 right-3 text-muted-foreground"
    aria-label={CLOSE_PANEL_LABEL}
    title={CLOSE_PANEL_LABEL}
    onClick={onClose}
  >
    <X />
  </Button>
);

export default GraphPanelCloseButton;
