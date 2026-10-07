import type { EUserRole } from "@/shared/typedefs";

export interface IPreviewPerson {
  name: string;
  role: EUserRole;
  isProposed?: boolean;
  reports: IPreviewPerson[];
}
