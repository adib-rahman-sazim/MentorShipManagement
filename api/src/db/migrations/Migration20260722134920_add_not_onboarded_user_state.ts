import { Migration } from "@mikro-orm/migrations";

export class Migration20260722134920_add_not_onboarded_user_state extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "users" drop constraint if exists "users_state_check";`);

    this.addSql(
      `alter table "users" add constraint "users_state_check" check("state" in ('UNREGISTERED', 'NOT_ONBOARDED', 'ACTIVE', 'INACTIVE'));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop constraint if exists "users_state_check";`);

    this.addSql(
      `alter table "users" add constraint "users_state_check" check("state" in ('UNREGISTERED', 'ACTIVE', 'INACTIVE'));`,
    );
  }
}
