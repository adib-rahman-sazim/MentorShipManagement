import { Migration } from "@mikro-orm/migrations";

export class Migration20260912155524_mms_domain_permission_codes extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "permissions" drop constraint if exists "permissions_resource_check";`,
    );
    this.addSql(`alter table "permissions" drop constraint if exists "permissions_action_check";`);

    this.addSql(
      `alter table "permissions" add constraint "permissions_resource_check" check("resource" in ('all', 'user', 'role', 'permissions', 'dashboard', 'settings', 'mentorship', 'draft', 'mentorship_graph'));`,
    );
    this.addSql(
      `alter table "permissions" add constraint "permissions_action_check" check("action" in ('page_view', 'list', 'read', 'create', 'update', 'delete', 'manage', 'assign', 'review', 'approve'));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `delete from "roles_permissions" where "permission_id" in (select "id" from "permissions" where "resource" in ('mentorship', 'draft', 'mentorship_graph') or "action" in ('assign', 'review', 'approve'));`,
    );

    this.addSql(
      `delete from "permissions" where "resource" in ('mentorship', 'draft', 'mentorship_graph') or "action" in ('assign', 'review', 'approve');`,
    );

    this.addSql(
      `alter table "permissions" drop constraint if exists "permissions_resource_check";`,
    );

    this.addSql(`alter table "permissions" drop constraint if exists "permissions_action_check";`);

    this.addSql(
      `alter table "permissions" add constraint "permissions_resource_check" check("resource" in ('all', 'user', 'role', 'permissions', 'dashboard', 'settings'));`,
    );

    this.addSql(
      `alter table "permissions" add constraint "permissions_action_check" check("action" in ('page_view', 'list', 'read', 'create', 'update', 'delete', 'manage'));`,
    );
  }
}
