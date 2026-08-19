import type { InferSubjects, MongoAbility, RawRuleOf } from "@casl/ability";

import type { ISubjectWithFields } from "@/modules/casl/casl.interfaces";
import type { EPermission, EResource } from "@/modules/permissions/permissions.enums";

export type TSubjects = InferSubjects<EResource | ISubjectWithFields> | "all";

export type TAppAbility = MongoAbility<[EPermission, TSubjects]>;

export type TAppRawRule = RawRuleOf<TAppAbility>;
