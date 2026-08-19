import { EPermission, EResource } from "@/shared/typedefs";

export interface INormalizedCaslRule {
  action: EPermission[];
  subject: Array<EResource | "all">;
  conditions?: Record<string, unknown>;
  inverted?: boolean;
  reason?: string;
  fields?: string[];
}

export interface IMyCaslRulesResponse {
  rules: INormalizedCaslRule[];
}
