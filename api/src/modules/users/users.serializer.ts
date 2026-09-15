import { Injectable } from "@nestjs/common";

import type { EUserRole } from "@/common/enums/roles.enums";
import { AbstractBaseSerializer } from "@/common/serializers/abstract-base.serializer";
import type { TSerializationOptions } from "@/common/serializers/abstract-base-serializer.types";

import { ROLE_CODE_FIELD, ROLE_FIELD } from "./users.constants";

@Injectable()
export class UsersSerializer extends AbstractBaseSerializer {
  private readonly commonSerializationOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    exclude: ["sessions", "accounts"],
    populate: [ROLE_FIELD],
  };

  protected serializeOneOptions: TSerializationOptions = this.commonSerializationOptions;

  protected serializeManyOptions: TSerializationOptions = this.commonSerializationOptions;

  serialize<E, S>(data: E, ...args: unknown[]): S {
    return this.flattenRole(
      super.serialize<E, Record<string, unknown>>(data, ...args),
    ) as unknown as S;
  }

  serializeMany<E, S>(data: E[], ...args: unknown[]): S[] {
    return super
      .serializeMany<E, Record<string, unknown>>(data, ...args)
      .map((user) => this.flattenRole(user) as unknown as S);
  }

  /**
   * MikroORM serializes the populated `role` relation as a full Role object.
   * Consumers only ever need the code, and both `request.user.role` and the
   * Better Auth session payload already expose it as a flat `EUserRole`, so
   * collapse it here to keep a single role shape across the API.
   */
  private flattenRole(user: Record<string, unknown>): Record<string, unknown> {
    const role = user[ROLE_FIELD];

    if (role && typeof role === "object" && ROLE_CODE_FIELD in role) {
      return { ...user, [ROLE_FIELD]: (role as { code: EUserRole }).code };
    }

    return user;
  }
}
