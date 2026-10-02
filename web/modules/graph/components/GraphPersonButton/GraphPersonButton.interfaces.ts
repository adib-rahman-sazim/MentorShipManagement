import { IMentorshipGraphNodeResponse } from "@/shared/typedefs";

export interface IGraphPersonButtonProps {
  person: IMentorshipGraphNodeResponse;
  onSelect: (personId: string) => void;
}
