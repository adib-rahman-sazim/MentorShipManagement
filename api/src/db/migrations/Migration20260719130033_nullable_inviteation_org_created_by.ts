import { Migration } from "@mikro-orm/migrations";

export class Migration20260719130033_nullable_invitation_org_created_by extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "invitations" drop constraint "invitations_organization_id_foreign";`);

    this.addSql(`alter table "organizations" add column "created_by" uuid null;`);
    this.addSql(
      `alter table "organizations" add constraint "organizations_created_by_foreign" foreign key ("created_by") references "users" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "invitations" add column "first_name" text null, add column "last_name" text null, add column "token" text null;`,
    );
    this.addSql(`alter table "invitations" alter column "organization_id" drop default;`);
    this.addSql(
      `alter table "invitations" alter column "organization_id" type uuid using ("organization_id"::text::uuid);`,
    );
    this.addSql(`alter table "invitations" alter column "organization_id" drop not null;`);
    this.addSql(
      `alter table "invitations" add constraint "invitations_organization_id_foreign" foreign key ("organization_id") references "organizations" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "invitations" add constraint "invitations_token_unique" unique ("token");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "invitations" drop constraint "invitations_organization_id_foreign";`);

    this.addSql(`alter table "organizations" drop constraint "organizations_created_by_foreign";`);

    this.addSql(`alter table "invitations" drop constraint "invitations_token_unique";`);
    this.addSql(
      `alter table "invitations" drop column "first_name", drop column "last_name", drop column "token";`,
    );

    this.addSql(`alter table "invitations" alter column "organization_id" drop default;`);
    this.addSql(
      `alter table "invitations" alter column "organization_id" type uuid using ("organization_id"::text::uuid);`,
    );
    this.addSql(`alter table "invitations" alter column "organization_id" set not null;`);
    this.addSql(
      `alter table "invitations" add constraint "invitations_organization_id_foreign" foreign key ("organization_id") references "organizations" ("id") on update cascade on delete no action;`,
    );

    this.addSql(`alter table "organizations" drop column "created_by";`);
  }
}
