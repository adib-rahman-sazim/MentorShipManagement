import type { EComponentExampleStatus } from "./ComponentExamplesTable.enums";

export interface IComponentExampleRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: EComponentExampleStatus;
  createdAt: string;
}
