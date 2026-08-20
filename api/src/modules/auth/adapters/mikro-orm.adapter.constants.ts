import { ReferenceKind } from "@mikro-orm/core";

export const USER_ENTITY_NAME = "User";
export const SESSION_ENTITY_NAME = "Session";
export const OWN_REFERENCE_KINDS = [
  ReferenceKind.SCALAR,
  ReferenceKind.ONE_TO_MANY,
  ReferenceKind.EMBEDDED,
];
