/* biome-ignore-all lint/suspicious/noExplicitAny lint/suspicious/noDoubleEquals: Better Auth adapter signatures require any and nullish loose equality. */
import type { EntityManager, EntityMetadata, EntityProperty, MikroORM } from "@mikro-orm/core";
import { ReferenceKind, serialize } from "@mikro-orm/core";

import { BetterAuthError } from "better-auth";
import { dset } from "dset";

import { OWN_REFERENCE_KINDS } from "./mikro-orm.adapter.constants";
import type { IAdapterUtils } from "./mikro-orm.adapter.interfaces";

export class MikroOrmAdapterUtils implements IAdapterUtils {
  private readonly naming;
  private readonly metadata;

  constructor(private readonly orm: MikroORM) {
    this.naming = this.orm.config.getNamingStrategy();
    this.metadata = this.orm.getMetadata();
  }

  normalizeEntityName(name: string): string {
    return this.naming.getEntityName(this.naming.classToTableName(name));
  }

  getEntityMetadata(entityName: string): EntityMetadata {
    const normalizedEntityName = this.normalizeEntityName(entityName);

    if (!this.metadata.has(normalizedEntityName)) {
      this.createAdapterError(
        `Cannot find metadata for "${normalizedEntityName}" entity. Make sure it defined and listed in your MikroORM config.`,
      );
    }

    return this.metadata.get(normalizedEntityName);
  }

  getFieldPath(metadata: EntityMetadata, fieldName: string, throwOnShadowProps = false): string[] {
    const prop = this.getPropertyMetadata(metadata, fieldName);

    if (prop.persist === false && throwOnShadowProps) {
      this.createAdapterError(
        `Cannot serialize "${fieldName}" into path, because it cannot be persisted in "${metadata.tableName}" table.`,
      );
    }

    if (prop.kind === ReferenceKind.SCALAR || prop.kind === ReferenceKind.EMBEDDED) {
      return [prop.name];
    }

    if (prop.kind === ReferenceKind.MANY_TO_ONE) {
      if (prop.referencedPKs.length > 1) {
        this.createAdapterError(
          `The "${fieldName}" field references to a table "${prop.name}" with complex primary key, which is not supported`,
        );
      }

      return [prop.name, this.naming.referenceColumnName()];
    }

    this.createAdapterError(
      `Cannot normalize "${fieldName}" field name into path for "${metadata.className}" entity.`,
    );
  }

  normalizeInput(
    metadata: EntityMetadata,
    input: Record<string, any>,
    em?: EntityManager,
  ): Record<string, any> {
    const fields: Record<string, any> = {};
    Object.entries(input).forEach(([key, value]) => {
      const property = this.getPropertyMetadata(metadata, key);
      const normalizedValue = em ? this.normalizePropertyValue(em, property, value) : value;

      dset(fields, [property.name], normalizedValue);
    });

    return fields;
  }

  normalizeOutput(
    metadata: EntityMetadata,
    output: Record<string, any>,
    _select?: string[],
  ): Record<string, any> {
    const serializedOutput = serialize(output);

    const result: Record<string, any> = {};
    Object.entries(serializedOutput)
      .map(([key, value]) => ({
        path: this.getReferencedPropertyName(metadata, this.getPropertyMetadata(metadata, key)),
        value,
      }))
      .forEach(({ path, value }) => dset(result, path, value));

    return result;
  }

  normalizeWhereClauses(metadata: EntityMetadata, where?: Array<Record<string, any>>) {
    if (!where) {
      return {};
    }

    if (where.length === 1) {
      const [w] = where;

      if (!w) {
        return {};
      }

      const path = this.getFieldPath(metadata, w.field, true);

      switch (w.operator) {
        case "in":
          return this.createWhereInClause(w.field, path, w.value);
        case "contains":
          return this.createWhereClause(path, `%${w.value}%`, "$like");
        case "starts_with":
          return this.createWhereClause(path, `${w.value}%`, "$like");
        case "ends_with":
          return this.createWhereClause(path, `%${w.value}`, "$like");
        case "gt":
        case "gte":
        case "lt":
        case "lte":
        case "ne":
          return this.createWhereClause(path, w.value, `$${w.operator}`);
        default:
          return this.createWhereClause(path, w.value);
      }
    }

    const result: Record<string, any> = {};

    where
      .filter(({ connector }) => !connector || connector === "AND")
      .forEach(({ field, operator, value }, index) => {
        const path = ["$and", index].concat(this.getFieldPath(metadata, field, true));

        if (operator === "in") {
          return this.createWhereInClause(field, path, value, result);
        }

        return this.createWhereClause(path, value, "eq", result);
      });

    where
      .filter(({ connector }) => connector === "OR")
      .forEach(({ field, value }, index) => {
        const path = ["$or", index].concat(this.getFieldPath(metadata, field, true));

        return this.createWhereClause(path, value, "eq", result);
      });

    return result;
  }

  private createAdapterError(message: string): never {
    throw new BetterAuthError(`[MikroORM Adapter] ${message}`);
  }

  private getPropertyMetadata(metadata: EntityMetadata, fieldName: string): EntityProperty {
    const prop = metadata.props.find((prop) => {
      if (OWN_REFERENCE_KINDS.includes(prop.kind) && prop.name === fieldName) {
        return true;
      }

      if (
        prop.kind === ReferenceKind.MANY_TO_ONE &&
        (prop.name === fieldName ||
          prop.fieldNames.includes(this.naming.propertyToColumnName(fieldName)))
      ) {
        return true;
      }

      return false;
    });

    if (!prop) {
      this.createAdapterError(
        `Can't find property "${fieldName}" on entity "${metadata.className}".`,
      );
    }

    return prop;
  }

  private getReferencedPropertyName(metadata: EntityMetadata, prop: EntityProperty) {
    return this.getReferencedColumnName(metadata.className, prop);
  }

  private getReferencedColumnName(entityName: string, prop: EntityProperty) {
    if (OWN_REFERENCE_KINDS.includes(prop.kind)) {
      return prop.name;
    }

    if (prop.kind === ReferenceKind.MANY_TO_ONE) {
      return this.naming.columnNameToProperty(this.naming.joinColumnName(prop.name));
    }

    this.createAdapterError(
      `Reference kind ${prop.kind} is not supported. Defined in "${entityName}" entity for "${prop.name}" field.`,
    );
  }

  private normalizePropertyValue(
    em: EntityManager,
    property: EntityProperty,
    value: unknown,
  ): unknown {
    if (
      !property.targetMeta ||
      property.kind === ReferenceKind.SCALAR ||
      property.kind === ReferenceKind.EMBEDDED
    ) {
      return value;
    }

    return em.getReference(property.targetMeta.class, value);
  }

  private createWhereClause(
    path: Array<string | number>,
    value: unknown,
    op?: string,
    target: Record<string, any> = {},
  ): Record<string, any> {
    dset(target, op == null || op === "eq" ? path : path.concat(op), value);

    return target;
  }

  private createWhereInClause(
    fieldName: string,
    path: Array<string | number>,
    value: unknown,
    target?: Record<string, any>,
  ): Record<string, any> {
    if (!Array.isArray(value)) {
      this.createAdapterError(
        `The value for the field "${fieldName}" must be an array when using the $in operator.`,
      );
    }

    return this.createWhereClause(path, value, "$in", target);
  }
}
