import { Migration } from "@mikro-orm/migrations";

export class Migration20260930120000_remove_granted_by_id_in_user_permission_overrides extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user_permission_overrides" drop constraint "user_permission_overrides_granted_by_id_foreign";`,
    );
    this.addSql(`drop index "user_permission_overrides_granted_by_id_index";`);
    this.addSql(`alter table "user_permission_overrides" drop column "granted_by_id";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user_permission_overrides" add column "granted_by_id" uuid null;`);
    this.addSql(
      `create index "user_permission_overrides_granted_by_id_index" on "user_permission_overrides" ("granted_by_id");`,
    );
    this.addSql(
      `alter table "user_permission_overrides" add constraint "user_permission_overrides_granted_by_id_foreign" foreign key ("granted_by_id") references "users" ("id") on update cascade;`,
    );
  }
}
