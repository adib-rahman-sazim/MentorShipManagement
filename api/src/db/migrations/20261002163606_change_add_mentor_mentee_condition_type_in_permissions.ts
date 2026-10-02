import { Migration } from "@mikro-orm/migrations";

export class Migration20261002163606_change_add_mentor_mentee_condition_type_in_permissions extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "permissions" drop constraint if exists "permissions_condition_type_check";`,
    );

    this.addSql(
      `alter table "permissions" add constraint "permissions_condition_type_check" check("condition_type" in ('none', 'self', 'subtree', 'hierarchy', 'not_author', 'mentor_mentee'));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "permissions" drop constraint if exists "permissions_condition_type_check";`,
    );

    this.addSql(
      `update "permissions" set "condition_type" = 'none' where "condition_type" = 'mentor_mentee';`,
    );

    this.addSql(
      `alter table "permissions" add constraint "permissions_condition_type_check" check("condition_type" in ('none', 'self', 'subtree', 'hierarchy', 'not_author'));`,
    );
  }
}
