import type { TPersonDetails } from "@/modules/graph/graph.types";

export interface IPersonDetailsProps {
  details: TPersonDetails;
  onSelectPerson: (personId: string) => void;
}
