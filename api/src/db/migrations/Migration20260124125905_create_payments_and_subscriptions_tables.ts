import { Migration } from "@mikro-orm/migrations";

export class Migration20260124125905_create_payments_and_subscriptions_tables extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "subscriptions" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "provider_subscription_id" varchar(255) not null, "customer_id" varchar(255) not null, "price_id" varchar(255) not null, "current_period_start_at" timestamptz not null, "current_period_end_at" timestamptz not null, "cancel_at_period_end" boolean not null default false, "status" text check ("status" in (\'active\', \'cancelled\', \'incomplete\', \'incomplete_expired\', \'past_due\', \'paused\', \'trialing\', \'unpaid\')) not null, "metadata" jsonb null, "user_id" uuid null, constraint "subscriptions_pkey" primary key ("id"));',
    );
    this.addSql(
      'create index "subscriptions_user_id_price_id_status_index" on "subscriptions" ("user_id", "price_id", "status");',
    );
    this.addSql(
      'alter table "subscriptions" add constraint "subscriptions_provider_subscription_id_customer_id_unique" unique ("provider_subscription_id", "customer_id");',
    );

    this.addSql(
      'create table "payments" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "type" text check ("type" in (\'recurring\', \'one_off\')) not null, "external_id" varchar(255) not null, "subscription_id" uuid null, "product_id" varchar(255) null, "price_id" varchar(255) null, "quantity" int null, "provider" text check ("provider" in (\'stripe\')) not null, "amount" int not null, "currency" text check ("currency" in (\'usd\')) not null, "description" varchar(255) null, "status" text check ("status" in (\'pending\', \'succeeded\', \'failed\')) not null default \'pending\', "metadata" jsonb null, "user_id" uuid not null, constraint "payments_pkey" primary key ("id"));',
    );
    this.addSql(
      'alter table "payments" add constraint "payments_external_id_unique" unique ("external_id");',
    );
    this.addSql(
      'create index "payments_user_id_created_at_index" on "payments" ("user_id", "created_at");',
    );

    this.addSql(
      'alter table "subscriptions" add constraint "subscriptions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete set null;',
    );

    this.addSql(
      'alter table "payments" add constraint "payments_subscription_id_foreign" foreign key ("subscription_id") references "subscriptions" ("id") on update cascade on delete set null;',
    );
    this.addSql(
      'alter table "payments" add constraint "payments_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "payments" drop constraint "payments_subscription_id_foreign";');

    this.addSql('drop table if exists "subscriptions" cascade;');

    this.addSql('drop table if exists "payments" cascade;');
  }
}
