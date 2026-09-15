import { Migration } from "@mikro-orm/migrations";

export class Migration20260822100802_mms_baseline extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "permissions" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "code" varchar(255) not null, "resource" text check ("resource" in ('all', 'user', 'role', 'permissions', 'dashboard', 'settings')) not null, "action" text check ("action" in ('page_view', 'list', 'read', 'create', 'update', 'delete', 'manage')) not null, "condition_type" text check ("condition_type" in ('none')) not null default 'none', "denied" boolean not null default false, "description" text null);`,
    );
    this.addSql(
      `alter table "permissions" add constraint "permissions_code_unique" unique ("code");`,
    );

    this.addSql(
      `create table "roles" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "code" text check ("code" in ('SUPERADMIN', 'SENSEI', 'MENTOR', 'MENTEE')) not null, "name" varchar(255) not null, constraint "roles_pkey" primary key ("id"));`,
    );
    this.addSql(`alter table "roles" add constraint "roles_code_unique" unique ("code");`);

    this.addSql(
      `create table "roles_permissions" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "role_id" uuid not null, "permission_id" int not null, constraint "roles_permissions_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "roles_permissions_role_id_index" on "roles_permissions" ("role_id");`,
    );
    this.addSql(
      `create index "roles_permissions_permission_id_index" on "roles_permissions" ("permission_id");`,
    );
    this.addSql(
      `alter table "roles_permissions" add constraint "roles_permissions_role_id_permission_id_unique" unique ("role_id", "permission_id");`,
    );

    this.addSql(
      `create table "users" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "email" varchar(255) not null, "email_verified" boolean not null default false, "full_name" varchar(255) not null, "image" varchar(255) null, "role_id" uuid not null, "state" text check ("state" in ('ACTIVE', 'INACTIVE')) not null default 'ACTIVE', "deleted_at" timestamptz null, constraint "users_pkey" primary key ("id"));`,
    );
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
    this.addSql(`create index "users_role_id_index" on "users" ("role_id");`);
    this.addSql(`create index "users_deleted_at_index" on "users" ("deleted_at");`);

    this.addSql(
      `create table "sessions" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "token" varchar(255) not null, "user_id" uuid not null, "expires_at" timestamptz not null, "ip_address" varchar(255) null, "user_agent" text null, constraint "sessions_pkey" primary key ("id"));`,
    );
    this.addSql(`alter table "sessions" add constraint "sessions_token_unique" unique ("token");`);
    this.addSql(`create index "sessions_user_id_index" on "sessions" ("user_id");`);

    this.addSql(
      `create table "accounts" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "account_id" varchar(255) not null, "provider_id" varchar(255) not null, "access_token" text null, "access_token_expires_at" timestamptz null, "refresh_token" text null, "refresh_token_expires_at" timestamptz null, "id_token" text null, "expires_at" timestamptz null, "scope" varchar(255) null, "password" varchar(255) null, constraint "accounts_pkey" primary key ("id"));`,
    );
    this.addSql(`create index "accounts_user_id_index" on "accounts" ("user_id");`);
    this.addSql(
      `alter table "accounts" add constraint "accounts_provider_id_account_id_unique" unique ("provider_id", "account_id");`,
    );

    this.addSql(
      `create table "verifications" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "identifier" varchar(255) not null, "value" varchar(255) not null, "expires_at" timestamptz not null, constraint "verifications_pkey" primary key ("id"));`,
    );
    this.addSql(`create index "verifications_identifier_index" on "verifications" ("identifier");`);

    this.addSql(
      `alter table "roles_permissions" add constraint "roles_permissions_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "roles_permissions" add constraint "roles_permissions_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "users" add constraint "users_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "sessions" add constraint "sessions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "accounts" add constraint "accounts_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "roles_permissions" drop constraint "roles_permissions_permission_id_foreign";`,
    );

    this.addSql(
      `alter table "roles_permissions" drop constraint "roles_permissions_role_id_foreign";`,
    );

    this.addSql(`alter table "users" drop constraint "users_role_id_foreign";`);

    this.addSql(`alter table "sessions" drop constraint "sessions_user_id_foreign";`);

    this.addSql(`alter table "accounts" drop constraint "accounts_user_id_foreign";`);

    this.addSql(`drop table if exists "permissions" cascade;`);

    this.addSql(`drop table if exists "roles" cascade;`);

    this.addSql(`drop table if exists "roles_permissions" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "sessions" cascade;`);

    this.addSql(`drop table if exists "accounts" cascade;`);

    this.addSql(`drop table if exists "verifications" cascade;`);
  }
}
