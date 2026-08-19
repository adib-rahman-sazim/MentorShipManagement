import { Migration } from "@mikro-orm/migrations";

export class Migration20260719102224_update_role_of_members extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "members" alter column "role" type text using ("role"::text);`);
    this.addSql(`alter table "members" alter column "role" drop not null;`);
    this.addSql(
      `alter table "members" add constraint "members_role_check" check("role" in ('super_admin', 'manager', 'customer'));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "members" drop constraint if exists "members_role_check";`);

    this.addSql(`alter table "members" alter column "role" type text using ("role"::text);`);
    this.addSql(`alter table "members" alter column "role" set not null;`);
  }
}
