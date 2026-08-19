import { InternalServerErrorException } from "@nestjs/common";

import { serialize } from "@mikro-orm/core";

import type { TSerializationOptions } from "./abstract-base-serializer.types";

export class AbstractBaseSerializer {
  protected serializeOneOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
  };

  protected serializeManyOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
  };

  serialize<E, S>(data: E, ..._args: unknown[]): S {
    if (!data) {
      throw new InternalServerErrorException("Data is required, received null or undefined");
    }
    // @ts-expect-error this is a valid call
    return serialize(data, this.serializeOneOptions);
  }

  serializeMany<E, S>(data: E[], ..._args: unknown[]): S[] {
    if (!data || data.length === 0) {
      return [];
    }

    // @ts-expect-error this is a valid call
    return serialize(data, this.serializeManyOptions);
  }
}
