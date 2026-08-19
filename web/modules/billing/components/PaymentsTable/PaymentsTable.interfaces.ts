import { EPaymentStatus } from "@/shared/typedefs/api";

export interface IPaymentTableRow {
  description: string;
  formattedAmount: string;
  formattedDate: string;
  id: string;
  shortId: string;
  status: EPaymentStatus;
  typeLabel: string;
}
