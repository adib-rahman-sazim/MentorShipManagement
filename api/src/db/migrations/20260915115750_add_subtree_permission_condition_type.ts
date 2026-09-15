import { Migration } from "@mikro-orm/migrations";

export class Migration20260915115750_add_subtree_permission_condition_type extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "permissions" drop constraint if exists "permissions_condition_type_check";`,
    );

    this.addSql(
      `alter table "permissions" add constraint "permissions_condition_type_check" check("condition_type" in ('none', 'subtree'));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `update "permissions" set "condition_type" = 'none' where "condition_type" = 'subtree';`,
    );

    this.addSql(
      `alter table "permissions" drop constraint if exists "permissions_condition_type_check";`,
    );

    this.addSql(
      `alter table "permissions" add constraint "permissions_condition_type_check" check("condition_type" in ('none'));`,
    );
  }
}
