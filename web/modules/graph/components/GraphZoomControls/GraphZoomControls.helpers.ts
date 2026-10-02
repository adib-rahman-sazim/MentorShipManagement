import { PERCENT } from "./GraphZoomControls.constants";

export function formatZoom(zoom: number): string {
  return `${Math.round(zoom * PERCENT)}%`;
}
