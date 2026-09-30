import { Migration } from "@mikro-orm/migrations";

export class Migration20260912204214_add_user_permission_overrides extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "user_permission_overrides" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "permission_id" int not null, "effect" text check ("effect" in ('ALLOW', 'REVOKE')) not null, "granted_by_id" uuid not null, "reason" text null, "deleted_at" timestamptz null, constraint "user_permission_overrides_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "user_permission_overrides_user_id_index" on "user_permission_overrides" ("user_id");`,
    );
    this.addSql(
      `create index "user_permission_overrides_permission_id_index" on "user_permission_overrides" ("permission_id");`,
    );
    this.addSql(
      `create index "user_permission_overrides_granted_by_id_index" on "user_permission_overrides" ("granted_by_id");`,
    );
    this.addSql(
      `create index "user_permission_overrides_deleted_at_index" on "user_permission_overrides" ("deleted_at");`,
    );
    this.addSql(
      `create unique index "user_permission_overrides_live_user_id_permission_id_unique" on "user_permission_overrides" ("user_id", "permission_id") where "deleted_at" is null;`,
    );

    this.addSql(
      `alter table "user_permission_overrides" add constraint "user_permission_overrides_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "user_permission_overrides" add constraint "user_permission_overrides_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "user_permission_overrides" add constraint "user_permission_overrides_granted_by_id_foreign" foreign key ("granted_by_id") references "users" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_permission_overrides" cascade;`);
  }
}
