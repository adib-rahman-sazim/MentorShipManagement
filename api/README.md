# NestJS MikroORM Starter Template

Backend starter built with NestJS, MikroORM, Better Auth, and related integrations for Sazim projects.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Template Modules](#template-modules)
- [Localstack](#localstack)
- [Using Bun](#using-bun)
- [Running the app with Node.js](#running-the-app-with-nodejs)
- [Database Migrations](#database-migrations)
- [Test](#test)
- [Build Actions (Local)](#build-actions-local)
- [Docker Deployment](#docker-deployment)
- [Features](#features)
- [Conventions](#conventions)
- [Commit Convention](#commit-convention)

## Installation

Make sure you have `nvm` installed. Then, run the following commands:

```bash
$ nvm use
```

We use the Node version pinned in `.nvmrc`.

We use `pnpm` as our package manager, pinned by the `packageManager` field in `package.json`. After using `nvm` to switch to the proper Node version, enable Corepack and activate the pinned pnpm version:

```bash
$ corepack enable
$ corepack prepare --activate
```

Install dependencies:

```bash
$ pnpm install
```

## Environment Variables

For local development and testing, please create the following files at the root of the project directory:

- `.env.development.local`
- `.env.test.local`

You can follow `.env.example` to specify which env variables are needed for the project as a guideline, and the above two files can be created based off of this file.

### Environment Variables Validation

We use `class-validator` to validate env files before the server starts up to avoid any cases of missing environment variables. They are tracked in these two files.

- `src/common/interfaces/environment-variables.interfaces.ts`
- `src/common/validators/env.validator.ts`

When adding new environment variables, please add them to these files so that your project can remain functional through environment variable changes.

## Template Modules

The template contains code that might not be relevant for your project's needs. Such modules might include:

- PDF generation
- Document signing

If not needed, please remove the said modules from the code when you are initiating your project. Make sure to remove any irrelevant environment variables as well by modifying `src/common/interfaces/environment-variables.interfaces.ts` and `src/common/validators/env.validator.ts` files.

## Localstack

We depend on localstack for local development to test out our integration with the S3 object storage. To set it up, make sure that your machine has:

- [Docker](https://docs.docker.com/desktop/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

Now, you have to configure an AWS profile. Run the following command and enter dummy values for access key id and secret:

```bash
aws configure --profile localstack_dev

AWS Access Key ID []: foo
AWS Secret Access Key []: bar
Default region name []: us-east-1
Default output format []: json
```

Next, start local services (Localstack, Postgres, Redis, MailHog, and Stripe CLI) via `docker compose` with the env file so Stripe gets `STRIPE_SECRET_KEY`:

```bash
docker compose -f ./docker-compose.local.yml --env-file .env.development.local up
```

Verify that the bucket was created using:

```bash
AWS_PROFILE=localstack_dev aws --endpoint-url=http://localhost:4566 s3api list-buckets
```

You should see this output:

```
{
    "Buckets": [
        {
            "Name": "project-dev-bucket",
            "CreationDate": "2024-01-04T15:56:22+00:00"
        }
    ],
    "Owner": {
        "DisplayName": "webfile",
        "ID": "75aa57f09aa0c8caeab4f8c24e99d10f8e7faeebf76c078efc7c6caea54ba06a"
    }
}
```

## Using Bun

This project supports [Bun](https://bun.com/) as an alternative JavaScript runtime that offers faster performance compared to Node.js.

### Installing Bun

To install Bun, run the following command:

```bash
# For macOS, Linux, and WSL
curl -fsSL https://bun.sh/install | bash

# Alternatively, you can use npm
npm install -g bun
```

Verify your installation:

```bash
bun --version
```

### Running with Bun

The project includes several scripts for running with Bun:

```bash
# Install dependencies with Bun
$ bun install

# Run in development mode with auto-reloading
$ bun run start:bun:dev

# Run in production mode with built files
$ bun run build
$ bun run start:bun

# Debug mode with inspector
$ bun run start:bun:debug

# Run tests with Bun
$ bun run test:bun
$ bun run test:bun:e2e
```

### Bun Configuration

The project includes a Bun-specific configuration file (`bunfig.toml`) and TypeScript configuration (`tsconfig.bun.json`) optimized for Bun's runtime.

## Running the app with Node.js

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

When using localstack, please explicitly set your `AWS_PROFILE` variable in your shell configuration file, or write all commands like the following:

```
AWS_PROFILE=localstack_dev pnpm run start:dev
```

## Database Migrations

The `dev` database is used during development and `test` database is used for running tests.

```bash
# Drop all tables, run all migrations, seed the db
$ pnpm run db:migration:fresh:dev

# Migrate up to latest
$ pnpm run db:migration:up:dev

# Migrate down by one
$ pnpm run db:migration:down:dev

# Create a new migration file (requires --name) (use --blank to skip autogeneration)
$ pnpm run db:migration:create

# Seed a specific class via -c / --class (timestamped core seeders under src/db/seeders/core-seeders/)
$ pnpm run db:seed:dev -- --class=Seed20260723000001_Roles
$ pnpm run db:seed:prod -- --class=ProdSeeder

# Run full orchestrators (dev: core + mock users; prod: core only)
$ pnpm run db:seed:dev:all
$ pnpm run db:seed:prod:all

# Run all migrations and seeding with test variables
$ pnpm run db:migration:fresh:test
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Build Actions (Local)

### Running Build Actions with the Script

- We have included a script (`test-lint.sh`) in the root directory to streamline the process of linting and testing the project.
- To use the script, follow these steps:

  1. Ensure the script is executable. If not, make it executable by running:
     ```bash
     chmod +x ./test-lint.sh
     ```
  2. If you don't use tmux, skip to the next step.
     - If you do use tmux, make sure you run this script outside any other tmux sessions
  3. Run the script:
     ```bash
     ./test-lint.sh
     ```
     This will:
       - Start a new tmux session named `test-lint`.
       - Open three panes:
         - Pane 1: Executes e2e tests.
         - Pane 2: Runs lint checks.
         - Pane 3: Executes unit tests.
  4. Once the actions are complete, you can:
     - Manually check the output in each pane for any errors or failures.
     - If necessary, take screenshot of the screen and attach the screenshot to your pull request (PR).

## Docker Deployment

### Certificate Handling

For production deployments that require SSL certificates (e.g., for managed database connections), you can mount your certificates directory using the `CERTS_PATH` environment variable.

## Features

- **Payments (Stripe):** Checkout, webhooks, and price list. Full local setup: [payments README](src/modules/payments/README.md)
- **AI providers:** Plug-in provider pattern. [Guide](docs/features/ai-providers.md)
- **OpenAI vector store:** Create store and env vars. [Guide](docs/features/openai-vector-store.md)
- **Audit logging:** `ENABLE_AUDIT_LOGGING` and subscriber. [Guide](docs/features/audit-logging.md)
- **Feature flags:** PostHog-backed rollouts via `FeatureFlagsService`. [Guide](docs/features/feature-flags.md)
- **CASL authorization:** Permission-based Nest authz, system vs org roles, invites, Better Auth split. [Guide](docs/features/casl-authorization.md)

## Email Testing Setup

The application selects the email provider via `EMAIL_PROVIDER`:

| `EMAIL_PROVIDER` | Provider | Typical use |
| ---------------- | -------- | ----------- |
| `mailhog`        | Mailhog (nodemailer SMTP) | Local / development / test |
| `resend`         | Resend API | Staging / production |

### MailHog (Default — Local Email Capture)

MailHog runs a local SMTP server that captures outbound emails without delivering them, and
exposes a web UI to inspect them.

> **Security Warning**: MailHog's web UI (`http://localhost:8025`) has no built-in authentication. If you host MailHog on a public server, anyone can view captured emails. Always protect it with nginx basic auth or restrict access via firewall/VPN in public environments.

#### Starting MailHog

MailHog is included in `docker-compose.local.yml`:

```bash
# Start MailHog and the development server together
pnpm run start:dev:mailhog

# Or start only the MailHog container
pnpm run mailhog:start

# Stop MailHog when done
pnpm run mailhog:stop

# Or start all local services (includes Stripe CLI when STRIPE_SECRET_KEY is set)
docker compose -f docker-compose.local.yml --env-file .env.development.local up -d
```

MailHog runs with:

- **SMTP server**: `localhost:1025` (what the app connects to)
- **Web UI**: `http://localhost:8025` (view captured emails here)

#### Environment Variables

```env
EMAIL_PROVIDER=mailhog
SEND_FROM_EMAIL=noreply@example.com
# optional; defaults to localhost:1025
# MAILHOG_HOST=localhost
# MAILHOG_PORT=1025
```

### Staging / Production (Resend)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
SEND_FROM_EMAIL=noreply@example.com
```

`RESEND_API_KEY` is required when `EMAIL_PROVIDER=resend`.

### Viewing Captured Emails

- **MailHog**: `http://localhost:8025`
- **Resend**: emails are delivered to real recipients via the Resend API

### Troubleshooting

1. **MailHog not receiving emails**: confirm the container is running (`docker ps`) and the
   web UI is reachable at `http://localhost:8025`
2. **Resend failures**: confirm `EMAIL_PROVIDER=resend` and `RESEND_API_KEY` are set
3. **Application logs**: every send attempt (success or failure) is logged — check server
   output for details

## Conventions

Follow our [NestJS Conventions Doc](https://docs.google.com/document/d/1fBH7IJOy8ugQIxN64gHjv50Mn1cj2ZiqOYm4niP_WQU/edit) for guidelines.

For agent and contributor coding rules (stack, DO/DONT, naming, module layout), see [AGENTS.md](AGENTS.md).

## Commit Convention

``subject(ticket-code): message``

Valid subjects:
``build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test``

