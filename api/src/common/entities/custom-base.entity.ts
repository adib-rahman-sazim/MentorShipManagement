import { Entity, OptionalProps, Property } from "@mikro-orm/core";

import dayjs from "dayjs";

@Entity({ abstract: true })
export abstract class CustomBaseEntity {
  [OptionalProps]?: "createdAt" | "updatedAt";

  @Property({ fieldName: "created_at" })
  createdAt: Date = dayjs().toDate();

  @Property({ fieldName: "updated_at", onUpdate: () => dayjs().toDate() })
  updatedAt: Date = dayjs().toDate();
}
