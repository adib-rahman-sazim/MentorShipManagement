import { Migration } from "@mikro-orm/migrations";

export class Migration20261002133758_add_mentorship_draft_items extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "mentorship_draft_items" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "draft_id" uuid not null, "operation" text check ("operation" in ('ASSIGN', 'REASSIGN', 'UNASSIGN')) not null, "subordinate_id" uuid not null, "proposed_supervisor_id" uuid null, "expected_current_mentorship_id" uuid null, constraint "mentorship_draft_items_pkey" primary key ("id"), constraint mentorship_draft_items_proposed_supervisor_check check (("operation" = 'UNASSIGN' and "proposed_supervisor_id" is null) or ("operation" <> 'UNASSIGN' and "proposed_supervisor_id" is not null)));`,
    );
    this.addSql(
      `create index "mentorship_draft_items_subordinate_id_index" on "mentorship_draft_items" ("subordinate_id");`,
    );
    this.addSql(
      `alter table "mentorship_draft_items" add constraint "mentorship_draft_items_draft_id_subordinate_id_unique" unique ("draft_id", "subordinate_id");`,
    );

    this.addSql(
      `alter table "mentorship_draft_items" add constraint "mentorship_draft_items_draft_id_foreign" foreign key ("draft_id") references "mentorship_drafts" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "mentorship_draft_items" add constraint "mentorship_draft_items_subordinate_id_foreign" foreign key ("subordinate_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "mentorship_draft_items" add constraint "mentorship_draft_items_proposed_supervisor_id_foreign" foreign key ("proposed_supervisor_id") references "users" ("id") on update cascade on delete no action;`,
    );
    this.addSql(
      `alter table "mentorship_draft_items" add constraint "mentorship_draft_items_expected_current_mentorship_id_foreign" foreign key ("expected_current_mentorship_id") references "mentorships" ("id") on update cascade on delete no action;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "mentorship_draft_items" cascade;`);
  }
}
