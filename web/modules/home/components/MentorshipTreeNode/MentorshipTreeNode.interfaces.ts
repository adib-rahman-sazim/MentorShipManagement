import type { IPreviewPerson } from "@/modules/home/home.interfaces";

export interface IMentorshipTreeNodeProps {
  person: IPreviewPerson;
  depth: number;
}
