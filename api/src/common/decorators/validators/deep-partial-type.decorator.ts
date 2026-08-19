import type { Type } from "@nestjs/common";
import type { MappedType } from "@nestjs/mapped-types";
import {
  applyIsOptionalDecorator,
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
  PartialType,
} from "@nestjs/mapped-types";
import type { RemoveFieldsWithType } from "@nestjs/mapped-types/dist/types/remove-fields-with-type.type";

import { Type as CTType } from "class-transformer";

import type { DeepPartial } from "../../types/deep-partial.types";

export function DeepPartialType<T>(classRef: Type<T>) {
  abstract class DeepPartialClassType {
    constructor() {
      inheritPropertyInitializers(this, classRef);
    }
  }

  const propertyKeys = inheritValidationMetadata(classRef, DeepPartialClassType);
  inheritTransformationMetadata(classRef, DeepPartialClassType);

  if (propertyKeys) {
    propertyKeys.forEach((key) => {
      applyIsOptionalDecorator(DeepPartialClassType, key);
      CTType(() => PartialType(classRef))(DeepPartialClassType.prototype, key);
    });
  }

  Object.defineProperty(DeepPartialClassType, "name", {
    value: `DeepPartial${classRef.name}`,
  });

  return DeepPartialClassType as MappedType<
    // biome-ignore lint/complexity/noBannedTypes: Nest mapped-types helper expects Function here.
    RemoveFieldsWithType<DeepPartial<T>, Function>
  >;
}
