import { Injectable } from "@nestjs/common";

import { AbstractBaseSerializer } from "@/common/serializers/abstract-base.serializer";
import type { TSerializationOptions } from "@/common/serializers/abstract-base-serializer.types";

@Injectable()
export class OrganizationsSerializer extends AbstractBaseSerializer {
  private readonly commonSerializationOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    exclude: ["members", "invitations", "metadata", "createdBy"],
  };

  protected serializeOneOptions: TSerializationOptions = this.commonSerializationOptions;

  protected serializeManyOptions: TSerializationOptions = this.commonSerializationOptions;
}
