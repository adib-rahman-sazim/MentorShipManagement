import { IMentorshipGraphNodeResponse } from "@/shared/typedefs";

export interface IGraphPersonLinkProps {
  person: IMentorshipGraphNodeResponse;
  onSelect: (personId: string) => void;
}
