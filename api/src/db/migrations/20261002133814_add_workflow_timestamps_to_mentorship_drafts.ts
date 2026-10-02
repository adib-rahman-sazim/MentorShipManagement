import { Migration } from "@mikro-orm/migrations";

export class Migration20261002133814_add_workflow_timestamps_to_mentorship_drafts extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "mentorship_drafts" add column "cancelled_by_id" uuid null, add column "submitted_at" timestamptz null, add column "decided_at" timestamptz null, add column "published_at" timestamptz null, add column "cancelled_at" timestamptz null;`,
    );
    this.addSql(
      `alter table "mentorship_drafts" add constraint "mentorship_drafts_cancelled_by_id_foreign" foreign key ("cancelled_by_id") references "users" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "mentorship_drafts" drop constraint "mentorship_drafts_cancelled_by_id_foreign";`,
    );

    this.addSql(
      `alter table "mentorship_drafts" drop column "cancelled_by_id", drop column "submitted_at", drop column "decided_at", drop column "published_at", drop column "cancelled_at";`,
    );
  }
}
