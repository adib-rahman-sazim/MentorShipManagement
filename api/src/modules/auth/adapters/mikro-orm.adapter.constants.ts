import { ReferenceKind } from "@mikro-orm/core";

export const OWN_REFERENCE_KINDS = [
  ReferenceKind.SCALAR,
  ReferenceKind.ONE_TO_MANY,
  ReferenceKind.EMBEDDED,
];
