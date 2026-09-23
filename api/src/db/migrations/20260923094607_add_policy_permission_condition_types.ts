import { Migration } from "@mikro-orm/migrations";

export class Migration20260923094607_add_policy_permission_condition_types extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "permissions" drop constraint if exists "permissions_condition_type_check";`,
    );

    this.addSql(
      `alter table "permissions" add constraint "permissions_condition_type_check" check("condition_type" in ('none', 'self', 'subtree', 'hierarchy', 'not_author'));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `update "permissions" set "condition_type" = 'none' where "condition_type" in ('self', 'hierarchy', 'not_author');`,
    );

    this.addSql(
      `alter table "permissions" drop constraint if exists "permissions_condition_type_check";`,
    );

    this.addSql(
      `alter table "permissions" add constraint "permissions_condition_type_check" check("condition_type" in ('none', 'subtree'));`,
    );
  }
}
