import { Migration } from "@mikro-orm/migrations";

export class Migration20260718134204_add_roles_and_permissions extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "permissions" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "code" varchar(255) not null, "resource" text check ("resource" in ('all', 'user', 'role', 'organization', 'member', 'invitation', 'permissions', 'dashboard', 'ai_chat', 'billing', 'settings', 'document_vector_store')) not null, "action" text check ("action" in ('page_view', 'list', 'read', 'create', 'update', 'delete', 'cancel', 'manage')) not null, "condition_type" text check ("condition_type" in ('none', 'organization_id', 'organization_resource_id')) not null default 'none', "denied" boolean not null default false, "description" text null);`,
    );
    this.addSql(
      `alter table "permissions" add constraint "permissions_code_unique" unique ("code");`,
    );

    this.addSql(
      `create table "roles" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "slug" varchar(255) not null, "description" text null, "is_system" boolean not null default false);`,
    );
    this.addSql(`alter table "roles" add constraint "roles_slug_unique" unique ("slug");`);

    this.addSql(
      `create table "roles_permissions" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "role_id" int not null, "permission_id" int not null, constraint "roles_permissions_pkey" primary key ("id"));`,
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
      `create table "user_roles" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "role_id" int not null, "organization_id" uuid null, constraint "user_roles_pkey" primary key ("id"));`,
    );
    this.addSql(`create index "user_roles_user_id_index" on "user_roles" ("user_id");`);
    this.addSql(`create index "user_roles_role_id_index" on "user_roles" ("role_id");`);
    this.addSql(
      `create index "user_roles_organization_id_index" on "user_roles" ("organization_id");`,
    );

    this.addSql(
      `alter table "roles_permissions" add constraint "roles_permissions_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "roles_permissions" add constraint "roles_permissions_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "user_roles" add constraint "user_roles_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "user_roles" add constraint "user_roles_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "user_roles" add constraint "user_roles_organization_id_foreign" foreign key ("organization_id") references "organizations" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "roles_permissions" drop constraint "roles_permissions_permission_id_foreign";`,
    );

    this.addSql(
      `alter table "roles_permissions" drop constraint "roles_permissions_role_id_foreign";`,
    );

    this.addSql(`alter table "user_roles" drop constraint "user_roles_role_id_foreign";`);

    this.addSql(`drop table if exists "permissions" cascade;`);

    this.addSql(`drop table if exists "roles" cascade;`);

    this.addSql(`drop table if exists "roles_permissions" cascade;`);

    this.addSql(`drop table if exists "user_roles" cascade;`);
  }
}
