import { Injectable } from "@nestjs/common";

import { AbstractBaseSerializer } from "@/common/serializers/abstract-base.serializer";
import type { TSerializationOptions } from "@/common/serializers/abstract-base-serializer.types";

@Injectable()
export class UsersSerializer extends AbstractBaseSerializer {
  private readonly commonSerializationOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    exclude: ["sessions", "accounts", "memberships"],
  };

  protected serializeOneOptions: TSerializationOptions = this.commonSerializationOptions;

  protected serializeManyOptions: TSerializationOptions = this.commonSerializationOptions;

  serializeInviteResult(message: string, success = true): { success: boolean; message: string } {
    return { success, message };
  }
}
