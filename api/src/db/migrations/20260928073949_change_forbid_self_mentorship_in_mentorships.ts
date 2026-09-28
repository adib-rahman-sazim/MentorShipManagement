import { Migration } from "@mikro-orm/migrations";

export class Migration20260928073949_change_forbid_self_mentorship_in_mentorships extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "mentorships" add constraint mentorships_supervisor_not_subordinate_check check("supervisor_id" <> "subordinate_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "mentorships" drop constraint mentorships_supervisor_not_subordinate_check;`,
    );
  }
}
