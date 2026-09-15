import { Migration } from "@mikro-orm/migrations";

export class Migration20260915115711_create_mentorship_drafts extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "mentorship_drafts" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "status" text check ("status" in ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'CANCELLED')) not null default 'DRAFT', "created_by_id" uuid not null, "reviewed_by_id" uuid null, "approved_by_id" uuid null, "published_by_id" uuid null, "decision_comment" text null, "deleted_at" timestamptz null, constraint "mentorship_drafts_pkey" primary key ("id"));`,
    );
    this.addSql(`create index "mentorship_drafts_status_index" on "mentorship_drafts" ("status");`);
    this.addSql(
      `create index "mentorship_drafts_created_by_id_index" on "mentorship_drafts" ("created_by_id");`,
    );
    this.addSql(
      `create index "mentorship_drafts_deleted_at_index" on "mentorship_drafts" ("deleted_at");`,
    );

    this.addSql(
      `alter table "mentorship_drafts" add constraint "mentorship_drafts_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "mentorship_drafts" add constraint "mentorship_drafts_reviewed_by_id_foreign" foreign key ("reviewed_by_id") references "users" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "mentorship_drafts" add constraint "mentorship_drafts_approved_by_id_foreign" foreign key ("approved_by_id") references "users" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "mentorship_drafts" add constraint "mentorship_drafts_published_by_id_foreign" foreign key ("published_by_id") references "users" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "mentorship_drafts" cascade;`);
  }
}
