/* biome-ignore-all lint/suspicious/noExplicitAny: Better Auth adapter signatures require any. */
import type { EntityMetadata } from "@mikro-orm/core";

import { ROLE_FIELD_NAME, USER_ENTITY_NAME } from "./mikro-orm.adapter.constants";

export class MikroOrmAdapterUserInputSanitizer {
  sanitize(metadata: EntityMetadata, input: Record<string, any>): Record<string, any> {
    if (metadata.className !== USER_ENTITY_NAME || !(ROLE_FIELD_NAME in input)) {
      return input;
    }

    const { role: _role, ...strippedInput } = input;
    return strippedInput;
  }
}
