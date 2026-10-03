import { Migration } from "@mikro-orm/migrations";

export class Migration20261003064218_change_add_publish_action_in_permissions extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "permissions" drop constraint if exists "permissions_action_check";`);

    this.addSql(
      `alter table "permissions" add constraint "permissions_action_check" check("action" in ('page_view', 'list', 'read', 'create', 'update', 'delete', 'manage', 'assign', 'review', 'approve', 'publish'));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `delete from "user_permission_overrides" where "permission_id" in (select "id" from "permissions" where "action" = 'publish');`,
    );

    this.addSql(
      `delete from "roles_permissions" where "permission_id" in (select "id" from "permissions" where "action" = 'publish');`,
    );

    this.addSql(`delete from "permissions" where "action" = 'publish';`);

    this.addSql(`alter table "permissions" drop constraint if exists "permissions_action_check";`);

    this.addSql(
      `alter table "permissions" add constraint "permissions_action_check" check("action" in ('page_view', 'list', 'read', 'create', 'update', 'delete', 'manage', 'assign', 'review', 'approve'));`,
    );
  }
}
