import type { TLinkDetails } from "@/modules/graph/graph.types";

export interface ILinkDetailsProps {
  details: TLinkDetails;
  onSelectPerson: (personId: string) => void;
}
