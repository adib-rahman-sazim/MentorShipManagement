import { Migration } from "@mikro-orm/migrations";

export class Migration20260915115731_create_mentorships extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "mentorships" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "supervisor_id" uuid not null, "subordinate_id" uuid not null, "relationship_type" text check ("relationship_type" in ('SENSEI_MENTOR', 'MENTOR_MENTEE')) not null, "status" text check ("status" in ('ACTIVE', 'ENDED')) not null default 'ACTIVE', "started_at" timestamptz not null, "ended_at" timestamptz null, "started_by_draft_id" uuid null, "ended_by_draft_id" uuid null, "deleted_at" timestamptz null, constraint "mentorships_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "mentorships_supervisor_id_index" on "mentorships" ("supervisor_id");`,
    );
    this.addSql(
      `create index "mentorships_subordinate_id_index" on "mentorships" ("subordinate_id");`,
    );
    this.addSql(`create index "mentorships_deleted_at_index" on "mentorships" ("deleted_at");`);
    this.addSql(
      `create unique index "mentorships_active_subordinate_unique" on "mentorships" ("subordinate_id") where "status" = 'ACTIVE' and "deleted_at" is null;`,
    );

    this.addSql(
      `alter table "mentorships" add constraint "mentorships_supervisor_id_foreign" foreign key ("supervisor_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "mentorships" add constraint "mentorships_subordinate_id_foreign" foreign key ("subordinate_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "mentorships" add constraint "mentorships_started_by_draft_id_foreign" foreign key ("started_by_draft_id") references "mentorship_drafts" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "mentorships" add constraint "mentorships_ended_by_draft_id_foreign" foreign key ("ended_by_draft_id") references "mentorship_drafts" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "mentorships" cascade;`);
  }
}
