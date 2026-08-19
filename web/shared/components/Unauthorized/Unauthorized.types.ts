import { EPermission, EResource } from "@/shared/typedefs";

export type TCanCheck = (action: EPermission, resource: EResource | "all") => boolean;
